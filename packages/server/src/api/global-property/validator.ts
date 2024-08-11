import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import idRequiredZodSchema from "../../types/idRequiredZodSchema";
import { global_properties } from "./schema";

export const selectGlobalPropertiesZodSchema = createSelectSchema(
  global_properties,
  {
    data: z.string().array(),
  },
);
export const insertGlobalPropertiesZodSchema = createInsertSchema(
  global_properties,
  {
    data: z.string().array(),
  },
);

export const updateGlobalPropertiesZodSchema = createInsertSchema(
  global_properties,
  {
    data: z.string().array(),
    name: z.string().optional(),
    category: z.string().optional(),
  },
).merge(idRequiredZodSchema);
export type GlobalProperties = z.infer<typeof selectGlobalPropertiesZodSchema>;
export type NewGlobalProperties = z.infer<
  typeof insertGlobalPropertiesZodSchema
>;

export type UpdateGlobalProperties = z.infer<
  typeof updateGlobalPropertiesZodSchema
>;
