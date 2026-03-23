"use client";
import { useEffect, useRef, useState } from "react";

interface StatConfig {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  display?: string;
  label: string;
  orange?: boolean;
  duration?: number;
}

const STATS: StatConfig[] = [
  { end: 1385, suffix: "+", label: "Bookings Tracked", display: "1.385+", duration: 3500 },
  { end: 189, prefix: "~", suffix: "€", label: "Avg. Saving/Booking", orange: true },
  { end: 84000, prefix: "€", suffix: "+", label: "Total Saved", display: "€84.000+", duration: 4000 },
  { end: 4.49, decimals: 2, suffix: "★", label: "User Rating", orange: true },
];

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
  }, [active, end, decimals]);
  return value;
}

function StatItem({ stat, active, index }: { stat: StatConfig; active: boolean; index: number }) {
  const raw = useCountUp(stat.end, stat.decimals ?? 0, active, stat.duration);

  let displayed: string;
  if (stat.display && !active) {
    displayed = "0";
  } else if (stat.display && active) {
    // Use the display string once animation completes, otherwise animate
    const intVal = Math.round(raw);
    displayed = (stat.prefix ?? "") + intVal.toLocaleString("de-DE") + (stat.suffix ?? "");
  } else if (stat.decimals) {
    displayed = (stat.prefix ?? "") + raw.toFixed(stat.decimals) + (stat.suffix ?? "");
  } else {
    displayed = (stat.prefix ?? "") + Math.round(raw).toLocaleString("de-DE") + (stat.suffix ?? "");
  }

  const isLast = index === 3;

  return (
    <div style={{
      display: "flex", alignItems: "stretch",
    }}>
      <div style={{
        flex: 1, textAlign: "center",
        padding: "1rem 1.5rem",
      }}>
        <div style={{
          fontFamily: "var(--font-head)", fontWeight: 800,
          fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
          color: stat.orange ? "#f97316" : "#ffffff",
          letterSpacing: "-0.02em", lineHeight: 1.1,
          marginBottom: "0.5rem",
        }}>
          {displayed}
        </div>
        <div style={{
          fontFamily: "var(--font-body)", fontSize: "0.82rem",
          color: "rgba(255,255,255,0.55)", fontWeight: 500,
        }}>
          {stat.label}
        </div>
      </div>
      {!isLast && (
        <div style={{
          width: 1, background: "rgba(255,255,255,0.12)",
          alignSelf: "stretch", flexShrink: 0,
        }} />
      )}
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: "#0f2044",
      padding: "3rem 2rem",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      }} className="stats-grid">
        {STATS.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} active={active} index={i} />
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
