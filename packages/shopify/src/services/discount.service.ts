import { supabase } from '@eco/database';
import { createClient } from '@shopify/shopify-api';
import { config } from '../config';

export class DiscountService {
  private shopify;

  constructor() {
    this.shopify = createClient({
      apiKey: config.SHOPIFY_API_KEY,
      apiSecretKey: config.SHOPIFY_API_SECRET,
      scopes: ['write_discounts'],
      hostName: config.SHOPIFY_SHOP_NAME,
      accessToken: config.SHOPIFY_ACCESS_TOKEN,
    });
  }

  async createEcoCupon({
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    startDate,
    expiryDate,
    usageLimit,
    userId
  }) {
    try {
      // Crear Price Rule en Shopify
      const priceRule = await this.shopify.priceRule.create({
        title: `Eco Cupon - ${code}`,
        target_type: 'line_item',
        target_selection: 'all',
        allocation_method: discountType === 'percentage' ? 'across' : 'each',
        value_type: discountType === 'percentage' ? 'percentage' : 'fixed_amount',
        value: `-${discountValue}`,
        customer_selection: 'all',
        starts_at: startDate,
        ends_at: expiryDate,
        usage_limit: usageLimit,
        once_per_customer: true,
        prerequisite_subtotal_range: minPurchaseAmount ? {
          greater_than_or_equal_to: minPurchaseAmount
        } : undefined,
      });

      // Crear Discount Code en Shopify
      const discountCode = await this.shopify.discountCode.create(priceRule.id, {
        code: code,
      });

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('eco_cupons')
        .insert({
          code,
          discount_type: discountType,
          discount_value: discountValue,
          min_purchase_amount: minPurchaseAmount,
          max_discount_amount: maxDiscountAmount,
          start_date: startDate,
          expiry_date: expiryDate,
          usage_limit: usageLimit,
          shopify_price_rule_id: priceRule.id,
          shopify_discount_code_id: discountCode.id,
          user_id: userId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Error creating eco cupon:', error);
      throw error;
    }
  }

  async validateEcoCupon(code: string) {
    try {
      // Verificar en Supabase
      const { data: cupon, error } = await supabase
        .from('eco_cupons')
        .select('*')
        .eq('code', code)
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
      const { data: cupon, error } = await supabase
        .from('eco_cupons')
        .update({ times_used: sql`times_used + 1` })
        .eq('code', code)
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
