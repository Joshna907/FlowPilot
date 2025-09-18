import { createClient } from "redis";

const Q_NAME = "executions";

async function run() {
  const client = createClient();
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();

  console.log(`listening to queue ${Q_NAME}`);

  while (true) {
    const result = await client.brPop(Q_NAME, 0);
    console.log({ result });
  }
}

run();

