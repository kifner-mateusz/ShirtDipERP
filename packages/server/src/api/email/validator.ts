import { email_credentials } from "@/api/email/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import idRequiredZodSchema from "@/types/idRequiredZodSchema";

export const selectEmailCredentialZodSchema =
  createSelectSchema(email_credentials);
export const insertEmailCredentialZodSchema = createInsertSchema(
  email_credentials,
).omit({
  createdAt: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
});

export const updateEmailCredentialZodSchema =
  insertEmailCredentialZodSchema.merge(idRequiredZodSchema);

export type EmailCredential = typeof email_credentials.$inferSelect;
export type NewEmailCredential = z.infer<typeof insertEmailCredentialZodSchema>;
export type UpdatedEmailCredential = z.infer<
  typeof updateEmailCredentialZodSchema
>;
