'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { Task } from '@/types/task';
import { priorities, statuses } from './data/data';
import { formatDate } from '@/lib/utils/date';

const CHECKBOX_COLUMN_ID = 'select';
const MAX_TITLE_WIDTH = 500;

const createSelectColumn = (): ColumnDef<Task> => ({
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
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  ),
  enableSorting: false,
  enableHiding: false,
});

const createTitleColumn = (): ColumnDef<Task> => ({
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

const createDueDateColumn = (): ColumnDef<Task> => ({
  accessorKey: 'dueDate',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Due date" />
  ),
  cell: ({ row }) => <div>{formatDate(row.getValue('dueDate'))}</div>,
});

const createStatusColumn = (): ColumnDef<Task> => ({
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

const createPriorityColumn = (): ColumnDef<Task> => ({
  accessorKey: 'priority',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Priority" />
  ),
  cell: ({ row }) => {
    const priority = priorities.find(
      (p) => p.value === row.getValue('priority')
    );
    if (!priority) return null;
    return (
      <div className="flex items-center">
        {priority.icon && (
          <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
        )}
        <span>{priority.label}</span>
      </div>
    );
  },
  filterFn: (row, id, value) => value.includes(row.getValue(id)),
});

const createActionsColumn = (): ColumnDef<Task> => ({
  id: 'actions',
  cell: ({ row }) => <DataTableRowActions row={row} />,
});

export const columns: ColumnDef<Task>[] = [
  createSelectColumn(),
  createTitleColumn(),
  createDueDateColumn(),
  createStatusColumn(),
  createPriorityColumn(),
  createActionsColumn(),
];
