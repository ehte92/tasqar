'use client';

import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { CalendarIcon } from '@radix-ui/react-icons';

type Greeting = 'morning' | 'afternoon' | 'evening';

const getGreeting = (): Greeting => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

export default function DashboardGreeting() {
  const { data: session } = useSession();
  const currentDate = new Date();
  const greeting = getGreeting();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'User';

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5" />
          <p className="text-sm font-medium">
            {format(currentDate, 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="text-xs font-semibold px-2 py-1 bg-white bg-opacity-20 rounded-full">
          {format(currentDate, 'yyyy')}
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-2">Good {greeting},</h1>
      <p className="text-2xl font-semibold text-blue-100">{firstName}</p>
    </div>
  );
}
