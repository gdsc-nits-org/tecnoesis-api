import * as Interfaces from "@interfaces";
import { Event } from "@prisma/client";
import { prisma } from "@utils/prisma";
import * as Errors from "@errors";
import * as Utils from "@utils";

const createEvent: Interfaces.Controller.Async = async (req, res, next) => {
  const {
    description,
    posterImage,
    thirdPartyURL,
    lat,
    lng,
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

  if (
    !(
      description &&
      posterImage &&
      lat &&
      lng &&
      maxTeamSize &&
      minTeamSize &&
      moduleId &&
      name &&
      prizeDescription &&
      registrationEndTime &&
      registrationStartTime &&
      stagesDescription &&
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
    typeof lat !== "string" ||
    typeof lng !== "string" ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof prizeDescription !== "string" ||
    typeof stagesDescription !== "string" ||
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

  const { organizers, managers }: { organizers: [string]; managers: [string] } =
    req.body;

  let connectOrganiser: {
    userId: string;
  }[] = [];
  let connectManager: {
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

  if (managers) {
    if (!managers.every((manager) => manager.length === 24)) {
      return next(Errors.Module.managerIdInvalid);
    }

    const userIdExist = await Utils.Event.userIdExist(managers);

    if (!userIdExist) {
      return next(Errors.User.userNotFound);
    }
    connectManager = await Utils.Event.connectId(managers);
  }

  const event = await prisma.event.create({
    data: {
      description,
      posterImage,
      thirdPartyURL,
      lat,
      lng,
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
      managers: {
        create: connectManager,
      },
    },
  });

  if (!event) return next(Errors.System.serverError);
  return res.json(Utils.Response.Success(event));
};

export { createEvent };
