"use server";

import { BookingsList } from "./components/BookingsList";
import { Sidebar } from "./components/Sidebar";
import { getSupabaseServerClient } from "../lib/supabase-server";

export default async function AdminPage() {
  const supabase = getSupabaseServerClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, starts_at, ends_at, status, notes, services(name), clients(name, phone)")
    .order("starts_at", { ascending: true })
    .limit(200);
  const { data: overrides } = await supabase
    .from("opening_hours_overrides")
    .select("id, date, open_time, close_time, closed, note");

  const all = bookings ?? [];
  const now = Date.now();
  const future = all.filter((b) => new Date(b.starts_at).getTime() >= now);
  const past = all.filter((b) => new Date(b.starts_at).getTime() < now);

  return (
    <div className="flex min-h-screen bg-[#f7f1f6] text-[#0f0a10]">
      <Sidebar active="bookings" />
      <main className="flex-1 px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8a4c7d]">Admin</p>
              <h1 className="font-[var(--font-display)] text-3xl text-[#2f1126] sm:text-4xl">Boekingen</h1>
              <p className="text-sm text-[#4c3b49]">Lijstweergave op basis van Supabase bookings.</p>
            </div>
          </div>

          <BookingsList future={future} past={past} overrides={overrides ?? []} />
        </div>
      </main>
    </div>
  );
}
