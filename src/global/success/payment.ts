import * as Utils from "@utils";

const orderCreated = (data: any) =>
  Utils.Response.Success({
    message: "Payment order created successfully",
    ...data,
  });

const paymentVerified = (data: any) =>
  Utils.Response.Success({
    message: "Payment verified successfully",
    ...data,
  });

const paymentDetails = (data: any) =>
  Utils.Response.Success({
    message: "Payment details retrieved successfully",
    ...data,
  });

export { orderCreated, paymentVerified, paymentDetails };
