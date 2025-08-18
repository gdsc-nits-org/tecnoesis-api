import { Router } from "express";
import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";
import { upload } from "@utils/upload";
import { uploadErrors } from "@middlewares/upload";

const router: Router = Router({ mergeParams: true });

router.post(
  "/create",
  Middlewares.Auth.isAdmin,
  upload.single("posterImage"), // event poster upload
  uploadErrors,
  Controllers.Event.createEvent
);

router.post(
  "/add/organiser/:eventId",
  Middlewares.Auth.isAdmin,
  Controllers.Event.addOrganizer
);

router.post(
  "/add/manager/:eventId",
  Middlewares.Auth.isAdmin,
  Controllers.Event.addManager
);

router.get("/:eventId", Controllers.Event.getEventById);
router.get("/", Controllers.Event.getAllEvents);

router.patch(
  "/:eventId/",
  Middlewares.Auth.isAdmin,
  upload.single("posterImage"), //updating event poster
  uploadErrors,
  Controllers.Event.updateEvent
);

router.delete(
  "/:eventId/",
  Middlewares.Auth.isAdmin,
  Controllers.Event.deleteEvent
);

export default router;
