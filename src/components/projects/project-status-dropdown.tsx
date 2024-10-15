import React from 'react';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ProjectStatus } from '@/types/project';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ProjectStatusDropdownProps {
  projectId: string;
  currentStatus: ProjectStatus;
}

export const ProjectStatusDropdown: React.FC<ProjectStatusDropdownProps> = ({
  currentStatus,
}) => {
  const { t } = useTranslation('project');

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    console.log(newStatus);
    // Implement status update logic here
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
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 px-3 py-2 rounded-full"
          >
            <motion.div
              className={`w-3 h-3 rounded-full ${getStatusColor(currentStatus)}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
            <span>{t(`status.${currentStatus}`)}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuRadioGroup
          value={currentStatus}
          onValueChange={(value: string) =>
            handleStatusChange(value as ProjectStatus)
          }
        >
          {Object.values(ProjectStatus).map((status) => (
            <DropdownMenuRadioItem
              key={status}
              value={status}
              className="flex items-center space-x-2 px-2 py-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100"
            >
              <motion.div
                className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
              <span>{t(`status.${status}`)}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
