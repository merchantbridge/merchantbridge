"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Merchant {
  id: string;
  business_name: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url: string;
  read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  merchant: Merchant;
  notifications: Notification[];
}

export default function NotificationCenter({
  merchant,
  notifications,
}: NotificationCenterProps) {
  const supabase = createClient();
  const [notifs, setNotifs] = useState(notifications);

  async function markAsRead(notificationId: string) {
    await supabase
      .from("merchant_notifications")
      .update({ read: true })
      .eq("id", notificationId);

    setNotifs((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }

  async function markAllAsRead() {
    await supabase
      .from("merchant_notifications")
      .update({ read: true })
      .eq("merchant_id", merchant.id);

    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifs.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "opportunity_match":
        return (
          <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        );
      case "profile_review":
        return (
          <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "message":
        return (
          <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "opportunity_expiring":
        return (
          <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case "application_reminder":
        return (
          <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        );
      default:
        return (
          <svg className="size-5 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        );
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
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl font-semibold text-[#C24E00]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-semibold text-[#FF6A00] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-[#FF6A00] text-sm font-semibold text-white">
            {merchant.business_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {notifs.length === 0 ? (
          <div className="rounded-2xl border border-[#EADFD5] bg-white p-12 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FF6A00]/10">
              <svg className="size-8 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-[#C24E00]">
              No notifications
            </h3>
            <p className="mt-2 text-[#4A4A4A]">
              You&apos;re all caught up! We&apos;ll notify you when there&apos;s something new.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl border p-6 transition ${
                  notification.read
                    ? "border-[#EADFD5] bg-white"
                    : "border-[#FF6A00] bg-[#FF6A00]/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#C24E00]">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#4A4A4A]">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="shrink-0 rounded-lg border border-[#EADFD5] px-3 py-1.5 text-xs font-semibold text-[#C24E00] transition hover:border-[#FF6A00] hover:text-[#FF6A00]"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-[#4A4A4A]">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {notification.action_url && (
                        <Link
                          href={notification.action_url}
                          className="text-sm font-semibold text-[#FF6A00] hover:underline"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
