import express from "express";
import { prisma } from "../utils/db";
import { enqueueExecution } from "./execution";
import z from "zod";
import assert from "assert";
import { ErrorMessage } from "../utils/errorMessage";
import type { Prisma, PrismaClient } from "../generated/prisma";

export const router = express.Router();

export async function createWebhook({
  db = prisma,
  webhookId,
  workflowId,
}: {
  db?: PrismaClient | Prisma.TransactionClient;
  webhookId: string;
  workflowId: string;
}) {
  return await db.webhook.create({
    data: { id: webhookId, workflowId: workflowId },
  });
}

export async function deleteWebhook({
  db = prisma,
  webhookId,
}: {
  db?: PrismaClient | Prisma.TransactionClient;
  webhookId: string;
}) {
  return await db.webhook.delete({ where: { id: webhookId } });
}

router.get("/:id", async (req, res) => {
  const webhookId = req.params.id;
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  });
  if (!webhook) {
    throw new Error("invalid webhook id");
  }
  const execution = await enqueueExecution(webhook.workflowId);

  if (!execution) {
    throw new Error("execution couldn't be queued");
  }
  return res.json({
    success: true,
    data: `execution has been queued via webhoook ${webhookId}`,
  });
});

const createWebhookSchema = z.object({
  webhookId: z.string(),
  workflowId: z.string(),
});
router.get("/create", async (req, res) => {
  assert(req.user);
  const { data, success } = createWebhookSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const webhook = await prisma.$transaction(async (txn) => {
    await deleteWebhook({ db: txn, webhookId: data.webhookId });
    return await createWebhook({
      db: txn,
      webhookId: data.webhookId,
      workflowId: data.workflowId,
    });
  });

  return res.json({
    success: true,
    data: `a new webhook : ${webhook.id} as been created`,
  });
});

router.get("/delete/:id", async (req, res) => {
  assert(req.user);
  await deleteWebhook({ webhookId: req.params.id });
  return res.json({
    success: true,
    data: `webhook removed`,
  });
});
