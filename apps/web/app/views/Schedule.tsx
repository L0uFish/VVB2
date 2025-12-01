import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "../types";

type Props = {
  selectedService: Service | null;
  selectedDate: string;
  slots: string[];
  loading?: boolean;
  selectedSlot: string;
  onDateChange: (date: string) => void;
  onSelectSlot: (slot: string) => void;
  bookingMessage?: string;
  bookingError?: string;
  bookingLoading?: boolean;
  onBack: () => void;
  onBook: () => void;
};

export function Schedule({
  selectedService,
  selectedDate,
  slots,
  loading = false,
  selectedSlot,
  onSelectSlot,
  bookingMessage,
  bookingError,
  bookingLoading = false,
  onDateChange,
  onBack,
  onBook,
}: Props) {
  const initialMonth = useMemo(
    () => (selectedDate ? new Date(selectedDate) : new Date()),
    [selectedDate]
  );
  const [monthCursor, setMonthCursor] = useState<Date>(initialMonth);
  const [dayAvailability, setDayAvailability] = useState<Record<string, boolean>>({});
  const [fetchedMonths, setFetchedMonths] = useState<Set<string>>(new Set());
  const [loadingMonth, setLoadingMonth] = useState(false);

  const monthLabel = monthCursor.toLocaleString("nl-BE", { month: "long", year: "numeric" });
  const days = buildCalendar(monthCursor);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const formatSlot = (iso: string) =>
    new Date(iso).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });

  const handleSelectDay = (dateStr: string) => {
    onDateChange(dateStr);
  };

  useEffect(() => {
    if (!selectedService) return;
    const year = monthCursor.getFullYear();
    const monthIndex = monthCursor.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const maxRangeDays = 90;
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    if (fetchedMonths.has(monthKey)) return;
    const fetchDays = async () => {
      const updates: Record<string, boolean> = {};
      const tasks: Promise<void>[] = [];
      setLoadingMonth(true);
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dateObj = new Date(dateStr);
        if (dateObj < today) {
          updates[dateStr] = false;
          continue;
        }
        const diffDays = Math.floor((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > maxRangeDays) continue;
        if (dayAvailability[dateStr] !== undefined) continue;
        tasks.push(
          fetch(`/api/availability?serviceId=${selectedService.id}&date=${dateStr}`)
            .then((res) => res.json())
            .then((data) => {
              updates[dateStr] = (data.slots ?? []).length > 0;
            })
            .catch(() => {
              updates[dateStr] = false;
            })
        );
      }
      await Promise.all(tasks);
      if (Object.keys(updates).length > 0) {
        setDayAvailability((prev) => ({ ...prev, ...updates }));
        setFetchedMonths((prev) => new Set(prev).add(monthKey));
      }
      setLoadingMonth(false);
    };
    fetchDays();
  }, [monthCursor, selectedService, today, dayAvailability, fetchedMonths]);

  return (
    <motion.div
      key="schedule"
      className="flex h-full flex-col items-center justify-center gap-6 px-4 py-8 text-center sm:px-10 sm:py-10"
      onWheelCapture={(e) => e.preventDefault()}
    >
      <motion.h3
        className="font-[var(--font-display)] text-4xl leading-[1.04] text-[#2f1126] sm:text-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        Kies een moment
      </motion.h3>
      <motion.p
        className="max-w-2xl text-base text-[#3f2635]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      >
        {selectedService ? selectedService.name : "Selecteer een service"} — kies een datum en zie mogelijke
        tijden.
      </motion.p>

      <div className="w-full max-w-5xl space-y-6 rounded-3xl bg-white/75 p-6 text-left text-[#2f1126] shadow-[0_18px_45px_-30px_rgba(47,17,38,0.32)] backdrop-blur-sm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#2f1126]">Datum</h4>
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="rounded-full bg-white px-3 py-1 text-[#2f1126] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
                  onClick={() =>
                    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                  }
                >
                  ←
                </button>
                <button
                  className="rounded-full bg-white px-3 py-1 text-[#2f1126] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
                  onClick={() =>
                    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                  }
                >
                  →
                </button>
              </div>
            </div>
            <p className="text-lg font-semibold capitalize text-[#2f1126]">{monthLabel}</p>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#2f1126]">
              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="relative">
              <div className={`grid grid-cols-7 gap-2 text-center ${loadingMonth ? "opacity-60" : ""}`}>
                {days.map((day, idx) => {
                  if (!day) return <span key={idx} />;
                  const dateObj = new Date(day.dateStr);
                  const disabled =
                    dateObj < today || dayAvailability[day.dateStr] === false;
                  const isSelected = selectedDate === day.dateStr;
                  return (
                    <button
                      key={idx}
                      onClick={() => !disabled && handleSelectDay(day.dateStr)}
                      disabled={disabled}
                      className={`aspect-square rounded-xl text-sm transition ${
                        disabled
                          ? "bg-[#f0e7f4] text-[#2f1126]/40 "
                          : isSelected
                          ? "bg-[#2f1126] text-white shadow-[0_12px_26px_-16px_rgba(47,17,38,0.35)]"
                          : "bg-white text-[#2f1126] ring-1 ring-[#e8e0eb] hover:-translate-y-0.5 hover:ring-[#b35a8c]"
                      }`}
                    >
                      {day.day}
                    </button>
                  );
                })}
              </div>
              {loadingMonth && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#b35a8c] border-t-transparent" />
                </div>
              )}
            </div>
            <p className="text-xs text-[#3f2635]">
              Kies een datum om beschikbare tijden te zien. Beschikbaarheid volgt je openings- en override-uren.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#2f1126]">Tijden</p>
            {loading ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b35a8c] border-t-transparent" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[#3f2635]">Selecteer eerst een datum.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-sm sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => onSelectSlot(slot)}
                    className={`rounded-xl border px-3 py-2 text-[#2f1126] shadow-[0_8px_18px_-18px_rgba(47,17,38,0.25)] transition hover:-translate-y-0.5 ${
                      selectedSlot === slot
                        ? "border-[#2f1126] bg-[#2f1126] text-white"
                        : "border-[#e8e0eb] bg-white hover:border-[#b35a8c] hover:text-[#b35a8c]"
                    }`}
                  >
                    {formatSlot(slot)}
                  </button>
                ))}
              </div>
            )}
            <div className="rounded-2xl border border-[#e8e0eb] bg-white/80 p-4 shadow-[0_12px_28px_-20px_rgba(47,17,38,0.28)]">
              <p className="text-sm font-semibold text-[#2f1126]">Overzicht</p>
              <div className="mt-2 space-y-1 text-sm text-[#2f1126]">
                <p>Service: {selectedService ? selectedService.name : "Nog niet gekozen"}</p>
                <p>Datum: {selectedDate || "Nog niet gekozen"}</p>
                <p>Tijd: {selectedSlot ? formatSlot(selectedSlot) : "Nog niet gekozen"}</p>
                <p className="text-[#2f1126]/70 text-xs">Controleer je gegevens bij bevestiging.</p>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <button
                onClick={onBook}
                disabled={bookingLoading || !selectedSlot}
                className={`rounded-full px-5 py-2 text-sm font-semibold shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] transition ${
                  bookingLoading || !selectedSlot
                    ? "bg-[#e8e0eb] text-[#2f1126]/50 cursor-not-allowed"
                    : "bg-[#2f1126] text-white hover:-translate-y-0.5"
                }`}
              >
                {bookingLoading ? "Boeken..." : "Bevestig"}
              </button>
            </div>
            {bookingMessage && (
              <p className="text-center text-sm font-semibold text-[#2f1126]">{bookingMessage}</p>
            )}
            {bookingError && <p className="text-center text-sm text-red-600">{bookingError}</p>}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2f1126] shadow-[0_12px_24px_-16px_rgba(47,17,38,0.35)] ring-1 ring-[#e8e0eb] transition hover:-translate-y-0.5"
          >
            Terug
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function buildCalendar(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0=Sun
  const offset = (firstWeekday + 6) % 7; // Monday = 0

  const cells: Array<{ dateStr: string; day: number } | null> = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ dateStr, day: d });
  }
  return cells;
}
