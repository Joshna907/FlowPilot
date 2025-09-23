import { oauth2Client } from "../lib";
import { sendEmail, sendEmailMetadataSchema } from "./sendMail";
import { google } from "googleapis";

async function ensureFreshAccessToken() {
  const res = await oauth2Client.getAccessToken();
  if (!res || !res.token) throw new Error("Unable to obtain access token");
  return res.token;
}

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function test() {
  const x = {
    access_token:
      "",
    refresh_token:
      "",
    scope: "https://www.googleapis.com/auth/gmail.modify",
    token_type: "Bearer",
  };
  // Ensure token is fresh
  oauth2Client.setCredentials(x);
  await ensureFreshAccessToken();

  // Simple profile call
  const profile = await gmail.users.getProfile({ userId: "me" });
  console.log("Email address:", profile.data.emailAddress);
}

await test();

export async function sendEmailAndAwaitReply(
  metadata: Record<string, unknown>,
) {
  const { success, data } = sendEmailMetadataSchema.safeParse(metadata);
  if (!success) {
    throw "unable to parse sendEmailAndAwaitReply data";
  }

  const { messageId } = await sendEmail(data);
  if (!messageId) {
    throw new Error("no message Id found");
  }
  const oauth2Client = "";

  // const reply = await pollForReply(oauth2Client, messageId);
  // if (reply) {
  //   console.log("Reply found:", reply.body);
  // } else {
  //   console.log("No reply within timeout.");
  // }
}

// decode helper
function b64Decode(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64").toString("utf8");
}

function extractText(payload: any): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return b64Decode(payload.body.data);
  }
  if (payload.parts) {
    for (const p of payload.parts) {
      const t = extractText(p);
      if (t) return t;
    }
  }
  return "";
}

export async function pollForReply(
  auth: any,
  gmailMessageId: string,
  opts: { intervalMs?: number; maxTries?: number } = {},
) {
  const client = google.gmail({ version: "v1", auth });

  const original = await client.users.messages.get({
    userId: "me",
    id: gmailMessageId,
    format: "metadata",
  });

  const threadId = original.data.threadId;
  if (!threadId) throw new Error("No threadId found");

  let tries = 0;
  const intervalMs = opts.intervalMs ?? 5000;
  const maxTries = opts.maxTries ?? 360;

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      tries++;
      try {
        // 2. List all messages in the same thread
        const list = await client.users.messages.list({
          userId: "me",
          q: `in:inbox`,
          // Gmail doesn’t support threadId filter in search,
          // but threadId comes back in response
        });

        const msgs = list.data.messages || [];

        // 3. Filter for replies (same thread, but not original)
        const replies: string[] = [];
        for (const m of msgs) {
          if (m.threadId === threadId && m.id !== gmailMessageId) {
            replies.push(m.id!);
          }
        }

        if (replies.length > 0) {
          clearInterval(interval);

          // get the first reply
          const reply = await client.users.messages.get({
            userId: "me",
            id: replies[0],
            format: "full",
          });

          const body = extractText(reply.data.payload) || reply.data.snippet;
          resolve({ reply: reply.data, body });
        }

        if (tries >= maxTries) {
          clearInterval(interval);
          resolve(null); // timeout
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, intervalMs);
  });
}
