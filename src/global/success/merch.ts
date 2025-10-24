import * as Utils from "@utils";

const orderCreated = (data: any) =>
  Utils.Response.Success({
    message: "Order placed successfully",
    ...data,
  });

const orderRetrieved = (data: any) => Utils.Response.Success(data);

const optedIn = () =>
  Utils.Response.Success({
    message: "Successfully opted in for BHM deduction",
  });

export { orderCreated, orderRetrieved, optedIn };
