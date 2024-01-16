import { Router } from "express";

import * as Controllers from "@controllers";
import * as Middlewares from "@middlewares";

const router: Router = Router({ mergeParams: true });

router.post("/signUp", Controllers.Auth.signUp);

router.get("/isAdmin", Middlewares.Auth.isAdmin, Controllers.Auth.checkAdmin);

export default router;
