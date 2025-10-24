import { TshirtSize, MerchType } from "@prisma/client";

export const VALID_SIZES = Object.values(TshirtSize);
export const VALID_TYPES = Object.values(MerchType);

export const formatOrderResponse = (order: any) => ({
  id: order.id,
  type: order.type,
  size: order.size,
  quantity: order.quantity,
  createdAt: order.createdAt,
  user: {
    id: order.user.id,
    firstName: order.user.firstName,
    lastName: order.user.lastName,
    email: order.user.email,
    username: order.user.username,
    phoneNumber: order.user.phoneNumber,
    registrationId: order.user.registrationId,
    hostelName: order.user.hostelName,
    collegeName: order.user.collegeName,
  },
});
