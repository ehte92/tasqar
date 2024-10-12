import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { UserNav } from '@/components/layouts/user-nav';
import { SheetMenu } from '@/components/layouts/sheet-menu';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-b dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <SheetMenu />
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">{title}</span>
            </Link>
          </div>

          <div className="flex-1 px-2 md:px-12 lg:max-w-2xl">
            <form className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full bg-background"
              />
            </form>
          </div>

          <div className="flex items-center space-x-4">
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
