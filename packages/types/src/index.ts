export type Role = "admin" | "client";

export type Client = {
  id: string;
  authUserId?: string | null;
  role: Role;
  name: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Service = {
  id: string;
  category: string;
  name: string;
  description?: string | null;
  durationMin: number;
  bufferMin: number;
  price: number;
  promoPrice?: number | null;
  active: boolean;
  sortOrder?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  serviceId: string;
  clientId: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  status: BookingStatus;
  notes?: string | null;
  source?: "web" | "admin" | "internal";
  createdAt?: string;
  updatedAt?: string;
};

export type OpeningHoursDefault = {
  id?: string;
  weekday: number; // 0 = Sunday
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
};

export type OpeningHoursOverride = {
  id?: string;
  date: string; // YYYY-MM-DD
  openTime?: string | null;
  closeTime?: string | null;
  closed?: boolean;
  note?: string | null;
};
