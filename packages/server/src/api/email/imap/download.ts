import fs from "fs";
import { isMimeImage } from "../../../utils/isMimeImage";
import fsp from "fs/promises";
import type { ImapFlow } from "imapflow";
import Logger from "js-logger";
import _ from "lodash";
import { type ParsedMail, simpleParser } from "mailparser";
import sharp from "sharp";
import { resolveEmailCacheFileName, writeStreamAsync } from "./utils";

// cache emails
export async function downloadEmailByUid(
  client: ImapFlow,
  uid: string,
  mailbox = "INBOX",
) {
  try {
    await client.connect();
    await client.mailboxOpen(mailbox);

    if (!client.authenticated)
      throw new Error("Email server authentication failed");

    const auth = (
      client as unknown as {
        options: {
          auth: {
            user: string;
            pass?: string;
            accessToken?: string;
          };
        };
      }
    ).options.auth;

    if (!auth.user) {
      throw new Error("User was not attached to imapFlow Client");
    }

    const { outputFilePath } = resolveEmailCacheFileName(auth, uid);

    try {
      await fsp.access(outputFilePath);
      Logger.info(`Email with ID ${uid} found in cache`);
    } catch {
      Logger.info(`Email with ID ${uid} not found in cache, downloading`);
      const emailStream = await client.download(uid, undefined, {
        uid: true,
      });

      if (!emailStream)
        throw new Error(`Email with ID ${uid} not found on server`);

      await writeStreamAsync(outputFilePath, emailStream.content);
    }

    const emailFileStream = fs.createReadStream(outputFilePath);
    const parsed = await simpleParser(emailFileStream);

    if (!parsed) {
      throw new Error("Email not found.");
    }
    if (parsed.headerLines[0]?.key.startsWith("[clamav deleted]")) {
      return {
        avIsInfected: true,
        viruses: ["file deleted"],
      } as {
        avIsInfected: true;
        viruses: string[];
      };
    }
    const result: Omit<ParsedMail, "attachments"> & { avIsInfected?: false } = {
      ..._.omit(parsed, ["attachments"]),
    };

    const files = parsed.attachments.map(async (attachment) => {
      let preview: Buffer | undefined;
      if (isMimeImage(attachment.contentType)) {
        preview = await sharp(attachment.content)
          .resize(100, 100, {
            fit: "cover",
            background: { r: 150, g: 150, b: 150 },
          })
          .jpeg()
          .toBuffer();
      }

      return {
        name: attachment.filename,
        preview: preview?.toString("base64") ?? null,
        mimetype: attachment.contentType,
        size: attachment.size,
      };
    });
    const data = await Promise.allSettled(files);
    return {
      ...result,
      attachments: data.map((val) =>
        val.status === "fulfilled"
          ? val.value
          : {
              name: "[UNKNOWN]",
            },
      ) as {
        name?: string;
        preview?: string;
        mimetype?: string;
        size?: number;
      }[],
    };
  } catch (error) {
    console.error("Error fetching email:", error);
    throw new Error("Failed to fetch email.");
  } finally {
    await client.logout();
  }
}

export async function downloadEmailAttachment(
  client: ImapFlow,
  uid: string,
  mailbox = "INBOX",
  attachment = "",
) {
  try {
    await client.connect();
    await client.mailboxOpen(mailbox);

    if (!client.authenticated)
      throw new Error("Email server authentication failed");

    const auth = (
      client as unknown as {
        options: {
          auth: {
            user: string;
            pass?: string;
            accessToken?: string;
          };
        };
      }
    ).options.auth;

    if (!auth.user) {
      throw new Error("User was not attached to imapFlow Client");
    }
    const { outputFilePath } = resolveEmailCacheFileName(auth, uid);

    try {
      await fsp.access(outputFilePath);
      Logger.info(`Email with ID ${uid} found in cache`);
    } catch {
      Logger.info(`Email with ID ${uid} not found in cache, downloading`);
      const emailStream = await client.download(uid, undefined, {
        uid: true,
      });

      if (!emailStream)
        throw new Error(`Email with ID ${uid} not found on server`);

      await writeStreamAsync(outputFilePath, emailStream.content);
    }

    const emailFileStream = fs.createReadStream(outputFilePath);
    const parsed = await simpleParser(emailFileStream);

    if (!parsed) {
      throw new Error("Email not found.");
    }

    if (parsed.headerLines[0]?.key.startsWith("[clamav deleted]"))
      throw new Error("Virus detected");

    const file = parsed.attachments.find((val) => val.filename === attachment);
    if (!file) throw new Error("NOT FOUND");

    return file;
  } catch (error) {
    console.error("Error fetching email attachment:", error);
    throw new Error("Failed to fetch email attachment.");
  } finally {
    await client.logout();
  }
}
