"use client";

import { useState, type FormEvent } from "react";
import { siteConfig } from "@/config/branding";

type Status = "idle" | "submitting" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      // TODO: implement app/api/contact/route.ts to relay this to email/Supabase.
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Business Name" name="business" />
      </div>
      <Field label="Email" name="email" type="email" required />
      <Field label="Store URL" name="storeUrl" type="url" placeholder="https://" />
      <div>
        <label htmlFor="message" className="mb-2 block text-[13px] font-medium text-textSecondary">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-borderCustom bg-secondary px-4 py-3 text-[14.5px] text-textPrimary outline-none focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-[3px] bg-accent px-6 py-3 text-[14.5px] font-semibold text-primary transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>

        {status === "sent" && (
        <p className="text-[13.5px] text-success">Message sent — we'll get back to you within one working day.</p>
      )}
      {status === "error" && (
        <p className="text-[13.5px] text-danger">
          Something went wrong. Email us directly at {siteConfig.supportEmail}.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[13px] font-medium text-textSecondary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-borderCustom bg-secondary px-4 py-3 text-[14.5px] text-textPrimary outline-none focus:border-accent"
      />
    </div>
  );
}
