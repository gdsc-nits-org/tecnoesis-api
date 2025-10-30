import * as Interfaces from "@interfaces";
import { Event } from "@prisma/client";
import { prisma } from "@utils/prisma";
import * as Errors from "@errors";
import * as Utils from "@utils";

const createEvent: Interfaces.Controller.Async = async (req, res, next) => {
  const {
    description,
    thirdPartyURL,
    maxTeamSize,
    minTeamSize,
    moduleId,
    name,
    prizeDescription,
    registrationEndTime,
    registrationStartTime,
    stagesDescription,
    venue,
    registrationFee,
  } = req.body as Event;

  const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };
  const posterImage = files?.posterImage?.[0]?.location;
  const upiQrCode = files?.upiQrCode?.[0]?.location;

  if (!posterImage) {
    return next(Errors.Module.invalidAttribute);
  }

  // Parse team sizes to integers
  const parsedMaxTeamSize = parseInt(String(maxTeamSize), 10);
  const parsedMinTeamSize = parseInt(String(minTeamSize), 10);

  // Validate parsed integers
  if (isNaN(parsedMaxTeamSize) || isNaN(parsedMinTeamSize)) {
    return next(Errors.Module.invalidAttribute);
  }

  if (!String(moduleId) || moduleId.length !== 24)
    return next(Errors.Module.moduleIdInvalid);

  if (parsedMinTeamSize > parsedMaxTeamSize)
    return next(Errors.Module.teamSizeMismatch);

  const regStart = new Date(registrationStartTime);
  const regEnd = new Date(registrationEndTime);

  if (
    JSON.stringify(regStart) === "null" ||
    JSON.stringify(regEnd) === "null"
  ) {
    return next(Errors.Module.timingInvalid);
  }

  if (regStart && regEnd && regStart > regEnd) {
    return next(Errors.Module.timingInvalid);
  }

  if (
    thirdPartyURL &&
    (typeof thirdPartyURL !== "string" || !thirdPartyURL.length)
  ) {
    return next(Errors.Module.thirdPartyURLInvalid);
  }

  if (
    !(await prisma.module.findFirst({
      where: { id: moduleId },
    }))
  ) {
    return next(Errors.Module.moduleNotFound);
  }

  const { organizers }: { organizers: [string] } = req.body;

  let connectOrganiser: {
    userId: string;
  }[] = [];

  if (organizers) {
    if (!organizers.every((organizer) => organizer.length === 24)) {
      return next(Errors.Module.organizerIdInvalid);
    }
    const userIdExist = await Utils.Event.userIdExist(organizers);

    if (!userIdExist) {
      return next(Errors.User.userNotFound);
    }
    connectOrganiser = await Utils.Event.connectId(organizers);
  }

  // Parse and validate payment fields
  const parsedRegistrationFee = registrationFee
    ? parseFloat(String(registrationFee))
    : 0;

  if (isNaN(parsedRegistrationFee) || parsedRegistrationFee < 0) {
    return next(Errors.Module.invalidAttribute);
  }

  const event = await prisma.event.create({
    data: {
      description,
      posterImage,
      thirdPartyURL,
      maxTeamSize: parsedMaxTeamSize,
      minTeamSize: parsedMinTeamSize,
      name,
      prizeDescription,
      registrationEndTime: regEnd,
      registrationStartTime: regStart,
      stagesDescription,
      venue,
      registrationFee: parsedRegistrationFee,
      upiQrCode,
      module: {
        connect: { id: moduleId },
      },
      organizers: {
        create: connectOrganiser,
      },
    },
  });

  if (!event) return next(Errors.System.serverError);
  return res.json(Utils.Response.Success(event));
};

export { createEvent };
