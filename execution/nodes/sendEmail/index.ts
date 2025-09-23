import { google } from "googleapis";
import z from "zod";
import {
  getAccountProfile,
  sendGmail,
  setCredentialsUsingAccount,
} from "./helpers";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const sendEmailMetadataSchema = z.object({
  from: z.string(),
  to: z.email(),
  subject: z.string(),
  body: z.string(),
});

export async function sendEmail(metadata: Record<string, unknown>) {
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
  return { threadId: response.threadId };
}
