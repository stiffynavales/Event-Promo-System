import Link from "next/link";
import { notFound } from "next/navigation";
import { getHostBySlug } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ThankYouPage({ params }: Props) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);
  if (!host) notFound();

  const dateObj = new Date(host.eventDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main style={{ padding: "80px 24px", maxWidth: "600px", margin: "0 auto" }}>
      <div className="card animate-fade-in-up" style={{ textAlign: "center", padding: "52px 40px" }}>
        <div style={{ fontSize: "72px", marginBottom: "24px" }}>🎉</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "14px" }}>
          You're Registered!
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "32px", fontSize: "16px" }}>
          Can't wait to see you at the <strong style={{ color: "var(--text)" }}>{host.city} Watch Party</strong>! 
          Check your inbox for a confirmation email with all the event details.
        </p>

        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "left",
            marginBottom: "32px",
          }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            Event Details
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "📅", label: formattedDate },
              { icon: "🕐", label: host.eventTime },
              { icon: "📍", label: `${host.venue}, ${host.city}` },
              { icon: "🎤", label: `Hosted by ${host.hostName}` },
            ].map((item) => (
              <div key={item.label} style={{ fontSize: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
                <span>{item.icon}</span>
                <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Want to invite a friend?
          </p>
          <Link
            href={`/event/${slug}`}
            className="btn-secondary"
            style={{ justifyContent: "center" }}
          >
            Share This Event
          </Link>
        </div>
      </div>
    </main>
  );
}
