import {
  CheckIcon,
  ClipboardIcon,
  PauseIcon,
  PlayIcon,
} from '@radix-ui/react-icons';

import { ProjectStatus } from '@/types/project';

export const statuses = [
  {
    value: ProjectStatus.PLANNED,
    label: 'Planned',
    icon: ClipboardIcon,
  },
  {
    value: ProjectStatus.ACTIVE,
    label: 'Active',
    icon: PlayIcon,
  },
  {
    value: ProjectStatus.COMPLETED,
    label: 'Completed',
    icon: CheckIcon,
  },
  {
    value: ProjectStatus.ON_HOLD,
    label: 'On Hold',
    icon: PauseIcon,
  },
];
