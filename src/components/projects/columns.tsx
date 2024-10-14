'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

import { statuses } from './data/data';
import { formatDate } from '@/lib/utils/date';
import { DataTableColumnHeader } from '../data-table/data-table-column-header';

import { Project } from '@/types/project';
import { DataTableRowActions } from './data-table-row-actions';
const CHECKBOX_COLUMN_ID = 'select';
const MAX_TITLE_WIDTH = 500;

const createSelectColumn = (): ColumnDef<Project> => ({
  id: CHECKBOX_COLUMN_ID,
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-[2px]"
    />
  ),
  cell: ({ row }) => (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
});

const createTitleColumn = (): ColumnDef<Project> => ({
  accessorKey: 'title',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Title" />
  ),
  cell: ({ row }) => (
    <div className="flex space-x-2">
      <span className={`max-w-[${MAX_TITLE_WIDTH}px] truncate font-medium`}>
        {row.getValue('title')}
      </span>
    </div>
  ),
});

const createDueDateColumn = (): ColumnDef<Project> => ({
  accessorKey: 'endDate',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="End date" />
  ),
  cell: ({ row }) => <div>{formatDate(row.getValue('endDate'))}</div>,
});

const createStatusColumn = (): ColumnDef<Project> => ({
  accessorKey: 'status',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Status" />
  ),
  cell: ({ row }) => {
    const status = statuses.find((s) => s.value === row.getValue('status'));
    if (!status) return null;
    return (
      <div className="flex w-[100px] items-center">
        {status.icon && (
          <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
        )}
        <span>{status.label}</span>
      </div>
    );
  },
  filterFn: (row, id, value) => value.includes(row.getValue(id)),
});

const createActionsColumn = (): ColumnDef<Project> => ({
  id: 'actions',
  cell: ({ row }) => (
    <div onClick={(e) => e.stopPropagation()}>
      <DataTableRowActions row={row} />
    </div>
  ),
});

export const columns: ColumnDef<Project>[] = [
  createSelectColumn(),
  createTitleColumn(),
  createDueDateColumn(),
  createStatusColumn(),
  createActionsColumn(),
];
