import { email_messages } from "./schema";
import {
  updateEmailMessageZodSchema,
  insertEmailMessageZodSchema,
} from "./validator";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { employeeProcedure, createTRPCRouter } from "../trpc";
import emailMessageService from "./service";
import { z } from "zod";

export const emailMessageRouter = createTRPCRouter({
  // getFullById: employeeProcedure
  //   .input(z.number())
  //   .query(async ({ input: id }) => await emailMessageService.getFullById(id)),

  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await emailMessageService.getById(id)),

  getManyByIds: employeeProcedure
    .input(z.number().array())
    .query(
      async ({ input: ids }) => await emailMessageService.getManyByIds(ids),
    ),

  create: employeeProcedure
    .input(insertEmailMessageZodSchema)
    .mutation(async ({ input: emailMessageData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await emailMessageService.create({
        ...emailMessageData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });
    }),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(
      async ({ input: id }) => await emailMessageService.deleteById(id),
    ),

  update: employeeProcedure
    .input(updateEmailMessageZodSchema)
    .mutation(async ({ input: emailMessageData, ctx }) => {
      const currentUserId = ctx.session.user.id;

      return await emailMessageService.update({
        ...emailMessageData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(email_messages),
  simpleSearch: createProcedureSimpleSearch(email_messages),
});
