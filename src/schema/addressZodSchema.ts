import { addresses } from "@/db/schema/addresses";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type z } from "zod";
import idRequiredZodSchema from "./idRequiredZodSchema";

export const selectAddressZodSchema = createSelectSchema(addresses);
export const insertAddressZodSchema = createInsertSchema(addresses);
export const updateAddressZodSchema =
  insertAddressZodSchema.merge(idRequiredZodSchema);

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
export type UpdatedAddress = z.infer<typeof updateAddressZodSchema>;
