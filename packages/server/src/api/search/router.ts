import { z } from "zod";

import { customers } from "../customer/schema";
import { orders } from "../order/schema";
import { employeeProcedure, createTRPCRouter } from "@/api/trpc";
import { ilike, or } from "drizzle-orm";
import { db } from "@/db";

export const searchRouter = createTRPCRouter({
  all: employeeProcedure
    .input(
      z.object({
        query: z.string().optional(),
        sort: z.enum(["desc", "asc"]).default("desc"),
        itemsPerPage: z.number().default(5),
      }),
    )
    .query(async ({ input }) => {
      const searchCustomers = [];
      const searchOrders = [];

      if (input.query && input.query.length > 0) {
        const splitQuery = input.query.split(" ");
        for (const queryPart of splitQuery) {
          if (queryPart.length > 0) {
            for (const key of [
              "username",
              "firstname",
              "lastname",
              "companyName",
              "email",
            ]) {
              searchCustomers.push(
                ilike(
                  customers[key as keyof typeof customers.$inferSelect],
                  `%${queryPart}%`,
                ),
              );
            }
          }
        }

        for (const queryPart of splitQuery) {
          if (queryPart.length > 0) {
            searchOrders.push(ilike(orders.name, `%${queryPart}%`));
          }
        }
      }

      const resultsCustomer = db.query.customers.findMany({
        where: or(...searchCustomers),
        limit: input.itemsPerPage,
      });

      const resultsOrder = db.query.orders.findMany({
        where: or(...searchOrders),
        limit: input.itemsPerPage,
      });

      const results = await Promise.all([resultsCustomer, resultsOrder]);

      return results;
    }),
});
