"use client";
import { useState } from "react";
import { type Translations } from "@/lib/translations";

interface MarkerCard {
  region: string;
  saved: string;
  img: string;
  top: string;
  left: string;
  anim: string;
}

const markers: MarkerCard[] = [
  { region: "USA", saved: "saved €187", img: "/usa.svg", top: "26%", left: "25%", anim: "float1" },
  { region: "Latin America", saved: "saved €134", img: "/lateinamerika.svg", top: "49%", left: "34%", anim: "float2" },
  { region: "Europe", saved: "saved €142", img: "/europa.svg", top: "27%", left: "52%", anim: "float3" },
  { region: "Africa", saved: "saved €112", img: "/afrika.svg", top: "48%", left: "53%", anim: "float4" },
  { region: "Asia", saved: "saved €219", img: "/asia.svg", top: "30%", left: "75%", anim: "float5" },
  { region: "Australia", saved: "saved €121", img: "/australien.svg", top: "56%", left: "82%", anim: "float6" },
];

export default function GlobalCoverage({ t }: { t: Translations }) {
  const [hotelName, setHotelName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [roomType, setRoomType] = useState("");
  const [rooms, setRooms] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [mealPlan, setMealPlan] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const inputStyle = {
    width: "100%", border: "1px solid #e5e7eb",
    borderRadius: 10, padding: "0.65rem 1rem",
    fontFamily: "var(--font-body)", fontSize: "0.875rem",
    color: "#111827", outline: "none",
    transition: "border-color 0.15s", boxSizing: "border-box" as const,
    background: "#ffffff",
  };
  const labelStyle = {
    fontFamily: "var(--font-body)", fontSize: "0.78rem",
    fontWeight: 600, color: "#374151",
    display: "block", marginBottom: "0.3rem",
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hotelName.trim()) { setError(t.form.errorHotel); return; }
    if (!city.trim()) { setError(t.form.errorCity); return; }
    if (!checkin) { setError(t.form.errorCheckin); return; }
    if (!checkout) { setError(t.form.errorCheckout); return; }
    if (checkin >= checkout) { setError(t.form.errorDates); return; }
    if (!email.includes("@")) { setError(t.form.errorEmail); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelName, city, country, roomType, rooms, adults, children,
          mealPlan, checkin, checkout, price, currency, email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="track-hotels" className="coverage-section" style={{ background: "#ffffff", padding: "6rem 1.5rem", scrollMarginTop: "80px" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: "0.78rem",
            fontWeight: 700, color: "#f97316",
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "1rem",
          }}>
            {t.form.eyebrow}
          </div>
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 900,
            fontSize: "clamp(2rem, 3.5vw, 3rem)",
            color: "#0f2044", lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
            {t.form.headline}<br />
            <span style={{ color: "#f97316" }}>{t.form.headlineSub}</span>
          </h2>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: "grid", gridTemplateColumns: "3fr 2fr",
          gap: "3rem", alignItems: "center",
        }} className="coverage-grid">

          {/* LEFT — Map with floating markers */}
          <div style={{ position: "relative" }}>
            <img
              src="/weltkarte.png"
              alt="World map"
              style={{ width: "100%", display: "block", opacity: 0.9 }}
            />

            {markers.map(m => (
              <div
                key={m.region}
                className="map-marker"
                style={{
                  position: "absolute",
                  top: m.top, left: m.left,
                  animation: `${m.anim} 4s ease-in-out infinite`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                }}
              >
                <div className="map-marker-inner" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  {/* Photo circle */}
                  <div style={{
                    width: 64, height: 64,
                    borderRadius: "50%",
                    overflow: "hidden",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    border: "3px solid #ffffff",
                    flexShrink: 0,
                  }}>
                    <img src={m.img} alt={m.region}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  {/* Label */}
                  <div style={{
                    background: "#ffffff",
                    borderRadius: 20, padding: "2px 10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    textAlign: "center",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-body)", fontWeight: 700,
                      fontSize: "0.72rem", color: "#0f2044",
                    }}>{m.region}</div>
                    <div style={{
                      fontFamily: "var(--font-body)", fontSize: "0.65rem",
                      color: "#059669", fontWeight: 600,
                    }}>{m.saved}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Form card */}
          <div style={{
            background: "#ffffff",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
            borderRadius: 24, padding: "2.5rem",
            maxWidth: 480, width: "100%",
            position: "relative", overflow: "hidden",
          }}>
            {/* Corner ribbon */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 110, height: 110,
              overflow: "hidden",
              borderRadius: "0 24px 0 0",
              pointerEvents: "none",
            }}>
              <div style={{
                position: "absolute",
                top: 26, right: -30,
                width: 150,
                background: "#0f2044",
                color: "#ffffff",
                fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 900,
                padding: "9px 0",
                transform: "rotate(45deg)",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
                {t.form.ribbon}
              </div>
            </div>
            <div style={{
              fontFamily: "var(--font-body)", fontSize: "0.75rem",
              fontWeight: 700, color: "#f97316",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: "0.75rem",
            }}>
              {t.form.formEyebrow}
            </div>
            <h3 style={{
              fontFamily: "var(--font-head)", fontWeight: 800,
              fontSize: "1.5rem", color: "#0f2044",
              lineHeight: 1.2, marginBottom: "0.75rem",
            }}>
              {t.form.formHeadline}<br /><span style={{ color: "#f97316" }}>{t.form.formHeadlineSub}</span>
            </h3>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
              color: "#6b7280", lineHeight: 1.65, marginBottom: "1.75rem",
            }}>
              {t.form.formSub}
            </p>

            {submitted ? (
              <div style={{
                background: "#ecfdf5", border: "1px solid rgba(5,150,105,0.3)",
                borderRadius: 12, padding: "1.5rem",
                textAlign: "center", color: "#059669",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
              }}>
                {t.form.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

                {/* Hotel Name */}
                <div>
                  <label style={labelStyle}>{t.form.hotelName} <span style={{ color: "#f97316" }}>*</span></label>
                  <input type="text" placeholder={t.form.hotelPlaceholder} value={hotelName}
                    onChange={e => setHotelName(e.target.value)} style={inputStyle} required
                    onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                </div>

                {/* City + Country */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                  <div>
                    <label style={labelStyle}>{t.form.city} <span style={{ color: "#f97316" }}>*</span></label>
                    <input type="text" placeholder={t.form.cityPlaceholder} value={city}
                      onChange={e => setCity(e.target.value)} style={inputStyle} required
                      onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t.form.country}</label>
                    <input type="text" placeholder={t.form.countryPlaceholder} value={country}
                      onChange={e => setCountry(e.target.value)} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>

                {/* Room Type */}
                <div>
                  <label style={labelStyle}>{t.form.roomType} <span style={{ color: "#9ca3af", fontWeight: 400 }}>{t.form.roomTypeNote}</span></label>
                  <input type="text" placeholder={t.form.roomTypePlaceholder} value={roomType}
                    onChange={e => setRoomType(e.target.value)} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                </div>

                {/* Rooms / Adults / Children */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem" }}>
                  {[
                    { label: t.form.rooms, ph: "1", val: rooms, set: setRooms },
                    { label: t.form.adults, ph: "2", val: adults, set: setAdults },
                    { label: t.form.children, ph: "0", val: children, set: setChildren },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="number" placeholder={f.ph} value={f.val} min="0"
                        onChange={e => f.set(e.target.value)} style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                        onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                    </div>
                  ))}
                </div>

                {/* Meal Plan */}
                <div>
                  <label style={labelStyle}>{t.form.mealPlan}</label>
                  <select value={mealPlan} onChange={e => setMealPlan(e.target.value)}
                    style={{ ...inputStyle, appearance: "none" as const }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}>
                    <option value="">{t.form.mealPlanPlaceholder}</option>
                    <option value="room_only">{t.form.mealOptions.roomOnly}</option>
                    <option value="breakfast">{t.form.mealOptions.breakfast}</option>
                    <option value="half_board">{t.form.mealOptions.halfBoard}</option>
                    <option value="full_board">{t.form.mealOptions.fullBoard}</option>
                    <option value="all_inclusive">{t.form.mealOptions.allInclusive}</option>
                  </select>
                </div>

                {/* Check-in / Check-out */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                  <div>
                    <label style={labelStyle}>{t.form.checkin} <span style={{ color: "#f97316" }}>*</span></label>
                    <input type="date" value={checkin} min={today}
                      onChange={e => setCheckin(e.target.value)} style={inputStyle} required
                      onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t.form.checkout} <span style={{ color: "#f97316" }}>*</span></label>
                    <input type="date" value={checkout} min={checkin || today}
                      onChange={e => setCheckout(e.target.value)} style={inputStyle} required
                      onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                </div>

                {/* Price + Currency */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.65rem" }}>
                  <div>
                    <label style={labelStyle}>{t.form.price}</label>
                    <input type="number" placeholder={t.form.pricePlaceholder} value={price}
                      onChange={e => setPrice(e.target.value)} style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t.form.currency}</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)}
                      style={{ ...inputStyle, appearance: "none" as const }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                      onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}>
                      <option>EUR</option>
                      <option>USD</option>
                      <option>GBP</option>
                      <option>CHF</option>
                      <option>AED</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>{t.form.email} <span style={{ color: "#f97316" }}>*</span></label>
                  <input type="email" placeholder={t.form.emailPlaceholder} value={email} required
                    onChange={e => setEmail(e.target.value)} style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "#f97316")}
                    onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
                </div>

                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: 10, padding: "0.75rem 1rem",
                    fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#ef4444",
                  }}>{error}</div>
                )}
                <button type="submit" disabled={loading} style={{
                  width: "100%", background: loading ? "#fdba74" : "#f97316", color: "#ffffff",
                  border: "none", padding: "1rem",
                  borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-head)", fontSize: "1rem", fontWeight: 700,
                  boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                  transition: "background 0.15s", marginTop: "0.25rem",
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#ea6c0a"; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#f97316"; }}
                >
                  {loading ? t.form.saving : t.form.cta}
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                  <div style={{ display: "flex" }}>
                    {[
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&q=80",
                      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=48&q=80",
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=48&q=80",
                      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=48&q=80",
                    ].map((src, i) => (
                      <img key={i} src={src} alt="" style={{
                        width: 32, height: 32, borderRadius: "50%",
                        border: "2px solid #ffffff", objectFit: "cover",
                        marginLeft: i === 0 ? 0 : -8,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#6b7280" }}>
                    <strong style={{ color: "#0f2044" }}>1.385+</strong> {t.form.tracked.split("+")[1]?.trim() ?? t.form.tracked}
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float1 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-8px); } }
        @keyframes float2 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-10px); } }
        @keyframes float3 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-6px); } }
        @keyframes float4 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-9px); } }
        @keyframes float5 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-7px); } }
        @keyframes float6 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-11px); } }
        @media (max-width: 1024px) {
          .coverage-grid { grid-template-columns: 1fr !important; }
          .coverage-form { max-width: 100% !important; }
        }
        @media (max-width: 640px) {
          .coverage-section { padding: 4rem 1.25rem !important; }
          .map-marker-inner { zoom: 0.6; }
        }
      `}</style>
    </section>
  );
}
