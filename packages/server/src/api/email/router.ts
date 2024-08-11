import { db } from "@/db";
import { users } from "@/api/user/schema";
import { employeeProcedure, createTRPCRouter } from "@/api/trpc";

import IMAPService from "@/api/email/imap";

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { ImapFlow } from "imapflow";
import Logger from "js-logger";
import { z } from "zod";

// TODO: divide this into 2 routers email and email credentials

export const emailRouter = createTRPCRouter({
  getAllConfigs: employeeProcedure.query(async ({ ctx }) => {
    const currentUserId = ctx.session.user.id;
    const result = await db.query.users.findFirst({
      where: eq(users.id, currentUserId),
      with: { emailCredentials: { with: { emailCredentials: true } } },
    });

    if (result === undefined || result?.emailCredentials.length === 0)
      return [];
    return result.emailCredentials.map((v) => v.emailCredentials);
  }),

  getFolders: employeeProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const result = await db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        with: { emailCredentials: { with: { emailCredentials: true } } },
      });
      const auth = result?.emailCredentials
        .map((val) => val.emailCredentials)
        .find((auth) => auth.id === input && auth.protocol === "imap");

      if (auth === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "emailCredentials not found",
        });

      const client = new ImapFlow({
        host: auth.host ?? "",
        port: auth.port ?? 993,
        auth: {
          user: auth.user ?? "",
          pass: auth.password ?? "",
        },
        secure: auth.secure ?? true,
        logger: Logger,
      });
      return await IMAPService.fetchFolders(client);
    }),

  getFolderTree: employeeProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;
      const result = await db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        with: { emailCredentials: { with: { emailCredentials: true } } },
      });
      const auth = result?.emailCredentials
        .map((val) => val.emailCredentials)
        .find((auth) => auth.id === input && auth.protocol === "imap");

      if (auth === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "emailCredentials not found",
        });

      const client = new ImapFlow({
        host: auth.host ?? "",
        port: auth.port ?? 993,
        auth: {
          user: auth.user ?? "",
          pass: auth.password ?? "",
        },
        secure: auth.secure ?? true,
        logger: Logger,
      });
      return await IMAPService.fetchFolderTree(client);
    }),

  getAll: employeeProcedure
    .input(
      z.object({
        mailbox: z.string().default("INBOX"),
        emailClientId: z.number(),
        take: z.number(),
        skip: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { mailbox, emailClientId, take, skip } = input;
      const currentUserId = ctx.session.user.id;
      const result = await db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        with: { emailCredentials: { with: { emailCredentials: true } } },
      });

      const auth = result?.emailCredentials
        .map((val) => val.emailCredentials)
        .find((auth) => auth.id === emailClientId && auth.protocol === "imap");

      if (auth === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "emailCredentials not found",
        });

      const client = new ImapFlow({
        host: auth.host ?? "",
        port: auth.port ?? 993,
        auth: {
          user: auth.user ?? "",
          pass: auth.password ?? "",
        },
        secure: auth.secure ?? true,
        logger: Logger,
      });
      return await IMAPService.fetchEmails(client, mailbox, take, skip);
    }),

  getByUid: employeeProcedure
    .input(
      z.object({
        mailbox: z.string().default("INBOX"),
        emailClientId: z.number(),
        emailId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { mailbox, emailClientId, emailId } = input;
      const currentUserId = ctx.session.user.id;
      const result = await db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        with: { emailCredentials: { with: { emailCredentials: true } } },
      });
      const auth = result?.emailCredentials
        .map((val) => val.emailCredentials)
        .find((auth) => auth.id === emailClientId && auth.protocol === "imap");

      if (auth === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "emailCredentials not found",
        });

      const client = new ImapFlow({
        host: auth.host ?? "",
        port: auth.port ?? 993,
        auth: {
          user: auth.user ?? "",
          pass: auth.password ?? "",
        },
        secure: auth.secure ?? true,
        logger: Logger,
      });
      // const mail = await fetchEmailByUid(client, emailId.toString(), mailbox);
      const mail = await IMAPService.downloadEmailByUid(
        client,
        emailId.toString(),
        mailbox,
      );
      return mail;
    }),
  downloadByUid: employeeProcedure
    .input(
      z.object({
        mailbox: z.string().default("INBOX"),
        emailClientId: z.number(),
        emailId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { mailbox, emailClientId, emailId } = input;
      const currentUserId = ctx.session.user.id;
      const result = await db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        with: { emailCredentials: { with: { emailCredentials: true } } },
      });

      const auth = result?.emailCredentials
        .map((val) => val.emailCredentials)
        .find((auth) => auth.id === emailClientId && auth.protocol === "imap");

      if (auth === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "emailCredentials not found",
        });

      const client = new ImapFlow({
        host: auth.host ?? "",
        port: auth.port ?? 993,
        auth: {
          user: auth.user ?? "",
          pass: auth.password ?? "",
        },
        secure: auth.secure ?? true,
        logger: Logger,
      });
      const mail = await IMAPService.transferEmailToDbByUId(
        client,
        emailId.toString(),
        mailbox,
      );
      return mail;
    }),

  oldSearch: employeeProcedure
    .input(
      z.object({
        mailbox: z.string().default("INBOX"),
        emailClientId: z.number(),
        query: z.string(),
        take: z.number().optional(),
        skip: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { mailbox, emailClientId, query, take } = input;
      const currentUserId = ctx.session.user.id;
      const result = await db.query.users.findFirst({
        where: eq(users.id, currentUserId),
        with: { emailCredentials: { with: { emailCredentials: true } } },
      });

      const auth = result?.emailCredentials
        .map((val) => val.emailCredentials)
        .find((val) => val.id === emailClientId && val.protocol === "imap");

      if (auth === undefined)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "emailCredentials not found",
        });

      const client = new ImapFlow({
        host: auth.host ?? "",
        port: auth.port ?? 993,
        auth: {
          user: auth.user ?? "",
          pass: auth.password ?? "",
        },
        secure: auth.secure ?? true,
        logger: Logger,
      });
      return await IMAPService.emailSearch(
        client,
        mailbox,
        query,
        take,
        //  skip
      );
    }),
});
