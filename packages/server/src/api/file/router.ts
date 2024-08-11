import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { employeeProcedure, createTRPCRouter } from "../trpc";

import { files } from "../file/schema";
import { updateFileZodSchema } from "../file/validator";
import { z } from "zod";
import fileService from "../file/service";

export const fileRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await fileService.getById(id)),

  getManyByIds: employeeProcedure
    .input(z.number().array())
    .query(async ({ input: ids }) => await fileService.getManyByIds(ids)),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => fileService.deleteById(id)),

  update: employeeProcedure
    .input(updateFileZodSchema)
    .mutation(async ({ input: fileData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await fileService.update({
        ...fileData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(files),
  simpleSearch: createProcedureSimpleSearch(files),
});
