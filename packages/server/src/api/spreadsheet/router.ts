// import Vector2Schema from "@/schema/Vector2Schema";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { employeeProcedure, createTRPCRouter } from "../trpc";

import { spreadsheets } from "../spreadsheet/schema";
import {
  insertSpreadsheetZodSchema,
  updateSpreadsheetZodSchema,
} from "./validator";
import { z } from "zod";
import spreadsheetService from "../spreadsheet/service";

// const partialSpreadsheetData = z.object({
//   id: z.number(),
//   partialData: z.array(
//     z.object({ position: Vector2Schema, data: z.record(z.any()) }),
//   ),
// });

// type typePartialSpreadsheetData = z.infer<typeof partialSpreadsheetData>;

export const spreadsheetRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => spreadsheetService.getById(id)),

  getManyByIds: employeeProcedure
    .input(z.number().array())
    .query(async ({ input: ids }) => spreadsheetService.getManyByIds(ids)),

  create: employeeProcedure
    .input(insertSpreadsheetZodSchema)
    .mutation(async ({ input: userData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await spreadsheetService.create({
        ...userData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });
    }),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => spreadsheetService.deleteById(id)),

  update: employeeProcedure
    .input(updateSpreadsheetZodSchema)
    .mutation(async ({ input: userData, ctx }) => {
      const currentUserId = ctx.session.user.id;
      return await spreadsheetService.update({
        ...userData,
        updatedById: currentUserId,
        updatedAt: new Date(),
      });
    }),

  oldSearch: createProcedureOldSearch(spreadsheets),
  simpleSearch: createProcedureSimpleSearch(spreadsheets),

  // updatePartial: employeeProcedure
  //   .input(partialSpreadsheetData)
  //   .mutation(async ({ input: partialData }) => {
  //     const dataSpreadsheet = await prisma.spreadsheet.findUnique({
  //       where: { id: partialData.id },
  //     });
  //     if (!dataSpreadsheet?.data)
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "NOT_FOUND",
  //       });
  //     //  eslint-disable-next-line
  //     const dataDecoded = SuperJSON.parse(dataSpreadsheet.data.toString());
  //     console.log(dataDecoded);
  //     for (const cell of partialData.partialData) {
  //     }
  //     const updatedSpreadsheet = await prisma.spreadsheet.update({
  //       where: { id: partialData.id },
  //       data: omit({ ...partialData }, ["id"]),
  //     });
  //     return updatedSpreadsheet;
  //   }),
});
