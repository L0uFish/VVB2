export type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  duration_min: number | null;
  buffer_min: number | null;
  price: number | null;
  promo_price: number | null;
  active: boolean;
};
