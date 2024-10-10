'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

const Header = () => (
  <motion.header
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative z-50"
  >
    <div className="container mx-auto px-4 py-3">
      <div className="flex justify-between items-center">
        <Logo />
        <AuthButtons />
      </div>
    </div>
  </motion.header>
);

const Logo = () => (
  <Link href="/" className="flex items-center space-x-2">
    <Icons.logo className="h-8 w-8 text-blue-600" />
    <span className="text-xl font-bold text-gray-900 dark:text-white">
      Tasqar
    </span>
  </Link>
);

const AuthButtons = () => (
  <div className="flex items-center space-x-4">
    <Button asChild variant="ghost">
      <Link href="/login">Login</Link>
    </Button>
    <Button asChild>
      <Link href="/register">Get Started</Link>
    </Button>
  </div>
);

export default Header;
