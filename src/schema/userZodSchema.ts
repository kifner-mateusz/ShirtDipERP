import { users } from "@/db/schema/users";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const selectUserZodSchema = createSelectSchema(users);
export const insertUserZodSchema = createInsertSchema(users).omit({
  createdAt: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
});

export const updateUserZodSchema = insertUserZodSchema.merge(
  z.object({ id: z.string() }),
);

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserZodSchema>;
