import * as Utils from "@utils";

const invalidInput = Utils.Response.Error("Invalid payment input", 400);
const paymentFailed = Utils.Response.Error("Payment failed", 400);
const paymentNotFound = Utils.Response.Error("Payment not found", 404);
const duplicatePayment = Utils.Response.Error("Payment already exists", 409);
const eventNotFound = Utils.Response.Error("Event not found", 404);
const paymentMethodNotConfigured = Utils.Response.Error(
  "Payment method not configured for this event",
  400
);
const registrationClosed = Utils.Response.Error(
  "Event registration is closed",
  400
);
const teamNotFound = Utils.Response.Error("Team not found", 404);

export {
  invalidInput,
  paymentFailed,
  paymentNotFound,
  duplicatePayment,
  eventNotFound,
  paymentMethodNotConfigured,
  registrationClosed,
  teamNotFound,
};
