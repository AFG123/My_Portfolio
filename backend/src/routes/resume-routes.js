import { Router } from "express";
import { createResumeDownload } from "../controllers/resume-controller.js";

export const resumeRouter = Router();

resumeRouter.post("/download", createResumeDownload);
