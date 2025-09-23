import express from "express";
import assert from "assert";
import z from "zod";
import { CredentialType } from "../../generated/prisma";
import { ErrorMessage } from "../../utils/errorMessage";
import { prisma } from "../../utils/db";
import { credentialSchemaMap } from "./schema";

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

const createCredentialSchema = z.object({
  credentialType: z.enum(Object.values(CredentialType)),
  metadata: z.unknown(),
});

router.post("/create", async (req, res) => {
  assert(req.user);
  const { data, success, error } = createCredentialSchema.safeParse(req.body);
  if (!success || !data) {
    console.error(error);
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const metadataSchema = credentialSchemaMap[data.credentialType];
  const {
    data: parsedMetadata,
    success: isMetadataParsingSuccess,
    error: parsingMetadataError,
  } = metadataSchema.safeParse(data.metadata);

  if (!isMetadataParsingSuccess || !parsedMetadata) {
    console.error(parsingMetadataError);
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }

  const credential = await prisma.credential.create({
    data: {
      userId: req.user.id,
      credentialType: data.credentialType,
      metadata: parsedMetadata,
    },
  });
  if (!credential) {
    return res.status(500).json({
      success: false,
      error: "unable to create credential",
    });
  }
  return res.status(200).json({
    success: true,
    data: {
      credential,
    },
  });
});
