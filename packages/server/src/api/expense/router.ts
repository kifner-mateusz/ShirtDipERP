import { z } from "zod";
import { expenses } from "../expense/schema";
import { insertExpenseZodSchema, updateExpenseZodSchema } from "./validator";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { employeeProcedure, createTRPCRouter } from "../trpc";
import expenseService from "./service";

export const expenseRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await expenseService.deleteById(id)),

  create: employeeProcedure
    .input(insertExpenseZodSchema)
    .mutation(async ({ input: expenseData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await expenseService.create({
        ...expenseData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });
    }),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => expenseService.deleteById(id)),

  update: employeeProcedure
    .input(updateExpenseZodSchema)
    .mutation(async ({ input: expenseData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await expenseService.update({
        ...expenseData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(expenses),
  simpleSearch: createProcedureSimpleSearch(expenses),
});
