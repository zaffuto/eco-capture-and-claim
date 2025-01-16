// Tipos comunes compartidos entre los paquetes
export interface User {
  id: string;
  email: string;
  name?: string;
}

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
