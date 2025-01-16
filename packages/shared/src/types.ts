// Tipos adicionales no cubiertos por los schemas
export interface EcoCupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minPurchaseAmount?: number;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
