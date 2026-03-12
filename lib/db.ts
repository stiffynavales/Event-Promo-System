import fs from "fs";
import path from "path";
import { Host, Attendee } from "./types";

// ─── LOCAL / VERCEL TEMPORARY FILE STORAGE ─────────────────────────────────
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? "/tmp/event-promo-data"
  : path.join(process.cwd(), "data");

// In-memory cache to help Vercel serverless functions persist data slightly longer
// across warm invocations without relying solely on the /tmp directory
let memoryHosts: Host[] | null = null;
let memoryAttendees: Attendee[] | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalJson<T>(file: string, fallback: T): T {
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
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ─── PUBLIC API (async to match existing API routes) ───────────────────────

export async function getHosts(): Promise<Host[]> {
  // Use memory cache first if available (crucial for Vercel)
  if (memoryHosts) return [...memoryHosts];
  
  // Fallback to file system
  const diskHosts = readLocalJson<Host[]>("hosts.json", []);
  memoryHosts = diskHosts;
  return [...memoryHosts];
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
  
  memoryHosts = hosts;
  try {
    writeLocalJson("hosts.json", hosts);
  } catch (err) {
    console.warn("Failed to write to local storage, relying on memory:", err);
  }
}

export async function deleteHost(id: string): Promise<void> {
  const hosts = (await getHosts()).filter((h) => h.id !== id);
  memoryHosts = hosts;
  writeLocalJson("hosts.json", hosts);
}

export async function getAttendees(hostSlug?: string): Promise<Attendee[]> {
  let all: Attendee[];
  if (memoryAttendees) {
    all = [...memoryAttendees];
  } else {
    all = readLocalJson<Attendee[]>("attendees.json", []);
    memoryAttendees = all;
  }
  return hostSlug ? all.filter((a) => a.hostSlug === hostSlug) : all;
}

export async function saveAttendee(attendee: Attendee): Promise<void> {
  const attendees = await getAttendees();
  attendees.push(attendee);
  
  memoryAttendees = attendees;
  try {
    writeLocalJson("attendees.json", attendees);
  } catch (err) {
    console.warn("Failed to write to local storage, relying on memory:", err);
  }
}

export function generateSlug(hostName: string, city: string): string {
  return `${city}-${hostName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
