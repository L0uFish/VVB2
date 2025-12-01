"use client";

import type { Grouped, OpeningOverride } from "../types";
import { formatTime } from "../utils/grouping";

type Row = {
  id: string;
  label: string;
  isBlock: boolean;
  isOverride: boolean;
  timeLabel: string;
  service?: string | null;
  phone?: string | null;
  startMs: number;
  sourceOverride?: OpeningOverride;
};

export function ListView({
  grouped,
  groupedPast,
  overrides,
  onOverrideSelect,
}: {
  grouped: Grouped[];
  groupedPast: Grouped[];
  overrides: Map<string, OpeningOverride[]>;
  onOverrideSelect?: (ov: OpeningOverride) => void;
}) {
  return (
    <div className="mt-5 space-y-6">
      <p className="text-xs text-[#4c3b49]">
        Toekomstige boekingen ({grouped.reduce((acc, g) => acc + g.items.length, 0)})
      </p>
      {grouped.length === 0 && <p className="text-sm text-[#4c3b49]">Geen boekingen gevonden.</p>}
      {grouped.map(({ date, items }) => (
        <DayCard key={date} date={date} items={items} overrides={overrides} onOverrideSelect={onOverrideSelect} />
      ))}

      <div className="mt-4 flex items-center justify-between border-t border-[#e8e0eb] pt-3">
        <p className="text-sm font-semibold text-[#2f1126]">Verleden</p>
      </div>
      {groupedPast.length === 0 && <p className="text-sm text-[#4c3b49]">Geen vorige boekingen.</p>}
      {groupedPast.map(({ date, items }) => (
        <DayCard key={date} date={date} items={items} overrides={overrides} muted onOverrideSelect={onOverrideSelect} />
      ))}
    </div>
  );
}

function DayCard({
  date,
  items,
  overrides,
  muted,
}: {
  date: string;
  items: Grouped["items"];
  overrides: Map<string, OpeningOverride[]>;
  onOverrideSelect?: (ov: OpeningOverride) => void;
  muted?: boolean;
}) {
  const cardClass = muted ? "bg-white" : "bg-[#fff9fd]";
  const rows: Row[] = buildRows(date, items, overrides);

  return (
    <div className={`rounded-2xl border border-[#e8e0eb] ${cardClass} p-4 shadow-sm sm:p-5`}>
      <p className="text-xs uppercase tracking-[0.2em] text-[#8a4c7d]">{date}</p>
      <div className="mt-3 space-y-3">
        {rows.map((row) => {
          const labelClass = row.isBlock ? "text-[#8a4c7d]" : "text-[#1f7a4d]";
          return (
            <div
              key={row.id}
              className={`flex flex-col gap-1 rounded-xl px-3 py-2 text-sm text-[#2f1126] sm:flex-row sm:items-center sm:justify-between ${
                muted
                  ? "bg-[#fff9fd] ring-1 ring-[#e8e0eb]"
                  : "bg-white shadow-[0_10px_24px_-18px_rgba(47,17,38,0.35)]"
              }`}
              onClick={() => {
                if (row.isOverride && row.sourceOverride && onOverrideSelect) onOverrideSelect(row.sourceOverride);
              }}
            >
              <div>
                <p className={`font-semibold ${labelClass}`}>
                  {row.label}: {row.timeLabel}
                </p>
                {!row.isBlock && (
                  <p className="text-xs text-[#4c3b49]">
                    {row.service ?? "Service"} • {row.phone ?? "Geen telefoon"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseDateLabel(label: string) {
  const [d, m, y] = label.split("/").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function buildRows(date: string, items: Grouped["items"], overrides: Map<string, OpeningOverride[]>) {
  const baseDate = parseDateLabel(date);
  const rows: Row[] = [];

  items.forEach((b) => {
    const first = (b.clients?.name ?? "Onbekend").split(" ")[0] || "Onbekend";
    const isBlock = (b.notes ?? "").trim().length > 0;
    const label = isBlock ? b.notes?.trim() ?? "Blok" : first;
    const start = new Date(b.starts_at);
    rows.push({
      id: b.id,
      label,
      isBlock,
      isOverride: false,
      timeLabel: formatTime(b.starts_at),
      service: b.services?.name ?? null,
      phone: b.clients?.phone ?? null,
      startMs: start.getTime(),
    });
  });

  (overrides.get(date) ?? []).forEach((o) => {
    const parseMinutes = (val: string) => {
      const [hStr, mStr] = val.split(":");
      const h = Number(hStr) || 0;
      const m = Number(mStr) || 0;
      return h * 60 + m;
    };
    const startMinutes =
      o.closed || (!o.open_time && !o.close_time) ? 0 : parseMinutes((o.open_time ?? "00:00").slice(0, 5));
    const s = new Date(baseDate);
    s.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const timeLabel =
      o.closed || (!o.open_time && !o.close_time)
        ? "hele dag"
        : `${(o.open_time ?? "").slice(0, 5)} - ${(o.close_time ?? "").slice(0, 5)}`;

    rows.push({
      id: `ov-${o.id}`,
      label: o.note?.trim() || "Blok",
      isBlock: true,
      isOverride: true,
      timeLabel,
      service: null,
      phone: null,
      startMs: s.getTime(),
      sourceOverride: o,
    });
  });

  return rows.sort((a, b) => a.startMs - b.startMs);
}
