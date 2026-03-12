import { notFound } from "next/navigation";
import { getHostBySlug } from "@/lib/db";
import RegistrationForm from "@/app/event/[slug]/RegistrationForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const host = await getHostBySlug(slug);
  if (!host) notFound();

  const headline = host.generatedCopy?.pageHeadline || `Join the ${host.city} Watch Party`;
  const description =
    host.generatedCopy?.eventDescription ||
    `Join ${host.hostName} for a community watch party event in ${host.city}.`;

  const dateObj = new Date(host.eventDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "64px 24px",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              gap: "8px",
              alignItems: "center",
              background: "rgba(102,126,234,0.12)",
              border: "1px solid rgba(102,126,234,0.3)",
              borderRadius: "999px",
              padding: "5px 14px",
              fontSize: "13px",
              color: "#667eea",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            🎬 Watch Party Event
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            {headline}
          </h1>
          <p style={{ fontSize: "17px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "560px", margin: "0 auto 40px" }}>
            {description}
          </p>

          {/* Event Details Row */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            {[
              { icon: "📅", label: formattedDate },
              { icon: "🕐", label: host.eventTime },
              { icon: "📍", label: `${host.venue}, ${host.city}` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content + Form */}
      <section style={{ padding: "60px 24px" }}>
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* Host Info */}
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>
              About Your Host
            </h2>
            <div
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {host.hostName.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "18px" }}>{host.hostName}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>{host.city}</div>
              </div>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "14px" }}>
                {host.hostBio}
              </p>
            </div>

            <div className="card" style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
                Event Info
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: "📅", label: "Date", value: formattedDate },
                  { icon: "🕐", label: "Time", value: host.eventTime },
                  { icon: "📍", label: "Venue", value: host.venue },
                  { icon: "🏙️", label: "City", value: host.city },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>{row.icon} {row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "20px" }}>
              Reserve Your Spot
            </h2>
            <RegistrationForm hostSlug={slug} />
          </div>
        </div>
      </section>
    </main>
  );
}
