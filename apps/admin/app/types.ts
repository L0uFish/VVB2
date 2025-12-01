export type BookingRow = {
  id: string;
  starts_at: string;
  ends_at?: string | null;
  status: string;
  notes?: string | null;
  services: { name: string } | null;
  clients: { name: string; phone: string | null } | null;
};

export type Grouped = { date: string; items: BookingRow[] };

export type OpeningOverride = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  open_time: string | null;
  close_time: string | null;
  closed: boolean | null;
  note: string | null;
};
