import fs from "fs";
import path from "path";
import { kv } from "@vercel/kv";
import { Host, Attendee } from "./types";

// ─── LOCAL STORAGE (dev fallback) ──────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");

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

// ─── VERCEL KV INTEGRATION ──────────────────────────────────────────────────
const USE_KV = !!process.env.KV_REST_API_URL;

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

export async function getHosts(): Promise<Host[]> {
  if (USE_KV) {
    const data = await kv.get<Host[]>("hosts");
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
  
  if (USE_KV) {
    await kv.set("hosts", hosts);
  } else {
    writeLocalJson("hosts.json", hosts);
  }
}

export async function deleteHost(id: string): Promise<void> {
  const hosts = (await getHosts()).filter((h) => h.id !== id);
  if (USE_KV) {
    await kv.set("hosts", hosts);
  } else {
    writeLocalJson("hosts.json", hosts);
  }
}

export async function getAttendees(hostSlug?: string): Promise<Attendee[]> {
  let all: Attendee[];
  if (USE_KV) {
    all = (await kv.get<Attendee[]>("attendees")) || [];
  } else {
    all = readLocalJson<Attendee[]>("attendees.json", []);
  }
  return hostSlug ? all.filter((a) => a.hostSlug === hostSlug) : all;
}

export async function saveAttendee(attendee: Attendee): Promise<void> {
  const attendees = await getAttendees();
  attendees.push(attendee);
  
  if (USE_KV) {
    await kv.set("attendees", attendees);
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
