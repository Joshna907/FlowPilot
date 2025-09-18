import { createClient, type RedisClientType } from "redis";

const Q_NAME = "executions";

export class RedisManager {
  private client: RedisClientType;
  private static instance: RedisManager;

  constructor() {
    this.client = createClient();
    this.client.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  public async pushExection(executionId: string) {
    const qLength = this.client.lPush(Q_NAME, JSON.stringify({ executionId }));
    return qLength;
  }
}
