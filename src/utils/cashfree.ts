import { Cashfree, CFEnvironment } from "cashfree-pg";

export const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID || "",
  process.env.CASHFREE_CLIENT_SECRET || ""
);
