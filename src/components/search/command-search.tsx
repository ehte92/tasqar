'use client';

import * as React from 'react';

import { Calendar, Loader2, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { useTaskSearch } from '@/hooks/use-task-search';

export function CommandSearch() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults, isLoading: isSearching } =
    useTaskSearch(debouncedQuery);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = React.useCallback(
    (taskId: string) => {
      setIsOpen(false);
      router.push(`/tasks`);
    },
    [router]
  );

  if (!session?.user?.id) {
    return null; // Don't render the search if there's no user logged in
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">{t('search.placeholder')}</span>
        <span className="sr-only">{t('search.label')}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder={t('search.placeholder')}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t('search.noResults')}</CommandEmpty>
          <CommandGroup heading={t('search.tasks')}>
            {isSearching ? (
              <CommandItem disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('search.loading')}
              </CommandItem>
            ) : (
              searchResults?.map((task) => (
                <CommandItem
                  key={task.id}
                  value={task.title}
                  onSelect={() => handleSelect(task.id)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.title}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
