import { Router } from "express";
import { createPortfolioEvent } from "../controllers/event-controller.js";

export const eventRouter = Router();

eventRouter.post("/", createPortfolioEvent);
