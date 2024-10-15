import Link from 'next/link';

import LanguageSwitcher from '@/components/language-switcher';
import { SheetMenu } from '@/components/layouts/sheet-menu';
import { UserNav } from '@/components/layouts/user-nav';
import { ModeToggle } from '@/components/mode-toggle';
import { CommandSearch } from '@/components/search/command-search';

import { NotificationDropdown } from '../notifications/notification-dropdown';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Menu and Title */}
          <div className="flex items-center space-x-4">
            <SheetMenu />
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">{title}</span>
            </Link>
          </div>

          {/* Center: Command Search */}
          <div className="flex-1 px-2 md:px-12 lg:max-w-2xl">
            <CommandSearch />
          </div>

          {/* Right side: Action items */}
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            <LanguageSwitcher />
            <ModeToggle />
            <div className="hidden sm:block">
              <UserNav />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
