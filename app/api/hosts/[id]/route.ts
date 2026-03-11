import { NextRequest, NextResponse } from "next/server";
import { getHosts, saveHost, getHostById } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const host = getHostById(id);
    if (!host) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    const DATA_DIR = path.join(process.cwd(), "data");
    const HOSTS_FILE = path.join(DATA_DIR, "hosts.json");
    const hosts = getHosts().filter((h) => h.id !== id);
    fs.writeFileSync(HOSTS_FILE, JSON.stringify(hosts, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/hosts/[id]]", err);
    return NextResponse.json({ error: "Failed to delete host" }, { status: 500 });
  }
}
