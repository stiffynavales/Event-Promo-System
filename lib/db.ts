import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { Host, Attendee } from "./types";

// ─── LOCAL STORAGE (dev fallback) ──────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const IS_VERCEL = !!process.env.VERCEL;

function ensureDataDir() {
  if (IS_VERCEL) return;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalJson<T>(file: string, fallback: T): T {
  if (IS_VERCEL) return fallback;
  ensureDataDir();
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson<T>(file: string, data: T): void {
  if (IS_VERCEL) return;
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ─── UPSTASH REDIS INTEGRATION ──────────────────────────────────────────────
const USE_REDIS = !!process.env.KV_REST_API_URL || !!process.env.UPSTASH_REDIS_REST_URL;

// On Vercel Marketplace, the variables are often either KV_REST_API_URL or UPSTASH_REDIS_REST_URL
const redis = USE_REDIS
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",
    })
  : null;

function assertRedisAvailable() {
  if (IS_VERCEL && !USE_REDIS) {
    throw new Error(
      "Upstash Redis is not configured! You must click 'Redeploy' on your Vercel dashboard so the app receives the new Upstash environment variables."
    );
  }
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

export async function getHosts(): Promise<Host[]> {
  assertRedisAvailable();
  if (redis) {
    const data = await redis.get<Host[]>("hosts");
    return data || [];
  }
  return readLocalJson<Host[]>("hosts.json", []);
}

export async function getHostBySlug(slug: string): Promise<Host | undefined> {
  const all = await getHosts();
  return all.find((h) => h.slug === slug);
}

export async function getHostById(id: string): Promise<Host | undefined> {
  const all = await getHosts();
  return all.find((h) => h.id === id);
}

export async function saveHost(host: Host): Promise<void> {
  const hosts = await getHosts();
  const idx = hosts.findIndex((h) => h.id === host.id);
  if (idx >= 0) {
    hosts[idx] = host;
  } else {
    hosts.push(host);
  }
  
  if (redis) {
    await redis.set("hosts", hosts);
  } else {
    writeLocalJson("hosts.json", hosts);
  }
}

export async function deleteHost(id: string): Promise<void> {
  const hosts = (await getHosts()).filter((h) => h.id !== id);
  if (redis) {
    await redis.set("hosts", hosts);
  } else {
    writeLocalJson("hosts.json", hosts);
  }
}

export async function getAttendees(hostSlug?: string): Promise<Attendee[]> {
  let all: Attendee[];
  if (redis) {
    all = (await redis.get<Attendee[]>("attendees")) || [];
  } else {
    all = readLocalJson<Attendee[]>("attendees.json", []);
  }
  return hostSlug ? all.filter((a) => a.hostSlug === hostSlug) : all;
}

export async function saveAttendee(attendee: Attendee): Promise<void> {
  const attendees = await getAttendees();
  attendees.push(attendee);
  
  if (redis) {
    await redis.set("attendees", attendees);
  } else {
    writeLocalJson("attendees.json", attendees);
  }
}

export function generateSlug(hostName: string, city: string): string {
  return `${city}-${hostName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
