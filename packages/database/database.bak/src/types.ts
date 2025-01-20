export interface EcoCupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  start_date: string;
  expiry_date: string;
  usage_limit?: number;
  times_used: number;
  user_id: string;
  shopify_price_rule_id: string;
  created_at: string;
  updated_at: string;
}
