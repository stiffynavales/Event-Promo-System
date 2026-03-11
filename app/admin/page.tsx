"use client";

import { useEffect, useState } from "react";
import { Host } from "@/lib/types";

export default function AdminPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  async function fetchHosts() {
    const res = await fetch("/api/hosts");
    const json = await res.json();
    setHosts(json.hosts || []);
    setLoading(false);
  }

  useEffect(() => {
    if (authed) fetchHosts();
  }, [authed]);

  async function runPipeline(hostId: string) {
    setRunningId(hostId);
    try {
      await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId }),
      });
      await fetchHosts();
    } finally {
      setRunningId(null);
    }
  }

  async function deleteHost(hostId: string, hostName: string) {
    if (!confirm(`Delete "${hostName}"? This cannot be undone.`)) return;
    setDeletingId(hostId);
    try {
      await fetch(`/api/hosts/${hostId}`, { method: "DELETE" });
      await fetchHosts();
    } finally {
      setDeletingId(null);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "badge-pending",
    generating: "badge-generating",
    complete: "badge-complete",
    error: "badge-error",
  };

  // Simple auth gate
  if (!authed) {
    return (
      <main
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div className="card" style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🔐</div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Admin Access</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
            Enter the admin password to continue
          </p>
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(true)}
            style={{ marginBottom: "16px" }}
          />
          <button className="btn-primary" style={{ width: "100%" }} onClick={() => setAuthed(true)}>
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "48px 24px 80px" }}>
      <div className="container" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "6px" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Manage meetup hosts and run automation pipelines
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-secondary" onClick={fetchHosts}>
              ↻ Refresh
            </button>
            <a href="/host-signup" className="btn-primary">
              + Add Host
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[
            { label: "Total Hosts", value: hosts.length, icon: "👥" },
            { label: "Complete", value: hosts.filter((h) => h.status === "complete").length, icon: "✅" },
            { label: "Pending", value: hosts.filter((h) => h.status === "pending").length, icon: "⏳" },
            { label: "Errors", value: hosts.filter((h) => h.status === "error").length, icon: "⚠️" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>
                {loading ? "—" : stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Host Table */}
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "var(--text-muted)" }}>Loading hosts...</p>
          </div>
        ) : hosts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "60px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <h2 style={{ fontWeight: 700, marginBottom: "12px" }}>No hosts yet</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
              Once hosts sign up, they'll appear here.
            </p>
            <a href="/host-signup" className="btn-primary">
              Add First Host
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {hosts.map((host) => (
              <div
                key={host.id}
                className="card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        color: "#fff",
                        fontSize: "15px",
                        flexShrink: 0,
                      }}
                    >
                      {host.hostName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "16px" }}>{host.hostName}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                        {host.hostEmail}
                      </div>
                    </div>
                    <span className={`badge ${statusColors[host.status] || "badge-pending"}`}>
                      {host.status === "generating" && "⚡ "}
                      {host.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>📍 {host.city}</span>
                    <span>🏛 {host.venue}</span>
                    <span>📅 {host.eventDate}</span>
                    <span>🕐 {host.eventTime}</span>
                  </div>

                  {host.status === "complete" && (
                    <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <a
                        href={`/event/${host.slug}`}
                        target="_blank"
                        className="btn-secondary"
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        🌐 View Event Page
                      </a>
                      {host.driveFolderUrl && host.driveFolderUrl !== "DRIVE_NOT_CONFIGURED" && (
                        <a
                          href={host.driveFolderUrl}
                          target="_blank"
                          className="btn-secondary"
                          style={{ fontSize: "12px", padding: "6px 14px" }}
                        >
                          📁 Drive Folder
                        </a>
                      )}
                    </div>
                  )}

                  {host.generatedCopy && (
                    <details style={{ marginTop: "14px" }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          color: "var(--primary)",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        View Generated Copy ↓
                      </summary>
                      <div
                        style={{
                          marginTop: "12px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                          borderRadius: "10px",
                          padding: "16px",
                          fontSize: "13px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {[
                          { label: "Page Headline", text: host.generatedCopy.pageHeadline },
                          { label: "Confirmation Email", text: host.generatedCopy.confirmationEmail },
                          { label: "Social Post (Instagram)", text: host.generatedCopy.socialPost1 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div style={{ fontWeight: 700, marginBottom: "4px", color: "var(--text)" }}>
                              {item.label}
                            </div>
                            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                  {host.status === "pending" || host.status === "error" ? (
                    <button
                      className="btn-primary"
                      style={{ fontSize: "13px", padding: "10px 18px", whiteSpace: "nowrap" }}
                      onClick={() => runPipeline(host.id)}
                      disabled={runningId === host.id}
                    >
                      {runningId === host.id ? "Running..." : "▶ Run Pipeline"}
                    </button>
                  ) : host.status === "complete" ? (
                    <button
                      className="btn-secondary"
                      style={{ fontSize: "13px", padding: "10px 18px" }}
                      onClick={() => runPipeline(host.id)}
                      disabled={runningId === host.id}
                    >
                      ↻ Re-run
                    </button>
                  ) : (
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Processing...</div>
                  )}
                  <button
                    onClick={() => deleteHost(host.id, host.hostName)}
                    disabled={deletingId === host.id || runningId === host.id}
                    style={{
                      fontSize: "12px",
                      padding: "8px 14px",
                      background: "rgba(248,113,113,0.1)",
                      color: "var(--error)",
                      border: "1px solid rgba(248,113,113,0.3)",
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      opacity: deletingId === host.id ? 0.6 : 1,
                    }}
                  >
                    {deletingId === host.id ? "Deleting..." : "🗑 Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
