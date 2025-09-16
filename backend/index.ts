import express from "express";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);

