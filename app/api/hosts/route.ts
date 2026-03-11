import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveHost, generateSlug, getHosts } from "@/lib/db";
import { Host } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hostName, hostEmail, hostBio, city, venue, eventDate, eventTime } =
      body;

    if (!hostName || !hostEmail || !city || !venue || !eventDate || !eventTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug = generateSlug(hostName, city);
    const existingHosts = getHosts();
    const duplicate = existingHosts.find((h) => h.slug === slug);
    if (duplicate) {
      return NextResponse.json(
        { error: "A host with this name and city already exists." },
        { status: 409 }
      );
    }

    const host: Host = {
      id: uuidv4(),
      hostName,
      hostEmail,
      hostBio: hostBio || "",
      city,
      venue,
      eventDate,
      eventTime,
      slug,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    saveHost(host);

    return NextResponse.json({ success: true, host }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/hosts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { getHosts } = await import("@/lib/db");
    const hosts = getHosts();
    return NextResponse.json({ hosts });
  } catch (err) {
    console.error("[GET /api/hosts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
