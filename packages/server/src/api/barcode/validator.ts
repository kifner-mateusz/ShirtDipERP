import { expenses } from "../expense/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import idRequiredZodSchema from "../../types/idRequiredZodSchema";

export const selectExpenseZodSchema = createSelectSchema(expenses, {
  expenseData: z
    .object({ name: z.string().optional(), amount: z.number().optional() })
    .array(),
});
export const insertExpenseZodSchema = createInsertSchema(expenses, {
  expenseData: z
    .object({ name: z.string().optional(), amount: z.number().optional() })
    .array(),
}).omit({
  createdAt: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
});

export const updateExpenseZodSchema =
  insertExpenseZodSchema.merge(idRequiredZodSchema);

export type Expense = z.infer<typeof selectExpenseZodSchema>;
export type NewExpense = z.infer<typeof insertExpenseZodSchema>;
export type UpdatedExpense = z.infer<typeof updateExpenseZodSchema>;
