import type { NextFunction, Response, Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
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
