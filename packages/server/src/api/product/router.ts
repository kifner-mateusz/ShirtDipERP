import { products } from "./schema";
import { insertProductZodSchema, updateProductZodSchema } from "./validator";
import { employeeProcedure, createTRPCRouter } from "@/api/trpc";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import productService from "@/api/product/service";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await productService.getById(id)),

  getManyByIds: employeeProcedure
    .input(z.number().array())
    .query(async ({ input: ids }) => await productService.getManyByIds(ids)),

  create: employeeProcedure
    .input(insertProductZodSchema)
    .mutation(async ({ input: productData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await productService.create({
        ...productData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });
    }),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => await productService.deleteById(id)),

  update: employeeProcedure
    .input(updateProductZodSchema)
    .mutation(async ({ input: productData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await productService.update({
        ...productData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(products),
  simpleSearch: createProcedureSimpleSearch(products),
});
