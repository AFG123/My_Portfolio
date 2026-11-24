import type { ArchitectureConfig } from "./types";

// Verified against Sweety's reading routes, middleware, service, and 001_init_schema.sql.
export const sweetyReadingArchitecture: ArchitectureConfig = {
  title: "Record one glucose reading",
  description: "A signed-in user submits a date, one of four daily slots, and a whole-number value. Express checks the request; PostgreSQL enforces the final unique-slot and value-range rules.",
  canvasLabels: ["01 / AUTHENTICATED WRITE", "02 / DATABASE GUARANTEES"],
  mobileHandoff: { afterNode: "validation", text: "The API checks date, slot, and value before insertion. PostgreSQL still enforces UNIQUE (user_id, reading_date, slot) and CHECK (value BETWEEN 40 AND 600), including when requests race." },
  nodes: [
    { id: "browser", label: "React form", role: "Date · slot · mg/dL", detail: "The recording modal submits reading_date, slot, and value. The client sends cookies with requests and a CSRF header for state-changing calls.", tech: ["React", "POST /api/v1/readings"], x: 9, y: 50 },
    { id: "api", label: "Express route", role: "Create a reading", detail: "The reading route applies authentication, CSRF protection, and create validation before the controller calls readingService.createReading with the authenticated user ID.", tech: ["Express 5", "readingRoutes", "readingService"], x: 28, y: 50 },
    { id: "security", label: "Auth + CSRF", role: "Cookie + header checks", detail: "requireAuth verifies the access-token cookie and supplies req.user.id. csrfProtection requires the X-CSRF-Token header to match the signed CSRF cookie on reading writes.", tech: ["HttpOnly access cookie", "JWT", "X-CSRF-Token"], x: 48, y: 50 },
    { id: "validation", label: "Input validation", role: "Date · slot · range", detail: "The middleware accepts a real YYYY-MM-DD date that is not in the future in Asia/Kolkata, one of four fixed slots, and an integer from 40 to 600 mg/dL.", tech: ["readingValidation", "Asia/Kolkata", "40–600 mg/dL"], x: 68, y: 50 },
    { id: "database", label: "PostgreSQL", role: "Unique slot + value CHECK", detail: "glucose_readings stores the user, date, slot, and value. UNIQUE (user_id, reading_date, slot) prevents two readings in one slot even under concurrent inserts; CHECK (value BETWEEN 40 AND 600) rejects out-of-range values at the database boundary.", tech: ["glucose_readings", "UNIQUE user/date/slot", "CHECK 40–600"], x: 88, y: 50 },
  ],
  edges: [
    { id: "submit", from: "browser", to: "api", fromSide: "right", toSide: "left", label: "POST READING", labelAt: { x: 18, y: 39 } },
    { id: "authenticate", from: "api", to: "security", fromSide: "right", toSide: "left", label: "AUTH + CSRF", labelAt: { x: 38, y: 39 } },
    { id: "validate", from: "security", to: "validation", fromSide: "right", toSide: "left", label: "VALIDATE", labelAt: { x: 58, y: 39 } },
    { id: "insert", from: "validation", to: "database", fromSide: "right", toSide: "left", label: "INSERT ROW", labelAt: { x: 78, y: 39 } },
    { id: "db_result", from: "database", to: "api", fromSide: "top", toSide: "top", fromOffset: -.35, toOffset: .35, laneY: 25, label: "ROW OR UNIQUE CONFLICT", labelAt: { x: 59, y: 19 } },
    { id: "response", from: "api", to: "browser", fromSide: "top", toSide: "top", fromOffset: -.45, toOffset: .45, laneY: 14, label: "201 Created / 409 Conflict", labelAt: { x: 18, y: 13 } },
  ],
  steps: [
    { title: "Submit date, slot, and value", plain: "The user chooses a calendar date and one of four daily slots, then submits a glucose value in mg/dL.", technical: "The client calls POST /api/v1/readings with reading_date, slot, and value. Its API helper includes cookies and a CSRF header for writes.", nodes: ["browser", "api"], edges: ["submit"] },
    { title: "Verify the session and CSRF token", plain: "The route verifies the signed-in user's access cookie and checks the CSRF header before accepting a write.", technical: "requireAuth sets req.user.id only after JWT verification. csrfProtection compares the supplied token against the HMAC signature in the _csrf cookie.", nodes: ["api", "security"], edges: ["authenticate"] },
    { title: "Validate the reading", plain: "The API rejects an invalid date, future date, unsupported slot, non-integer value, or value outside 40–600 mg/dL.", technical: "The date check uses Asia/Kolkata for the current day. The four slots are MORNING_FASTING, AFTER_BREAKFAST, AFTER_LUNCH, and AFTER_DINNER.", nodes: ["security", "validation"], edges: ["validate"] },
    { title: "Enforce database constraints", plain: "PostgreSQL accepts at most one reading per user, date, and slot and rejects values outside the allowed range. These checks still apply if concurrent requests pass the API's preliminary lookup.", technical: "The migration defines UNIQUE (user_id, reading_date, slot) and CHECK (value BETWEEN 40 AND 600). readingService maps a PostgreSQL 23505 unique violation to HTTP 409.", nodes: ["validation", "database"], edges: ["insert", "db_result"] },
    { title: "Return saved row or conflict", plain: "A successful insert returns the saved reading. If the slot was already used, the API returns a duplicate-slot conflict.", technical: "The service first checks for an existing slot for a clearer error, then catches a 23505 constraint violation in case two inserts race. The controller returns 201 on success or passes the 409 error to the central handler.", nodes: ["database", "api", "browser"], edges: ["db_result", "response"] },
  ],
};

// Verified against reportRoutes, reportController, reportDates, and reportService.
export const sweetyReportArchitecture: ArchitectureConfig = {
  title: "Build a date-based report",
  description: "The authenticated API calculates a date range, queries only that user's readings, and returns highest, lowest, average, and count. Daily reports also include the four slots' recorded rows.",
  canvasLabels: ["01 / AUTHENTICATED REPORT", "02 / USER-SCOPED SQL"],
  mobileHandoff: { afterNode: "api", text: "The report service calculates the requested calendar range, then queries glucose_readings with the authenticated user ID. The daily report makes a second query for its ordered slot rows." },
  nodes: [
    { id: "browser", label: "Analytics view", role: "Daily · MTD · previous", detail: "The React analytics view chooses daily, month-to-date, or previous-month reporting and requests the selected date through the reports API.", tech: ["React", "GET /api/v1/reports"], x: 11, y: 50 },
    { id: "api", label: "Express API", role: "Auth + date parameter", detail: "All report routes require a valid access-token cookie. The controller validates a real YYYY-MM-DD date and passes req.user.id to the report service.", tech: ["requireAuth", "reportController"], x: 38, y: 50 },
    { id: "database", label: "PostgreSQL", role: "Scoped aggregate", detail: "The report service runs MAX, MIN, rounded AVG, and COUNT over glucose_readings filtered by user_id and the inclusive date range. Daily reports run another SELECT for that date's rows in slot order.", tech: ["user_id filter", "MAX / MIN / AVG / COUNT", "daily slot SELECT"], x: 74, y: 50 },
    { id: "range", label: "Date-range helper", role: "Calendar boundaries", detail: "Daily uses the selected date; month-to-date starts on the first of that month; monthly uses the entire previous calendar month. The helper returns bounds to the report service and does not query PostgreSQL itself.", tech: ["reportDates", "inclusive bounds", "previous month"], x: 38, y: 82, group: "dependency" },
  ],
  edges: [
    { id: "request", from: "browser", to: "api", fromSide: "right", toSide: "left", label: "REPORT REQUEST", labelAt: { x: 25, y: 39 } },
    { id: "calculate", from: "api", to: "range", fromSide: "bottom", toSide: "top", fromOffset: -.5, toOffset: -.5, label: "CALCULATE RANGE", labelAt: { x: 28, y: 69 } },
    { id: "bounds", from: "range", to: "api", fromSide: "top", toSide: "bottom", fromOffset: .5, toOffset: .5 },
    { id: "query", from: "api", to: "database", fromSide: "right", toSide: "left", label: "USER + DATE FILTER", labelAt: { x: 57, y: 39 } },
    { id: "result", from: "database", to: "api", fromSide: "top", toSide: "top", fromOffset: -.45, toOffset: .45, laneY: 26, label: "STATS + DAILY ROWS", labelAt: { x: 57, y: 20 } },
    { id: "response", from: "api", to: "browser", fromSide: "top", toSide: "top", fromOffset: -.45, toOffset: .45, laneY: 14, label: "REPORT JSON", labelAt: { x: 25, y: 9 } },
  ],
  steps: [
    { title: "Choose a report", plain: "The analytics view requests daily, month-to-date, or previous-month statistics for a selected date.", technical: "GET /api/v1/reports/daily, /month-to-date, and /monthly require authentication and a valid date=YYYY-MM-DD query parameter.", nodes: ["browser", "api"], edges: ["request"] },
    { title: "Calculate the calendar range", plain: "The service derives inclusive start and end dates. Previous-month reporting is the whole month before the selected date's month.", technical: "getDailyRange uses one date; getMonthToDateRange starts on day 1; getPreviousMonthRange calculates the previous month, including the year boundary.", nodes: ["api", "range"], edges: ["calculate", "bounds"] },
    { title: "Aggregate only this user's rows", plain: "PostgreSQL filters by the authenticated user ID and date range, then calculates highest, lowest, average, and total count.", technical: "The aggregate query uses WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3. AVG is rounded to one decimal. An empty range returns null for high, low, and average, with count zero.", nodes: ["api", "database"], edges: ["query", "result"] },
    { title: "Add daily slot details", plain: "Only the daily report also loads that date's individual readings, ordered from fasting through after dinner.", technical: "getDailyReport runs a second user-scoped SELECT for reading_date and sorts rows with a CASE expression over the four slots. Month-to-date and previous-month responses contain summaries only.", nodes: ["api", "database"], edges: ["query", "result"] },
    { title: "Return the report", plain: "The API sends the selected range and summary back to the analytics view, with the daily rows when applicable.", technical: "The JSON includes report_type, start_date, end_date, summary, and daily readings when requested. The React view renders summary values and a daily slot breakdown.", nodes: ["database", "api", "browser"], edges: ["result", "response"] },
  ],
};
