import {
  CircleIcon,
  StopwatchIcon,
  CheckCircledIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  ArrowDownIcon,
} from '@radix-ui/react-icons';

import { TaskStatus, TaskPriority } from '@/types/task';

export const statuses = [
  {
    value: TaskStatus.TODO,
    label: 'Todo',
    icon: CircleIcon,
  },
  {
    value: TaskStatus.IN_PROGRESS,
    label: 'In Progress',
    icon: StopwatchIcon,
  },
  {
    value: TaskStatus.DONE,
    label: 'Done',
    icon: CheckCircledIcon,
  },
];

export const priorities = [
  {
    value: TaskPriority.LOW,
    label: 'Low',
    icon: ArrowDownIcon,
  },
  {
    value: TaskPriority.MEDIUM,
    label: 'Medium',
    icon: ArrowRightIcon,
  },
  {
    value: TaskPriority.HIGH,
    label: 'High',
    icon: ArrowUpIcon,
  },
];
