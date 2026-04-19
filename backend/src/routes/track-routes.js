import { Router } from "express";
import {
  trackPageView,
  trackProjectClick,
  trackResumeDownload,
} from "../controllers/track-controller.js";

export const trackRouter = Router();

trackRouter.post("/page-view", trackPageView);
trackRouter.post("/project-click", trackProjectClick);
trackRouter.post("/resume-download", trackResumeDownload);
