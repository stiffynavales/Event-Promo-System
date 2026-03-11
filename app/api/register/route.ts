import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveAttendee, getHostBySlug } from "@/lib/db";
import { Attendee } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { hostSlug, name, email } = await req.json();

    if (!hostSlug || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const host = getHostBySlug(hostSlug);
    if (!host) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const attendee: Attendee = {
      id: uuidv4(),
      hostSlug,
      name,
      email,
      registeredAt: new Date().toISOString(),
    };

    saveAttendee(attendee);

    return NextResponse.json({ success: true, attendee }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
