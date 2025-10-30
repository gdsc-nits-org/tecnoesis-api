import { Router } from "express";
import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";
import { upload } from "@utils/upload";

const router: Router = Router({ mergeParams: true });

router.post(
  "/create",
  Middlewares.Auth.isAdmin,
  upload.fields([
    { name: "posterImage", maxCount: 1 },
    { name: "upiQrCode", maxCount: 1 },
  ]), // event poster and UPI QR code upload
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
  upload.fields([
    { name: "posterImage", maxCount: 1 },
    { name: "upiQrCode", maxCount: 1 },
  ]), // updating event poster and UPI QR code
  Controllers.Event.updateEvent
);

router.delete(
  "/:eventId/",
  Middlewares.Auth.isOrganizerOrAdmin,
  Controllers.Event.deleteEvent
);

export default router;
