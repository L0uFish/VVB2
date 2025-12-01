export const isBelgianPhone = (value: string): boolean => {
  const normalized = value.replace(/\s|-/g, "");
  return /^(\+32|0)\d{8,9}$/.test(normalized);
};
