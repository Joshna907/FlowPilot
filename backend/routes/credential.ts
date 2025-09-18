import express from "express";
import assert from "assert";
import { prisma } from "../utils/db";
import z from "zod";
import { CredentialType } from "../generated/prisma";
import { ErrorMessage } from "../utils/errorMessage";

export const router = express.Router();

const getUserCredentialsInputSchema = z
  .object({
    filter: z
      .object({
        credentialType: z.enum(Object.values(CredentialType)).optional(),
      })
      .partial(),
  })
  .partial();

router.post("/list", async (req, res) => {
  assert(req.user);
  const { data, success } = getUserCredentialsInputSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const credentials = await prisma.credential.findMany({
    where: {
      userId: req.user.id,
      ...(data.filter?.credentialType && {
        credentialType: data.filter.credentialType,
      }),
    },
  });
  return res.json({
    success: true,
    data: { credentials },
  });
});
