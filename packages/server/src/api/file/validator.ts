import { files } from "../file/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import idRequiredZodSchema from "../../types/idRequiredZodSchema";
import type { Merge } from "../../types/Merge";

export const selectFileZodSchema = createSelectSchema(files).merge(
  z.object({ url: z.string() }),
);
export const insertFileZodSchema = createInsertSchema(files).omit({
  createdAt: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
});

export const updateFileZodSchema =
  insertFileZodSchema.merge(idRequiredZodSchema);

export type File = Merge<typeof files.$inferSelect, { url: string }>;
export type NewFile = Merge<
  z.infer<typeof insertFileZodSchema>,
  { url: string }
>;

export type UpdatedFile = z.infer<typeof updateFileZodSchema>;
