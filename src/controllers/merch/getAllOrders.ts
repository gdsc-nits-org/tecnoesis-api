import { prisma } from "@utils/prisma";

import * as Interfaces from "@interfaces";
import * as Success from "@success";
import { formatOrderResponse } from "./utils";

const getAllOrders: Interfaces.Controller.Async = async (_req, res, _next) => {
  const orders = await prisma.merchOrder.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return res.json(
    Success.Merch.orderRetrieved({
      count: orders.length,
      orders: orders.map(formatOrderResponse),
    })
  );
};

export { getAllOrders };
