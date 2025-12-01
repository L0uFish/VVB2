import type { BookingRow, Grouped } from "../types";

export function groupByDate(items: BookingRow[]): Grouped[] {
  const map = new Map<string, BookingRow[]>();
  items.forEach((b) => {
    const d = new Date(b.starts_at);
    const dateLabel = d.toLocaleDateString("nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!map.has(dateLabel)) map.set(dateLabel, []);
    map.get(dateLabel)!.push(b);
  });
  return Array.from(map.entries()).map(([date, arr]) => ({ date, items: arr }));
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
}