import { logger } from '../utils/logger';

export interface SendMailInput {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export class MailService {
  public static async sendMail(input: SendMailInput): Promise<boolean> {
    logger.info(`✉️ [MailService Abstract] Sending email to ${input.to} | Subject: "${input.subject}"`);
    if (process.env.NODE_ENV === 'development') {
      logger.info(`📧 Email Body Preview:\n${input.body}`);
    }
    return true;
  }

  public static async sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: 'MarketLink Password Reset Request',
      body: `Hello,\n\nYou requested a password reset for your MarketLink account. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.`,
    });
  }

  public static async sendEmailVerificationLink(to: string, verifyUrl: string): Promise<boolean> {
    return this.sendMail({
      to,
      subject: 'MarketLink - Verify Your Email Address',
      body: `Welcome to MarketLink!\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThank you for joining the eGreen Basket initiative.`,
    });
  }
}
