import { createPortfolioEvent } from "../db/event-queries.js";

export async function insertPortfolioEvent(payload) {
  return createPortfolioEvent(payload);
}
