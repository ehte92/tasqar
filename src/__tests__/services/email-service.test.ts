import nodemailer from 'nodemailer';

import { CustomError } from '@/lib/custom-error';
import { emailService } from '@/services/email-service';

jest.mock('nodemailer');

describe('Email Service', () => {
  const mockTransporter = {
    sendMail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpassword';
    process.env.EMAIL_FROM = 'noreply@example.com';
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com';
  });

  describe('sendInvitationEmail', () => {
    it('should send an invitation email successfully', async () => {
      const inviteeEmail = 'invitee@example.com';
      const inviterName = 'John Doe';
      const invitationToken = 'abc123';

      await emailService.sendInvitationEmail(
        inviteeEmail,
        inviterName,
        invitationToken
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: inviteeEmail,
        subject: "You've been invited to join Tasqar",
        text: expect.stringContaining(inviterName),
        html: expect.stringContaining(inviterName),
      });
    });

    it('should throw a CustomError if email configuration is incomplete', async () => {
      delete process.env.EMAIL_USER;

      await expect(
        emailService.sendInvitationEmail('test@example.com', 'John', 'token')
      ).rejects.toThrow(
        new CustomError('Email configuration is incomplete', 500)
      );
    });

    it('should throw a CustomError if APP_URL is not configured', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;

      await expect(
        emailService.sendInvitationEmail('test@example.com', 'John', 'token')
      ).rejects.toThrow(new CustomError('APP_URL is not configured', 500));
    });

    it('should throw a CustomError if sending email fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        emailService.sendInvitationEmail('test@example.com', 'John', 'token')
      ).rejects.toThrow(new CustomError('Failed to send email', 500));
    });
  });
});
