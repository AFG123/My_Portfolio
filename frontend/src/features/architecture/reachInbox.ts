import type { ArchitectureConfig } from "./types";

// Mapped from ReachInbox backend/src/controllers/emailController.ts,
// queues/emailQueue.ts, workers/emailWorker.ts, and services/mailer.ts.
export const reachInboxArchitecture: ArchitectureConfig = {
  title: "Follow one scheduled email",
  description: "An email is saved in PostgreSQL, scheduled through BullMQ, checked against sender limits, and delivered by a background worker.",
  mobileHandoff: { afterNode: "database", text: "After PostgreSQL commits, the Express API adds delayed jobs to BullMQ. The database does not call the queue." },
  nodes: [
    { id: "browser", label: "Browser", role: "Campaign form", detail: "The React interface accepts recipients from text or CSV and sends a campaign schedule request.", tech: ["React", "TypeScript"], x: 9, y: 44 },
    { id: "api", label: "Express API", role: "Authenticated request", detail: "POST /api/emails/schedule checks the session, validates the payload with Zod, and confirms that the sender belongs to the user.", tech: ["Express", "Zod", "Passport session"], x: 25, y: 44 },
    { id: "database", label: "PostgreSQL", role: "Campaign and email rows", detail: "Prisma writes a campaign and PENDING email records in one database transaction. The worker also reads email state and writes processing or delivery status here.", tech: ["PostgreSQL", "Prisma"], x: 41, y: 44 },
    { id: "queue", label: "BullMQ queue", role: "Delayed Redis jobs", detail: "After the database transaction commits, the Express API adds one delayed BullMQ job per email to Redis. PostgreSQL does not enqueue the jobs itself.", tech: ["BullMQ", "Redis"], x: 57, y: 44 },
    { id: "worker", label: "Email worker", role: "Background processing", detail: "The BullMQ worker receives due jobs, loads the email from PostgreSQL, checks its state, and marks it PROCESSING before attempting delivery.", tech: ["BullMQ Worker", "Prisma"], x: 73, y: 44 },
    { id: "smtp", label: "SMTP transport", role: "Nodemailer send", detail: "The worker calls Nodemailer to send through the configured SMTP server. The repository uses Ethereal for local test messages.", tech: ["Nodemailer", "SMTP / Ethereal"], x: 89, y: 44 },
    { id: "limits", label: "Redis sender limits", role: "Hourly count + spacing", detail: "The worker uses Redis for a fixed UTC-hour sender counter and last-sent timestamp. Over-limit work is requeued by the worker for the next hour; spacing may make it wait.", tech: ["Redis INCR", "Sender spacing"], x: 73, y: 76, group: "dependency" },
  ],
  edges: [
    { id: "request", from: "browser", to: "api", fromSide: "right", toSide: "left" },
    { id: "persist", from: "api", to: "database", fromSide: "right", toSide: "left", label: "Write + commit", labelAt: { x: 33, y: 55 } },
    { id: "enqueue", from: "api", to: "queue", fromSide: "bottom", toSide: "bottom", laneY: 63, label: "API enqueues after commit", labelAt: { x: 38, y: 70 } },
    { id: "dispatch", from: "queue", to: "worker", fromSide: "right", toSide: "left" },
    { id: "lookup", from: "database", to: "worker", fromSide: "top", toSide: "top", fromOffset: .45, toOffset: .45, laneY: 27, label: "Worker loads email state", labelAt: { x: 55, y: 32 } },
    { id: "state", from: "worker", to: "database", fromSide: "top", toSide: "top", fromOffset: -.45, toOffset: -.45, laneY: 14, label: "Worker writes delivery status", labelAt: { x: 52, y: 9 } },
    { id: "check", from: "worker", to: "limits", fromSide: "bottom", toSide: "top", label: "Sender limit + spacing", labelAt: { x: 83, y: 66 } },
    { id: "deliver", from: "worker", to: "smtp", fromSide: "right", toSide: "left" },
  ],
  steps: [
    { title: "Submit a campaign", plain: "The browser sends the schedule request. The API checks the user's session, validates the message and recipients, and checks ownership of the sender profile.", technical: "POST /api/emails/schedule uses the authentication middleware and a Zod schema before looking up the sender by both sender ID and user ID.", nodes: ["browser", "api"], edges: ["request"], pin: { x: 17, y: 44 } },
    { title: "Commit the schedule", plain: "The Express API writes the campaign and its PENDING email records to PostgreSQL in one transaction. That transaction commits before any job is queued.", technical: "A Prisma transaction creates the Campaign row and Email rows, with each scheduledAt offset by the configured delay. Only after the transaction returns does the API schedule BullMQ jobs.", nodes: ["api", "database"], edges: ["persist"], pin: { x: 33, y: 44 } },
    { title: "Enqueue delayed jobs", plain: "After PostgreSQL commits, the Express API adds one delayed BullMQ job per email. Redis holds those jobs until their scheduled times.", technical: "scheduleEmailJob(email.id, delayFromNow) runs in the API after the Prisma transaction returns. PostgreSQL does not call BullMQ. The queue has retry attempts and exponential backoff.", nodes: ["api", "database", "queue"], edges: ["enqueue"], pin: { x: 50, y: 63 } },
    { title: "Claim and check work", plain: "A worker receives the due job from BullMQ, then reads the email and its saved state from PostgreSQL.", technical: "The worker skips SENT rows and non-stale PROCESSING rows, then writes PROCESSING in PostgreSQL before delivery.", nodes: ["queue", "worker", "database"], edges: ["dispatch", "lookup"], pin: { x: 65, y: 44 } },
    { title: "Apply sender limits", plain: "The worker checks the sender's hourly count and spacing in Redis. If the limit is reached, the worker requeues the email for the next hour.", technical: "The worker uses a fixed UTC-hour INCR key and a last-sent timestamp. Spacing can make a worker slot sleep before delivery.", nodes: ["worker", "limits"], edges: ["check"], pin: { x: 73, y: 61 } },
    { title: "Attempt SMTP delivery", plain: "The worker sends the message through Nodemailer using the configured SMTP account.", technical: "The local setup uses Ethereal SMTP. The documented Render deployment blocks outbound SMTP ports, so its live demo cannot transmit test emails.", nodes: ["worker", "smtp"], edges: ["deliver"], pin: { x: 81, y: 44 } },
    { title: "Record the result", plain: "The worker records SENT or FAILED in PostgreSQL. The dashboard reads those stored states when it refreshes.", technical: "The worker writes PROCESSING before delivery and SENT or FAILED afterward, with timestamps, attempts, and errors as applicable. The frontend polls the scheduled and sent API lists for updated status.", nodes: ["worker", "database"], edges: ["state"], pin: { x: 65, y: 14 } },
  ],
};
