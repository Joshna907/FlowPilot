import express from "express";
import assert from "assert";
import { prisma } from "../utils/db";
import { ExecutionStatus } from "../generated/prisma";
import { RedisManager } from "../utils/redis";
export const router = express.Router();

router.post("/execute/:id", async (req, res) => {
  assert(req.user);
  const id = req.params.id;

  const workflowExists = await prisma.workflow.findUnique({
    where: { id },
  });
  if (!workflowExists) {
    return res
      .json({
        success: false,
        error: "provided workflow Id doesn't exist",
      })
      .status(400);
  }
  const execution = await prisma.execution.create({
    data: {
      workflowId: id,
      status: ExecutionStatus.QUEUED,
    },
  });
  if (!execution) {
    return res
      .json({
        success: false,
        error: "coudn't create an execution",
      })
      .status(500);
  }

  const redisManager = RedisManager.getInstance();
  const qLength = await redisManager.pushExection(execution.id);

  if (qLength <= 0) {
    console.error("error queuing execution");
    return res.json({
      success: false,
      error: "error queuing execution",
    });
  }
  return res.json({
    success: true,
    data: "execution has been queued",
  });
});
