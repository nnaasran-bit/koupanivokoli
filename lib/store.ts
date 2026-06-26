// Úložiště komunity (uživatelé, sessions, hlášení, příspěvky).
// Produkce: PostgreSQL (Neon) přes DATABASE_URL. Lokálně bez DB: fallback do souboru.
// POZOR: importovat jen na serveru (route handlery, server komponenty).
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";
import type { Contribution, PublicUser, Report } from "./gamify";

const CONN = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const sql = CONN ? neon(CONN) : null;

interface StoredUser {
  id: string;
  nick: string;
  email: string;
  salt: string;
  hash: string;
  points: number;
  reportCount: number;
  consentMarketing: boolean;
  createdAt: string;
}

export function toPublic(u: StoredUser): PublicUser {
  return { id: u.id, nick: u.nick, points: u.points, reportCount: u.reportCount, createdAt: u.createdAt };
}

/* ---------- PostgreSQL backend ---------- */

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  const db = sql;
  if (!db) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await db`CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY, nick text NOT NULL, nick_lower text NOT NULL UNIQUE,
        email text, salt text NOT NULL, hash text NOT NULL,
        points integer NOT NULL DEFAULT 0, report_count integer NOT NULL DEFAULT 0,
        consent_marketing boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now())`;
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS email text`;
      await db`ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_marketing boolean NOT NULL DEFAULT false`;
      await db`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower ON users (lower(email))`;
      await db`CREATE TABLE IF NOT EXISTS sessions (
        token text PRIMARY KEY, user_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS reports (
        id text PRIMARY KEY, user_id text NOT NULL, nick text NOT NULL, kind text NOT NULL,
        location_name text, location_slug text, new_place_name text,
        lat double precision, lng double precision, text text, photo_url text,
        status text NOT NULL DEFAULT 'pending', points integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now())`;
      await db`ALTER TABLE reports ADD COLUMN IF NOT EXISTS photo_url text`;
      await db`CREATE TABLE IF NOT EXISTS contributions (
        id text PRIMARY KEY, location_slug text NOT NULL, user_id text NOT NULL, nick text NOT NULL,
        kind text NOT NULL, amenity text, text text, created_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS ratings (
        location_slug text NOT NULL, ip_hash text NOT NULL, value smallint NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (location_slug, ip_hash))`;
    })();
  }
  return schemaReady;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toUser(r: any): StoredUser {
  return {
    id: r.id,
    nick: r.nick,
    email: r.email ?? "",
    salt: r.salt,
    hash: r.hash,
    points: Number(r.points),
    reportCount: Number(r.report_count),
    consentMarketing: !!r.consent_marketing,
    createdAt: new Date(r.created_at).toISOString(),
  };
}
function toReport(r: any): Report {
  return {
    id: r.id,
    userId: r.user_id,
    nick: r.nick,
    kind: r.kind,
    locationName: r.location_name ?? undefined,
    locationSlug: r.location_slug ?? undefined,
    newPlaceName: r.new_place_name ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    text: r.text ?? undefined,
    photoUrl: r.photo_url ?? undefined,
    status: r.status,
    points: Number(r.points),
    createdAt: new Date(r.created_at).toISOString(),
  };
}
function toContribution(r: any): Contribution {
  return {
    id: r.id,
    locationSlug: r.location_slug,
    userId: r.user_id,
    nick: r.nick,
    kind: r.kind,
    amenity: r.amenity ?? undefined,
    text: r.text ?? undefined,
    createdAt: new Date(r.created_at).toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---------- file fallback (lokální vývoj bez DB) ---------- */

const FILE = join(process.cwd(), ".data", "community.json");
interface Rating {
  location_slug: string;
  ip_hash: string;
  value: number;
}
interface DB {
  users: StoredUser[];
  sessions: { token: string; userId: string; createdAt: string }[];
  reports: Report[];
  contributions: Contribution[];
  ratings: Rating[];
}
function readFile(): DB {
  const empty: DB = { users: [], sessions: [], reports: [], contributions: [], ratings: [] };
  try {
    if (!existsSync(FILE)) return empty;
    const db = JSON.parse(readFileSync(FILE, "utf8"));
    return {
      users: db.users ?? [],
      sessions: db.sessions ?? [],
      reports: db.reports ?? [],
      contributions: db.contributions ?? [],
      ratings: db.ratings ?? [],
    };
  } catch {
    return empty;
  }
}
function writeFile(db: DB): void {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(db, null, 2), "utf8");
}

/* ---------- veřejné API (async, společné pro oba backendy) ---------- */

export async function findUserByNick(nick: string): Promise<StoredUser | undefined> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM users WHERE nick_lower = ${nick.toLowerCase()} LIMIT 1`;
    return rows[0] ? toUser(rows[0]) : undefined;
  }
  return readFile().users.find((u) => u.nick.toLowerCase() === nick.toLowerCase());
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM users WHERE lower(email) = ${email.toLowerCase()} LIMIT 1`;
    return rows[0] ? toUser(rows[0]) : undefined;
  }
  return readFile().users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
}

export async function getUserById(id: string): Promise<StoredUser | undefined> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] ? toUser(rows[0]) : undefined;
  }
  return readFile().users.find((u) => u.id === id);
}

export async function createUser(
  nick: string,
  email: string,
  salt: string,
  hash: string,
  consentMarketing: boolean,
): Promise<StoredUser> {
  const user: StoredUser = {
    id: randomUUID(),
    nick,
    email,
    salt,
    hash,
    points: 0,
    reportCount: 0,
    consentMarketing,
    createdAt: new Date().toISOString(),
  };
  if (sql) {
    await ensureSchema();
    await sql`INSERT INTO users (id, nick, nick_lower, email, salt, hash, points, report_count, consent_marketing)
      VALUES (${user.id}, ${nick}, ${nick.toLowerCase()}, ${email}, ${salt}, ${hash}, 0, 0, ${consentMarketing})`;
    return user;
  }
  const db = readFile();
  db.users.push(user);
  writeFile(db);
  return user;
}

// Najde uživatele podle e-mailu, nebo ho založí (pro přihlášení přes Google/Facebook).
export async function findOrCreateOAuthUser(email: string, displayName: string): Promise<StoredUser> {
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const base = (displayName || email.split("@")[0] || "Plavec").trim().slice(0, 20) || "Plavec";
  let nick = base;
  for (let i = 0; (await findUserByNick(nick)); i++) {
    nick = `${base}${randomBytes(2).toString("hex")}`;
    if (i > 5) break;
  }
  // OAuth účet nemá použitelné heslo – uložíme náhodný otisk.
  const salt = randomBytes(16).toString("hex");
  const hash = randomBytes(32).toString("hex");
  return createUser(nick, email, salt, hash, false);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(24).toString("hex");
  if (sql) {
    await ensureSchema();
    await sql`INSERT INTO sessions (token, user_id) VALUES (${token}, ${userId})`;
    return token;
  }
  const db = readFile();
  db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  writeFile(db);
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  if (sql) {
    await ensureSchema();
    await sql`DELETE FROM sessions WHERE token = ${token}`;
    return;
  }
  const db = readFile();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeFile(db);
}

export async function getSessionUser(token: string): Promise<PublicUser | null> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ${token} LIMIT 1`;
    return rows[0] ? toPublic(toUser(rows[0])) : null;
  }
  const db = readFile();
  const s = db.sessions.find((x) => x.token === token);
  if (!s) return null;
  const u = db.users.find((x) => x.id === s.userId);
  return u ? toPublic(u) : null;
}

type ReportInput = Omit<Report, "id" | "createdAt" | "status">;

export async function addReport(input: ReportInput): Promise<Report> {
  const report: Report = { ...input, id: randomUUID(), status: "pending", createdAt: new Date().toISOString() };
  if (sql) {
    await ensureSchema();
    await sql`INSERT INTO reports (id, user_id, nick, kind, location_name, location_slug, new_place_name, lat, lng, text, photo_url, status, points)
      VALUES (${report.id}, ${input.userId}, ${input.nick}, ${input.kind}, ${input.locationName ?? null},
        ${input.locationSlug ?? null}, ${input.newPlaceName ?? null}, ${input.lat ?? null}, ${input.lng ?? null},
        ${input.text ?? null}, ${input.photoUrl ?? null}, 'pending', ${input.points})`;
    await sql`UPDATE users SET points = points + ${input.points}, report_count = report_count + 1 WHERE id = ${input.userId}`;
    return report;
  }
  const db = readFile();
  const user = db.users.find((u) => u.id === input.userId);
  db.reports.unshift(report);
  if (user) {
    user.points += report.points;
    user.reportCount += 1;
  }
  writeFile(db);
  return report;
}

// ---- Ochrana proti spamu (počty za časové okno, deduplikace) ----

export async function countReportsSince(userId: string, sinceMs: number): Promise<number> {
  const iso = new Date(Date.now() - sinceMs).toISOString();
  if (sql) {
    await ensureSchema();
    const r = await sql`SELECT count(*)::int AS n FROM reports WHERE user_id = ${userId} AND created_at >= ${iso}::timestamptz`;
    return r[0]?.n ?? 0;
  }
  return readFile().reports.filter((x) => x.userId === userId && x.createdAt >= iso).length;
}

export async function recentDuplicateReport(
  userId: string,
  slug: string | undefined,
  kind: string,
  sinceMs: number,
): Promise<boolean> {
  if (!slug) return false;
  const iso = new Date(Date.now() - sinceMs).toISOString();
  if (sql) {
    await ensureSchema();
    const r = await sql`SELECT 1 FROM reports WHERE user_id = ${userId} AND location_slug = ${slug} AND kind = ${kind} AND created_at >= ${iso}::timestamptz LIMIT 1`;
    return r.length > 0;
  }
  return readFile().reports.some(
    (x) => x.userId === userId && x.locationSlug === slug && x.kind === kind && x.createdAt >= iso,
  );
}

export async function countContributionsSince(userId: string, sinceMs: number): Promise<number> {
  const iso = new Date(Date.now() - sinceMs).toISOString();
  if (sql) {
    await ensureSchema();
    const r = await sql`SELECT count(*)::int AS n FROM contributions WHERE user_id = ${userId} AND created_at >= ${iso}::timestamptz`;
    return r[0]?.n ?? 0;
  }
  return readFile().contributions.filter((x) => x.userId === userId && x.createdAt >= iso).length;
}

export async function hasAmenityContribution(
  userId: string,
  slug: string,
  amenity: string,
): Promise<boolean> {
  if (sql) {
    await ensureSchema();
    const r = await sql`SELECT 1 FROM contributions WHERE user_id = ${userId} AND location_slug = ${slug} AND kind = 'amenity' AND amenity = ${amenity} LIMIT 1`;
    return r.length > 0;
  }
  return readFile().contributions.some(
    (c) => c.userId === userId && c.locationSlug === slug && c.kind === "amenity" && c.amenity === amenity,
  );
}

// Už uživatel u tohoto místa udělal příspěvek daného druhu? (dedup pro 'visit')
export async function hasContributionKind(userId: string, slug: string, kind: string): Promise<boolean> {
  if (sql) {
    await ensureSchema();
    const r = await sql`SELECT 1 FROM contributions WHERE user_id = ${userId} AND location_slug = ${slug} AND kind = ${kind} LIMIT 1`;
    return r.length > 0;
  }
  return readFile().contributions.some(
    (c) => c.userId === userId && c.locationSlug === slug && c.kind === kind,
  );
}

/* ---------- Hodnocení (1 IP = 1 hlas) ---------- */

export async function addRating(slug: string, ipHash: string, value: number): Promise<void> {
  const v = Math.max(1, Math.min(5, Math.round(value)));
  if (sql) {
    await ensureSchema();
    await sql`INSERT INTO ratings (location_slug, ip_hash, value) VALUES (${slug}, ${ipHash}, ${v})
      ON CONFLICT (location_slug, ip_hash) DO UPDATE SET value = ${v}, created_at = now()`;
    return;
  }
  const db = readFile();
  const ex = db.ratings.find((r) => r.location_slug === slug && r.ip_hash === ipHash);
  if (ex) ex.value = v;
  else db.ratings.push({ location_slug: slug, ip_hash: ipHash, value: v });
  writeFile(db);
}

export async function getRating(slug: string, ipHash?: string): Promise<{ avg: number; count: number; mine: number | null }> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT avg(value)::float AS avg, count(*)::int AS count FROM ratings WHERE location_slug = ${slug}`;
    let mine: number | null = null;
    if (ipHash) {
      const m = await sql`SELECT value FROM ratings WHERE location_slug = ${slug} AND ip_hash = ${ipHash} LIMIT 1`;
      mine = m[0] ? Number(m[0].value) : null;
    }
    return { avg: rows[0]?.avg ? Number(rows[0].avg) : 0, count: rows[0]?.count ?? 0, mine };
  }
  const rs = readFile().ratings.filter((r) => r.location_slug === slug);
  const avg = rs.length ? rs.reduce((s, r) => s + r.value, 0) / rs.length : 0;
  const mine = ipHash ? rs.find((r) => r.ip_hash === ipHash)?.value ?? null : null;
  return { avg, count: rs.length, mine };
}

// Hodnocení pro více lokalit najednou (typové seznamy).
export async function ratingStats(): Promise<Map<string, { avg: number; count: number }>> {
  const map = new Map<string, { avg: number; count: number }>();
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT location_slug, avg(value)::float AS avg, count(*)::int AS count FROM ratings GROUP BY location_slug`;
    for (const r of rows) map.set(String(r.location_slug), { avg: Number(r.avg), count: Number(r.count) });
    return map;
  }
  const agg = new Map<string, number[]>();
  for (const r of readFile().ratings) {
    if (!agg.has(r.location_slug)) agg.set(r.location_slug, []);
    agg.get(r.location_slug)!.push(r.value);
  }
  for (const [slug, vals] of agg) map.set(slug, { avg: vals.reduce((s, v) => s + v, 0) / vals.length, count: vals.length });
  return map;
}

// Počet navštívených míst uživatele (check-iny 'visit') – pro soutěž/odznaky.
export async function visitCount(userId: string): Promise<number> {
  if (sql) {
    await ensureSchema();
    const r = await sql`SELECT count(*)::int AS n FROM contributions WHERE user_id = ${userId} AND kind = 'visit'`;
    return r[0]?.n ?? 0;
  }
  return readFile().contributions.filter((c) => c.userId === userId && c.kind === "visit").length;
}

// Žebříček návštěvníků (kdo navštívil nejvíc míst).
export async function visitLeaderboard(limit = 50): Promise<{ nick: string; visits: number }[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT nick, count(*)::int AS visits FROM contributions
      WHERE kind = 'visit' GROUP BY nick ORDER BY visits DESC LIMIT ${limit}`;
    return rows.map((r) => ({ nick: String(r.nick), visits: Number(r.visits) }));
  }
  const counts = new Map<string, number>();
  for (const c of readFile().contributions) {
    if (c.kind === "visit") counts.set(c.nick, (counts.get(c.nick) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([nick, visits]) => ({ nick, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit);
}

export async function reportsByLocation(slug: string): Promise<Report[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM reports WHERE location_slug = ${slug} ORDER BY created_at DESC`;
    return rows.map(toReport);
  }
  return readFile().reports.filter((r) => r.locationSlug === slug);
}

export async function reportsByUser(userId: string): Promise<Report[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM reports WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return rows.map(toReport);
  }
  return readFile().reports.filter((r) => r.userId === userId);
}

export async function recentReports(limit = 30): Promise<Report[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM reports ORDER BY created_at DESC LIMIT ${limit}`;
    return rows.map(toReport);
  }
  return readFile().reports.slice(0, limit);
}

// Vymaže všechny uživatele, sessions, hlášení i příspěvky (reset komunity/žebříčku).
export async function wipeAllUsers(): Promise<void> {
  if (sql) {
    await ensureSchema();
    await sql`DELETE FROM sessions`;
    await sql`DELETE FROM reports`;
    await sql`DELETE FROM contributions`;
    await sql`DELETE FROM users`;
    return;
  }
  writeFile({ users: [], sessions: [], reports: [], contributions: [], ratings: readFile().ratings });
}

export async function leaderboard(limit = 50): Promise<PublicUser[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM users ORDER BY points DESC, created_at ASC LIMIT ${limit}`;
    return rows.map((r) => toPublic(toUser(r)));
  }
  return readFile()
    .users.map(toPublic)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

type ContributionInput = Omit<Contribution, "id" | "createdAt">;

export async function addContribution(input: ContributionInput, points: number): Promise<Contribution> {
  const contribution: Contribution = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  if (sql) {
    await ensureSchema();
    await sql`INSERT INTO contributions (id, location_slug, user_id, nick, kind, amenity, text)
      VALUES (${contribution.id}, ${input.locationSlug}, ${input.userId}, ${input.nick}, ${input.kind},
        ${input.amenity ?? null}, ${input.text ?? null})`;
    await sql`UPDATE users SET points = points + ${points} WHERE id = ${input.userId}`;
    return contribution;
  }
  const db = readFile();
  const user = db.users.find((u) => u.id === input.userId);
  db.contributions.unshift(contribution);
  if (user) user.points += points;
  writeFile(db);
  return contribution;
}

export async function contributionsByLocation(slug: string): Promise<Contribution[]> {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM contributions WHERE location_slug = ${slug} ORDER BY created_at DESC`;
    return rows.map(toContribution);
  }
  return readFile().contributions.filter((c) => c.locationSlug === slug);
}
