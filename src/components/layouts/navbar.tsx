import { ModeToggle } from '@/components/mode-toggle';
import { UserNav } from '@/components/layouts/user-nav';
import { SheetMenu } from '@/components/layouts/sheet-menu';
import { cn } from '@/lib/utils';

interface NavbarProps {
  title: string;
  className?: string;
}

export function Navbar({ title, className }: NavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <SheetMenu />
            <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-none">
              {title}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle />
            <UserNav />
          </div>
        </nav>
      </div>
    </header>
  );
}
