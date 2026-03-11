import fs from "fs";
import path from "path";
import { Host, Attendee } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const HOSTS_FILE = path.join(DATA_DIR, "hosts.json");
const ATTENDEES_FILE = path.join(DATA_DIR, "attendees.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getHosts(): Host[] {
  ensureDataDir();
  if (!fs.existsSync(HOSTS_FILE)) return [];
  const raw = fs.readFileSync(HOSTS_FILE, "utf-8");
  return JSON.parse(raw) as Host[];
}

export function getHostBySlug(slug: string): Host | undefined {
  return getHosts().find((h) => h.slug === slug);
}

export function getHostById(id: string): Host | undefined {
  return getHosts().find((h) => h.id === id);
}

export function saveHost(host: Host): void {
  ensureDataDir();
  const hosts = getHosts();
  const idx = hosts.findIndex((h) => h.id === host.id);
  if (idx >= 0) {
    hosts[idx] = host;
  } else {
    hosts.push(host);
  }
  fs.writeFileSync(HOSTS_FILE, JSON.stringify(hosts, null, 2));
}

export function getAttendees(hostSlug?: string): Attendee[] {
  ensureDataDir();
  if (!fs.existsSync(ATTENDEES_FILE)) return [];
  const raw = fs.readFileSync(ATTENDEES_FILE, "utf-8");
  const all = JSON.parse(raw) as Attendee[];
  return hostSlug ? all.filter((a) => a.hostSlug === hostSlug) : all;
}

export function saveAttendee(attendee: Attendee): void {
  ensureDataDir();
  const attendees = getAttendees();
  attendees.push(attendee);
  fs.writeFileSync(ATTENDEES_FILE, JSON.stringify(attendees, null, 2));
}

export function generateSlug(hostName: string, city: string): string {
  const base = `${city}-${hostName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base;
}
