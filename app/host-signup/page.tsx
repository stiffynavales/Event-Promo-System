"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  hostName: z.string().min(2, "Name must be at least 2 characters"),
  hostEmail: z.string().email("Please enter a valid email"),
  hostBio: z.string().min(20, "Please write at least 20 characters about yourself"),
  city: z.string().min(2, "City is required"),
  venue: z.string().min(3, "Venue is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
});

type FormData = z.infer<typeof schema>;

type Step = "form" | "submitting" | "generating" | "success" | "error";

export default function HostSignupPage() {
  const [step, setStep] = useState<Step>("form");
  const [resultHost, setResultHost] = useState<{ slug: string; id: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStep("submitting");
    try {
      // Step 1: Create host
      const res = await fetch("/api/hosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create host");

      setResultHost({ slug: json.host.slug, id: json.host.id });

      // Step 2: Run pipeline
      setStep("generating");
      const pipeRes = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId: json.host.id }),
      });
      const pipeJson = await pipeRes.json();
      if (!pipeRes.ok) throw new Error(pipeJson.error || "Pipeline failed");

      setStep("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  };

  if (step === "submitting" || step === "generating") {
    return (
      <main className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            border: "4px solid rgba(102,126,234,0.2)",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 32px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
          {step === "submitting" ? "Saving your details..." : "🤖 AI is building your promo kit..."}
        </h2>
        <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto" }}>
          {step === "generating"
            ? "Generating email sequences, social media posts, and creating your Google Drive folder. This takes about 30 seconds."
            : "Hang tight, almost there!"}
        </p>
      </main>
    );
  }

  if (step === "success" && resultHost) {
    return (
      <main className="container" style={{ padding: "80px 24px", maxWidth: "600px" }}>
        <div
          className="card animate-fade-in-up"
          style={{ textAlign: "center", padding: "48px 36px" }}
        >
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px" }}>
            Your Promo Kit is Ready!
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "32px", lineHeight: 1.7 }}>
            Your promotional assets have been generated. Check your email for the
            full kit — including your registration page link and Google Drive folder.
          </p>
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "28px",
            }}
          >
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
              Your Registration Page
            </div>
            <div style={{ fontWeight: 600, fontSize: "16px", wordBreak: "break-all" }}>
              /event/{resultHost.slug}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={`/event/${resultHost.slug}`}
              className="btn-primary"
            >
              View My Event Page →
            </a>
            <a href="/admin" className="btn-secondary">
              Admin Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (step === "error") {
    return (
      <main className="container" style={{ padding: "80px 24px", maxWidth: "600px", textAlign: "center" }}>
        <div className="card" style={{ padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>{errorMsg}</p>
          <button className="btn-primary" onClick={() => setStep("form")}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div className="page-header" style={{ padding: "0 0 40px", textAlign: "left" }}>
          <div
            style={{
              display: "inline-flex",
              gap: "8px",
              alignItems: "center",
              background: "rgba(102,126,234,0.1)",
              border: "1px solid rgba(102,126,234,0.3)",
              borderRadius: "999px",
              padding: "5px 14px",
              fontSize: "13px",
              color: "#667eea",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            <span>🎤</span> Host Signup
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 800, marginBottom: "12px" }}>
            Become a Meetup Host
          </h1>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "16px" }}>
            Fill out this form and we'll automatically generate your complete
            event promotion kit — registration page, emails, and social media posts.
          </p>
        </div>

        <form className="card" onSubmit={handleSubmit(onSubmit)} style={{ gap: 0 }}>
          {/* Section: Host Info */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
              About You
            </h2>
            <div className="form-group">
              <label className="form-label">
                Full Name <span>*</span>
              </label>
              <input
                {...register("hostName")}
                className="form-input"
                placeholder="e.g. Sarah Johnson"
              />
              {errors.hostName && <span className="form-error">{errors.hostName.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">
                Email Address <span>*</span>
              </label>
              <input
                {...register("hostEmail")}
                type="email"
                className="form-input"
                placeholder="your@email.com"
              />
              {errors.hostEmail && <span className="form-error">{errors.hostEmail.message}</span>}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Your Bio <span>*</span>
              </label>
              <textarea
                {...register("hostBio")}
                className="form-input form-textarea"
                placeholder="Tell us a little about yourself and why you're hosting this watch party..."
              />
              {errors.hostBio && <span className="form-error">{errors.hostBio.message}</span>}
            </div>
          </div>

          <div className="divider" />

          {/* Section: Event Info */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
              Event Details
            </h2>
            <div className="form-group">
              <label className="form-label">
                City <span>*</span>
              </label>
              <input
                {...register("city")}
                className="form-input"
                placeholder="e.g. Dallas, TX"
              />
              {errors.city && <span className="form-error">{errors.city.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">
                Venue Name <span>*</span>
              </label>
              <input
                {...register("venue")}
                className="form-input"
                placeholder="e.g. The Grand Hall, Community Center"
              />
              {errors.venue && <span className="form-error">{errors.venue.message}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Event Date <span>*</span>
                </label>
                <input
                  {...register("eventDate")}
                  type="date"
                  className="form-input"
                  style={{ colorScheme: "dark" }}
                />
                {errors.eventDate && <span className="form-error">{errors.eventDate.message}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Event Time <span>*</span>
                </label>
                <input
                  {...register("eventTime")}
                  type="time"
                  className="form-input"
                  style={{ colorScheme: "dark" }}
                />
                {errors.eventTime && <span className="form-error">{errors.eventTime.message}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px" }}>
            🚀 Generate My Promo Kit
          </button>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "12px" }}>
            Takes ~30 seconds. You'll receive an email with everything ready.
          </p>
        </form>
      </div>
    </main>
  );
}
