import { Router } from "express";
import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";
import { upload } from "@utils/upload";


const router: Router = Router({ mergeParams: true });

router.post(
  "/create",
  Middlewares.Auth.isAdmin,
  upload.single("posterImage"), // event poster upload
  Controllers.Event.createEvent
);

router.post(
  "/add/organiser/:eventId",
  Middlewares.Auth.isOrganizerOrAdmin,
  Controllers.Event.addOrganizer
);

router.get("/:eventId", Controllers.Event.getEventById);
router.get("/", Controllers.Event.getAllEvents);

router.patch(
  "/:eventId/",
  Middlewares.Auth.isOrganizerOrAdmin,
  upload.single("posterImage"), //updating event poster
  Controllers.Event.updateEvent
);

router.delete(
  "/:eventId/",
  Middlewares.Auth.isAdmin,
  Controllers.Event.deleteEvent
);

export default router;
