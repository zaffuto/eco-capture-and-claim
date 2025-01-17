import { supabase } from '@eco/database';
import { Session, shopifyApi, ApiVersion } from '@shopify/shopify-api';
import { config } from '../config';
import { z } from 'zod';

// Validación de entrada
const createEcoCuponSchema = z.object({
  code: z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive().max(100),
  minPurchaseAmount: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  startDate: z.date(),
  expiryDate: z.date(),
  usageLimit: z.number().int().positive().optional(),
  userId: z.string().uuid(),
});

export class DiscountService {
  private shopify;
  private static instance: DiscountService;

  private constructor() {
    if (!config.SHOPIFY_API_KEY || !config.SHOPIFY_API_SECRET || !config.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing required Shopify configuration');
    }

    this.shopify = shopifyApi({
      apiKey: config.SHOPIFY_API_KEY,
      apiSecretKey: config.SHOPIFY_API_SECRET,
      scopes: ['write_discounts'],
      hostName: config.SHOPIFY_SHOP_NAME,
      isEmbeddedApp: true,
      apiVersion: ApiVersion.January24,
    });
  }

  public static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService();
    }
    return DiscountService.instance;
  }

  async createEcoCupon(input: z.infer<typeof createEcoCuponSchema>) {
    try {
      // Validar entrada
      const data = createEcoCuponSchema.parse(input);

      // Validar fechas
      if (data.expiryDate <= data.startDate) {
        throw new Error('La fecha de expiración debe ser posterior a la fecha de inicio');
      }

      // Crear descuento en Shopify
      const client = new this.shopify.clients.Rest({
        session: new Session({
          id: '',
          shop: config.SHOPIFY_SHOP_NAME,
          state: '',
          isOnline: true,
          accessToken: config.SHOPIFY_ACCESS_TOKEN,
        }),
      });

      const discount = await client.post({
        path: 'price_rules',
        data: {
          price_rule: {
            title: `EcoCupon - ${data.code}`,
            target_type: 'line_item',
            target_selection: 'all',
            allocation_method: 'across',
            value_type: data.discountType === 'percentage' ? 'percentage' : 'fixed_amount',
            value: -data.discountValue,
            customer_selection: 'all',
            starts_at: data.startDate.toISOString(),
            ends_at: data.expiryDate.toISOString(),
            usage_limit: data.usageLimit,
            prerequisite_subtotal_range: data.minPurchaseAmount
              ? { greater_than_or_equal_to: data.minPurchaseAmount }
              : undefined,
          },
        },
      });

      // Crear cupón en la base de datos
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .insert([
          {
            code: data.code,
            discount_type: data.discountType,
            discount_value: data.discountValue,
            min_purchase_amount: data.minPurchaseAmount,
            max_discount_amount: data.maxDiscountAmount,
            start_date: data.startDate.toISOString(),
            expiry_date: data.expiryDate.toISOString(),
            usage_limit: data.usageLimit,
            user_id: data.userId,
            shopify_price_rule_id: discount.body.price_rule.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return cupon;
    } catch (error) {
      console.error('Error creating EcoCupon:', error);
      throw error;
    }
  }

  async validateEcoCupon(code: string) {
    try {
      // Sanitizar entrada
      const sanitizedCode = code.trim().toUpperCase();
      if (!/^[A-Z0-9-_]+$/.test(sanitizedCode)) {
        return { valid: false, message: 'Código inválido' };
      }

      // Verificar en Supabase
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .select('*')
        .eq('code', sanitizedCode)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      if (!cupon) return { valid: false, message: 'Cupón no encontrado' };

      // Verificar fecha de expiración
      if (cupon.expiry_date && new Date(cupon.expiry_date) < new Date()) {
        await this.deactivateEcoCupon(cupon.id);
        return { valid: false, message: 'Cupón expirado' };
      }

      // Verificar límite de uso
      if (cupon.usage_limit && cupon.times_used >= cupon.usage_limit) {
        await this.deactivateEcoCupon(cupon.id);
        return { valid: false, message: 'Cupón alcanzó el límite de uso' };
      }

      return { valid: true, cupon };

    } catch (error) {
      console.error('Error validating eco cupon:', error);
      throw error;
    }
  }

  private async deactivateEcoCupon(cuponId: string) {
    try {
      // Validar UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cuponId)) {
        throw new Error('Invalid cupon ID format');
      }

      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .update({ status: 'inactive' })
        .eq('id', cuponId)
        .select()
        .single();

      if (error) throw error;

      // Desactivar en Shopify
      if (cupon.shopify_price_rule_id) {
        const client = new this.shopify.clients.Rest({
          session: new Session({
            id: '',
            shop: config.SHOPIFY_SHOP_NAME,
            state: '',
            isOnline: true,
            accessToken: config.SHOPIFY_ACCESS_TOKEN,
          }),
        });

        await client.put({
          path: `price_rules/${cupon.shopify_price_rule_id}`,
          data: {
            price_rule: {
              status: 'disabled'
            }
          }
        });
      }

      return cupon;

    } catch (error) {
      console.error('Error deactivating eco cupon:', error);
      throw error;
    }
  }

  async incrementCuponUsage(code: string) {
    try {
      // Sanitizar entrada
      const sanitizedCode = code.trim().toUpperCase();
      if (!/^[A-Z0-9-_]+$/.test(sanitizedCode)) {
        throw new Error('Invalid coupon code format');
      }

      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .update({ times_used: { increment: 1 } })
        .eq('code', sanitizedCode)
        .select()
        .single();

      if (error) throw error;

      // Verificar si alcanzó el límite
      if (cupon.usage_limit && cupon.times_used >= cupon.usage_limit) {
        await this.deactivateEcoCupon(cupon.id);
      }

      return cupon;

    } catch (error) {
      console.error('Error incrementing cupon usage:', error);
      throw error;
    }
  }

  async getEcoCupons(userId: string) {
    try {
      const { data: cupons, error } = await supabase
        .from('ecocupons')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return cupons;
    } catch (error) {
      console.error('Error getting EcoCupons:', error);
      throw error;
    }
  }

  async getEcoCupon(code: string) {
    try {
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        throw error;
      }

      return cupon;
    } catch (error) {
      console.error('Error getting EcoCupon:', error);
      throw error;
    }
  }

  async updateEcoCupon(code: string, updates: Partial<z.infer<typeof createEcoCuponSchema>>) {
    try {
      const { data: cupon, error } = await supabase
        .from('ecocupons')
        .update(updates)
        .eq('code', code)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return cupon;
    } catch (error) {
      console.error('Error updating EcoCupon:', error);
      throw error;
    }
  }

  async deleteEcoCupon(code: string) {
    try {
      const { error } = await supabase
        .from('ecocupons')
        .delete()
        .eq('code', code);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting EcoCupon:', error);
      throw error;
    }
  }
}
