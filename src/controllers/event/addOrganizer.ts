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

  const results = await Promise.all(
    organizers.map((username: string) =>
      prisma.user.findFirst({
        where: { username: username },
      })
    )
  );

  if (!results.every((result) => result)) {
    return next(Errors.User.userNotFound);
  }

  const eventOrganisers: EventOrganiser[] = [];
  await Promise.all(
    results.map(async (result) => {
      const eventOrganizer = await prisma.eventOrganiser.upsert({
        create: {
          user: { connect: { id: result!.id } },
          event: { connect: { id: eventId } },
        },
        where: { userId_eventId: { userId: result!.id, eventId: eventId } },
        update: {},
      });

      if (eventOrganizer) {
        eventOrganisers.push(eventOrganizer);
      }
    })
  );

  return res.json(Utils.Response.Success(eventOrganisers));
};

export { addOrganizer };
