import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { Host, Attendee } from "./types";

// ─── LOCAL FILE STORAGE (dev) ──────────────────────────────────────────────
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? "/tmp/event-promo-data"
  : path.join(process.cwd(), "data");

// ─── GOOGLE DRIVE STORAGE (Vercel production) ──────────────────────────────
function getDriveClient() {
  let pk = process.env.GOOGLE_PRIVATE_KEY || "";
  pk = pk.replace(/\\n/g, "\n").replace(/^"|"$/g, ""); // Fix common Vercel parsing issues

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: pk,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || "";

async function findDriveFile(name: string): Promise<string | null> {
  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `name='${name}' and '${PARENT_FOLDER_ID}' in parents and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });
  return res.data.files?.[0]?.id ?? null;
}

async function readDriveJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const fileId = await findDriveFile(name);
    if (!fileId) return fallback;
    const drive = getDriveClient();
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "text" }
    );
    return JSON.parse(res.data as string) as T;
  } catch {
    return fallback;
  }
}

async function writeDriveJson<T>(name: string, data: T): Promise<void> {
  const drive = getDriveClient();
  const body = JSON.stringify(data, null, 2);
  const existingId = await findDriveFile(name);
  if (existingId) {
    await drive.files.update({
      fileId: existingId,
      media: { mimeType: "application/json", body },
    });
  } else {
    await drive.files.create({
      requestBody: {
        name,
        mimeType: "application/json",
        parents: PARENT_FOLDER_ID ? [PARENT_FOLDER_ID] : [],
      },
      media: { mimeType: "application/json", body },
    });
  }
}

// ─── LOCAL FILE HELPERS ─────────────────────────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalJson<T>(file: string, fallback: T): T {
  ensureDataDir();
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, "utf-8")) as T; } catch { return fallback; }
}

function writeLocalJson<T>(file: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ─── PUBLIC API (async) ────────────────────────────────────────────────────
const useGoogleDrive = IS_VERCEL && !!PARENT_FOLDER_ID;

export async function getHosts(): Promise<Host[]> {
  if (useGoogleDrive) return readDriveJson<Host[]>("db_hosts.json", []);
  return readLocalJson<Host[]>("hosts.json", []);
}

export async function getHostBySlug(slug: string): Promise<Host | undefined> {
  return (await getHosts()).find((h) => h.slug === slug);
}

export async function getHostById(id: string): Promise<Host | undefined> {
  return (await getHosts()).find((h) => h.id === id);
}

export async function saveHost(host: Host): Promise<void> {
  const hosts = await getHosts();
  const idx = hosts.findIndex((h) => h.id === host.id);
  if (idx >= 0) hosts[idx] = host; else hosts.push(host);
  if (useGoogleDrive) { await writeDriveJson("db_hosts.json", hosts); return; }
  writeLocalJson("hosts.json", hosts);
}

export async function getAttendees(hostSlug?: string): Promise<Attendee[]> {
  const all = useGoogleDrive
    ? await readDriveJson<Attendee[]>("db_attendees.json", [])
    : readLocalJson<Attendee[]>("attendees.json", []);
  return hostSlug ? all.filter((a) => a.hostSlug === hostSlug) : all;
}

export async function saveAttendee(attendee: Attendee): Promise<void> {
  const attendees = await getAttendees();
  attendees.push(attendee);
  if (useGoogleDrive) { await writeDriveJson("db_attendees.json", attendees); return; }
  writeLocalJson("attendees.json", attendees);
}

export function generateSlug(hostName: string, city: string): string {
  return `${city}-${hostName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function deleteHost(id: string): Promise<void> {
  const hosts = (await getHosts()).filter((h) => h.id !== id);
  if (useGoogleDrive) { await writeDriveJson("db_hosts.json", hosts); return; }
  writeLocalJson("hosts.json", hosts);
}

