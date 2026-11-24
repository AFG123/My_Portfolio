import type { ArchitectureConfig } from "./types";

// Verified against Snip-share's snippetController, snippetService, routes, app.js, and SQL dump.
export const snipShareAccessArchitecture: ArchitectureConfig = {
  title: "From pasted text to a protected link",
  description: "The browser creates a snippet through Express. The API stores its content and settings in PostgreSQL. The return path shows different outcomes: a created link, a protected response, or snippet content after access checks.",
  canvasLabels: ["01 / CREATE + STORE", "02 / LOOKUP + PROTECT"],
  mobileHandoff: { afterNode: "api", text: "CREATE: hash an optional password, then insert the snippet. ACCESS: read the row, check expiry, and compare a supplied password when protected." },
  nodes: [
    { id: "browser", label: "Browser", role: "Create or open a link", detail: "The React form submits content, language, expiry hours or never, and optional password, burn, and download settings. A visitor opens the returned short link to request the snippet.", tech: ["React", "POST /api/snippets", "GET /api/snippets/:shortId"], x: 12, y: 52 },
    { id: "api", label: "Express API", role: "Validate + gate access", detail: "The controller checks required fields and settings on creation. On access it looks up the short ID and checks expiry. Protected snippets return a lock response unless a supplied password matches or the unsigned verification cookie is accepted; that cookie is not a tamper-proof access credential.", tech: ["Express 5", "snippetController", "rate limits"], x: 42, y: 52 },
    { id: "database", label: "PostgreSQL", role: "snippets table", detail: "The snippets row holds content as plaintext, language, title, note, expiry, password hash, burn and download flags, view count, short ID, and management token. Unique short IDs are retried after a constraint collision.", tech: ["pg", "snippets", "unique short_id"], x: 77, y: 52 },
    { id: "bcrypt", label: "bcrypt", role: "Optional password hash", detail: "Creation hashes a supplied password with bcrypt cost 10. The verify endpoint compares it with the stored hash. A match sets an unsigned verified_<shortId>=true cookie for one hour; the cookie itself has no integrity protection.", tech: ["bcrypt.hash", "bcrypt.compare", "POST /:shortId/verify"], x: 42, y: 84, group: "dependency" },
  ],
  edges: [
    { id: "request", from: "browser", to: "api", fromSide: "right", toSide: "left", label: "CREATE / OPEN", labelAt: { x: 27, y: 45 } },
    { id: "hash", from: "api", to: "bcrypt", fromSide: "bottom", toSide: "top", fromOffset: -.55, toOffset: -.55, label: "HASH / COMPARE", labelAt: { x: 34, y: 70 } },
    { id: "hash_result", from: "bcrypt", to: "api", fromSide: "top", toSide: "bottom", fromOffset: .55, toOffset: .55 },
    { id: "write", from: "api", to: "database", fromSide: "right", toSide: "left", label: "INSERT ROW", labelAt: { x: 60, y: 45 } },
    { id: "read", from: "api", to: "database", fromSide: "top", toSide: "top", fromOffset: .5, toOffset: -.5, laneY: 31, label: "LOOK UP SHORT ID", labelAt: { x: 62, y: 26 } },
    { id: "row", from: "database", to: "api", fromSide: "bottom", toSide: "bottom", fromOffset: -.5, toOffset: .5, laneY: 69, label: "ROW + EXPIRY + HASH", labelAt: { x: 62, y: 76 } },
    { id: "response", from: "api", to: "browser", fromSide: "top", toSide: "top", fromOffset: -.5, toOffset: .5, laneY: 23, label: "LINK / CONTENT / LOCK", labelAt: { x: 25, y: 18 } },
  ],
  steps: [
    { title: "Submit a snippet", plain: "The browser sends code or text and its settings to the Express create route. The API checks the required fields and option types.", technical: "POST /api/snippets has a 10-per-hour rate limit. Content and language are required; numeric expiry must be positive. Optional title and note are sent by the React form.", nodes: ["browser", "api"], edges: ["request"], pin: { x: 24, y: 47 } },
    { title: "Hash an optional password", plain: "If the author supplies a password, the service hashes it before saving. Unprotected snippets have no password hash.", technical: "createSnippet calls bcrypt.hash(password, 10). PostgreSQL stores password_hash, while the content itself is stored as plaintext.", nodes: ["api", "bcrypt"], edges: ["hash", "hash_result"], pin: { x: 30, y: 66 } },
    { title: "Store and return links", plain: "The service inserts a row with a short ID, management token, optional expiry, and settings. The API returns viewer, raw, and manage URLs.", technical: "A six-character short ID and 32-character management token are generated with crypto.randomBytes. The service retries unique-constraint collisions up to five times.", nodes: ["api", "database", "browser"], edges: ["write", "response"], pin: { x: 55, y: 47 } },
    { title: "Look up a short link", plain: "A visitor opens the short link. The API reads the row and rejects an expired snippet before returning content.", technical: "GET /api/snippets/:shortId selects by short_id. A present but expired row returns 410; a missing row returns 404 unless a destroyed marker exists.", nodes: ["browser", "api", "database"], edges: ["request", "read", "row"], pin: { x: 56, y: 17 } },
    { title: "Verify protected access", plain: "For a protected snippet, the normal GET returns a lock state. The visitor submits a password, and the API compares it with the stored bcrypt hash.", technical: "POST /:shortId/verify is rate-limited to five failed attempts per 15 minutes per IP. A successful comparison sets an unsigned one-hour verified_<shortId>=true cookie and returns content. Later cookie-based access is not tamper-proof because the cookie is neither signed nor tied to a server-side session.", nodes: ["browser", "api", "bcrypt", "database"], edges: ["request", "read", "row", "hash", "hash_result"], pin: { x: 47, y: 65 } },
    { title: "Return the content", plain: "After the checks, Express returns the snippet. A successful read increments its view count; burn-after-read then follows the separate lifecycle shown in mode two.", technical: "The JSON viewer and raw text routes both increment view_count on successful access. The raw route also accepts a password in a query parameter or x-snippet-password header.", nodes: ["api", "browser", "database"], edges: ["row", "response"], pin: { x: 23, y: 18 } },
  ],
};

export const snipShareLifecycleArchitecture: ArchitectureConfig = {
  title: "Expiry, burn, and database cleanup",
  description: "Expiry is checked when content is requested. Burn-after-read removes a row after a successful read; a separate cron job deletes expired rows every 15 minutes while the Node process is running.",
  canvasLabels: ["01 / REQUEST-TIME LIFECYCLE", "02 / SCHEDULED CLEANUP"],
  mobileHandoff: { afterNode: "api", text: "An access request reads snippets first. A successful burn read then writes a destroyed marker and deletes the row in one transaction; the read itself is outside that transaction." },
  nodes: [
    { id: "browser", label: "Visitor", role: "Open or verify link", detail: "A visitor requests a short link, raw content, or password verification. The API may return content, 410 for expiry or destruction, or 404 when no row or destroyed marker exists.", tech: ["GET /:shortId", "POST /:shortId/verify"], x: 12, y: 52 },
    { id: "api", label: "Express API", role: "Check + count + burn", detail: "The controller reads the row and checks expiry and password. For a successful access it increments view_count, then calls the burn routine if enabled. The initial read and count are outside the burn transaction.", tech: ["snippetController", "snippetService"], x: 41, y: 52 },
    { id: "snippets", label: "snippets table", role: "Content + expiry", detail: "PostgreSQL stores content and expiry_at. The request-time check returns 410 while an expired row remains. The cleanup job later deletes expired rows, after which a lookup generally returns 404.", tech: ["PostgreSQL", "expiry_at", "view_count"], x: 70, y: 52 },
    { id: "cron", label: "Cleanup cron", role: "Every 15 minutes", detail: "node-cron schedules DELETE FROM snippets WHERE expiry_at IS NOT NULL AND expiry_at < NOW() every 15 minutes in the running backend process. It does not purge destroyed_snippets markers.", tech: ["node-cron", "*/15 * * * *"], x: 88, y: 17, group: "dependency" },
    { id: "markers", label: "Destroyed marker", role: "410 after burn", detail: "The burn routine inserts or updates a destroyed_snippets marker and deletes the matching snippets row in one transaction. A later missing-row lookup checks the marker to distinguish destroyed from not found.", tech: ["destroyed_snippets", "BEGIN / COMMIT"], x: 87, y: 83, group: "dependency" },
  ],
  edges: [
    { id: "request", from: "browser", to: "api", fromSide: "right", toSide: "left", label: "OPEN LINK", labelAt: { x: 26, y: 45 } },
    { id: "read", from: "api", to: "snippets", fromSide: "right", toSide: "left", label: "READ ROW", labelAt: { x: 55, y: 45 } },
    { id: "result", from: "snippets", to: "api", fromSide: "top", toSide: "top", fromOffset: -.5, toOffset: .5, laneY: 31, label: "ROW + EXPIRY", labelAt: { x: 56, y: 26 } },
    { id: "response", from: "api", to: "browser", fromSide: "top", toSide: "top", fromOffset: -.5, toOffset: .5, laneY: 23, label: "CONTENT / 410 / 404", labelAt: { x: 25, y: 18 } },
    { id: "count", from: "api", to: "snippets", fromSide: "bottom", toSide: "bottom", fromOffset: .5, toOffset: -.5, laneY: 70, label: "COUNT + DELETE", labelAt: { x: 57, y: 77 } },
    { id: "marker", from: "api", to: "markers", fromSide: "bottom", toSide: "left", fromOffset: -.5, laneY: 88, label: "MARKER WRITE / CHECK", labelAt: { x: 68, y: 93 } },
    { id: "cleanup", from: "cron", to: "snippets", fromSide: "left", toSide: "right", fromOffset: -.2, toOffset: -.5, label: "DELETE EXPIRED", labelAt: { x: 76, y: 36 } },
  ],
  steps: [
    { title: "Read and check expiry", plain: "The API reads a snippet and checks expiry_at at request time. An expired row returns 410 without showing its content.", technical: "isExpired compares expiry_at to the current time. An expired row can remain until the next cleanup run; after deletion, the same link usually returns 404.", nodes: ["browser", "api", "snippets"], edges: ["request", "read", "result", "response"], pin: { x: 51, y: 25 } },
    { title: "Count a successful read", plain: "After access checks succeed, the API increments view_count and prepares the content response.", technical: "The JSON, raw, and password-verification handlers call incrementViewCountByShortId. That UPDATE is separate from the burn transaction.", nodes: ["api", "snippets"], edges: ["count"], pin: { x: 51, y: 66 } },
    { title: "Burn after reading", plain: "For a burn-enabled snippet, the API records a destroyed marker and deletes the snippet row after it has already read the content.", technical: "destroySnippetByShortId wraps marker insertion and row deletion in BEGIN/COMMIT. The earlier SELECT and view-count UPDATE are outside this transaction.", nodes: ["api", "snippets", "markers"], edges: ["count", "marker"], pin: { x: 70, y: 86 } },
    { title: "Concurrent-read limit", plain: "Two near-simultaneous requests may both read the row before either deletes it. Burn-after-read therefore does not guarantee exactly one recipient sees the content.", technical: "The source has no SELECT FOR UPDATE, conditional consume statement, or lock around the read. This is a race inferred from code ordering, not a reported production incident.", nodes: ["browser", "api", "snippets", "markers"], edges: ["request", "read", "result", "marker"], pin: { x: 23, y: 46 } },
    { title: "Report a burned link", plain: "A later request that cannot find the snippet checks the destroyed marker and returns 410 when it exists.", technical: "getSnippetHandler and verifySnippetHandler check destroyed_snippets for a missing row. The raw handler also checks it. The marker table is created on demand if absent.", nodes: ["browser", "api", "markers"], edges: ["request", "marker", "response"], pin: { x: 23, y: 16 } },
    { title: "Delete expired rows", plain: "The running backend schedules a database delete every 15 minutes for rows whose expiry time has passed.", technical: "app.js uses node-cron with */15 * * * *. It issues a single DELETE against snippets and logs errors. The job depends on the Node process being active.", nodes: ["cron", "snippets"], edges: ["cleanup"], pin: { x: 78, y: 23 } },
  ],
};
