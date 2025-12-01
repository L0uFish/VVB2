"use client";

import { useEffect, useMemo, useState } from "react";
import type { OpeningOverride } from "../types";

type FormState = {
  date: string;
  open_time: string;
  close_time: string;
  closed: boolean;
  note: string;
};

function emptyForm(): FormState {
  return { date: "", open_time: "", close_time: "", closed: false, note: "" };
}

export function OverrideModal({
  open,
  overrides,
  onClose,
  onAdd,
  onDelete,
  selectedOverride,
}: {
  open: boolean;
  overrides: OpeningOverride[];
  onClose: () => void;
  onAdd?: (payload: Partial<OpeningOverride>) => void;
  onDelete?: (id: string) => void;
  selectedOverride?: OpeningOverride | null;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);

  const sorted = useMemo(
    () => [...overrides].sort((a, b) => a.date.localeCompare(b.date)),
    [overrides]
  );

  useEffect(() => {
    if (selectedOverride) {
      setForm({
        date: selectedOverride.date,
        open_time: selectedOverride.open_time ?? "",
        close_time: selectedOverride.close_time ?? "",
        closed: !!selectedOverride.closed || (!selectedOverride.open_time && !selectedOverride.close_time),
        note: selectedOverride.note ?? "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [selectedOverride, open]);

  const handleSubmit = () => {
    onAdd?.({
      id: selectedOverride?.id,
      date: form.date,
      open_time: form.closed ? null : form.open_time || null,
      close_time: form.closed ? null : form.close_time || null,
      closed: form.closed,
      note: form.note || null,
    });
    if (!selectedOverride) {
      setForm(emptyForm());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-[#e8e0eb] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a4c7d]">Openingstijden</p>
            <h3 className="text-2xl font-semibold text-[#2f1126]">Overrides beheren</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-[#2f1126] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Sluiten
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3 rounded-2xl bg-[#fff9fd] p-4 ring-1 ring-[#f0e7f4]">
            <p className="text-sm font-semibold text-[#2f1126]">Nieuwe override</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-[#2f1126]">
                Datum
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#e8e0eb] px-3 py-2 text-sm text-[#2f1126] focus:border-[#8a4c7d] focus:outline-none"
                />
              </label>
              <label className="text-sm text-[#2f1126] flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.closed}
                  onChange={(e) => setForm({ ...form, closed: e.target.checked })}
                  className="h-4 w-4 rounded border-[#e8e0eb] text-[#8a4c7d] focus:ring-[#8a4c7d]"
                />
                Gesloten (hele dag)
              </label>
            </div>

            {!form.closed && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-[#2f1126]">
                  Open
                  <input
                    type="time"
                    value={form.open_time}
                    onChange={(e) => setForm({ ...form, open_time: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#e8e0eb] px-3 py-2 text-sm text-[#2f1126] focus:border-[#8a4c7d] focus:outline-none"
                  />
                </label>
                <label className="text-sm text-[#2f1126]">
                  Sluit
                  <input
                    type="time"
                    value={form.close_time}
                    onChange={(e) => setForm({ ...form, close_time: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#e8e0eb] px-3 py-2 text-sm text-[#2f1126] focus:border-[#8a4c7d] focus:outline-none"
                  />
                </label>
              </div>
            )}

            <label className="text-sm text-[#2f1126]">
              Notitie (optioneel)
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="bv. Feestdag, onderhoud, ..."
                className="mt-1 w-full rounded-lg border border-[#e8e0eb] px-3 py-2 text-sm text-[#2f1126] focus:border-[#8a4c7d] focus:outline-none"
              />
            </label>

            <button
              onClick={handleSubmit}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#2f1126] to-[#8a4c7d] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Toevoegen
            </button>
          </div>

          <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-[#f0e7f4]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2f1126]">Bestaande overrides</p>
              <span className="text-xs text-[#6c5665]">{sorted.length} items</span>
            </div>
            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
              {sorted.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#e8e0eb] px-3 py-4 text-center text-sm text-[#6c5665]">
                  Nog geen overrides toegevoegd.
                </div>
              )}
              {sorted.map((ov) => {
                const isClosed = !!ov.closed || (!ov.open_time && !ov.close_time);
                return (
                  <div
                    key={ov.id}
                    className="flex items-center justify-between rounded-xl border border-[#e8e0eb] bg-[#fff9fd] px-3 py-3 text-sm text-[#2f1126] shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{ov.date}</div>
                      <div className="text-xs text-[#6c5665]">
                        {isClosed
                          ? "Gesloten / hele dag"
                          : `${(ov.open_time ?? "").slice(0, 5)} - ${(ov.close_time ?? "").slice(0, 5)}`}
                      </div>
                      {ov.note && <div className="text-xs text-[#8a4c7d]">{ov.note}</div>}
                    </div>
                    <button
                      onClick={() => onDelete?.(ov.id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-[#8a4c7d] ring-1 ring-[#e8e0eb] transition hover:bg-[#f5d7e3]"
                    >
                      Verwijder
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
