'use client';

import { useEffect, useState } from 'react';

import HolyLoader from 'holy-loader';
import { useTheme } from 'next-themes';

export type NextLoaderProps = {
  showSpinner?: boolean;
};

export const NextLoader = ({ showSpinner = false }: NextLoaderProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const loaderColor =
    theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary))';

  return (
    <HolyLoader
      height={2}
      zIndex={99999}
      color={loaderColor}
      showSpinner={showSpinner}
    />
  );
};
