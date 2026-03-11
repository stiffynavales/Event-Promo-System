import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Promotion System",
  description: "Automated event promotion system for meetup hosts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="navbar">
          <a href="/" className="navbar-logo">
            Event<span>Promo</span>
          </a>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <a href="/host-signup" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
              Become a Host →
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
