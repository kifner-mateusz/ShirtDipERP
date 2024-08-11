import { createTRPCRouter } from "@/api/trpc";

import { addressRouter } from "@/api/address/router";
import { adminRouter } from "@/api/admin/router";
import { customerRouter } from "@/api/customer/router";
import { emailRouter } from "@/api/email/router";
import { expenseRouter } from "@/api/expense/router";
import { fileRouter } from "@/api/file/router";
import { orderRouter } from "@/api/order/router";
import { productRouter } from "@/api/product/router";
import { searchRouter } from "@/api/search/router";
import { sessionRouter } from "@/api/session/router";
import { settingsRouter } from "@/api/settings/router";
import { spreadsheetRouter } from "@/api/spreadsheet/router";
import { userRouter } from "@/api/user/router";
import { emailMessageRouter } from "@/api/email-message/router";
import { globalPropertyRouter } from "@/api/global-property/router";
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
