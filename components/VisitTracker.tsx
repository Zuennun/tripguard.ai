"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "rbs_cookie_consent";

export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    try {
      const consent = window.localStorage.getItem(STORAGE_KEY);
      if (consent !== "all") return;
    } catch {
      return;
    }

    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const payload = JSON.stringify({
      pathname: path,
      referrer: document.referrer || "",
      title: document.title || "",
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/visit", blob);
      return;
    }

    void fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
