import { prisma } from "@utils/prisma";
import * as Interfaces from "@interfaces";
import * as Success from "@success";

const optIn: Interfaces.Controller.Async = async (req, res, _next) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { hasOpted: true },
  });

  return res.json(Success.Merch.optedIn());
};

export { optIn };
