import { addMinutes } from "date-fns";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase-server";

type BookingRow = {
  starts_at: string;
  ends_at: string;
  status: string;
};

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const dateParam = searchParams.get("date"); // YYYY-MM-DD
  const limit = Number(searchParams.get("limit") ?? 6);

  // find first available within 7 days if no date provided
  const startDate = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();

  try {
    // fetch service
    const { data: service } = await supabase
      .from("services")
      .select(
        "id, duration_min, buffer_min, name, price, promo_price, active"
      )
      .eq("id", serviceId ?? "")
      .maybeSingle();

    // if no service provided or not found, pick first active
    let chosen = service;
    if (!chosen) {
      const { data: first } = await supabase
        .from("services")
        .select("id, duration_min, buffer_min, name, price, promo_price, active")
        .eq("active", true)
        .order("sort_order", { ascending: true, nullsFirst: true })
        .limit(1)
        .maybeSingle();
      chosen = first ?? null;
    }
    if (!chosen) {
      return NextResponse.json({ slots: [], nextAvailable: null, reason: "Geen services" });
    }

    const searchDays = 7;
    for (let dayOffset = 0; dayOffset < searchDays; dayOffset++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().slice(0, 10);
      const slots = await computeSlotsForDate(supabase, chosen, dateStr);
      if (slots.length > 0) {
        const filteredSlots =
          dayOffset === 0
            ? slots.filter((s) => new Date(s) > new Date())
            : slots;
        const nextSlot = filteredSlots[0] ?? null;
        if (!dateParam) {
          // no explicit date: return first available across range
          return NextResponse.json({
            slots: filteredSlots.slice(0, limit),
            nextAvailable: nextSlot,
            date: dateStr,
          });
        }
        if (dateParam === dateStr) {
          return NextResponse.json({
            slots: filteredSlots,
            nextAvailable: nextSlot,
            date: dateStr,
          });
        }
      }
      if (dateParam === dateStr) {
        // date requested but no slots that day
        return NextResponse.json({ slots: [], nextAvailable: null, date: dateStr });
      }
    }

    return NextResponse.json({ slots: [], nextAvailable: null, reason: "Geen beschikbaarheid" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ slots: [], nextAvailable: null, error: "internal" }, { status: 500 });
  }
}

async function computeSlotsForDate(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  service: { id: string; duration_min: number; buffer_min: number },
  dateStr: string
): Promise<string[]> {
  const weekday = new Date(dateStr).getDay(); // 0=Sunday, 1=Monday...

  const { data: defaultHour } = await supabase
    .from("opening_hours_default")
    .select("weekday, open_time, close_time, closed")
    .eq("weekday", weekday)
    .maybeSingle();

  const { data: override } = await supabase
    .from("opening_hours_overrides")
    .select("date, open_time, close_time, closed")
    .eq("date", dateStr)
    .maybeSingle();

  if (override?.closed) return [];

  if (override?.closed) return [];
  if (defaultHour?.closed) return [];

  const openTime = override?.open_time ?? defaultHour?.open_time;
  const closeTime = override?.close_time ?? defaultHour?.close_time;

  if (!openTime || !closeTime) return [];

  const dayStart = new Date(`${dateStr}T${openTime}`);
  const dayEnd = new Date(`${dateStr}T${closeTime}`);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("starts_at, ends_at, status")
    .gte("starts_at", dayStart.toISOString())
    .lt("starts_at", addMinutes(dayEnd, 1).toISOString())
    .in("status", ["confirmed"]);

  const slots: string[] = [];
  const stepMinutes = 30;
  const duration = service.duration_min + service.buffer_min;

  for (let cursor = new Date(dayStart); addMinutes(cursor, duration) <= dayEnd; cursor = addMinutes(cursor, stepMinutes)) {
    const end = addMinutes(cursor, duration);
    const overlaps = (bookings ?? []).some((b: BookingRow) => {
      const bStart = new Date(b.starts_at);
      const bEnd = new Date(b.ends_at);
      return cursor < bEnd && end > bStart;
    });
    if (!overlaps) {
      slots.push(cursor.toISOString());
    }
  }
  return slots;
}
