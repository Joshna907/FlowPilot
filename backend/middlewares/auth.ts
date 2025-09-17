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
    id: "41a79d18-9a24-40ab-989e-d70483af84e1",
    role: "",
  };
  next();
}
