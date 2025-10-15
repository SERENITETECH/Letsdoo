export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message = 'Ressource introuvable') => new HttpError(404, 'NOT_FOUND', message);
export const unauthorized = (message = 'Authentification requise') => new HttpError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'Accès refusé') => new HttpError(403, 'FORBIDDEN', message);
export const badRequest = (message = 'Requête invalide', details?: unknown) => new HttpError(400, 'BAD_REQUEST', message, details);
