import { insertResumeDownload } from "../services/resume-service.js";
import { validateResumePayload } from "../validators/resume-validator.js";

export async function createResumeDownload(req, res) {
  const payload = validateResumePayload(req.body);
  const savedDownload = await insertResumeDownload(payload);

  res.status(201).json({
    ok: true,
    message: "Resume download tracked successfully.",
    data: {
      id: savedDownload.id,
      createdAt: savedDownload.created_at,
    },
  });
}
