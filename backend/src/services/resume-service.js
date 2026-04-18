import { createResumeDownload } from "../db/resume-queries.js";

export async function insertResumeDownload(payload) {
  return createResumeDownload(payload);
}
