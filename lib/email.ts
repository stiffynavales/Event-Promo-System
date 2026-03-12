import sgMail from "@sendgrid/mail";
import { Host, Attendee } from "./types";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendHostPromoKit(
  host: Host,
  driveFolderUrl: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const registrationUrl = `${baseUrl}/event/${host.slug}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 26px; margin: 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px; }
    .body { padding: 36px 32px; }
    .body p { color: #444; line-height: 1.7; font-size: 15px; }
    .cta-block { background: #f8f7ff; border-left: 4px solid #667eea; padding: 20px 24px; border-radius: 8px; margin: 24px 0; }
    .cta-block p { margin: 0 0 6px; color: #333; font-weight: 600; font-size: 14px; }
    .btn { display: inline-block; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; text-decoration: none; margin: 8px 4px; }
    .btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .steps { background: #f8f7ff; border-radius: 8px; padding: 24px; margin: 24px 0; }
    .steps h3 { margin: 0 0 16px; color: #333; font-size: 16px; }
    .steps ol { padding-left: 20px; color: #555; line-height: 2; margin: 0; }
    .footer { background: #f4f4f4; padding: 20px 32px; text-align: center; }
    .footer p { color: #999; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your Promo Kit is Ready!</h1>
      <p>Hi ${host.hostName}, everything you need is set up below</p>
    </div>
    <div class="body">
      <p>Congratulations! Your custom promotional kit for the <strong>${host.city} Watch Party</strong> is ready. Here are all the assets you need to start promoting your event.</p>

      <div class="cta-block">
        <p>📄 Your Registration Page</p>
        <a href="${registrationUrl}" class="btn btn-primary">View Registration Page</a>
        <p style="margin-top:10px;font-size:13px;color:#666;">Share this link with your audience: <br><em>${registrationUrl}</em></p>
      </div>

      <div class="cta-block">
        <p>📁 Your Promotional Assets Folder</p>
        <a href="${driveFolderUrl}" class="btn btn-secondary">Open Google Drive Folder</a>
        <p style="margin-top:10px;font-size:13px;color:#666;">Inside you'll find email templates, social media posts, and your event info sheet.</p>
      </div>

      <div class="steps">
        <h3>🚀 Getting Started — 3 Simple Steps</h3>
        <ol>
          <li>Open the Google Drive folder and review all your assets</li>
          <li>Share your registration page link with your network</li>
          <li>Copy & paste the social media templates to promote the event</li>
        </ol>
      </div>

      <p>Your event is scheduled for <strong>${host.eventDate} at ${host.eventTime}</strong> at <strong>${host.venue}</strong>. If you have any questions, just reply to this email!</p>
    </div>
    <div class="footer">
      <p>You're receiving this because you signed up as a meetup host. © 2026 Event Promotion System</p>
    </div>
  </div>
</body>
</html>
`;

  await sgMail.send({
    to: host.hostEmail,
    from: process.env.SENDGRID_FROM_EMAIL || "noreply@example.com",
    subject: `🎉 Your Watch Party Promo Kit is Ready — ${host.city}!`,
    html,
  });
}

export async function sendAttendeeConfirmation(
  attendee: Attendee,
  host: Host
): Promise<void> {
  if (!host.generatedCopy?.confirmationEmail) {
    console.warn(`[Email] No AI confirmation email found for host ${host.slug}`);
    return;
  }

  // Use the AI-generated email text as the body
  let textBody = host.generatedCopy.confirmationEmail;
  
  // Replace template variables if the AI left any
  textBody = textBody.replace(/\[Attendee Name\]|\[Name\]/gi, attendee.name);
  textBody = textBody.replace(/\[Host Name\]/gi, host.hostName);

  await sgMail.send({
    to: attendee.email,
    from: process.env.SENDGRID_FROM_EMAIL || "noreply@example.com",
    subject: `You're registered for the ${host.city} Watch Party!`,
    text: textBody,
  });
}
