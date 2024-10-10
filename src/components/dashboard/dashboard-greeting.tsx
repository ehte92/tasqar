'use client';

import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DashboardGreeting() {
  const { data: session } = useSession();
  const currentDate = new Date();
  const firstName = session?.user?.name?.split(' ')[0] || 'User';

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Good {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm opacity-80 flex items-center">
            <CalendarIcon className="mr-2" />
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="hidden sm:block">
          <Avatar className="w-16 h-16 border-2 border-white">
            <AvatarImage
              src={session?.user?.image || undefined}
              alt={`${firstName}'s avatar`}
            />
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {firstName[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}
