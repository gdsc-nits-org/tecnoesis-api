import * as Utils from "@utils";

const orderAlreadyExists = (merchTypes: string) =>
  Utils.Response.Error(
    `You have already placed an order for: ${merchTypes}`,
    409
  );

const invalidInput = Utils.Response.Error(
  "Invalid order data. Please check your selection and try again.",
  400
);

const userNotOptedForBHM = Utils.Response.Error(
  "The user has not opted for BHM deduction",
  403
);

export { orderAlreadyExists, invalidInput, userNotOptedForBHM };
