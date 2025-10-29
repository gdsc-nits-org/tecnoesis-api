import { Router } from "express";
import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";
import { upload } from "@utils/upload";

const router: Router = Router({ mergeParams: true });

router.post(
  "/create",
  Middlewares.Auth.isAdmin,
  upload.fields([
    { name: "iconImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  Controllers.Module.createModule
);

router.get("/:moduleId/event", Controllers.Event.getEventsByModule);
router.get("/:moduleId", Controllers.Module.getModuleById);
router.get("/", Controllers.Module.getAllModules);

router.delete(
  "/:moduleId/",
  Middlewares.Auth.isAdmin,
  Controllers.Module.deleteModuleById
);

router.patch(
  "/:moduleId",
  Middlewares.Auth.isAdmin,
  upload.fields([
    { name: "iconImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  Controllers.Module.updateModule
);

export default router;
