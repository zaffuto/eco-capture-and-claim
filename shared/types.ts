export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'collector' | 'business';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface RecyclingRecord {
  id: string;
  userId: string;
  containerId: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  batteryType: string;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  recyclingRecordId: string;
  userId: string;
  businessId?: string;
  issueDate: string;
  validUntil: string;
  status: 'active' | 'used' | 'expired';
}

export interface Reward {
  id: string;
  userId: string;
  type: 'credit' | 'coupon';
  amount: number;
  shopifyProductId?: string;
  expiryDate?: string;
  status: 'active' | 'used' | 'expired';
}
