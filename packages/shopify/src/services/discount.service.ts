import { supabase } from '@eco/database';
import { createClient } from '@shopify/shopify-api';
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

    this.shopify = createClient({
      apiKey: config.SHOPIFY_API_KEY,
      apiSecretKey: config.SHOPIFY_API_SECRET,
      scopes: ['write_discounts'],
      hostName: config.SHOPIFY_SHOP_NAME,
      accessToken: config.SHOPIFY_ACCESS_TOKEN,
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

      if (data.startDate < new Date()) {
        throw new Error('La fecha de inicio no puede ser en el pasado');
      }

      // Crear Price Rule en Shopify
      const priceRule = await this.shopify.priceRule.create({
        title: `Eco Cupon - ${data.code}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: data.discountType === 'percentage' ? 'across' : 'each',
        value_type: data.discountType === 'percentage' ? 'percentage' : 'fixed_amount',
        value: `-${data.discountValue}`,
        customer_selection: 'all',
        starts_at: data.startDate.toISOString(),
        ends_at: data.expiryDate.toISOString(),
        usage_limit: data.usageLimit,
        once_per_customer: true,
        prerequisite_subtotal_range: data.minPurchaseAmount ? {
          greater_than_or_equal_to: data.minPurchaseAmount.toString()
        } : undefined,
      });

      // Crear Discount Code en Shopify
      const discountCode = await this.shopify.discountCode.create(priceRule.id, {
        code: data.code,
      });

      // Guardar en Supabase con prepared statement
      const { data: cupon, error } = await supabase
        .from('eco_cupons')
        .insert({
          code: data.code,
          discount_type: data.discountType,
          discount_value: data.discountValue,
          min_purchase_amount: data.minPurchaseAmount,
          max_discount_amount: data.maxDiscountAmount,
          start_date: data.startDate.toISOString(),
          expiry_date: data.expiryDate.toISOString(),
          usage_limit: data.usageLimit,
          shopify_price_rule_id: priceRule.id,
          shopify_discount_code_id: discountCode.id,
          user_id: data.userId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return cupon;

    } catch (error) {
      console.error('Error creating eco cupon:', error);
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

      // Verificar en Supabase usando prepared statement
      const { data: cupon, error } = await supabase
        .from('eco_cupons')
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
        .from('eco_cupons')
        .update({ status: 'inactive' })
        .eq('id', cuponId)
        .select()
        .single();

      if (error) throw error;

      // Desactivar en Shopify
      if (cupon.shopify_price_rule_id) {
        await this.shopify.priceRule.update(cupon.shopify_price_rule_id, {
          status: 'disabled'
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
        .from('eco_cupons')
        .update({ times_used: sql`times_used + 1` })
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
}