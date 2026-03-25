"use client";
import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  return null;
}
