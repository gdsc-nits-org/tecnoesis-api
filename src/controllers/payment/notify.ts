import { prisma } from "@utils/prisma";
import { cashfree } from "@utils/cashfree";
import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import { Prisma, RegistrationStatus, TeamMemberRole } from "@prisma/client";

const notify: Interfaces.Controller.Async = async (req, res, next) => {
  const { data } = req.body;

  try {
    const isVerified = cashfree.PGVerifyWebhookSignature(
      req.headers["x-webhook-signature"] as string,
      (req as any).rawBody,
      req.headers["x-webhook-timestamp"] as string
    );

    if (!isVerified) {
      return next(Errors.Payment.invalidSignature);
    }

    if (data.order.order_status !== "PAID") {
      await prisma.paymentTransaction.update({
        where: { orderId: data.order.order_id },
        data: { status: "FAILED" },
      });
      return res.status(200).send("OK");
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId: data.order.order_id },
      include: { event: true },
    });

    if (!transaction || transaction.status === "SUCCESS") {
      return res.status(200).send("OK");
    }

    await prisma.paymentTransaction.update({
      where: { orderId: data.order.order_id },
      data: {
        status: "SUCCESS",
        paymentId: data.payment.cf_payment_id,
      },
    });

    const registrationData = JSON.parse(
      transaction.paymentData as string
    ).registrationData;

    const members = registrationData.members as string[];
    const teamName = registrationData.teamName as string;
    const extraInformation = registrationData.extraInformation;

    const memberRegistration: Prisma.TeamRegistrationCreateWithoutTeamInput[] =
      [];

    members.forEach((member) => {
      memberRegistration.push({
        registrationStatus:
          member === transaction.payerId
            ? RegistrationStatus.REGISTERED
            : RegistrationStatus.PENDING,
        role:
          member === transaction.payerId
            ? TeamMemberRole.LEADER
            : TeamMemberRole.MEMBER,
        user: {
          connect: {
            username: member,
          },
        },
      });
    });

    await prisma.team.create({
      data: {
        teamName: teamName,
        registrationStatus:
          members.length === 1
            ? RegistrationStatus.REGISTERED
            : RegistrationStatus.PENDING,
        event: {
          connect: {
            id: transaction.eventId,
          },
        },
        members: {
          create: memberRegistration,
        },
        extraInformation: extraInformation as Prisma.InputJsonValue[],
      },
    });

    // Calculate net amount after Cashfree charges (typically 2% + GST)
    // Cashfree charges approximately 2% + 18% GST = 2.36% total
    const gatewayCharges = transaction.amount * 0.0236;
    const netAmount = transaction.amount - gatewayCharges;

    // Update event's collected payment amount
    await prisma.event.update({
      where: { id: transaction.eventId },
      data: {
        paymentCollected: {
          increment: netAmount,
        },
      },
    });

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
};

export { notify };
