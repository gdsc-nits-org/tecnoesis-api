import { Cashfree, CFEnvironment } from "cashfree-pg";
const CashfreeSDK = require("cashfree-sdk");

export const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID || "",
  process.env.CASHFREE_CLIENT_SECRET || ""
);

export const Payouts = CashfreeSDK.Payouts;

Payouts.Init({
  ENV: "TEST",
  ClientID: process.env.CASHFREE_PAYOUT_CLIENT_ID || "",
  ClientSecret: process.env.CASHFREE_PAYOUT_CLIENT_SECRET || "",
});
