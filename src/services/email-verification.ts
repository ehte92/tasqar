import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

import prisma from '@/lib/db';

export async function createVerificationToken(userId: string): Promise<string> {
  const token = uuidv4();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      verificationTokenExpires: expires,
    },
  });

  return token;
}

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
    // For example, using Gmail:
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
  });
}

export async function verifyEmail(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return true;
}
