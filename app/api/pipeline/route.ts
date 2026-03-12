import { NextRequest, NextResponse } from "next/server";
import { getHostById, saveHost } from "@/lib/db";
import { generateEventCopy } from "@/lib/openai";
import { createHostDriveFolder } from "@/lib/drive";
import { sendHostPromoKit } from "@/lib/email";

export async function POST(req: NextRequest) {
  let hostId: string | null = null;

  try {
    const body = await req.json();
    hostId = body.hostId;

    if (!hostId) {
      return NextResponse.json({ error: "hostId is required" }, { status: 400 });
    }

    let host = await getHostById(hostId);
    
    // Vercel KV can have a 50-200ms replication delay on Edge networks. Retry up to 3 times.
    let retries = 3;
    while (!host && retries > 0) {
      await new Promise(res => setTimeout(res, 300));
      host = await getHostById(hostId);
      retries--;
    }

    if (!host) {
      return NextResponse.json({ error: "Host not found in database (KV sync delay)" }, { status: 404 });
    }

    // Mark as generating
    host.status = "generating";
    await saveHost(host);

    // Step 1: Generate AI copy
    console.log(`[Pipeline] Step 1: Generating AI copy for ${host.hostName}...`);
    let generatedCopy;
    try {
      generatedCopy = await generateEventCopy(host);
      host.generatedCopy = generatedCopy;
      console.log(`[Pipeline] Step 1: ✓ AI copy generated`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Pipeline] Step 1 FAILED (OpenAI):`, msg);
      host.status = "error";
      await saveHost(host);
      return NextResponse.json({ error: `OpenAI failed: ${msg}` }, { status: 500 });
    }

    // Step 2: Create Google Drive folder
    let driveFolderUrl = "";
    const googleConfigured =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL !== "your_service_account@yourproject.iam.gserviceaccount.com";

    if (googleConfigured) {
      console.log(`[Pipeline] Step 2: Creating Drive folder...`);
      try {
        driveFolderUrl = await createHostDriveFolder(host, generatedCopy);
        host.driveFolderUrl = driveFolderUrl;
        console.log(`[Pipeline] Step 2: ✓ Drive folder created: ${driveFolderUrl}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Pipeline] Step 2 FAILED (Google Drive):`, msg);
        // Non-fatal — continue without Drive
        host.driveFolderUrl = "DRIVE_ERROR";
        console.log(`[Pipeline] Step 2: Continuing without Drive folder`);
      }
    } else {
      console.log(`[Pipeline] Step 2: Skipping Drive (not configured)`);
      host.driveFolderUrl = "DRIVE_NOT_CONFIGURED";
    }

    // Step 3: Set registration URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    host.registrationPageUrl = `${baseUrl}/event/${host.slug}`;

    // Step 4: Send promo kit email
    const sendgridConfigured =
      process.env.SENDGRID_API_KEY &&
      process.env.SENDGRID_API_KEY !== "your_sendgrid_api_key_here";

    if (sendgridConfigured) {
      console.log(`[Pipeline] Step 3: Sending promo kit email to ${host.hostEmail}...`);
      try {
        await sendHostPromoKit(host, driveFolderUrl || host.registrationPageUrl);
        console.log(`[Pipeline] Step 3: ✓ Email sent`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Pipeline] Step 3 FAILED (SendGrid):`, msg);
        // Non-fatal — continue without email
        console.log(`[Pipeline] Step 3: Continuing without email`);
      }
    } else {
      console.log(`[Pipeline] Step 3: Skipping email (SendGrid not configured)`);
    }

    // Mark as complete
    host.status = "complete";
    await saveHost(host);
    console.log(`[Pipeline] ✓ Complete for ${host.hostName}`);

    return NextResponse.json({ success: true, host });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Pipeline] Unexpected error:", msg);
    if (hostId) {
      try {
        const host = await getHostById(hostId);
        if (host) { host.status = "error"; await saveHost(host); }
      } catch {}
    }
    return NextResponse.json({ error: `Pipeline failed: ${msg}` }, { status: 500 });
  }
}
