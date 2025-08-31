import * as Interfaces from "@interfaces";
import { Module } from "@prisma/client";
import { prisma } from "@utils/prisma";
import * as Errors from "@errors";
import * as Utils from "@utils";

const createModule: Interfaces.Controller.Async = async (req, res, next) => {
  try {
    const { description, name, thirdPartyURL } = req.body as Partial<Module>;

    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };

    const coverImage = files?.coverImage?.[0]?.location;
    const iconImage = files?.iconImage?.[0]?.location;

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
