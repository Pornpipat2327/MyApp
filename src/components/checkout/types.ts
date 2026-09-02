/**
 * @file types.ts
 * @description Type definitions สำหรับโมดูล Checkout
 */

import { ShippingAddress } from '@/types/order';

export type {
  Order,
  ShippingAddress,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
} from '@/types/order';

export type ShippingAddressValues = ShippingAddress;
export type ShippingFormValues = ShippingAddress;
