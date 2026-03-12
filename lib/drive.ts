import { google } from "googleapis";
import { Host, GeneratedCopy } from "./types";

function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return auth;
}

export async function createHostDriveFolder(
  host: Host,
  copy: GeneratedCopy
): Promise<string> {
  const auth = getAuthClient();
  const drive = google.drive({ version: "v3", auth });

  // Create main folder
  const folderRes = await drive.files.create({
    requestBody: {
      name: `${host.city} - ${host.hostName} Promo Kit`,
      mimeType: "application/vnd.google-apps.folder",
      parents: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
        ? [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID]
        : [],
    },
    fields: "id",
  });

  const folderId = folderRes.data.id!;

  try {
    // Create email templates doc
    const emailContent = buildEmailDoc(host, copy);
    await drive.files.create({
      requestBody: {
        name: "Email Templates",
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId],
      },
      media: { mimeType: "text/plain", body: emailContent },
      fields: "id",
    });

    // Create social media templates doc
    const socialContent = buildSocialDoc(host, copy);
    await drive.files.create({
      requestBody: {
        name: "Social Media Templates",
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId],
      },
      media: { mimeType: "text/plain", body: socialContent },
      fields: "id",
    });

    // Create event info doc
    const infoContent = buildInfoDoc(host, copy);
    await drive.files.create({
      requestBody: {
        name: "Event Info & Registration Link",
        mimeType: "application/vnd.google-apps.document",
        parents: [folderId],
      },
      media: { mimeType: "text/plain", body: infoContent },
      fields: "id",
    });

    // Make folder shareable (anyone with link can view)
    await drive.permissions.create({
      fileId: folderId,
      requestBody: { role: "reader", type: "anyone" },
    });
  } catch (err: unknown) {
    console.error("[Drive] Partially failed creating docs/permissions inside folder:", err);
    // Continue anyway — the folder exists!
  }

  return `https://drive.google.com/drive/folders/${folderId}`;
}

function buildEmailDoc(host: Host, copy: GeneratedCopy): string {
  return `EVENT PROMOTIONAL EMAIL TEMPLATES
For: ${host.hostName} | ${host.city} Watch Party
Event: ${host.eventDate} at ${host.eventTime} | ${host.venue}

===========================================
EMAIL 1: CONFIRMATION EMAIL
(Send immediately after attendee registers)
===========================================

${copy.confirmationEmail}

===========================================
EMAIL 2: REMINDER - 1 DAY BEFORE
(Send the day before the event)
===========================================

${copy.reminder1DayBefore}

===========================================
EMAIL 3: REMINDER - 1 HOUR BEFORE
(Send 1 hour before event starts)
===========================================

${copy.reminder1HourBefore}

===========================================
EMAIL 4: FOLLOW-UP EMAIL
(Send the day after the event)
===========================================

${copy.followUpEmail}
`;
}

function buildSocialDoc(host: Host, copy: GeneratedCopy): string {
  return `SOCIAL MEDIA TEMPLATES
For: ${host.hostName} | ${host.city} Watch Party
Event: ${host.eventDate} at ${host.eventTime}

===========================================
POST 1: INSTAGRAM / FACEBOOK
===========================================

${copy.socialPost1}

===========================================
POST 2: X (TWITTER)
===========================================

${copy.socialPost2}

===========================================
POST 3: LINKEDIN
===========================================

${copy.socialPost3}
`;
}

function buildInfoDoc(host: Host, copy: GeneratedCopy): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `EVENT INFO SHEET
Host: ${host.hostName}
City: ${host.city}
Venue: ${host.venue}
Date: ${host.eventDate}
Time: ${host.eventTime}
Host Email: ${host.hostEmail}

===========================================
YOUR REGISTRATION PAGE LINK
===========================================
${baseUrl}/event/${host.slug}

Share this link with your audience so they can register for your watch party!

===========================================
PAGE HEADLINE
===========================================
${copy.pageHeadline}

===========================================
EVENT DESCRIPTION
===========================================
${copy.eventDescription}
`;
}
