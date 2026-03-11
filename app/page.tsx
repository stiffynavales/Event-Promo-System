import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(102,126,234,0.12)",
              border: "1px solid rgba(102,126,234,0.3)",
              borderRadius: "999px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#667eea",
              marginBottom: "28px",
            }}
          >
            <span>⚡</span> AI-Powered Event Promotion
          </div>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 6vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "24px",
            }}
          >
            Promote Your Watch Party{" "}
            <span className="gradient-text">Without Lifting a Finger</span>
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "560px",
              margin: "0 auto 40px",
            }}
          >
            Fill out one simple form. Our AI builds your custom event page,
            writes all your emails, and delivers a ready-to-use promo kit in
            minutes.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/host-signup" className="btn-primary">
              Apply as a Meetup Host →
            </Link>
            <Link href="/admin" className="btn-secondary">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "60px 24px 80px" }}>
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800,
              marginBottom: "48px",
            }}
          >
            How It Works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
            }}
          >
            {[
              {
                num: "01",
                title: "Fill Out the Form",
                desc: "Submit your event details — name, city, venue, date, and time.",
                icon: "📋",
              },
              {
                num: "02",
                title: "AI Generates Everything",
                desc: "OpenAI writes your email sequences, social media posts, and event page copy.",
                icon: "🤖",
              },
              {
                num: "03",
                title: "Assets Land in Drive",
                desc: "A Google Drive folder with all your promotional assets is created automatically.",
                icon: "📁",
              },
              {
                num: "04",
                title: "Receive Your Promo Kit",
                desc: "You get a single email with your registration link and Drive folder.",
                icon: "🚀",
              },
            ].map((step) => (
              <div key={step.num} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "16px" }}>{step.icon}</div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--primary)",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  STEP {step.num}
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "10px" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "60px 24px",
        }}
      >
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              marginBottom: "12px",
            }}
          >
            What You Get
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              marginBottom: "40px",
            }}
          >
            Every host receives a complete, customized promotional kit
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              { icon: "🌐", label: "Custom Registration Page", desc: "A unique URL with your event details" },
              { icon: "✅", label: "Thank You Page", desc: "Automatic confirmation for attendees" },
              { icon: "📧", label: "4-Part Email Sequence", desc: "Confirmation, two reminders, follow-up" },
              { icon: "📱", label: "Social Media Templates", desc: "Instagram, Twitter & LinkedIn posts" },
              { icon: "📁", label: "Google Drive Folder", desc: "All assets organized and shareable" },
              { icon: "📊", label: "Attendee Tracking", desc: "Each host has their own registration list" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <span style={{ fontSize: "24px" }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "16px" }}>
          Ready to Host a Watch Party?
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "16px" }}>
          Takes less than 3 minutes to fill out the form.
        </p>
        <Link href="/host-signup" className="btn-primary" style={{ fontSize: "17px", padding: "16px 36px" }}>
          Get Started Now →
        </Link>
      </section>
    </main>
  );
}
