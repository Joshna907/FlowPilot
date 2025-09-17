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
    id: "b242aecc-0e6c-46d7-ae3b-6da1708fa6e1",
    role: "",
  };
  next();
}
