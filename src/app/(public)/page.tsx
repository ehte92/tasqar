'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, UserPlus, BarChart, ArrowRight } from 'lucide-react';
import React from 'react';

const Icons = {
  tasks: CheckSquare,
  users: UserPlus,
  barChart: BarChart,
  arrowRight: ArrowRight,
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center items-center relative z-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Welcome to{' '}
          <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Tasqar
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Collaborate on tasks efficiently and boost your team&apos;s
          productivity with our intuitive task management platform.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/register" className="flex items-center">
              Get Started <Icons.arrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Login</Link>
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
        <h2 className="text-3xl font-bold mb-4">
          Ready to boost your productivity?
        </h2>
        <p className="text-lg mb-6">
          Join thousands of teams already using Tasqar to streamline their
          workflow.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/register">Start Your Free Trial</Link>
        </Button>
      </motion.div>
    </div>
  );
}

const features = [
  {
    title: 'Task Management',
    description:
      'Create, assign, and track tasks with ease. Stay organized and never miss a deadline.',
    icon: Icons.tasks,
  },
  {
    title: 'Team Collaboration',
    description:
      'Work together seamlessly with real-time updates and communication tools.',
    icon: Icons.users,
  },
  {
    title: 'Analytics & Insights',
    description:
      "Gain valuable insights into your team's performance and project progress.",
    icon: Icons.barChart,
  },
];
