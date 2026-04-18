import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { contactRouter } from "./routes/contact-routes.js";
import { eventRouter } from "./routes/event-routes.js";
import { healthRouter } from "./routes/health-routes.js";
import { resumeRouter } from "./routes/resume-routes.js";
import { statsRouter } from "./routes/stats-routes.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/contact", contactRouter);
app.use("/api/events", eventRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/stats", statsRouter);

app.use(errorHandler);
