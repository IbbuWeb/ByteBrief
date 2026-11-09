import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
