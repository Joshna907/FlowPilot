import express from "express";
import { authRouter, executionRouter, workflowRouter } from "./routes";
import { authMiddleware } from "./middlewares/auth";
import { errorHandler } from "./middlewares/error";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", authRouter);
// routers above won't run auth middleware
app.use(authMiddleware);

app.use("/workflow", workflowRouter);
app.use("/execution", executionRouter);

app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
