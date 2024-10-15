'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';
import { cn } from '@/lib/utils';

import { Icons } from '../ui/icons';
import { Menu } from './menu';
import { SidebarToggle } from './sidebar-toggle';

export function Sidebar() {
  const { isOpen, toggle } = useSidebarToggle();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300',
        isOpen ? 'w-60' : 'w-[90px]'
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggle} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            'transition-transform ease-in-out duration-300 mb-1',
            isOpen ? 'translate-x-0' : 'translate-x-1'
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="w-6 h-6 mr-1 text-blue-600" />
            <h1
              className={cn(
                'font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300',
                isOpen
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-96 opacity-0 hidden'
              )}
            >
              Tasqar
            </h1>
          </Link>
        </Button>
        <Menu isOpen={isOpen} />
      </div>
    </aside>
  );
}
