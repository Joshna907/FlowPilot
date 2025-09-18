import { createClient } from "redis";
import { prisma } from "../backend/utils/db";
import { z } from "zod";
import { ExecutionManager } from "./execution";

const Q_NAME = "executions";

async function run() {
  const client = createClient();
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();

  console.log(`listening to queue ${Q_NAME}`);

  while (true) {
    const result = await client.brPop(Q_NAME, 0);
    if (result) {
      const element = JSON.parse(result.element);
      const { data, success } = z
        .object({ executionId: z.string() })
        .safeParse(element);

      if (!success) {
        console.error("unable to parse execution id");
        continue;
      }
      const execution = await prisma.execution.findUnique({
        where: { id: data.executionId },
        include: {
          workflow: {
            include: {
              nodes: {
                include: {
                  outgoingEdges: true,
                  incomingEdges: true,
                },
              },
              edges: true,
            },
          },
        },
      });
      if (!execution) {
        console.error(
          `no execution with the given id ${data.executionId} found`,
        );
        continue;
      }
      const executionManager = new ExecutionManager(
        execution.workflow,
        execution.id,
      );
      await executionManager.intializeExecution();
      await executionManager.execute();
    }
  }
}

run();
