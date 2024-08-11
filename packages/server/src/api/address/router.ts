import { addresses } from "./schema";
import { insertAddressZodSchema, updateAddressZodSchema } from "./validator";
import { createProcedureGetAll } from "@/api/procedures";
import { employeeProcedure, createTRPCRouter } from "@/api/trpc";
import addressService from "./service";
import { z } from "zod";

export const addressRouter = createTRPCRouter({
  getAll: createProcedureGetAll(addresses),

  getById: employeeProcedure
    .input(z.number())
    .query(async ({ input: id }) => await addressService.getById(id)),

  create: employeeProcedure
    .input(insertAddressZodSchema)
    .mutation(
      async ({ input: addressData }) =>
        await addressService.create(addressData),
    ),

  deleteById: employeeProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => addressService.deleteById(id)),

  update: employeeProcedure
    .input(updateAddressZodSchema)
    .mutation(
      async ({ input: addressData }) =>
        await addressService.update(addressData),
    ),
});
