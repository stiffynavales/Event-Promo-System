import { Host, GeneratedCopy } from "./types";

// Try Gemini AI first — fall back to smart templates if unavailable
export async function generateEventCopy(host: Host): Promise<GeneratedCopy> {
  // Try Gemini if key is configured
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
  ) {
    try {
      return await generateWithGemini(host);
    } catch (err) {
      console.warn("[AI] Gemini failed, falling back to templates:", err instanceof Error ? err.message : err);
    }
  }

  // Smart template fallback
  console.log("[AI] Using smart template copy generation");
  return generateWithTemplates(host);
}

async function generateWithGemini(host: Host): Promise<GeneratedCopy> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  // Try models in order of preference
  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro", "gemini-1.5-flash-latest"];

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = buildPrompt(host);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      console.log(`[AI] ✓ Generated with ${modelName}`);
      return JSON.parse(cleaned) as GeneratedCopy;
    } catch (err) {
      console.warn(`[AI] Model ${modelName} failed:`, err instanceof Error ? err.message.slice(0, 100) : err);
    }
  }

  throw new Error("All Gemini models failed");
}

function buildPrompt(host: Host): string {
  return `You are an expert event marketing copywriter. Generate promotional copy for a community watch party.

Event: Host: ${host.hostName}, City: ${host.city}, Venue: ${host.venue}, Date: ${host.eventDate}, Time: ${host.eventTime}
Host Bio: ${host.hostBio}

Return ONLY valid JSON (no markdown, no explanation):
{"pageHeadline":"compelling headline under 12 words","eventDescription":"2-3 sentence event description","confirmationEmail":"150-200 word confirmation email","reminder1DayBefore":"100-150 word day-before reminder","reminder1HourBefore":"60-80 word hour-before reminder","followUpEmail":"120-150 word follow-up email","socialPost1":"Instagram post with emojis 80-100 words","socialPost2":"Twitter/X post under 280 chars with hashtags","socialPost3":"LinkedIn post 80-100 words professional tone"}`;
}

function generateWithTemplates(host: Host): GeneratedCopy {
  const { hostName, city, venue, eventDate, eventTime } = host;

  const dateObj = new Date(eventDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return {
    pageHeadline: `Join the ${city} Watch Party — Live Event with ${hostName}`,

    eventDescription: `Get ready for an unforgettable evening! Join ${hostName} and a community of like-minded people for a live watch party in ${city}. We'll be gathering at ${venue} on ${formattedDate} at ${eventTime} for a shared viewing experience you won't want to miss.`,

    confirmationEmail: `Hi there,

You're in! 🎉 We're so excited to have you join us for the ${city} Watch Party.

Here are your event details:
📅 Date: ${formattedDate}
🕐 Time: ${eventTime}
📍 Venue: ${venue}, ${city}
🎤 Hosted by: ${hostName}

Please arrive a few minutes early so we can get settled before the event starts. Bring your enthusiasm, a great attitude, and be ready to connect with amazing people in the ${city} community!

If you have any questions, simply reply to this email.

See you soon!
${hostName}`,

    reminder1DayBefore: `Hey there!

Just a quick reminder — the ${city} Watch Party is TOMORROW! 🚀

📅 ${formattedDate}
🕐 ${eventTime}
📍 ${venue}, ${city}

We have an incredible evening planned and can't wait to see you there. Make sure to mark your calendar, set a reminder, and get ready for an amazing experience.

Don't forget to share this event with a friend who might want to join! See you tomorrow.

${hostName}`,

    reminder1HourBefore: `We're starting in 1 HOUR! ⏰🔥

Head over to ${venue} in ${city} now — doors open soon and you don't want to miss the beginning!

See you there!
${hostName}`,

    followUpEmail: `Hi,

What an amazing evening! 🙌 Thank you so much for joining us at the ${city} Watch Party. It was incredible to share the experience with such an engaged and enthusiastic group.

We hope you enjoyed every moment of it. The energy in the room at ${venue} was truly special, and that's because of people like YOU who showed up and made it happen.

Stay connected — we have more exciting events coming up and we'd love to have you back. Keep an eye on your inbox for upcoming announcements.

Until next time,
${hostName}`,

    socialPost1: `🎬✨ Watch Party Alert — ${city}!

We're hosting a live community viewing event and YOU'RE invited!

📅 ${formattedDate}
🕐 ${eventTime}
📍 ${venue}, ${city}
🎤 Hosted by ${hostName}

This is going to be an incredible experience. Don't miss out — grab your free spot now! 👇

💥 Register at the link in bio!

#WatchParty #${city.replace(/\s/g, "")}Events #CommunityEvent #LiveEvent`,

    socialPost2: `🎬 ${city} Watch Party — ${formattedDate} at ${eventTime}! Join ${hostName} at ${venue} for an awesome live community event. Free to attend — register now! #WatchParty #${city.replace(/\s/g, "")} #LiveEvent`,

    socialPost3: `Excited to announce the ${city} Watch Party! 🎬

I'll be hosting a community live-viewing event on ${formattedDate} at ${eventTime} at ${venue} in ${city}.

This is a wonderful opportunity to connect with your local community, share an incredible experience together, and be part of something meaningful.

All are welcome — spaces are limited, so be sure to register early.

Looking forward to seeing you there!

#CommunityEvent #${city.replace(/\s/g, "")} #WatchParty #Networking`,
  };
}
