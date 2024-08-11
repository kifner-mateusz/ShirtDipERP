import { z } from "zod";
import { expenses } from "@/api/expense/schema";
import { insertExpenseZodSchema, updateExpenseZodSchema } from "./validator";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "@/api/procedures";
import { employeeProcedure, createTRPCRouter } from "@/api/trpc";
import barcodeService from "./service";

export const barcodeRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await barcodeService.deleteById(id)),

  create: employeeProcedure
    .input(insertExpenseZodSchema)
    .mutation(async ({ input: expenseData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await barcodeService.create({
        ...expenseData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });
    }),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => barcodeService.deleteById(id)),

  update: employeeProcedure
    .input(updateExpenseZodSchema)
    .mutation(async ({ input: expenseData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await barcodeService.update({
        ...expenseData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(expenses),
  simpleSearch: createProcedureSimpleSearch(expenses),
});
