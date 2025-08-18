import { Router } from "express";
import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";
import { upload } from "@utils/upload";
import { uploadErrors } from "@middlewares/upload";

const router: Router = Router({ mergeParams: true });

router.get("/search/", Controllers.User.searchUsers);
router.get("/", Controllers.User.getAllUsers);

router.get(
  "/me/my_teams",
  Middlewares.Auth.validateUser,
  Controllers.User.getMyTeams
);

router.get(
  "/me",
  Middlewares.Auth.validateUser,
  Controllers.User.getLogedInUser
);

router.patch(
  "/",
  Middlewares.Auth.validateUser,
  upload.single("image"), // middleware for uploading
  uploadErrors,
  Controllers.User.updateUserDetails
);

router.get("/:id", Middlewares.Auth.isAdmin, Controllers.User.getOneUserById);

export default router;
