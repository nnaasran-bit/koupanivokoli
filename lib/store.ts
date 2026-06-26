// Lokální souborové úložiště komunity (uživatelé, sessions, hlášení).
// Běží u tebe bez databáze. Pro produkci (Vercel) se nahradí PostgreSQL.
// POZOR: importovat jen na serveru (route handlery, server komponenty).
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Contribution, PublicUser, Report } from "./gamify";

const FILE = join(process.cwd(), ".data", "community.json");

interface StoredUser {
  id: string;
  nick: string;
  salt: string;
  hash: string;
  points: number;
  reportCount: number;
  createdAt: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

interface DB {
  users: StoredUser[];
  sessions: Session[];
  reports: Report[];
  contributions: Contribution[];
}

function read(): DB {
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

function write(db: DB): void {
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(db, null, 2), "utf8");
}

export function toPublic(u: StoredUser): PublicUser {
  return { id: u.id, nick: u.nick, points: u.points, reportCount: u.reportCount, createdAt: u.createdAt };
}

export function findUserByNick(nick: string): StoredUser | undefined {
  return read().users.find((u) => u.nick.toLowerCase() === nick.toLowerCase());
}

export function getUserById(id: string): StoredUser | undefined {
  return read().users.find((u) => u.id === id);
}

export function createUser(nick: string, salt: string, hash: string): StoredUser {
  const db = read();
  const user: StoredUser = {
    id: randomUUID(),
    nick,
    salt,
    hash,
    points: 0,
    reportCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  write(db);
  return user;
}

export function createSession(userId: string): string {
  const db = read();
  const token = randomBytes(24).toString("hex");
  db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  write(db);
  return token;
}

export function deleteSession(token: string): void {
  const db = read();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  write(db);
}

export function getSessionUser(token: string): PublicUser | null {
  const db = read();
  const s = db.sessions.find((x) => x.token === token);
  if (!s) return null;
  const u = db.users.find((x) => x.id === s.userId);
  return u ? toPublic(u) : null;
}

type ReportInput = Omit<Report, "id" | "createdAt" | "status">;

export function addReport(input: ReportInput): Report {
  const db = read();
  const user = db.users.find((u) => u.id === input.userId);
  const report: Report = {
    ...input,
    id: randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.reports.unshift(report);
  if (user) {
    user.points += report.points;
    user.reportCount += 1;
  }
  write(db);
  return report;
}

export function reportsByLocation(slug: string): Report[] {
  return read().reports.filter((r) => r.locationSlug === slug);
}

export function reportsByUser(userId: string): Report[] {
  return read().reports.filter((r) => r.userId === userId);
}

export function recentReports(limit = 30): Report[] {
  return read().reports.slice(0, limit);
}

export function leaderboard(limit = 50): PublicUser[] {
  return read()
    .users.map(toPublic)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

type ContributionInput = Omit<Contribution, "id" | "createdAt">;

export function addContribution(input: ContributionInput, points: number): Contribution {
  const db = read();
  const user = db.users.find((u) => u.id === input.userId);
  const contribution: Contribution = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  db.contributions.unshift(contribution);
  if (user) user.points += points;
  write(db);
  return contribution;
}

export function contributionsByLocation(slug: string): Contribution[] {
  return read().contributions.filter((c) => c.locationSlug === slug);
}
