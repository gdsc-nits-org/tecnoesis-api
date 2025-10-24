import { prisma } from "@utils/prisma";

import * as Interfaces from "@interfaces";
import * as Success from "@success";
import * as Errors from "@errors";
import { formatOrderResponse } from "./utils";

const getUserOrder: Interfaces.Controller.Async = async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return next(Errors.Merch.invalidInput);
  }

  const orders = await prisma.merchOrder.findMany({
    where: { userId },
    include: { user: true },
  });

  return res.json(
    Success.Merch.orderRetrieved({
      orders: orders.map(formatOrderResponse),
    })
  );
};

export { getUserOrder };
