import { NextRequest, NextResponse } from "next/server";
import { getHosts, saveHost, generateSlug } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { hostName, hostEmail, hostBio, city, venue, eventDate, eventTime } =
      await req.json();

    if (!hostName || !hostEmail || !city || !venue || !eventDate || !eventTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = uuidv4();
    const slug = generateSlug(hostName, city);
    const host = {
      id,
      slug,
      hostName,
      hostEmail,
      hostBio: hostBio || "",
      city,
      venue,
      eventDate,
      eventTime,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    await saveHost(host);
    return NextResponse.json({ success: true, host });
  } catch (err) {
    console.error("[POST /api/hosts]", err);
    return NextResponse.json({ error: "Failed to create host" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const hosts = await getHosts();
    return NextResponse.json({ hosts });
  } catch (err) {
    console.error("[GET /api/hosts]", err);
    return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 });
  }
}
