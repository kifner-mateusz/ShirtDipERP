import { createTRPCRouter } from "@/server/api/trpc";

import { addressRouter } from "./address/router";
import { adminRouter } from "./admin/router";
import { customerRouter } from "./customer/router";
import { emailRouter } from "./email/router";
import { expenseRouter } from "./expense/router";
import { fileRouter } from "./file/router";
import { orderRouter } from "./order/router";
import { productRouter } from "@/server/api/product/router";
import { searchRouter } from "./search/router";
import { sessionRouter } from "@/server/api/session/router";
import { settingsRouter } from "./settings/router";
import { spreadsheetRouter } from "./spreadsheet/router";
import { userRouter } from "./user/router";
import { emailMessageRouter } from "./email-message/router";
import { globalPropertyRouter } from "./global-property/router";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  address: addressRouter,
  admin: adminRouter,
  customer: customerRouter,
  email: emailRouter,
  emailMessage: emailMessageRouter,
  expense: expenseRouter,
  file: fileRouter,
  globalProperty: globalPropertyRouter,
  order: orderRouter,
  product: productRouter,
  search: searchRouter,
  session: sessionRouter,
  settings: settingsRouter,
  spreadsheet: spreadsheetRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
