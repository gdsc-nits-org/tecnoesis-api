import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import { prisma } from "@utils/prisma";
import * as Utils from "@utils";

const deleteModuleById: Interfaces.Controller.Async = async (
  req,
  res,
  next
) => {
  const { moduleId: MID } = req.params;
  const moduleId = String(MID);
  if (!moduleId || moduleId.length !== 24)
    return next(Errors.Module.invalidInput);
  if (!(await prisma.module.findFirst({ where: { id: moduleId } })))
    return next(Errors.Module.moduleNotFound);

  const module = await prisma.module.delete({ where: { id: moduleId } });
  if (!module) return next(Errors.System.serverError);
  return res.json(Utils.Response.Success(module));
};

export { deleteModuleById };
