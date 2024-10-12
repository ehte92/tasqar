'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { useEffect } from 'react';

const verifyEmail = async (token: string) => {
  const response = await fetch(`/api/auth/verify-email?token=${token}`);
  if (!response.ok) {
    throw new Error('Email verification failed');
  }
  return response.json();
};

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ['verifyEmail', token],
    queryFn: () =>
      token ? verifyEmail(token) : Promise.reject('No token provided'),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setTimeout(() => router.push('/login'), 5000);
    }
  }, [data, router]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { delay: 0.2, type: 'spring', stiffness: 200 },
    },
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">
              Email Verification
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {isLoading
                ? 'Verifying your email...'
                : 'Thank you for verifying your email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <motion.div variants={iconVariants}>
              {isLoading && (
                <Icons.spinner className="h-16 w-16 text-blue-500 animate-spin" />
              )}
              {isSuccess && (
                <Icons.check className="h-16 w-16 text-green-500" />
              )}
              {isError && (
                <Icons.alertCircle className="h-16 w-16 text-red-500" />
              )}
            </motion.div>

            {isSuccess && (
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600 mb-2">
                  Email Verified Successfully!
                </p>
                <p className="text-gray-600">
                  You will be redirected to the login page shortly.
                </p>
              </div>
            )}

            {isError && (
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600 mb-2">
                  Email Verification Failed
                </p>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error
                    ? error.message
                    : 'There was an error verifying your email. Please try again or contact support.'}
                </p>
                <Button asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            )}

            {!isLoading && (
              <Button asChild variant="outline" className="mt-4">
                <Link href="/login">Go to Login</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
