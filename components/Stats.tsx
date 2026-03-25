"use client";
import { useEffect, useRef, useState } from "react";
import { type Translations } from "@/lib/translations";

function useCountUp(end: number, decimals = 0, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf: number;
    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setValue(end);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, end, decimals, duration]);
  return value;
}

function StatItem({ end, decimals, prefix, suffix, display, label, orange, duration, active, index }: {
  end: number; decimals?: number; prefix?: string; suffix?: string; display?: string;
  label: string; orange?: boolean; duration?: number; active: boolean; index: number;
}) {
  const raw = useCountUp(end, decimals ?? 0, active, duration);
  let displayed: string;
  if (display && !active) displayed = "0";
  else if (display && active) displayed = (prefix ?? "") + Math.round(raw).toLocaleString("de-DE") + (suffix ?? "");
  else if (decimals) displayed = (prefix ?? "") + raw.toFixed(decimals) + (suffix ?? "");
  else displayed = (prefix ?? "") + Math.round(raw).toLocaleString("de-DE") + (suffix ?? "");

  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: 1, textAlign: "center", padding: "1rem 1.5rem" }}>
        <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: orange ? "#f97316" : "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "0.5rem" }}>
          {displayed}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
          {label}
        </div>
      </div>
      {index !== 3 && <div style={{ width: 1, background: "rgba(255,255,255,0.12)", alignSelf: "stretch", flexShrink: 0 }} />}
    </div>
  );
}

export default function Stats({ t }: { t: Translations }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { end: 1385, suffix: "+", label: t.stats.bookings, display: "1.385+", duration: 3500 },
    { end: 189, prefix: "~", suffix: "€", label: t.stats.avgSaving, orange: true },
    { end: 84000, prefix: "€", suffix: "+", label: t.stats.totalSaved, display: "€84.000+", duration: 4000 },
    { end: 4.49, decimals: 2, suffix: "★", label: t.stats.rating, orange: true },
  ];

  return (
    <section ref={ref} style={{ background: "#0f2044", padding: "3rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }} className="stats-grid">
        {stats.map((stat, i) => <StatItem key={i} {...stat} active={active} index={i} />)}
      </div>
      <style>{`@media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr) !important}}`}</style>
    </section>
  );
}
