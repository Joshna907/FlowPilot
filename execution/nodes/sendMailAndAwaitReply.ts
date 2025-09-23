import { gmail_v1, google } from "googleapis";
import { sendEmailMetadataSchema } from "./sendEmail";
import {
  extractText,
  getAccountProfile,
  sendGmail,
  setCredentialsUsingAccount,
  stripQuotedText,
} from "./sendEmail/helpers";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export async function sendEmailAndAwaitReply(
  metadata: Record<string, unknown>,
) {
  const { success, data } = sendEmailMetadataSchema.safeParse(metadata);
  if (!success) {
    throw "unable to parse email data";
  }
  const { from, to, subject, body } = data;

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}/auth/google/callback`,
  );

  await setCredentialsUsingAccount(from, oauth2Client);

  const profile = await getAccountProfile(oauth2Client);
  if (!profile.data.emailAddress) {
    throw "no email found in profile";
  }

  const response = await sendGmail(oauth2Client, {
    to,
    from: profile.data.emailAddress,
    subject,
    body,
  });

  const reply = await pollForReplyOnThread(
    oauth2Client,
    response.threadId ?? "",
    {
      intervalMs: 10000,
      maxTries: 360,
    },
  );
  return reply?.body;
}
export async function pollForReplyOnThread(
  oauth2Client: any,
  threadId: string,
  opts: { intervalMs?: number; maxTries?: number } = {},
): Promise<{
  reply: gmail_v1.Schema$Message | undefined;
  body: string;
} | null> {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const intervalMs = opts.intervalMs ?? 5000;
  const maxTries = opts.maxTries ?? 120;
  let tries = 0;

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      tries++;
      try {
        // 1. Get all messages in this thread
        const thread = await gmail.users.threads.get({
          userId: "me",
          id: threadId,
          format: "full",
        });

        const messages = thread.data.messages ?? [];

        // 2. If more than 1 message in thread, treat later ones as replies
        if (messages.length > 1) {
          clearInterval(interval);

          // Take the last message (latest reply)
          const latest = messages[messages.length - 1];
          const body =
            extractText(latest?.payload) || latest?.snippet || "(no body)";

          resolve({ reply: latest, body: stripQuotedText(body) });
        }

        if (tries >= maxTries) {
          clearInterval(interval);
          resolve(null);
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, intervalMs);
  });
}
