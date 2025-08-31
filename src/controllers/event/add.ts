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
    extraQuestions,
  } = req.body as Event;

  const posterImage = (req.file as Express.MulterS3.File).location;

  if (
    !(
      posterImage &&
      maxTeamSize &&
      minTeamSize &&
      moduleId &&
      name &&
      registrationEndTime &&
      registrationStartTime &&
      venue
    )
  )
    return next(Errors.Module.invalidAttribute);

  if (!String(moduleId) || moduleId.length !== 24)
    return next(Errors.Module.moduleIdInvalid);

  if (extraQuestions && !Array.isArray(extraQuestions))
    return next(Errors.Module.extraQuestionsJSONInvalid);

  if (minTeamSize > maxTeamSize) return next(Errors.Module.teamSizeMismatch);

  if (
    typeof maxTeamSize !== "number" ||
    typeof minTeamSize !== "number" ||
    typeof name !== "string" ||
    typeof venue !== "string" ||
    typeof posterImage !== "string"
  )
    return next(Errors.Module.invalidAttribute);

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

  const event = await prisma.event.create({
    data: {
      description,
      posterImage,
      thirdPartyURL,
      maxTeamSize,
      minTeamSize,
      name,
      prizeDescription,
      registrationEndTime: regEnd,
      registrationStartTime: regStart,
      stagesDescription,
      venue,
      extraQuestions,
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
