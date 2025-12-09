export const GROUPABLE_DIMENSIONS = [
  "transaction_type",
  "status",
  "year",
] as const;
export type GroupableDimensions = (typeof GROUPABLE_DIMENSIONS)[number];
