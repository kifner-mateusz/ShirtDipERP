import { z } from "zod";

import {
  createProcedureGetById,
  createProcedureSearchWithPagination,
} from "@/server/api/procedures";
import { authenticatedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { expenses, insertExpenseSchema } from "@/db/schema/expenses";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";

export const expenseRouter = createTRPCRouter({
  getById: createProcedureGetById("expenses"),
  create: authenticatedProcedure
    .input(insertExpenseSchema)
    .mutation(async ({ input: clientData, ctx }) => {
      const currentUserId = ctx.session!.user!.id;
      const newProduct = await db
        .insert(expenses)
        .values({
          ...clientData,
          createdById: currentUserId,
          updatedById: currentUserId,
        })
        .returning();
      return newProduct[0];
    }),
  deleteById: authenticatedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      const deletedClient = await db
        .delete(expenses)
        .where(eq(expenses.id, id))
        .returning();
      return deletedClient[0];
    }),
  update: authenticatedProcedure
    .input(insertExpenseSchema.merge(z.object({ id: z.number() })))
    .mutation(async ({ input: clientData, ctx }) => {
      const { id, ...dataToUpdate } = clientData;
      const updatedClient = await db
        .update(expenses)
        .set({ ...dataToUpdate, updatedById: ctx.session!.user!.id })
        .where(eq(expenses.id, id))
        .returning();
      return updatedClient[0];
    }),
  search: createProcedureSearchWithPagination(expenses),
});
