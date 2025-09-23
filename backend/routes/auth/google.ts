import { OAuth2Client } from "google-auth-library";
import { ProviderType } from "../../generated/prisma";
import assert from "assert";
import { signJwtToken, type JwtPayload } from "../../middlewares/auth";
import express from "express";
import { prisma } from "../../utils/db";
import jwt from "jsonwebtoken";

export const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL}/auth/google/callback`,
);

const SECRET = process.env.JWT_SECRET;

router.get("/init", (req, res) => {
  assert(req.user);

  const scopes = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.modify",
  ];

  const state = signJwtToken({ id: req.user.id, role: req.user.role });

  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state,
  });

  res.json({ url });
});

async function createUserAccount({
  userId,
  providerType,
  providerAccountId,
  refreshToken,
  accessToken,
  accessTokenExpires,
}: {
  userId: string;
  providerType: ProviderType;
  providerAccountId: string;
  refreshToken: string | undefined;
  accessToken: string | undefined;
  accessTokenExpires: Date;
}) {
  const account = await prisma.account.create({
    data: {
      userId,
      providerType,
      providerAccountId,
      refreshToken,
      accessToken,
      accessTokenExpires,
    },
  });
  return account;
}

router.get("/callback", async (req, res) => {
  try {
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");

    const { tokens } = await client.getToken((code as string) ?? "");
    if (!tokens.id_token)
      throw new Error("id_token missing (request openid scope)");

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    assert(SECRET);
    const statePayload = jwt.verify(state, SECRET) as JwtPayload;

    const payload = ticket.getPayload();

    const providerAccountId = payload?.sub;
    // const email = payload?.email ?? null;
    // const name = payload?.name ?? null;
    // const picture = payload?.picture ?? null;
    const accessToken = tokens.access_token ?? undefined;
    const refreshToken = tokens.refresh_token ?? undefined;
    const accessTokenExpires = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 1000);

    if (!providerAccountId) {
      throw new Error("providerAccountId missing");
    }
    if (statePayload.id) {
      await createUserAccount({
        userId: statePayload.id,
        providerType: ProviderType.GOOGLE,
        providerAccountId,
        refreshToken,
        accessToken,
        accessTokenExpires,
      });
    } else {
      // create a new user
    }
    res.redirect(process.env.CLIENT_URL ?? "http://localhost:3000");
  } catch (err) {
    console.error(err);
    res.status(500).send("Auth failed");
  }
});
