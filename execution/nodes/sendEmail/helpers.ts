import { google } from "googleapis";
import { prisma } from "../../../backend/utils/db";

export async function sendGmail(
  oauth2Client: any,
  opts: {
    to: string;
    from: string;
    subject: string;
    body: string;
  },
) {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const raw = makeEmailRaw(opts.to, opts.from, opts.subject, opts.body);

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return res.data;
}

function makeEmailRaw(to: string, from: string, subject: string, body: string) {
  const message =
    `To: ${to}\r\n` +
    `From: ${from}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/plain; charset="UTF-8"\r\n` +
    `\r\n` +
    body;

  // convert to Base64URL, gmail requires base64url
  const encodedMessage = Buffer.from(message)
    .toString("base64") // normal base64
    .replace(/\+/g, "-") // convert to base64url
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // strip padding (=)

  return encodedMessage;
}

export async function getAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });
  if (!account) {
    throw "unable to get google account";
  }
  return account;
}

//set users credentials inside oauth2Client
export async function setCredentialsUsingAccount(
  accountId: string,
  oauth2Client: any,
) {
  const account = await getAccount(accountId);
  const tokens = {
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
    scope: "https://www.googleapis.com/auth/gmail.modify",
    token_type: "Bearer",
  };
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

export async function getAccountProfile(oauth2Client: any) {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });
  return profile;
}

export function stripQuotedText(body: string): string {
  if (!body) return "";

  // normalize newlines
  let s = body.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 1) Remove "On <date> <person> wrote:" style blocks and everything after them
  //    (covers many common mail clients)
  s = s.replace(/\nOn\s.+?wrote:\n[\s\S]*$/i, "");

  // 2) Remove lines that are quoted (start with '>')
  s = s
    .split("\n")
    .filter((line) => !line.trim().startsWith(">"))
    .join("\n");

  // 3) Remove typical reply separators like "-----Original Message-----" etc and everything after
  s = s.replace(/\n-{3,}\s*Original Message[\s\S]*$/i, "");
  s = s.replace(/\n-{3,}[\s\S]*$/i, "");

  // Trim and return
  return s.trim();
}

export function decodeBody(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

export function extractText(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBody(payload.body.data);
  }
  if (payload.parts) {
    for (const p of payload.parts) {
      const t = extractText(p);
      if (t) return t;
    }
  }
  return "";
}
