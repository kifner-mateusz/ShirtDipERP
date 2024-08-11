import { z } from "zod";
import {
  createProcedureOldSearch,
  createProcedureSimpleSearch,
} from "../procedures";
import { employeeProcedure, createTRPCRouter, managerProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { global_properties } from "./schema";
import {
  insertGlobalPropertiesZodSchema,
  updateGlobalPropertiesZodSchema,
} from "./validator";
import globalPropertyService from "./service";
import { db } from "../../db";

export const globalPropertyRouter = createTRPCRouter({
  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await globalPropertyService.getById(id)),

  getAll: employeeProcedure.query(
    async () => await db.select().from(global_properties),
  ),

  getByCategory: employeeProcedure
    .input(z.string())
    .query(async ({ input: category }) => {
      const propertiesArray = await db
        .select()
        .from(global_properties)
        .where(eq(global_properties.category, category));
      return propertiesArray;
    }),

  create: managerProcedure
    .input(insertGlobalPropertiesZodSchema)
    .mutation(
      async ({ input: globalPropertyData }) =>
        await globalPropertyService.create(globalPropertyData),
    ),

  deleteById: managerProcedure
    .input(z.number())
    .mutation(
      async ({ input: id }) => await globalPropertyService.deleteById(id),
    ),

  update: employeeProcedure
    .input(updateGlobalPropertiesZodSchema)
    .mutation(
      async ({ input: globalPropertyData }) =>
        await globalPropertyService.update(globalPropertyData),
    ),

  oldSearch: createProcedureOldSearch(global_properties),
  simpleSearch: createProcedureSimpleSearch(global_properties),
});
