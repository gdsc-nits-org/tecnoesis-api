import * as Utils from "@utils";

const orderCreated = (data: any) =>
  Utils.Response.Success({
    message: "Order placed successfully",
    ...data,
  });

const orderRetrieved = (data: any) => Utils.Response.Success(data);

export { orderCreated, orderRetrieved };
