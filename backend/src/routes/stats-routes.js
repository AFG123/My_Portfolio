import { Router } from "express";
import { getPublicStats } from "../controllers/stats-controller.js";

export const statsRouter = Router();

statsRouter.get("/", getPublicStats);
