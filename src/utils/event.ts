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

const userIdExist = async (organizers: string[]) => {
  const results = await Promise.all(
    organizers.map(async (organizer: string) => {
      const user = await prisma.user.findFirst({ where: { id: organizer } });
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

export { extractUsername, userIdExist };
