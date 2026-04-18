import { insertPortfolioEvent } from "../services/event-service.js";
import { validateEventPayload } from "../validators/event-validator.js";

export async function createPortfolioEvent(req, res) {
  const payload = validateEventPayload(req.body);
  const savedEvent = await insertPortfolioEvent(payload);

  res.status(201).json({
    ok: true,
    message: "Event tracked successfully.",
    data: {
      id: savedEvent.id,
      createdAt: savedEvent.created_at,
    },
  });
}
