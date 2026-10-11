"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Merchant {
  id: string;
  business_name: string;
}

interface Application {
  id: string;
  opportunity_id: string | null;
  opportunity_title: string;
  opportunity_type: string;
  status: string;
  notes: string;
  applied_at: string;
  updated_at: string;
}

interface ApplicationTrackerProps {
  merchant: Merchant;
  applications: Application[];
}

const STATUS_OPTIONS = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "in_conversation", label: "In conversation" },
  { value: "deal_closed", label: "Deal closed" },
  { value: "not_successful", label: "Not successful" },
] as const;

export default function ApplicationTracker({
  merchant,
  applications,
}: ApplicationTrackerProps) {
  const supabase = createClient();
  const [apps, setApps] = useState(applications);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonial, setTestimonial] = useState("");
  const [testimonialAppId, setTestimonialAppId] = useState<string | null>(null);

  async function saveChanges(appId: string) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("merchant_opportunity_applications")
        .update({
          status: editingStatus,
          notes: editingNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appId);

      if (error) throw error;

      setApps((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: editingStatus, notes: editingNotes }
            : app
        )
      );

      setEditingId(null);

      // If status changed to deal_closed, show testimonial prompt
      if (editingStatus === "deal_closed") {
        setTestimonialAppId(appId);
        setShowTestimonialModal(true);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setSaving(false);
    }
  }

  async function submitTestimonial() {
    if (!testimonial.trim() || !testimonialAppId) return;

    setSaving(true);
    try {
      const app = apps.find((a) => a.id === testimonialAppId);
      if (!app) return;

      await supabase.from("merchant_testimonials").insert({
        merchant_id: merchant.id,
        opportunity_id: app.opportunity_id,
        content: testimonial,
        status: "pending_review",
      });

      setShowTestimonialModal(false);
      setTestimonial("");
      setTestimonialAppId(null);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
    } finally {
      setSaving(false);
    }
  }

  function startEditing(app: Application) {
    setEditingId(app.id);
    setEditingNotes(app.notes || "");
    setEditingStatus(app.status);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingNotes("");
    setEditingStatus("");
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "bg-gray-100 text-gray-700";
      case "applied":
        return "bg-accentSoft text-accentDim";
      case "in_conversation":
        return "bg-yellow-100 text-yellow-700";
      case "deal_closed":
        return "bg-green-100 text-green-700";
      case "not_successful":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F2]">
      {/* Header */}
      <header className="border-b border-[#EADFD5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/merchant/dashboard" className="font-display text-xl font-semibold text-[#C24E00]">
            ← Back to dashboard
          </Link>
          <h1 className="font-display text-xl font-semibold text-[#C24E00]">
            Application Tracker
          </h1>
          <div className="flex size-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-semibold text-white">
            {merchant.business_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-[#C24E00]">
            Your applications
          </h2>
          <p className="mt-2 text-[#4A4A4A]">
            Track and update the status of your opportunity applications
          </p>
        </div>

        {apps.length === 0 ? (
          <div className="rounded-2xl border border-[#EADFD5] bg-white p-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FF6A00]/10">
              <svg className="size-8 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-[#C24E00]">
              No applications yet
            </h3>
            <p className="mt-2 text-[#4A4A4A]">
              Start browsing opportunities and apply to ones that match your business
            </p>
            <Link
              href="/merchant/opportunities"
              className="mt-4 inline-block rounded-xl bg-[#FF6A00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E85D00]"
            >
              Browse opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-[#EADFD5] bg-white p-6"
              >
                {editingId === app.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                        Status
                      </label>
                      <select
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value)}
                        className="w-full rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#C24E00]">
                        Notes
                      </label>
                      <textarea
                        rows={3}
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Add context about this application (who you spoke to, conversation stage, etc.)"
                        className="w-full resize-none rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => saveChanges(app.id)}
                        disabled={saving}
                        className="rounded-xl bg-[#FF6A00] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E85D00] disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={saving}
                        className="rounded-xl border border-[#EADFD5] px-6 py-2.5 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-lg font-semibold text-[#C24E00]">
                          {app.opportunity_title}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(app.status)}`}
                        >
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-[#4A4A4A]">
                        <span>
                          Applied {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                        {app.opportunity_type && (
                          <span>· {app.opportunity_type}</span>
                        )}
                      </div>

                      {app.notes && (
                        <div className="mt-3 rounded-lg bg-[#F3F5F2] p-3 text-sm text-[#4A4A4A]">
                          <span className="font-semibold">Notes:</span> {app.notes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => startEditing(app)}
                      className="shrink-0 rounded-lg border border-[#EADFD5] px-4 py-2 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00]"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-lg rounded-2xl bg-white p-6">
            <h3 className="font-display text-xl font-semibold text-[#C24E00]">
              Congratulations! 🎉
            </h3>
            <p className="mt-2 text-[#4A4A4A]">
              Would you like to share a brief testimonial about your experience on Merchant Bridge?
            </p>
            <textarea
              rows={4}
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Share your experience..."
              className="mt-4 w-full resize-none rounded-xl border border-[#EADFD5] px-4 py-3 text-sm outline-none focus:border-[#FF6A00] focus:ring-4 focus:ring-[#FF6A00]/10"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={submitTestimonial}
                disabled={saving || !testimonial.trim()}
                className="rounded-xl bg-[#FF6A00] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E85D00] disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit testimonial"}
              </button>
              <button
                onClick={() => {
                  setShowTestimonialModal(false);
                  setTestimonial("");
                  setTestimonialAppId(null);
                }}
                disabled={saving}
                className="rounded-xl border border-[#EADFD5] px-6 py-2.5 text-sm font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00] disabled:opacity-50"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
