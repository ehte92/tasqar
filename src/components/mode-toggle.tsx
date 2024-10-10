'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDarkMode = theme === 'dark';
  const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-8 h-8 bg-background mr-2 relative"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
          >
            <SunIcon
              className={`w-[1.2rem] h-[1.2rem] transition-all duration-300 ${
                isDarkMode ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
              }`}
            />
            <MoonIcon
              className={`w-[1.2rem] h-[1.2rem] transition-all duration-300 absolute ${
                isDarkMode ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          Switch to {isDarkMode ? 'light' : 'dark'} theme
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
