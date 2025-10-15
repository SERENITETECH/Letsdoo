import { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger.js';

export function auditTrail(req: Request, _res: Response, next: NextFunction) {
  const userId = (req.session as any)?.user?.id;
  logger.info({
    userId: userId ?? 'anonymous',
    action: req.method + ' ' + req.path,
    ip: req.ip,
    ts: new Date().toISOString(),
  });
  next();
}
