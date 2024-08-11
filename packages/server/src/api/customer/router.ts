import { customers } from "../customer/schema";
import {
  insertCustomerWithRelationZodSchema,
  updateCustomerZodSchema,
} from "../customer/validator";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { employeeProcedure, createTRPCRouter } from "../trpc";
import customerService from "../customer/service";
import { z } from "zod";

export const customerRouter = createTRPCRouter({
  getFullById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await customerService.getFullById(id)),

  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await customerService.getById(id)),
  getRelatedAddress: employeeProcedure
    .input(z.number())
    .query(
      async ({ input: orderId }) =>
        await customerService.addressRelation.get(orderId),
    ),
  create: employeeProcedure
    .input(insertCustomerWithRelationZodSchema)
    .mutation(async ({ input: customerData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await customerService.create({
        ...customerData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });
    }),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => await customerService.deleteById(id)),

  update: employeeProcedure
    .input(updateCustomerZodSchema)
    .mutation(async ({ input: customerData, ctx }) => {
      const currentUserId = ctx.session.user.id;

      return await customerService.update({
        ...customerData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(customers),
  simpleSearch: createProcedureSimpleSearch(customers),
});
