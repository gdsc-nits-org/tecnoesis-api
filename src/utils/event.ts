import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const extractUsername = async (
  users: string[]
): Promise<Prisma.UserWhereUniqueInput[] | undefined> => {
  if (!users) return undefined;
  const userids = [];
  for (let i = 0; i < users.length; i++) {
    const id = users[i];
    if (typeof id !== "string") return undefined;
    if (!(await prisma.user.findFirst({ where: { id } }))) return undefined;
    userids.push({ id });
  }

  return userids;
};

const userIdExist = async (userIds: string[]) => {
  const results = await Promise.all(
    userIds.map(async (id: string) => {
      const user = await prisma.user.findFirst({ where: { id: id } });
      if (!user) {
        return false;
      }
      return true;
    })
  );

  if (!results.every((result) => result)) {
    return false;
  } else {
    return true;
  }
};

const connectId = async (userIds: string[]) => {
  const connectResult = userIds.map((id: string) => {
    return {
      userId: id,
    };
  });

  return connectResult;
};

const connectOrCreateId = async (userIds: string[], eventId: string) => {
  const connectOrCreateResult = userIds.map((id: string) => {
    return {
      create: {
        user: { connect: { id: id } },
      },
      where: {
        userId_eventId: { userId: id, eventId: eventId },
      },
    };
  });

  return connectOrCreateResult;
};

const deleteId = async (userIds: string[], eventId: string) => {
  const deleteResult = userIds.map((id: string) => {
    return {
      userId_eventId: { userId: id, eventId: eventId },
    };
  });

  return deleteResult;
};

export { extractUsername, userIdExist, connectId, connectOrCreateId, deleteId };
