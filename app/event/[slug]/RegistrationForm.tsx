"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function RegistrationForm({ hostSlug }: { hostSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, hostSlug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      router.push(`/event/${hostSlug}/thank-you`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">Full Name <span>*</span></label>
        <input {...register("name")} className="form-input" placeholder="Your name" />
        {errors.name && <span className="form-error">{errors.name.message}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Email Address <span>*</span></label>
        <input {...register("email")} type="email" className="form-input" placeholder="your@email.com" />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>
      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "12px", fontSize: "14px", color: "var(--error)", marginBottom: "16px" }}>
          {error}
        </div>
      )}
      <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }} disabled={loading}>
        {loading ? "Registering..." : "✅ Reserve My Spot"}
      </button>
      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "12px", textAlign: "center" }}>
        You'll receive a confirmation email with event details.
      </p>
    </form>
  );
}
