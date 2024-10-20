import * as Interfaces from "@interfaces";
import { Event } from "@prisma/client";
import { prisma } from "@utils/prisma";
import * as Errors from "@errors";
import * as Utils from "@utils";

const updateEvent: Interfaces.Controller.Async = async (req, res, next) => {
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

  const { eventId: EID } = req.params;
  const eventId = String(EID);

  if (!String(eventId) || typeof eventId !== "string" || eventId.length !== 24)
    return next(Errors.Module.invalidInput);

  const eventOriginal = await prisma.event.findFirst({
    where: { id: eventId },
  });
  if (!eventOriginal) return next(Errors.Module.eventNotFound);

  if (minTeamSize > maxTeamSize) return next(Errors.Module.invalidInput);

  if (
    !String(moduleId) ||
    typeof moduleId !== "string" ||
    moduleId.length !== 24
  )
    return next(Errors.Module.invalidInput);
  if (!(await prisma.module.findFirst({ where: { id: moduleId } })))
    return next(Errors.Module.moduleNotFound);

  let regStart;
  if (registrationStartTime) regStart = new Date(registrationStartTime);
  else {
    regStart = new Date(eventOriginal.registrationStartTime);
  }
  let regEnd;
  if (registrationEndTime) regEnd = new Date(registrationEndTime);
  else {
    regEnd = new Date(eventOriginal.registrationEndTime);
  }
  if (registrationStartTime && JSON.stringify(regStart) === "null")
    return next(Errors.Module.invalidInput);
  if (registrationEndTime && JSON.stringify(regEnd) === "null")
    return next(Errors.Module.invalidInput);
  if (regStart && regEnd && regStart > regEnd)
    return next(Errors.Module.invalidInput);

  if (
    thirdPartyURL &&
    (typeof thirdPartyURL !== "string" || !thirdPartyURL.length)
  )
    return next(Errors.Module.invalidInput);

  const {
    organizers = [],
    managers = [],
  }: { organizers: string[]; managers: string[] } = req.body;

  if (extraQuestions && !Array.isArray(extraQuestions)) {
    return next(Errors.Module.invalidInput);
  }

  if (
    (minTeamSize && typeof minTeamSize !== "number") ||
    (maxTeamSize && typeof maxTeamSize !== "number") ||
    (lat && typeof lat !== "string") ||
    (lng && typeof lng !== "string") ||
    (name && typeof name !== "string") ||
    (description && typeof description !== "string") ||
    (prizeDescription && typeof prizeDescription !== "string") ||
    (stagesDescription && typeof stagesDescription !== "string") ||
    (venue && typeof venue !== "string") ||
    (posterImage && typeof posterImage !== "string")
  )
    return next(Errors.Module.invalidInput);

  if (
    (typeof lat === "string" && !lat.length) ||
    (typeof lng === "string" && !lng.length) ||
    (typeof name === "string" && !name.length) ||
    (typeof description === "string" && !description.length) ||
    (typeof prizeDescription === "string" && !prizeDescription.length) ||
    (typeof stagesDescription === "string" && !stagesDescription.length) ||
    (typeof venue === "string" && !venue.length) ||
    (typeof posterImage === "string" && !posterImage.length)
  )
    return next(Errors.Module.invalidInput);

  const userIdExist = await Utils.Event.userIdExist([
    ...organizers,
    ...managers,
  ]);

  if (!userIdExist) {
    return next(Errors.User.userNotFound);
  }

  const eventOrganisers = await prisma.eventOrganiser.findMany({
    where: {
      eventId: eventId,
    },
  });

  const eventOrganiserIds = eventOrganisers.map(
    (organiser) => organiser.userId
  );

  const organiserIdsToRemove = eventOrganiserIds.filter(
    (id) => !organizers.includes(id)
  );

  const eventManagers = await prisma.eventManager.findMany({
    where: {
      eventId: eventId,
    },
  });

  const eventManagersUserId = eventManagers.map((manager) => manager.userId);

  const managerIdsToRemove = eventManagersUserId.filter(
    (id) => !managers.includes(id)
  );

  const connectOrCreateOrganiser = await Utils.Event.connectOrCreateId(
    organizers,
    eventId
  );

  const deleteOrganiser = await Utils.Event.deleteId(
    organiserIdsToRemove,
    eventId
  );

  const connectOrCreateManagers = await Utils.Event.connectOrCreateId(
    managers,
    eventId
  );

  const deleteManager = await Utils.Event.deleteId(managerIdsToRemove, eventId);

  const event = await prisma.event.update({
    where: { id: eventId },
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
      moduleId,
      extraQuestions: extraQuestions,
      organizers: {
        connectOrCreate: connectOrCreateOrganiser,
        delete: deleteOrganiser,
      },
      managers: {
        connectOrCreate: connectOrCreateManagers,
        delete: deleteManager,
      },
    },
  });

  if (!event) return next(Errors.System.serverError);
  return res.json(Utils.Response.Success(event));
};

export { updateEvent };
