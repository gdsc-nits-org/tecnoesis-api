import * as Interfaces from "@interfaces";
import { prisma } from "@utils/prisma";
import * as Errors from "@errors";

const isValidTeamId: Interfaces.Middleware.Sync = (req, _res, next) => {
  const { teamId } = req.params;

  if (!String(teamId)) {
    return next(Errors.Team.invalidTeamId);
  } else {
    return next();
  }
};

const fetchEventIdOfTeam: Interfaces.Middleware.Async = async (
  req,
  _res,
  next
) => {
  const { teamId: TID } = req.params;
  const teamId = String(TID);

  if (!teamId || teamId.length !== 24) {
    next(Errors.Module.invalidInput);
  }

  const team = await prisma.team.findFirst({
    where: { id: teamId },
    select: {
      eventId: true,
    },
  });

  if (!team) {
    return next(Errors.Team.teamNotFound);
  }

  req.params.eventId = team!.eventId;
  return next();
};
export { isValidTeamId, fetchEventIdOfTeam };
