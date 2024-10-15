'use client';

import { useState } from 'react';

import { MenuIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Menu } from './menu';

export function SheetMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="h-8 lg:hidden"
          variant="outline"
          size="icon"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-[280px] sm:w-[320px] px-4 py-6 flex flex-col"
        side="left"
      >
        <SheetHeader className="mb-4">
          <SheetClose asChild>
            <Button
              variant="link"
              className="flex items-center gap-2 px-0"
              asChild
            >
              <Link href="/dashboard">
                <Icons.logo className="h-6 w-6" aria-hidden="true" />
                <SheetTitle className="font-bold text-lg">Tasqar</SheetTitle>
              </Link>
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-grow">
          <Menu isOpen={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
