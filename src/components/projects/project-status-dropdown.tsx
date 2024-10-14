import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';
import { ProjectStatus } from '@/types/project';

interface ProjectStatusDropdownProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export const ProjectStatusDropdown: React.FC<ProjectStatusDropdownProps> = ({
  projectId,
  currentStatus,
}) => {
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    console.log(newStatus);
  };

  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'PLANNED':
        return 'bg-yellow-500';
      case 'ON_HOLD':
        return 'bg-red-500';
      case 'COMPLETED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: ProjectStatus): string => {
    switch (status) {
      case 'ACTIVE':
        return 'On track';
      case 'PLANNED':
        return 'Planned';
      case 'ON_HOLD':
        return 'On hold';
      case 'COMPLETED':
        return 'Complete';
      default:
        return 'Set status';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 px-2 py-1"
        >
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(currentStatus)}`}
          />
          <span>{getStatusLabel(currentStatus)}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuRadioGroup
          value={currentStatus}
          onValueChange={(value: string) =>
            handleStatusChange(value as ProjectStatus)
          }
        >
          <DropdownMenuRadioItem
            value="ACTIVE"
            className="flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Active</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="PLANNED"
            className="flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Planned</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="ON_HOLD"
            className="flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>On hold</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="COMPLETED"
            className="flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Complete</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
