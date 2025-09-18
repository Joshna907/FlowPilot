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
    id: "a190d173-2d10-49a6-8f9d-3441fc4966c2",
    role: "",
  };
  next();
}
