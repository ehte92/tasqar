import nodemailer from 'nodemailer';

import { CustomError } from '@/lib/custom-error';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // Assuming you're using Gmail since you have EMAIL_USER and EMAIL_PASS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({
  to,
  subject,
  text,
  html,
}: EmailOptions): Promise<void> {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.EMAIL_FROM
  ) {
    throw new CustomError('Email configuration is incomplete', 500);
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new CustomError('Failed to send email', 500);
  }
}

function generateInvitationEmailContent(
  inviteeEmail: string,
  inviterName: string,
  invitationLink: string
): { text: string; html: string } {
  const text = `
    Hello,

    You've been invited to join Tasqar by ${inviterName}.
    Click the link below to accept the invitation:
    ${invitationLink}

    If you didn't expect this invitation, please ignore this email.

    Best regards,
    The Tasqar Team
  `;

  const html = `
    <html>
      <body>
        <h2>You've Been Invited to Tasqar!</h2>
        <p>Hello,</p>
        <p>You've been invited to join Tasqar by ${inviterName}.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
          Accept Invitation
        </a>
        <p>If you didn't expect this invitation, please ignore this email.</p>
        <p>Best regards,<br>The Tasqar Team</p>
      </body>
    </html>
  `;

  return { text, html };
}

export async function sendInvitationEmail(
  inviteeEmail: string,
  inviterName: string,
  invitationToken: string
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new CustomError('APP_URL is not configured', 500);
  }

  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${encodeURIComponent(invitationToken)}`;
  const { text, html } = generateInvitationEmailContent(
    inviteeEmail,
    inviterName,
    invitationLink
  );

  await sendEmail({
    to: inviteeEmail,
    subject: `You've been invited to join Tasqar`,
    text,
    html,
  });
}

export const emailService = {
  sendInvitationEmail,
};
