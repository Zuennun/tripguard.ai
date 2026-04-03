const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const db = createClient(
  (process.env.SUPABASE_URL || "").trim(),
  process.env.SUPABASE_SECRET_KEY
);

const hotels = [
  ["Hotel Adlon Kempinski", "Berlin", "Germany", "EUR"],
  ["Fairmont Vancouver", "Vancouver", "Canada", "USD"],
  ["Gavião Nature Village", "Gaviao", "Portugal", "EUR"],
  ["Park Plaza Westminster Bridge", "London", "United Kingdom", "GBP"],
  ["citizenM Paris Gare de Lyon", "Paris", "France", "EUR"],
  ["NH Collection Amsterdam Barbizon Palace", "Amsterdam", "Netherlands", "EUR"],
  ["Hotel Regina Barcelona", "Barcelona", "Spain", "EUR"],
  ["Ruby Marie Hotel", "Vienna", "Austria", "EUR"],
  ["25hours Hotel Piazza San Paolino", "Florence", "Italy", "EUR"],
  ["H10 Madison", "Barcelona", "Spain", "EUR"],
  ["Baur au Lac", "Zurich", "Switzerland", "CHF"],
  ["The Hoxton Rome", "Rome", "Italy", "EUR"],
  ["Maxx Royal Bodrum Resort", "Bodrum", "Turkey", "EUR"],
  ["Rove Downtown", "Dubai", "United Arab Emirates", "AED"],
  ["M Social Hotel Times Square", "New York", "United States", "USD"],
];

const roomTypes = [
  "Deluxe Room",
  "Junior Suite",
  "Superior Double Room",
  "Classic Room",
  "Executive Room",
  "Family Room",
];

const mealPlans = ["room_only", "breakfast", "half_board", ""];
const originCountries = ["DE", "AT", "CH", "NL", "US", "GB", "AE", "CA", "FR", "SE"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function futureDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().slice(0, 10);
}

function buildBooking(index, hotel) {
  const [hotelName, city, country, currency] = hotel;
  const checkinOffset = randomInt(14, 170);
  const nights = randomInt(2, 6);
  const checkin = futureDate(checkinOffset);
  const checkout = futureDate(checkinOffset + nights);
  const rooms = randomInt(1, 2);
  const adults = randomInt(1, 3);
  const children = rooms === 2 ? randomInt(0, 2) : randomInt(0, 1);
  const price = randomInt(180, 1800);
  const locale = randomFrom(["de", "en"]);

  return {
    email: `zunnun2310+seed${Date.now()}${index}@gmail.com`,
    hotel_name: hotelName,
    city,
    country,
    room_type: randomFrom(roomTypes),
    rooms,
    adults,
    children,
    meal_plan: randomFrom(mealPlans) || null,
    checkin_date: checkin,
    checkout_date: checkout,
    price,
    currency,
    origin_country: randomFrom(originCountries),
    status: "active",
    locale,
    booking_com_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function ensureManageToken(bookingId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await db.from("booking_tokens").insert({
    booking_id: bookingId,
    token,
    purpose: "manage",
    expires_at: expiresAt,
  });
}

async function main() {
  const payload = hotels.map((hotel, index) => buildBooking(index + 1, hotel));
  const { data, error } = await db.from("bookings").insert(payload).select("id,hotel_name");
  if (error) throw error;

  for (const booking of data || []) {
    await ensureManageToken(booking.id);
  }

  console.log(JSON.stringify({
    inserted: (data || []).length,
    hotels: (data || []).map((b) => b.hotel_name),
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
