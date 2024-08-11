import { products } from "./schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import idRequiredZodSchema from "../../types/idRequiredZodSchema";

export const selectProductZodSchema = createSelectSchema(products, {
  colors: z.string().array(),
  sizes: z.string().array(),
});

export const insertProductZodSchema = createInsertSchema(products, {
  colors: z.string().array(),
  sizes: z.string().array(),
}).omit({
  createdAt: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
});

export const updateProductZodSchema =
  insertProductZodSchema.merge(idRequiredZodSchema);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type UpdatedProduct = z.infer<typeof updateProductZodSchema>;
