import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import { prisma } from "@utils/prisma";
import success from "@utils/response/success";
import * as Utils from "@utils";

const getAllEvents: Interfaces.Controller.Async = async (_req, res, next) => {
  const events = await prisma.event.findMany({
    include: {
      module: true,
      organizers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              username: true,
              phoneNumber: true,
              imageUrl: true,
            },
          },
        },
      },
      managers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              username: true,
              phoneNumber: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!events) return next(Errors.System.serverError);
  return res.json(Utils.Response.Success(events));
};

const getEventsByModule: Interfaces.Controller.Async = async (
  req,
  res,
  next
) => {
  const { moduleId: MID } = req.params;
  const moduleId = String(MID);
  if (!moduleId || moduleId.length !== 24)
    return next(Errors.Module.invalidInput);

  let events = null;
  if (moduleId)
    events = await prisma.event.findMany({
      where: { moduleId },
      include: {
        module: true,
        organizers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                middleName: true,
                lastName: true,
                username: true,
                phoneNumber: true,
                imageUrl: true,
              },
            },
          },
        },
        managers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                middleName: true,
                lastName: true,
                username: true,
                phoneNumber: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  else events = await prisma.event.findMany();

  if (!events) return next(Errors.System.serverError);
  return res.json(success(events));
};

const getEventById: Interfaces.Controller.Async = async (req, res, next) => {
  const { eventId: EID } = req.params;
  const eventId = String(EID);

  if (!eventId || eventId.length !== 24)
    return next(Errors.Module.invalidInput);

  const event = await prisma.event.findFirst({
    where: { id: eventId },
    include: {
      module: true,
      organizers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              username: true,
              phoneNumber: true,
              imageUrl: true,
            },
          },
        },
      },
      managers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              username: true,
              phoneNumber: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });
  if (!event) return next(Errors.Module.eventNotFound);
  return res.json(Utils.Response.Success(event));
};

export { getAllEvents, getEventsByModule, getEventById };
