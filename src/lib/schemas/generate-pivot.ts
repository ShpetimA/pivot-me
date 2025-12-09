import { z } from "zod";

export const schema = z.object({
  rowDimension: z.union([
    z.literal("year"),
    z.literal("transaction_type"),
    z.literal("status"),
  ]),
  columnDimensions: z
    .array(
      z.union([
        z.literal("year"),
        z.literal("transaction_type"),
        z.literal("status"),
      ])
    )
    .min(1, "Select at least one column dimension"),
});

export type TForm = z.infer<typeof schema>;
