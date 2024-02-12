import * as Utils from "@utils";

const eventDoesntExist = Utils.Response.Error("Event doesn't exist.", 404);

const unableToCreate = Utils.Response.Error("Unable to create the event", 400);

export { eventDoesntExist, unableToCreate };
