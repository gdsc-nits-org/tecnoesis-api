import * as Interfaces from "@interfaces";
// import * as Errors from "@errors";
import * as Success from "@success";

const sayHello: Interfaces.Controller.Async = async (_req, _res, _next) => {
  return _res.json(Success.Home.hello);
  // return _res.json(Success.Home.hello);

  // _next(Errors.System.serverError);
  // return _next(Errors.System.serverError);
};

export { sayHello };
