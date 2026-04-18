import { insertContactMessage } from "../services/contact-service.js";
import { validateContactPayload } from "../validators/contact-validator.js";

export async function createContactMessage(req, res) {
  const payload = validateContactPayload(req.body);
  const savedMessage = await insertContactMessage(payload);

  res.status(201).json({
    ok: true,
    message: "Message sent successfully.",
    data: {
      id: savedMessage.id,
      createdAt: savedMessage.created_at,
    },
  });
}
