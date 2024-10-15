'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { verifyEmail } from '@/lib/api/auth';

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

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  const token = searchParams.get('token');

  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ['verifyEmail', token],
    queryFn: () =>
      token
        ? verifyEmail(token)
        : Promise.reject(new Error(t('verifyEmail.noToken'))),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => router.push('/login'), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

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
              {t('verifyEmail.title')}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {isLoading
                ? t('verifyEmail.verifying')
                : t('verifyEmail.thankYou')}
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
                  {t('verifyEmail.success')}
                </p>
                <p className="text-gray-600">{t('verifyEmail.redirecting')}</p>
              </div>
            )}

            {isError && (
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600 mb-2">
                  {t('verifyEmail.error')}
                </p>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error
                    ? error.message
                    : t('verifyEmail.genericError')}
                </p>
                <Button asChild>
                  <Link href="/support">{t('verifyEmail.contactSupport')}</Link>
                </Button>
              </div>
            )}

            {!isLoading && (
              <Button asChild variant="outline" className="mt-4">
                <Link href="/login">{t('verifyEmail.goToLogin')}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
