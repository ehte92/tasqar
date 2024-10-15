'use client';

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  refetch: () => void;
  isLoading: boolean;
}

export function DataTableViewOptions<TData>({
  table,
  refetch,
  isLoading,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation('common');

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`ml-auto hidden h-8 lg:flex mr-2 ${isLoading ? 'animate-pulse' : ''}`}
        onClick={handleRefresh}
        disabled={isLoading}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
            disabled={isLoading}
          >
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            {t('dataTable.view')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>{t('dataTable.toggleColumns')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide()
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {t(`dataTable.columns.${column.id}`)}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
