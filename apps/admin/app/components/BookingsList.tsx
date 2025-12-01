"use client";

import { useState } from "react";
import { DayView } from "./DayView";
import { ListView } from "./ListView";
import { MonthView } from "./MonthView";
import { groupByDate } from "../utils/grouping";
import type { BookingRow, OpeningOverride } from "../types";
import { OverrideModal } from "./OverrideModal";

export function BookingsList({
  future,
  past,
  overrides,
}: {
  future: BookingRow[];
  past: BookingRow[];
  overrides: OpeningOverride[];
}) {
  const grouped = groupByDate(future);
  const groupedPast = groupByDate(past);
  const allGrouped = groupByDate([...future, ...past]);
  const overridesByDate = buildOverrideMap(overrides);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<OpeningOverride | null>(null);
  const [activeView, setActiveView] = useState<"lijst" | "dag" | "maand">("lijst");
  const [selectedDate, setSelectedDate] = useState<string | null>(grouped[0]?.date ?? groupedPast[0]?.date ?? null);
  const [monthCursor, setMonthCursor] = useState<Date>(
    grouped[0]?.items?.[0] ? new Date(grouped[0].items[0].starts_at) : new Date()
  );

  return (
    <div className="rounded-3xl border border-[#e8e0eb] bg-white/90 p-4 text-[#2f1126] shadow-[0_18px_45px_-32px_rgba(47,17,38,0.28)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e8e0eb] pb-3">
        {(["lijst", "dag", "maand"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`rounded-full px-3 py-1 text-sm font-semibold capitalize transition ${
              activeView === v ? "bg-[#2f1126] text-white shadow-sm" : "bg-white text-[#2f1126] ring-1 ring-[#e8e0eb]"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {activeView === "lijst" && (
        <ListView
          grouped={grouped}
          groupedPast={groupedPast}
          overrides={overridesByDate}
          onOverrideSelect={(ov) => {
            setSelectedOverride(ov);
            setOverrideModalOpen(true);
          }}
        />
      )}

      {activeView === "dag" && (
        <DayView
          grouped={grouped}
          groupedPast={groupedPast}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          overrides={overridesByDate}
          onOverrideSelect={(ov) => {
            setSelectedOverride(ov);
            setOverrideModalOpen(true);
          }}
        />
      )}

      {activeView === "maand" && (
        <MonthView
          monthDate={monthCursor}
          onPrev={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          onNext={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          grouped={allGrouped}
          overrides={overridesByDate}
          onOverrideSelect={(ov) => {
            setSelectedOverride(ov);
            setOverrideModalOpen(true);
          }}
        />
      )}

      <OverrideModal
        open={overrideModalOpen}
        overrides={overrides}
        selectedOverride={selectedOverride}
        onClose={() => {
          setOverrideModalOpen(false);
          setSelectedOverride(null);
        }}
      />
    </div>
  );
}

function buildOverrideMap(overrides: OpeningOverride[]) {
  const map = new Map<string, OpeningOverride[]>();
  overrides.forEach((o) => {
    const dateStr = new Date(o.date).toLocaleDateString("nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!map.has(dateStr)) map.set(dateStr, []);
    map.get(dateStr)!.push(o);
  });
  return map;
}
