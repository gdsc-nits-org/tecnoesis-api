import * as Interfaces from "@interfaces";
import { Module } from "@prisma/client";
import { prisma } from "@utils/prisma";
import * as Errors from "@errors";
import * as Utils from "@utils";

const createModule: Interfaces.Controller.Async = async (req, res, next) => {
  try {
    const { description, name, thirdPartyURL } = req.body as Partial<Module>;

    const coverImage = req.files && (req.files as any).coverImage?.[0]?.path;
    const iconImage = req.files && (req.files as any).iconImage?.[0]?.path;

    if (!coverImage || !iconImage || !name) {
      return next(Errors.Module.invalidInput);
    }

    if (
      typeof name !== "string" ||
      (thirdPartyURL &&
        (typeof thirdPartyURL !== "string" || !thirdPartyURL.length))
    ) {
      return next(Errors.Module.invalidInput);
    }

    const module = await prisma.module.create({
      data: {
        description,
        iconImage,
        coverImage,
        name,
        thirdPartyURL,
      },
    });

    if (!module) return next(Errors.System.serverError);

    return res.json(Utils.Response.Success(module));
  } catch (err) {
    return next(err);
  }
};

export { createModule };
