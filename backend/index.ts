import express from "express";
import {
    accountsRouter,
  authRouter,
  credentialRouter,
  executionRouter,
  googleAuthRouter,
  webhookRouter,
  workflowRouter,
} from "./routes";
import { authMiddleware } from "./middlewares/auth";
import { errorHandler } from "./middlewares/error";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
// routers above won't run auth middleware
app.use(authMiddleware);

app.use("/auth/google", googleAuthRouter);
app.use("/workflow", workflowRouter);
app.use("/execution", executionRouter);
app.use("/credential", credentialRouter);
app.use("/webhook", webhookRouter);
app.use("/accounts", accountsRouter);

app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
