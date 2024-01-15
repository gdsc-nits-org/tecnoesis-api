import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import * as Utils from "@utils";
import { prisma } from "@utils/prisma";
import { EventOrganiser } from "@prisma/client";

const addOrganizer: Interfaces.Controller.Async = async (req, res, next) => {
  const { eventId: EID } = req.params;
  const eventId = String(EID);

  if (!eventId || eventId.length !== 24)
    return next(Errors.Module.invalidInput);

  if (
    !(await prisma.event.findFirst({
      where: {
        id: eventId,
      },
    }))
  )
    return next(Errors.Event.eventDoesntExist);

  let { organizers }: { organizers: string[] } = req.body;

  if (!organizers) return next(Errors.Module.invalidInput);

  organizers = organizers.filter(
    (value, index, array) => array.indexOf(value) === index
  );

  console.log(organizers);

  if (!organizers.every((organizer) => organizer.length === 24)) {
    return next(Errors.Module.invalidInput);
  }

  const userIdExist = await Utils.Event.userIdExist(organizers);

  if (!userIdExist) {
    return next(Errors.User.userNotFound);
  } else {
    const eventOrganisers: EventOrganiser[] = [];
    await Promise.all(
      organizers.map(async (id: string) => {
        const eventOrganizer = await prisma.eventOrganiser.upsert({
          create: {
            user: { connect: { id: id } },
            event: { connect: { id: eventId } },
          },
          where: { userId_eventId: { userId: id, eventId: eventId } },
          update: {},
        });

        if (eventOrganizer) {
          eventOrganisers.push(eventOrganizer);
        }
      })
    );

    return res.json(Utils.Response.Success(eventOrganisers));
  }
};

export { addOrganizer };
