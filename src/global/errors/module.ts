import * as Utils from "@utils";

const invalidInput = Utils.Response.Error("Invalid input", 400);
const moduleNotFound = Utils.Response.Error("Module does not exist", 404);
const eventNotFound = Utils.Response.Error("Event does not exist", 404);
const userUnauthorized = Utils.Response.Error(
  "User is not authorized to perform the request",
  403
);

const extraQuestionsJSONInvalid = Utils.Response.Error(
  "Extra questions misc JSON is invalid",
  400
);

const invalidAttribute = Utils.Response.Error(
  "One or more required attributes invalid [description, posterImage, lat, lng, maxTeamSize, minTeamSize, moduleId, name, prizeDescription, registrationEndTime, registrationStartTime, stagesDescription, venue]",
  400
);

const moduleIdInvalid = Utils.Response.Error("Invalid moduleId", 400);

const teamSizeMismatch = Utils.Response.Error(
  "minTeamSize cannot exceed maxTeamSize",
  400
);

const timingInvalid = Utils.Response.Error(
  "Invalid values for registrationStartTime and registrationEndTIme",
  400
);

const thirdPartyURLInvalid = Utils.Response.Error(
  "Invalid value received for thirdPartyURL",
  400
);

const organizerIdInvalid = Utils.Response.Error("Invalid organizer id(s)", 400);

const managerIdInvalid = Utils.Response.Error("Invalid manager id(s)", 400);

export {
  managerIdInvalid,
  organizerIdInvalid,
  thirdPartyURLInvalid,
  invalidInput,
  moduleNotFound,
  eventNotFound,
  userUnauthorized,
  extraQuestionsJSONInvalid,
  invalidAttribute,
  moduleIdInvalid,
  teamSizeMismatch,
  timingInvalid,
};
