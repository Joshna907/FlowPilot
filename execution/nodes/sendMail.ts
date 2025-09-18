import nodemailer from "nodemailer";

export async function sendEmail(): Promise<{ messageId: string }> {
  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw "No Gmail Credentials found";
  }
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: GMAIL_USER,
    to: GMAIL_USER,
    subject: "n8n test",
    text: "n8n test",
  });

  console.log("mail sent successfully", info);
  return { messageId: info.messageId };
}
