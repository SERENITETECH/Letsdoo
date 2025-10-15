import { logger } from '../../config/logger.js';

export interface MailOptions {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, unknown>;
}

export async function sendMail(options: MailOptions) {
  logger.info({ options }, '📧 Mail simulé (pas d’envoi réel en développement)');
}
