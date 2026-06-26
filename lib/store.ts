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
        lat double precision, lng double precision, text text,
        status text NOT NULL DEFAULT 'pending', points integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now())`;
      await db`CREATE TABLE IF NOT EXISTS contributions (
        id text PRIMARY KEY, location_slug text NOT NULL, user_id text NOT NULL, nick text NOT NULL,
        kind text NOT NULL, amenity text, text text, created_at timestamptz NOT NULL DEFAULT now())`;
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
interface DB {
  users: StoredUser[];
  sessions: { token: string; userId: string; createdAt: string }[];
  reports: Report[];
  contributions: Contribution[];
}
function readFile(): DB {
  const empty: DB = { users: [], sessions: [], reports: [], contributions: [] };
  try {
    if (!existsSync(FILE)) return empty;
    const db = JSON.parse(readFileSync(FILE, "utf8"));
    return {
      users: db.users ?? [],
      sessions: db.sessions ?? [],
      reports: db.reports ?? [],
      contributions: db.contributions ?? [],
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
    await sql`INSERT INTO reports (id, user_id, nick, kind, location_name, location_slug, new_place_name, lat, lng, text, status, points)
      VALUES (${report.id}, ${input.userId}, ${input.nick}, ${input.kind}, ${input.locationName ?? null},
        ${input.locationSlug ?? null}, ${input.newPlaceName ?? null}, ${input.lat ?? null}, ${input.lng ?? null},
        ${input.text ?? null}, 'pending', ${input.points})`;
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
