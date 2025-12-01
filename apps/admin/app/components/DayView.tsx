"use client";

import type { Grouped, OpeningOverride } from "../types";
import { formatTime } from "../utils/grouping";
import { useMemo } from "react";

export function DayView({
  grouped,
  groupedPast,
  selectedDate,
  onDateChange,
  overrides,
  onOverrideSelect,
}: {
  grouped: Grouped[];
  groupedPast: Grouped[];
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  overrides: Map<string, OpeningOverride[]>;
  onOverrideSelect?: (ov: OpeningOverride) => void;
}) {
  const fallbackDate = grouped[0]?.date ?? groupedPast[0]?.date ?? "";
  const bookings =
    grouped.find((g) => g.date === selectedDate)?.items ??
    groupedPast.find((g) => g.date === selectedDate)?.items ??
    grouped[0]?.items ??
    [];

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-semibold text-[#2f1126]">Datum:</label>
        <select
          value={selectedDate ?? ""}
          onChange={(e) => onDateChange(e.target.value || null)}
          className="rounded-lg border border-[#e8e0eb] bg-white px-3 py-2 text-sm text-[#2f1126] shadow-sm"
        >
          {grouped.map((g) => (
            <option key={g.date} value={g.date}>
              {g.date}
            </option>
          ))}
          {groupedPast.map((g) => (
            <option key={g.date} value={g.date}>
              {g.date} (verleden)
            </option>
          ))}
        </select>
      </div>
      <DayAgenda
        dateLabel={selectedDate ?? fallbackDate}
        bookings={bookings}
        overrides={overrides}
        onOverrideSelect={onOverrideSelect}
      />
    </div>
  );
}

type DayEvent = {
  id: string;
  start: Date;
  end: Date;
  label: string;
  isBlock: boolean;
  isOverride: boolean;
  service?: string | null;
  phone?: string | null;
  sourceOverride?: OpeningOverride;
};

function parseDateLabel(label: string) {
  const [d, m, y] = label.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function DayAgenda({
  dateLabel,
  bookings,
  overrides,
  onOverrideSelect,
}: {
  dateLabel: string;
  bookings: Grouped["items"];
  overrides: Map<string, OpeningOverride[]>;
  onOverrideSelect?: (ov: OpeningOverride) => void;
}) {
  const slotHeight = 18; // px per 30 min
  const defaultStart = 7;
  const defaultEnd = 20;

  const events = useMemo<DayEvent[]>(() => {
    const baseDate = parseDateLabel(dateLabel);
    const ovs = overrides.get(dateLabel) ?? [];
    const normalized: DayEvent[] = [];

    bookings.forEach((b) => {
      const s = new Date(b.starts_at);
      const e = b.ends_at ? new Date(b.ends_at) : new Date(s.getTime() + 60 * 60000);
      const first = (b.clients?.name ?? "Onbekend").split(" ")[0] || "Onbekend";
      const isBlock = (b.notes ?? "").trim().length > 0;
      const label = isBlock ? b.notes?.trim() ?? "Blok" : first;
      normalized.push({
        id: b.id,
        start: s,
        end: e,
        label,
        isBlock,
        isOverride: false,
        service: b.services?.name ?? null,
        phone: b.clients?.phone ?? null,
      });
    });

    ovs.forEach((o) => {
      const parseMinutes = (val: string) => {
        const [hStr, mStr] = val.split(":");
        const h = Number(hStr) || 0;
        const m = Number(mStr) || 0;
        return h * 60 + m;
      };

      const startMinutes =
        o.closed || (!o.open_time && !o.close_time) ? 0 : parseMinutes((o.open_time ?? "00:00").slice(0, 5));
      const endMinutes =
        o.closed || (!o.open_time && !o.close_time) ? 24 * 60 : parseMinutes((o.close_time ?? "24:00").slice(0, 5));

      const s = new Date(baseDate);
      s.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
      const e = new Date(baseDate);
      e.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

      normalized.push({
        id: `ov-${o.id}`,
        start: s,
        end: e,
        label: o.note?.trim() || "Blok",
        isBlock: true,
        isOverride: true,
        service: null,
        phone: null,
        sourceOverride: o,
      });
    });

    return normalized.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [bookings, overrides, dateLabel]);

  const { startHour, endHour, height } = useMemo(() => {
    if (events.length === 0) {
      const totalMinutes = (defaultEnd - defaultStart) * 60;
      return { startHour: defaultStart, endHour: defaultEnd, height: (totalMinutes / 30) * slotHeight };
    }

    const mins = events.flatMap((ev) => {
      return [
        ev.start.getHours() * 60 + ev.start.getMinutes(),
        ev.end.getHours() * 60 + ev.end.getMinutes(),
      ];
    });
    const earliest = Math.min(...mins, defaultStart * 60);
    const latest = Math.max(...mins, defaultEnd * 60);
    const startHour = Math.max(0, Math.min(defaultStart, Math.floor(earliest / 60)));
    const endHour = Math.min(24, Math.max(defaultEnd, Math.ceil(latest / 60) + 1));
    const totalMinutes = (endHour - startHour) * 60;
    return { startHour, endHour, height: (totalMinutes / 30) * slotHeight };
  }, [events]);

  return (
    <div className="rounded-2xl border border-[#e8e0eb] bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-semibold text-[#2f1126]">{dateLabel}</p>
      <div className="relative mt-3 overflow-hidden rounded-xl bg-[#fff9fd]" style={{ height }}>
        {/* time labels */}
        <div className="absolute left-1 top-0 bottom-0 w-12 pr-2 text-right text-[11px] text-[#6c5665]">
          {Array.from({ length: endHour - startHour + 1 }).map((_, idx) => {
            const hh = startHour + idx;
            const top = ((hh * 60 - startHour * 60) / 30) * slotHeight;
            return (
              <div key={hh} className="absolute" style={{ top }}>
                {String(hh).padStart(2, "0")}:00
              </div>
            );
          })}
        </div>

        {/* grid */}
        {Array.from({ length: ((endHour - startHour) * 60) / 30 + 1 }).map((_, idx) => {
          const minutes = startHour * 60 + idx * 30;
          const isHour = minutes % 60 === 0;
          const top = (minutes - startHour * 60) / 30 * slotHeight;
          return (
            <div key={idx} className="absolute left-12 right-0" style={{ top }}>
              <div className={`h-px w-full ${isHour ? "bg-[#e0d4e2]" : "border-t border-dotted border-[#e6d7e0]"}`} />
            </div>
          );
        })}

        {events.map((ev) => {
          const startMinutes = Math.max(ev.start.getHours() * 60 + ev.start.getMinutes(), startHour * 60);
          const endMinutes = Math.min(ev.end.getHours() * 60 + ev.end.getMinutes(), endHour * 60);
          const top = ((startMinutes - startHour * 60) / 30) * slotHeight;
          const h = Math.max(((endMinutes - startMinutes) / 30) * slotHeight, slotHeight * 2);
          const labelClass = ev.isBlock ? "text-[#f5d7e3]" : "text-[#f5d7e3]";

          return (
            <div
              key={ev.id}
              className={`absolute left-14 right-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs shadow-lg sm:left-16 sm:right-6 sm:px-4 ${
                ev.isBlock ? "bg-[#581c3a] text-white" : "bg-[#16311b] text-white"
              }`}
              style={{ top, height: h }}
              onClick={() => {
                if (ev.isOverride && ev.sourceOverride && onOverrideSelect) onOverrideSelect(ev.sourceOverride);
              }}
            >
              <div className="flex flex-col gap-0.5">
                <p className={`font-semibold text-sm leading-tight ${labelClass}`}>
                  {ev.label}: {formatTime(ev.start.toISOString())} - {formatTime(ev.end.toISOString())}
                </p>
              </div>
              {!ev.isBlock && (
                <>
                  <div className="h-8 w-px self-center bg-white/30" />
                  <div className="text-[11px] text-[#f5d7e3]">
                    <p>{ev.service ?? "Service"}</p>
                  </div>
                  <div className="h-8 w-px self-center bg-white/30" />
                  <div className="text-[11px] text-[#f5d7e3]">
                    <p>{ev.phone ?? "Geen telefoon"}</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
