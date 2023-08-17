import { clientRouter } from "@/server/api/routers/client";
import { exampleRouter } from "@/server/api/routers/example";
import { productRouter } from "@/server/api/routers/product";
import { sessionRouter } from "@/server/api/routers/session";
import { settingsRouter } from "@/server/api/routers/settings";
import { createTRPCRouter } from "@/server/api/trpc";
import { designRouter } from "./routers/design";
import { emailRouter } from "./routers/email";
import { expenseRouter } from "./routers/expense";
import { orderRouter } from "./routers/order";
import { orderArchiveRouter } from "./routers/orderArchive";
import { searchRouter } from "./routers/search";
import { spreadsheetRouter } from "./routers/spreadsheet";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  session: sessionRouter,
  product: productRouter,
  settings: settingsRouter,
  client: clientRouter,
  order: orderRouter,
  "order-archive": orderArchiveRouter,
  spreadsheet: spreadsheetRouter,
  design: designRouter,
  user: userRouter,
  search: searchRouter,
  email: emailRouter,
  expense: expenseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
