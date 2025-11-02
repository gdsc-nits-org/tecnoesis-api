import { prisma } from "@utils/prisma";
import * as Interfaces from "@interfaces";
import * as Success from "@success";

const optIn: Interfaces.Controller.Async = async (req, res, _next) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { hasOpted: false },
  });

  return res.json(Success.Merch.optedIn());
};

const getOptOutStatus: Interfaces.Controller.Async = async (
  _req,
  res,
  _next
) => {
  const users = await prisma.user.findMany({
    where: { hasOpted: false },
    select: {
      firstName: true,
      middleName: true,
      lastName: true,
      registrationId: true,
      collegeName: true,
      email: true,
      hasOpted: true,
    },
  });
  const header =
    "firstName,middleName,lastName,registrationId,collegeName,email,hasOpted\n";
  const rows = users
    .map((u) =>
      [
        u.firstName,
        u.middleName || "",
        u.lastName,
        u.registrationId || "",
        u.collegeName,
        u.email,
        u.hasOpted,
      ].join(",")
    )
    .join("\n");
  const csv = header + rows;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="users-opt-status.csv"'
  );
  return res.send(csv);
};

export { optIn, getOptOutStatus };
