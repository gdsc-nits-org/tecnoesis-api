import * as Interfaces from "@interfaces";

import * as Errors from "@errors";

const isAdmin: Interfaces.Middleware.Sync = (req, _res, next) => {
  if (req.user && req.user.id === String(process.env.ADMIN_ID!)) {
    return next();
  } else {
    return next(Errors.Module.userUnauthorized);
  }
};

export { isAdmin };
