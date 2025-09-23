import type { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import assert from "assert";

export type JwtPayload = {
  id: string;
  role: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
  }
}

const SECRET = process.env.JWT_SECRET;

export function signJwtToken(input: { id: string; role: string }) {
  assert(SECRET);
  return jwt.sign(input, SECRET);
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  req.user = {
    id: "d3cb659a-0846-4254-b414-0ce1b04b2d7d",
    role: "",
  };
  next();
}
