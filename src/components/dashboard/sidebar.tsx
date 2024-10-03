'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center flex-shrink-0 px-4">
          <Link href="/dashboard" className="flex items-center">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
              Tasqar
            </span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3 mt-6">
          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className={cn(
                  'w-full justify-start',
                  pathname === item.href
                    ? 'bg-gray-100 dark:bg-gray-700 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <Link href={item.href} className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
