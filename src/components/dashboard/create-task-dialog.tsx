import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Task, TaskStatus } from '@/types/task';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Partial<Task>) => void;
  initialData: Partial<Task>;
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  initialData,
}: CreateTaskDialogProps) {
  const [taskDetails, setTaskDetails] = useState<Partial<Task>>(initialData);
  const { data: session } = useSession();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTaskDetails({ ...taskDetails, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setTaskDetails({ ...taskDetails, [name]: value });
  };

  const handleSubmit = () => {
    onCreateTask(taskDetails);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{taskDetails.title || 'New Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={taskDetails.status === TaskStatus.DONE}
              onCheckedChange={(checked) =>
                setTaskDetails({
                  ...taskDetails,
                  status: checked ? TaskStatus.DONE : TaskStatus.TODO,
                })
              }
            />
            <label
              htmlFor="mark-complete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark complete
            </label>
          </div>
          <Input
            name="title"
            value={taskDetails.title || ''}
            onChange={handleChange}
            placeholder="Task name"
          />
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <Select
              onValueChange={handleSelectChange('assignee')}
              defaultValue={session?.user?.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={session?.user?.id || ''}>
                  {session?.user?.name}
                </SelectItem>
                {/* Add more users here */}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            name="dueDate"
            value={taskDetails.dueDate?.toString().split('T')[0] || ''}
            onChange={handleChange}
            placeholder="Due date"
          />
          <Select
            onValueChange={handleSelectChange('project')}
            defaultValue={taskDetails.projectId ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add to project" />
            </SelectTrigger>
            <SelectContent>{/* Add project options here */}</SelectContent>
          </Select>
          <Textarea
            name="description"
            value={taskDetails.description || ''}
            onChange={handleChange}
            placeholder="What is this task about?"
          />
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
