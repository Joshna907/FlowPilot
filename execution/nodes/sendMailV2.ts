import { google } from "googleapis";

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
