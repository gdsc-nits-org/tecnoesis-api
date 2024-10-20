import { prisma } from "@utils/prisma";
import { RegistrationStatus } from "@prisma/client";

import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import * as Success from "@success";

const teamRegistrationResponse: Interfaces.Controller.Async = async (
  req,
  res,
  next
) => {
  const { teamId: TID } = req.params;
  const teamId = String(TID);

  if (!teamId || teamId.length !== 24) return next(Errors.Module.invalidInput);

  const userId = req.user!.id;

  const { status } = req.body as Interfaces.Team.RegistrationResponse;

  // Check response
  if (
    !(status in RegistrationStatus) ||
    status === RegistrationStatus.PENDING
  ) {
    return next(Errors.Team.invalidResponse);
  }

  // Find Team for user in event
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          user: {
            id: userId,
          },
        },
      },
    },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          registrationStatus: true,
          role: true,
          user: {
            select: {
              firebaseId: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    return next(Errors.Team.userNotPartOfTeam);
  }

  // Check cancellation status of Team
  if (team.registrationStatus === RegistrationStatus.CANCELLED) {
    return next(Errors.Team.teamRegistrationCancelled);
  }

  // Check if already responded
  const indexOfMember = team.members.findIndex(
    (member) => member.userId === userId
  );

  if (
    team.members[indexOfMember].registrationStatus !==
    RegistrationStatus.PENDING
  ) {
    return next(Errors.Team.userAlreadyResponded);
  }

  // Cancel Team Registration
  if (status === RegistrationStatus.CANCELLED) {
    await prisma.team.update({
      where: {
        id: team.id,
      },
      data: {
        registrationStatus: RegistrationStatus.CANCELLED,
        members: {
          updateMany: {
            where: {
              teamId,
            },
            data: {
              registrationStatus: RegistrationStatus.CANCELLED,
            },
          },
        },
      },
    });

    return res.json(Success.Team.userStatusUpdated);
  }

  // Check if status is registered in another team in the event
  const otherTeam = await prisma.team.findFirst({
    where: {
      eventId: team.eventId,
      members: {
        some: {
          userId,
          registrationStatus: RegistrationStatus.REGISTERED,
        },
      },
    },
  });

  if (otherTeam) {
    return next(Errors.Team.userAlreadyRegistered);
  }

  // Update Status
  if (status === RegistrationStatus.REGISTERED) {
    // Update team and member status.
    // Complete it in a single transaction.

    await prisma.$transaction(async (prisma) => {
      // Update Member's Status to Registered
      const memberRegistration = await prisma.teamRegistration.findFirst({
        where: {
          userId,
          teamId: team.id,
        },
      });

      await prisma.team.update({
        where: {
          id: team.id,
        },
        data: {
          members: {
            update: {
              where: {
                id: memberRegistration!.id,
              },
              data: {
                registrationStatus: RegistrationStatus.REGISTERED,
              },
            },
          },
        },
      });

      // Check if all other members have registered
      let allMembersRegistered = true;

      team.members.forEach((member) => {
        if (member.userId !== userId) {
          allMembersRegistered &&=
            member.registrationStatus === RegistrationStatus.REGISTERED;
        }
      });

      if (allMembersRegistered) {
        // Update Team Status
        await prisma.team.update({
          where: {
            id: teamId,
          },
          data: {
            registrationStatus: RegistrationStatus.REGISTERED,
          },
        });
      }
    });
  }

  return res.json(Success.Team.userStatusUpdated);
};

export { teamRegistrationResponse };
