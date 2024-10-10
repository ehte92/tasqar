import Link from 'next/link';
import Image from 'next/image';
import { MenuIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu } from './menu';
import { Icons } from '../ui/icons';

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="lg:hidden h-8"
          variant="outline"
          size="icon"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[280px] sm:w-[320px] px-4 h-full flex flex-col"
        side="left"
      >
        <SheetHeader className="mb-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="w-6 h-6 mr-1 text-blue-600" />
            <SheetTitle className="font-bold text-xl">Tasqar</SheetTitle>
          </Link>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
