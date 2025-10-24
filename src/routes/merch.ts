import { Router } from "express";

import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";

const router: Router = Router({ mergeParams: true });

router.put("/opt-in", Middlewares.Auth.validateUser, Controllers.Merch.optIn);

router.post(
  "/order",
  Middlewares.Auth.validateUser,
  Controllers.Merch.createOrder
);

router.get(
  "/order/me",
  Middlewares.Auth.validateUser,
  Controllers.Merch.getMyOrder
);

router.get(
  "/order/all",
  Middlewares.Auth.isAdmin,
  Controllers.Merch.getAllOrders
);

router.get(
  "/order/:userId",
  Middlewares.Auth.isAdmin,
  Controllers.Merch.getUserOrder
);

export default router;
