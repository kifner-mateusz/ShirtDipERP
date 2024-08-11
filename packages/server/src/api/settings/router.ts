import { db } from "../../db";
import { email_credentials_to_users } from "../email/schema";
import { insertEmailCredentialZodSchema } from "../email/validator";
import { employeeProcedure, createTRPCRouter } from "../trpc";
import emailCredentialService from "../email/service";

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { observable } from "@trpc/server/observable";

export const settingsRouter = createTRPCRouter({
  getAllMailCredentials: employeeProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;
    // const result = await db.query.users.findFirst({
    //   where: (users, { eq }) => eq(users.id, currentUserId),
    //   with: { emailCredentials: { with: { emailCredentials: true } } },
    // });
    // return result?.emailCredentials.map((v) => v.emailCredentials);
  }),

  createMailCredential: employeeProcedure
    .input(insertEmailCredentialZodSchema)
    .mutation(async ({ ctx, input: emailCredentialData }) => {
      const currentUserId = ctx.session.user.id;
      const EmailCredential = await emailCredentialService.create({
        ...emailCredentialData,
        createdById: currentUserId,
        updatedById: currentUserId,
      });

      await db.insert(email_credentials_to_users).values({
        userId: currentUserId,
        emailCredentialsId: EmailCredential.id,
      });
      return EmailCredential;
    }),
  // updateMailCredential: employeeProcedure
  //   .input(emailCredentialSchema)
  //   .mutation(async ({ input: mailCredential }) => {
  //     const updatedProduct = await prisma.product.update({
  //       where: { id: mailCredential.id },
  //       data: { ...mailCredential },
  //     });
  //     return updatedProduct;
  //   }),
  deleteMailCredential: employeeProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: id }) => {
      const currentUserId = ctx.session.user.id;
      // const result = await db.query.users.findFirst({
      //   where: (users, { eq }) => eq(users.id, currentUserId),
      //   with: { emailCredentials: true },
      // });

      // const found = result?.emailCredentials.findIndex(
      //   (credential) => credential.emailCredentialsId === id,
      // );
      // if (found === undefined) {
      //   throw new TRPCError({
      //     code: "FORBIDDEN",
      //     message: "You don't have permissions to delete this credential",
      //   });
      // }
      // await db
      //   .delete(email_credentials_to_users)
      //   .where(eq(email_credentials_to_users.emailCredentialsId, id));

      // return await emailCredentialService.deleteById(id);
    }),

  randomNumber: employeeProcedure.subscription(() => {
    return observable<number>((emit) => {
      const int = setInterval(() => {
        emit.next(Math.random());
      }, 500);
      return () => {
        clearInterval(int);
      };
    });
  }),
});
