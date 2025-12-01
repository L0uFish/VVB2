"use client";

import type { BookingRow, Grouped, OpeningOverride } from "../types";
import { formatTime } from "../utils/grouping";

export function MonthView({
  monthDate,
  onPrev,
  onNext,
  grouped,
  overrides,
  onOverrideSelect,
}: {
  monthDate: Date;
  onPrev: () => void;
  onNext: () => void;
  grouped: Grouped[];
  overrides: Map<string, OpeningOverride[]>;
  onOverrideSelect?: (ov: OpeningOverride) => void;
}) {
  const monthLabel = monthDate.toLocaleString("nl-BE", { month: "long", year: "numeric" });
  const days = buildMonthGrid(monthDate, grouped);

  return (
    <div className="rounded-2xl border border-[#e8e0eb] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="rounded-full bg-white px-3 py-1 text-sm text-[#2f1126] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
        >
          ←
        </button>
        <p className="text-lg font-semibold capitalize text-[#2f1126]">{monthLabel}</p>
        <button
          onClick={onNext}
          className="rounded-full bg-white px-3 py-1 text-sm text-[#2f1126] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#6c5665]">
        {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="sm:min-h-[140px]" />;

          const isToday = day.isToday;
          const isPast = day.isPast;
          const hasFullBlock = (overrides.get(day.dateStr) ?? []).some(
            (o) => o.closed || (!o.open_time && !o.close_time)
          );
          const mobileBg = hasFullBlock ? "bg-[#fde8e8]" : "bg-[#fff9fd]";
          const borderClass = isToday ? "border-[#8a4c7d] ring-1 ring-[#8a4c7d]/40" : "border-[#f0e7f4]";
          const opacityClass = isPast && !isToday ? "opacity-60" : "opacity-100";

          return (
            <div
              key={idx}
              className={`rounded-xl ${borderClass} ${mobileBg} p-2 text-left text-xs text-[#2f1126] shadow-sm sm:min-h-[140px] ${opacityClass}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold">{day.day}</span>
                {day.items.length > 0 && (
                  <span className="mt-1 inline-flex w-fit rounded-full bg-[#2f1126] px-2 py-0.5 text-[9px] font-semibold text-white sm:ml-auto sm:mt-0 sm:hidden">
                    {day.items.length}
                  </span>
                )}
              </div>

              <div className="hidden space-y-2 pt-2 sm:block">
                {[...day.items]
                  .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
                  .map((b) => {
                  const first = (b.clients?.name ?? "Onbekend").split(" ")[0] || "Onbekend";
                  const isBlock = (b.notes ?? "").trim().length > 0;
                  const label = isBlock ? b.notes?.trim() ?? "Blok" : first;
                  return (
                    <div
                      key={b.id}
                      className="rounded-lg bg-white px-2 py-1 text-[11px] text-[#2f1126] shadow-[0_6px_16px_-14px_rgba(47,17,38,0.4)]"
                    >
                      <div className={`font-semibold ${isBlock ? "text-[#8a4c7d]" : "text-[#1f7a4d]"}`}>
                        {label}: {formatTime(b.starts_at)}
                      </div>
                    </div>
                  );
                })}

                {(overrides.get(day.dateStr) ?? []).map((o) => {
                  const label = o.note?.trim() || "Blok";
                  const time =
                    o.closed || (!o.open_time && !o.close_time)
                      ? "hele dag"
                      : `${(o.open_time ?? "").slice(0, 5)}${
                          o.close_time ? `-${o.close_time.slice(0, 5)}` : ""
                        }`;
                  return (
                    <div
                      key={o.id}
                      className="rounded-lg bg-white px-2 py-1 text-[11px] text-[#8a4c7d] shadow-[0_6px_16px_-14px_rgba(47,17,38,0.3)]"
                      onClick={() => onOverrideSelect?.(o)}
                    >
                      <div className="font-semibold">
                        {label}: {time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildMonthGrid(month: Date, grouped: Grouped[]) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const firstWeekday = (start.getDay() + 6) % 7; // Mon=0
  const daysInMonth = end.getDate();
  const todayStr = new Date().toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const cells: Array<{ day: number; dateStr: string; items: BookingRow[]; isToday: boolean; isPast: boolean } | null> =
    [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);

  const mapByDate = new Map<string, BookingRow[]>();
  grouped.forEach((g) => {
    mapByDate.set(g.date, g.items);
  });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(month.getFullYear(), month.getMonth(), d);
    const dateStr = dateObj.toLocaleDateString("nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    cells.push({
      day: d,
      dateStr,
      items: mapByDate.get(dateStr) ?? [],
      isToday: dateStr === todayStr,
      isPast: dateObj < new Date(todayStr.split("-").reverse().join("-")),
    });
  }

   return cells;
}
