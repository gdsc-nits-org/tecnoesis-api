import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import { prisma } from "@utils/prisma";
import * as Utils from "@utils";

const deleteTeamById: Interfaces.Controller.Async = async (req, res, next) => {
  const { teamId: TID } = req.params;
  const teamId = String(TID);

  if (!teamId || teamId.length !== 24) return next(Errors.Module.invalidInput);

  if (!(await prisma.team.findFirst({ where: { id: teamId } })))
    return next(Errors.Team.teamNotFound);

  const deletedTeam = await prisma.team.delete({
    where: {
      id: teamId,
    },
  });

  return res.json(Utils.Response.Success(deletedTeam));
};

export { deleteTeamById };
