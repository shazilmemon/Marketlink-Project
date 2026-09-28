import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let metaStr = '';
    if (meta) {
      // Ensure passwords or secrets are never printed in logs
      const sanitizedMeta = { ...meta };
      delete sanitizedMeta.password;
      delete sanitizedMeta.passwordHash;
      delete sanitizedMeta.token;
      delete sanitizedMeta.secret;
      metaStr = ` | ${JSON.stringify(sanitizedMeta)}`;
    }
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
  }

  public info(message: string, meta?: any) {
    console.log(this.formatMessage('info', message, meta));
  }

  public warn(message: string, meta?: any) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  public error(message: string, meta?: any) {
    console.error(this.formatMessage('error', message, meta));
  }

  public debug(message: string, meta?: any) {
    if (env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
