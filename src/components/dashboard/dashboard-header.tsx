'use client';

import { useSession } from 'next-auth/react';

export function DashboardHeader() {
  const { data: session } = useSession();

  return (
    <div className="pb-5 border-b border-gray-200 dark:border-gray-700 sm:flex sm:items-center sm:justify-between">
      <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
        Welcome back, {session?.user?.name || 'User'}!
      </h3>
      <div className="mt-3 sm:mt-0 sm:ml-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Task
        </button>
      </div>
    </div>
  );
}
