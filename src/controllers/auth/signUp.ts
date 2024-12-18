import * as Interfaces from "@interfaces";
import * as Errors from "@errors";
import * as Success from "@success";
import * as Utils from "@utils";

import { prisma } from "@utils/prisma";

const signUp: Interfaces.Controller.Async = async (req, res, next) => {
  const auth: string | undefined = req?.headers?.authorization;

  const user: Interfaces.User.CreateUserBody = req.body;

  let {
    username,
    firstName,
    middleName,
    lastName,
    collegeName,
    registrationId,
    email,
    imageUrl,
    phoneNumber,
  } = user;

  if (
    !username ||
    !firstName ||
    !lastName ||
    !collegeName ||
    !email ||
    !phoneNumber
  ) {
    return next(Errors.User.badRequest("Required fields missing"));
  }

  if (!auth) {
    return next(Errors.User.badRequest("Auth token is missing"));
  }

  username = username.trim();
  firstName = firstName.trim();
  lastName = lastName.trim();
  middleName = middleName?.trim();
  collegeName = collegeName.trim();
  registrationId = registrationId?.trim();
  email = email.trim();
  imageUrl = imageUrl?.trim();
  phoneNumber = phoneNumber.trim();

  if (!Utils.User.validateUsername(username)) {
    return next(Errors.User.notAcceptable("Username not Acceptable"));
  }

  if (!Utils.User.validatePhoneNumber(phoneNumber)) {
    return next(Errors.User.notAcceptable("Phone number not Acceptable"));
  }
  const idToken: string = (auth as string).split(" ")[1];

  const firebaseAuth = Utils.Firebase.firebaseAdmin.auth();

  let decodedToken;

  try {
    if (process.env.NODE_ENV === "development") {
      decodedToken = {
        uid: idToken,
      };
    } else {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    }
  } catch (err) {
    return next(err);
  }

  if (!decodedToken) {
    return next(Errors.User.userNotAuthenticated);
  }

  const { uid, email: firebaseEmail, picture } = decodedToken;

  const userExists: number = await prisma.user.count({
    where: {
      OR: [
        {
          firebaseId: uid,
        },
        {
          email:
            process.env.NODE_ENV === "development" ? email : firebaseEmail!,
        },
        {
          username: username,
        },
      ],
    },
  });

  if (userExists) {
    return next(Errors.User.userAlreadyExists);
  }

  await prisma.user.create({
    data: {
      email: process.env.NODE_ENV === "development" ? email : firebaseEmail!,
      collegeName: collegeName,
      registrationId: registrationId,
      firebaseId: uid,
      firstName: firstName,
      middleName: middleName ? middleName : "",
      lastName: lastName,
      phoneNumber: phoneNumber,
      imageUrl: imageUrl || picture || "https://picsum.photos/200",
      username: username,
    },
  });

  return res.json(Success.User.userCreated);
};

export { signUp };
