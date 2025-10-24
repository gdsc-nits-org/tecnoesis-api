import { prisma } from "@utils/prisma";
import { TshirtSize, MerchType } from "@prisma/client";

import * as Interfaces from "@interfaces";
import * as Success from "@success";
import * as Errors from "@errors";
import { VALID_SIZES, VALID_TYPES } from "./utils";

interface OrderItem {
  type: MerchType;
  size: TshirtSize;
  quantity: number;
}

const validateItem = (item: any): OrderItem | null => {
  if (!item?.type || !item?.size || item?.quantity !== 1) {
    return null;
  }

  if (!VALID_TYPES.includes(item.type) || !VALID_SIZES.includes(item.size)) {
    return null;
  }

  return {
    type: item.type,
    size: item.size,
    quantity: item.quantity,
  };
};

const createOrder: Interfaces.Controller.Async = async (req, res, next) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(Errors.Merch.invalidInput);
  }

  const validatedItems = items
    .map(validateItem)
    .filter((item): item is OrderItem => item !== null);

  if (validatedItems.length === 0) {
    return next(Errors.Merch.invalidInput);
  }
  const existingOrders = await prisma.merchOrder.findMany({
    where: {
      userId: req.user!.id,
      type: { in: validatedItems.map((item) => item.type) },
    },
  });

  if (existingOrders.length > 0) {
    const existingTypes = existingOrders
      .map((order: any) => order.type)
      .join(", ");
    return next(Errors.Merch.orderAlreadyExists(existingTypes));
  }
  const orders = await prisma.$transaction(
    validatedItems.map((item) =>
      prisma.merchOrder.create({
        data: {
          userId: req.user!.id,
          type: item.type,
          size: item.size,
          quantity: item.quantity,
        },
      })
    )
  );

  return res.json(Success.Merch.orderCreated({ orders }));
};

export { createOrder };
