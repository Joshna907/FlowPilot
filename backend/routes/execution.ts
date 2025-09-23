import express from "express";
import assert from "assert";
import { prisma } from "../utils/db";
import { ExecutionStatus } from "../generated/prisma";
import { RedisManager } from "../utils/redis";
export const router = express.Router();

export async function enqueueExecution(workflowId: string) {
  const existingWorkflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });
  if (!existingWorkflow) {
    throw new Error("provided workflow Id doesn't exist");
  }
  const execution = await prisma.execution.create({
    data: {
      workflowId: existingWorkflow.id,
      status: ExecutionStatus.QUEUED,
    },
  });
  const redisManager = RedisManager.getInstance();
  const qLength = await redisManager.pushExection(execution.id);

  if (qLength <= 0) {
    throw new Error("error Queuing Exeution");
  }
  return execution;
}

router.post("/execute/:id", async (req, res) => {
  assert(req.user);
  const id = req.params.id;
  const execution = await enqueueExecution(id);
  if (!execution) {
    throw new Error("execution couldn't be queued");
  }
  return res.json({
    success: true,
    data: "execution has been queued",
  });
});
