import { prisma } from "@utils/prisma";

import * as Interfaces from "@interfaces";
import * as Success from "@success";
import { formatOrderResponse } from "./utils";

const getMyOrder: Interfaces.Controller.Async = async (req, res, _next) => {
  const orders = await prisma.merchOrder.findMany({
    where: { userId: req.user!.id },
    include: { user: true },
  });

  return res.json(
    Success.Merch.orderRetrieved({
      orders: orders.map(formatOrderResponse),
    })
  );
};

export { getMyOrder };
