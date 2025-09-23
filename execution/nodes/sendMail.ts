import nodemailer from "nodemailer";
import z from "zod";
import { prisma } from "../../backend/utils/db";

export const sendEmailMetadataSchema = z.object({
  from: z.string(),
  to: z.email(),
  subject: z.string(),
  body: z.string(),
});

const emailCredentialsMetadata = z.object({
  GMAIL_USER: z.email(),
  GMAIL_APP_PASSWORD: z.string(),
});

async function getEmailCredential(credentialId: string) {
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  });
  if (!credential) {
    throw "unable to get email credentials";
  }
  const { success, data } = emailCredentialsMetadata.safeParse(
    credential.metadata,
  );
  if (!success) {
    throw "unable to parse email credential";
  }
  return data;
}

async function send(){
}

export async function sendEmail(
  metadata: Record<string, unknown>,
): Promise<{ messageId: string }> {
  const { success, data } = sendEmailMetadataSchema.safeParse(metadata);
  if (!success) {
    throw "unable to parse email data";
  }
  const { from, to, subject, body } = data;
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = await getEmailCredential(from);

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw "No Gmail Credentials found";
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: GMAIL_USER,
    to,
    subject,
    text: body,
  });

  return { messageId: info.messageId };
}
