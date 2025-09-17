import express from "express";
import { prisma } from "../utils/db";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { ErrorMessage } from "../utils/errorMessage";

const userSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const router = express.Router();

router.post("/signup", async (req, res) => {
  const { data, success } = userSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const existingUser = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUser) {
    return res.json({
      success: false,
      data: "found user with same username , please try another username",
    });
  }
  const createdUser = await prisma.user.create({
    data: {
      username: data.username,
      password: data.password,
    },
  });
  if (!createdUser.id) {
    return res.json({
      success: false,
      data: "failed to create new user",
    });
  }
  return res.json({
    success: true,
    data: "Created a new user",
  });
});
router.get("/signin", async (req, res) => {
  const { data, success } = userSchema.safeParse(req.body);
  if (!success) {
    return res
      .status(400)
      .json({ success: false, error: ErrorMessage.PARSING });
  }
  const user = await prisma.user.findUnique({
    where: { username: data.username },
    select: {
      id: true,
      username: true,
    },
  });
  if (!user) {
    return res.json({
      success: false,
      error: "the user with the given credentials doesn't exist",
    });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw "JWT_SECRET not found";
  }
  const token = jwt.sign({ user }, secret);
  return res.json({
    success: true,
    data: { token },
  });
});
