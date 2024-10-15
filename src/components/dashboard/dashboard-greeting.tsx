'use client';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

type Greeting = 'morning' | 'afternoon' | 'evening';

const getGreeting = (): Greeting => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.6, 0.05, 0.01, 0.99],
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.99],
    },
  },
};

export default function DashboardGreeting() {
  const { t } = useTranslation('common');
  const { data: session } = useSession();
  const router = useRouter();
  const currentDate = new Date();
  const greeting = getGreeting();
  const firstName =
    session?.user?.name?.split(' ')[0] ?? t('dashboard.greeting.defaultUser');

  return (
    <motion.div
      className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg p-8 shadow-lg overflow-hidden relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-white opacity-10"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      />
      <motion.div
        className="flex items-center justify-between mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-6 h-6" />
          <p className="text-sm font-medium">
            {t('dashboard.greeting.date', { date: currentDate })}
          </p>
        </div>
        <motion.div
          className="text-xs font-semibold px-3 py-1.5 bg-white bg-opacity-20 rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('dashboard.greeting.year', { year: format(currentDate, 'yyyy') })}
        </motion.div>
      </motion.div>
      <motion.h1
        className="text-5xl font-bold mb-3 leading-tight"
        variants={itemVariants}
      >
        {t(`dashboard.greeting.${greeting}`)} {firstName}
      </motion.h1>
      <motion.p
        className="text-3xl font-semibold text-blue-100"
        variants={itemVariants}
      >
        {firstName}
      </motion.p>
      <motion.div className="mt-6 flex space-x-4" variants={itemVariants}>
        <motion.button
          className="px-4 py-2 bg-white text-purple-700 rounded-full font-semibold text-sm transition-colors hover:bg-opacity-90"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('dashboard.myTasks')}
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-transparent border border-white text-white rounded-full font-semibold text-sm transition-colors hover:bg-white hover:bg-opacity-10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/projects')}
        >
          {t('dashboard.projectOverview')}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
