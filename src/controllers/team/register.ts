import { prisma } from "@utils/prisma";
import { Prisma, RegistrationStatus, TeamMemberRole } from "@prisma/client";
import { cashfree } from "@utils/cashfree";

import * as Interfaces from "@interfaces";
import * as Success from "@success";
import * as Errors from "@errors";
import * as Utils from "@utils";

const registerTeam: Interfaces.Controller.Async = async (req, res, next) => {
  const { eventId: EID } = req.params;
  const eventId = String(EID);

  if (!eventId || eventId.length !== 24)
    return next(Errors.Module.invalidInput);

  const { members: memberArray, extraInformation } =
    req.body as Interfaces.Team.RegisterTeamBody;

  let { name } = req.body as Interfaces.Team.RegisterTeamBody;

  name = name.trim();

  memberArray.push(req.user!.username);

  const members = new Set(memberArray);
  // Any duplicate members, including leader,
  // if duplicate is present, gets removed.

  // Get event
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
    select: {
      id: true,
      name: true,
      maxTeamSize: true,
      minTeamSize: true,
      registrationStartTime: true,
      registrationEndTime: true,
      moduleId: true,
      isPaymentRequired: true,
      registrationFee: true,
      accountHolderName: true,
      accountNumber: true,
      ifscCode: true,
      bankName: true,
      upiId: true,
    },
  });

  const module = await prisma.module.findFirst({
    where: {
      id: event?.moduleId,
    },
    select: {
      name: true,
    },
  });

  await prisma.$transaction(async (prisma) => {
    if (members.size !== memberArray.length) {
      return next(Errors.Team.memberDuplicates);
    }

    // Check time
    const now = new Date();
    if (
      now < event!.registrationStartTime ||
      now > event!.registrationEndTime
    ) {
      return next(Errors.Team.timeNotRight);
    }

    if (!event) {
      return next(Errors.Event.eventDoesntExist);
    }

    // Check member limit
    if (
      event!.minTeamSize > members.size ||
      event!.maxTeamSize < members.size
    ) {
      return next(Errors.Team.teamSizeNotAllowed);
    }

    // Check if payment is required
    if (event.isPaymentRequired) {
      if (!event.registrationFee || event.registrationFee <= 0) {
        return next(Errors.Payment.paymentMethodNotConfigured);
      }

      // Create order in Cashfree
      const orderId = `${eventId}_${req.user!.id}_${Date.now()}`;
      const orderAmount = event.registrationFee;

      /* eslint-disable camelcase */
      // Validate bank account details are present
      if (!event.accountHolderName || !event.accountNumber || !event.ifscCode) {
        return next(Errors.Payment.paymentMethodNotConfigured);
      }

      const orderResponse = await cashfree.PGCreateOrder({
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: req.user!.id,
          customer_name: `${req.user!.firstName} ${req.user!.lastName}`,
          customer_email: req.user!.email,
          customer_phone: req.user!.phoneNumber,
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/payment/verify?orderId=${orderId}`,
          notify_url: `${process.env.API_URL}/payment/notify`,
        },
        order_note: JSON.stringify({
          members: Array.from(members),
          extraInformation,
        }),
      });
      /* eslint-enable camelcase */

      // Store payment details and pending team registration
      const payment = await prisma.paymentTransaction.create({
        data: {
          orderId: orderId,
          amount: orderAmount,
          status: "PENDING",
          event: { connect: { id: eventId } },
          payer: { connect: { id: req.user!.id } },
          paymentData: JSON.stringify({
            registrationData: {
              teamName: name,
              members: Array.from(members),
              extraInformation,
            },
          }),
        },
      });

      // Return payment link to complete registration
      return res.json({
        status: 200,
        message: "Payment required to complete registration",
        data: {
          paymentLink: orderResponse.data.payment_session_id,
          orderId: payment.orderId,
          amount: orderAmount,
          eventName: event.name,
        },
      });
    }

    // If no payment required, proceed with normal registration
    // Check team name
    const teamTaken = await prisma.team.count({
      where: {
        eventId,
        teamName: name,
        OR: [
          {
            registrationStatus: RegistrationStatus.REGISTERED,
          },
          {
            registrationStatus: RegistrationStatus.PENDING,
          },
        ],
      },
      take: 1,
    });

    if (teamTaken !== 0) {
      return next(Errors.Team.teamAlreadyExists);
    }

    // Check if users exist and if registered in another team.
    for await (const member of members) {
      const user = await prisma.user.count({
        where: { username: member },
        take: 1,
      });

      if (user === 0) {
        return next(Errors.User.userNotFound);
      }

      const belongsToTeam = await prisma.teamRegistration.count({
        where: {
          registrationStatus: RegistrationStatus.REGISTERED,
          user: {
            username: member,
          },
          team: {
            event: {
              id: eventId,
            },
          },
        },
        take: 1,
      });

      if (belongsToTeam !== 0) {
        return next(Errors.Team.userAlreadyRegistered);
      }
    }

    // Creating a connection array after modifying data from front-end
    const memberRegistration: Prisma.TeamRegistrationCreateWithoutTeamInput[] =
      [];

    members.forEach((member) => {
      memberRegistration.push({
        registrationStatus:
          member === req.user!.username
            ? RegistrationStatus.REGISTERED
            : RegistrationStatus.PENDING,
        role:
          member === req.user!.username
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
        teamName: name,
        registrationStatus:
          members.size === 1
            ? RegistrationStatus.REGISTERED
            : RegistrationStatus.PENDING,
        event: {
          connect: {
            id: eventId,
          },
        },
        members: {
          create: memberRegistration,
        },
        extraInformation: extraInformation as Prisma.InputJsonValue[],
      },
    });

    // Send Emails to User
    for await (const member of members) {
      const user = await prisma.user.findFirst({
        where: {
          username: member,
        },
      });

      if (!user) {
        return next(Errors.User.userNotFound);
      }

      let html;
      let subject;
      if (member === req.user!.username) {
        html = Utils.HTML.createRegisterCreationHTML({
          eventName: event!.name,
          leaderName: user.firstName,
          moduleName: module!.name,
          teamName: name,
        });

        subject = `Team Registration Application Submitted | ${process.env.NAME}`;
      } else {
        if (event.maxTeamSize === 1) {
          html = Utils.HTML.sucessfullyRegisteredHTML({
            eventName: event!.name,
            leaderName: user.firstName,
            moduleName: module!.name,
          });
          subject = `Successfully Registered for ${event.name} | ${process.env.NAME}`;
        } else {
          html = Utils.HTML.createRegisterInvitationHTML({
            eventName: event!.name,
            leaderName: user.firstName,
            moduleName: module!.name,
          });
          subject = `Team Invitation for ${name} | ${process.env.NAME}`;
        }
      }

      Utils.Email.sendMail(user.email, html, subject); // Await Not Used On Purpose
    }

    return res.json(Success.Team.teamCreated);
  });
};

export { registerTeam };
