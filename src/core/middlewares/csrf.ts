import csurf from 'csurf';

export const csrfProtection = csurf({ cookie: false });

export function attachCsrfToken(req: any, res: any, next: any) {
  if (typeof req.csrfToken === 'function') {
    try {
      const token = req.csrfToken();
      res.setHeader('X-CSRF-Token', token);
      res.locals.csrfToken = token;
    } catch (error) {
      // ignore token generation errors for safe methods
    }
  }
  next();
}
