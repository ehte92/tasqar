'use client';

import React from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart, CheckSquare, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Icons = {
  tasks: CheckSquare,
  users: UserPlus,
  barChart: BarChart,
  arrowRight: ArrowRight,
};

export default function Home() {
  const { t } = useTranslation('landing');

  const features = [
    {
      title: t('features.taskManagement.title'),
      description: t('features.taskManagement.description'),
      icon: Icons.tasks,
    },
    {
      title: t('features.teamCollaboration.title'),
      description: t('features.teamCollaboration.description'),
      icon: Icons.users,
    },
    {
      title: t('features.analyticsInsights.title'),
      description: t('features.analyticsInsights.description'),
      icon: Icons.barChart,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center items-center relative z-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          {t('welcome')}{' '}
          <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            {t('appName')}
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          {t('description')}
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/register" className="flex items-center">
              {t('getStarted')} <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">{t('login')}</Link>
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  {React.createElement(feature.icon, {
                    className: 'h-8 w-8 text-blue-600',
                  })}
                  <span>{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full max-w-4xl bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
        <p className="text-lg mb-6">{t('cta.description')}</p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/register">{t('cta.button')}</Link>
        </Button>
      </motion.div>
    </div>
  );
}
