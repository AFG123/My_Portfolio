import { createContactMessage } from "../db/contact-queries.js";

export async function insertContactMessage(payload) {
  return createContactMessage(payload);
}
