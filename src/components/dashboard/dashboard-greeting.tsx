'use client';

import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

export function DashboardGreeting() {
  const { data: session } = useSession();
  const currentDate = new Date();

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {format(currentDate, 'EEEE, MMMM d')}
      </p>
      <h1 className="text-3xl font-bold mt-2">
        Good {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'User'}
      </h1>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
