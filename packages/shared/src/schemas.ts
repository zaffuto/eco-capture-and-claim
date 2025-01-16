import { z } from 'zod';

export const UserRole = z.enum(['collector', 'business']);
export const CertificateStatus = z.enum(['active', 'used', 'expired']);
export const RewardType = z.enum(['credit', 'coupon']);

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  role: UserRole,
  location: LocationSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RecyclingRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  containerId: z.string(),
  timestamp: z.date(),
  location: LocationSchema,
  batteryType: z.string(),
  certificateId: z.string().uuid().optional(),
  createdAt: z.date(),
});

export const CertificateSchema = z.object({
  id: z.string().uuid(),
  recyclingRecordId: z.string().uuid(),
  userId: z.string().uuid(),
  businessId: z.string().uuid().optional(),
  issueDate: z.date(),
  validUntil: z.date(),
  status: CertificateStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RewardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: RewardType,
  amount: z.number(),
  shopifyProductId: z.string().optional(),
  expiryDate: z.date().optional(),
  status: CertificateStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type RecyclingRecord = z.infer<typeof RecyclingRecordSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type Reward = z.infer<typeof RewardSchema>;
