import { Router } from "express";
import { createContactMessage } from "../controllers/contact-controller.js";
import { contactRateLimit } from "../middleware/rate-limit.js";

export const contactRouter = Router();

contactRouter.post("/", contactRateLimit, createContactMessage);
