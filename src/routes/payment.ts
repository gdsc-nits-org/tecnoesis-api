import { Router } from "express";
import * as Controllers from "@controllers";
import express from "express";

const router: Router = Router();

// The express.raw middleware is used to get the raw request body for webhook signature verification
router.post(
  "/notify",
  express.raw({ type: "application/json" }),
  Controllers.Payment.notify
);

export default router;
