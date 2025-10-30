import { Router } from "express";

import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";
import { upload } from "@utils/upload";

const router: Router = Router({ mergeParams: true });

// ROOT = /api/team

router.post(
  "/event/:eventId/add",
  Middlewares.Auth.validateUser,
  Middlewares.Event.isEventValid,
  upload.single("verificationPhoto"), // Payment verification photo upload
  Controllers.Team.registerTeam
);

router.get(
  "/:teamId",
  Middlewares.Auth.validateUser,
  Middlewares.Team.isValidTeamId,
  Controllers.Team.getTeamDetails
);

router.get(
  "/event/:eventId/registered_teams",
  Middlewares.Auth.isOrganizerOrAdmin,
  Middlewares.Event.isEventValid,
  Controllers.Team.getAllTeamsOfEvent
);

router.patch(
  "/:teamId/respond",
  Middlewares.Auth.validateUser,
  Controllers.Team.teamRegistrationResponse
);

router.delete(
  "/:teamId",
  Middlewares.Team.fetchEventIdOfTeam,
  Middlewares.Auth.isOrganizerOrAdmin,
  Controllers.Team.deleteTeamById
);

export default router;
