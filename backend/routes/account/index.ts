import express from "express";
import { ProviderType } from "../../generated/prisma";
import { prisma } from "../../utils/db";
import assert from "assert";

export const router = express.Router();

router.get("/gmail/list", async (req, res) => {
  assert(req.user);
  const accounts = await prisma.account.findMany({
    where: { userId: req.user.id, providerType: ProviderType.GOOGLE },
    select: { id: true },
  });
  return res.json({ success: true, data: { accounts } });
});

async function getAccountById(id: string) {
  const account = await prisma.account.findUnique({
    where: { id },
  });
  return account;
}

router.get("/:id", async (req, res) => {
  assert(req.user);
  const account = await getAccountById(req.params.id);
  return res.json({ success: true, account });
});
