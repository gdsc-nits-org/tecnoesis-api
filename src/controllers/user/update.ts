import * as Interfaces from "@interfaces";
import * as Success from "@success";
import * as Utils from "@utils";
import * as Errors from "@errors";

import { prisma } from "@utils/prisma";

const updateUserDetails: Interfaces.Controller.Async = async (
  req,
  res,
  next
) => {
  let {
    firstName,
    lastName,
    middleName,
    collegeName,
    registrationId,
    phoneNumber,
    imageUrl,
  } = req.body as Interfaces.User.UserUpdateBody;

  const user = req.user;

  if (!user) {
    return next(Errors.User.userNotFound);
  }

  firstName = firstName || user.firstName;
  lastName = lastName || user.lastName;
  middleName = middleName === "" ? "" : middleName || user.middleName;
  collegeName = collegeName || user.collegeName;
  registrationId = registrationId || user.registrationId;
  phoneNumber = phoneNumber || user.phoneNumber;
  imageUrl = imageUrl || user.imageUrl;

  if (phoneNumber && !Utils.User.validatePhoneNumber(phoneNumber)) {
    return next(Errors.User.notAcceptable("Phone number not acceptable"));
  }

  try {
    const updatedUser = await prisma.$transaction(async (prismaClient) => {
      if (
        await prismaClient.user.findFirst({
          where: {
            registrationId: registrationId,
            collegeName: collegeName || "",
            firebaseId: { not: user.firebaseId },
          },
        })
      ) {
        throw Errors.User.notAcceptable("Registration id already in use");
      }

      if (
        phoneNumber &&
        (await prismaClient.user.findFirst({
          where: {
            phoneNumber: phoneNumber,
            firebaseId: { not: user.firebaseId },
          },
        }))
      ) {
        throw Errors.User.notAcceptable("Phone number already in use");
      }

      return await prismaClient.user.update({
        where: {
          firebaseId: user.firebaseId,
        },
        data: {
          firstName,
          lastName,
          middleName,
          collegeName,
          registrationId,
          phoneNumber,
          imageUrl,
        },
      });
    });
    res.json(Success.User.updateUserResponse(updatedUser));
  } catch (error) {
    return next(error);
  }
};

export { updateUserDetails };
