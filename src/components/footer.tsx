'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import React from 'react';

const footerLinks = [
  { title: 'Product', items: ['Features', 'Pricing', 'Integrations', 'FAQ'] },
  { title: 'Company', items: ['About', 'Blog', 'Careers', 'Contact'] },
];

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Tasqar
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Boost your team&apos;s productivity with our intuitive task
              management platform.
            </p>
          </div>

          {footerLinks.map(({ title, items }) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Tasqar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
