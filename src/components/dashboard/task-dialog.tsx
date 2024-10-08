import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import {
  CalendarIcon,
  Lock,
  Globe,
  X,
  ThumbsUp,
  Paperclip,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  ClipboardList,
  Tags,
  Zap,
  ArrowUpDown,
  Copy,
  Printer,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface TaskDialogProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskDialog({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: TaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: keyof Task) => (value: string) => {
    setEditedTask({ ...editedTask, [name]: value });
  };

  const handleDueDateChange = (date: Date | undefined) => {
    const updatedTask = { ...editedTask, dueDate: date || null };
    setEditedTask(updatedTask);
    onUpdateTask(updatedTask);
    // Don't close the calendar popover here
  };

  const clearDueDate = () => {
    const updatedTask = { ...editedTask, dueDate: null };
    setEditedTask(updatedTask);
    onUpdateTask(updatedTask);
    setIsCalendarOpen(false); // Close the popover after clearing the date
  };

  const handleSubmit = () => {
    onUpdateTask(editedTask);
    onClose();
  };

  const handleDeleteTask = () => {
    setIsDeleting(true);
  };

  const confirmDeleteTask = () => {
    onDeleteTask(task.id);
    onClose();
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" hideCloseButton>
        {isDeleting ? (
          <div className="space-y-4">
            <div className="bg-red-100 p-4 rounded-md">
              <h2 className="text-lg font-semibold text-red-800">
                This task is deleted.
              </h2>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDelete}>
                Undelete
              </Button>
              <Button variant="destructive" onClick={confirmDeleteTask}>
                Delete permanently
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" className="text-sm">
                <Checkbox
                  checked={editedTask.status === TaskStatus.DONE}
                  onCheckedChange={(checked) =>
                    setEditedTask({
                      ...editedTask,
                      status: checked ? TaskStatus.DONE : TaskStatus.TODO,
                    })
                  }
                  className="mr-2 h-4 w-4"
                />
                Mark complete
              </Button>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon">
                  <ThumbsUp size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageSquare size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <ExternalLink size={20} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Add to projects</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Tags className="mr-2 h-4 w-4" />
                      <span>Add tags</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Zap className="mr-2 h-4 w-4" />
                      <span>Create follow-up task</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <span>Merge duplicate tasks</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplicate task</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="mr-2 h-4 w-4" />
                      <span>Print</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={handleDeleteTask}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete task</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={20} />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              {isPrivate ? <Lock size={16} /> : <Globe size={16} />}
              <span className="text-sm text-muted-foreground">
                This task is {isPrivate ? 'private to you' : 'public'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPrivate(!isPrivate)}
                className="ml-auto"
              >
                Make {isPrivate ? 'public' : 'private'}
              </Button>
            </div>
            <div className="space-y-6">
              <Input
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                placeholder="Task name"
                className="text-2xl font-semibold border-none px-0 focus-visible:ring-0"
              />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Assignee</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{session?.user?.name}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X size={16} />
                  </Button>
                  <Select defaultValue="recently">
                    <SelectTrigger className="w-[140px] h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recently">
                        Recently assigned
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Due date</span>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[200px] justify-start text-left font-normal"
                        onClick={() => setIsCalendarOpen(true)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dueDate ? (
                          format(new Date(editedTask.dueDate), 'PPP')
                        ) : (
                          <span>No due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          editedTask.dueDate
                            ? new Date(editedTask.dueDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          handleDueDateChange(date);
                          // Don't close the popover here
                        }}
                        initialFocus
                      />
                      <div className="p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearDueDate}
                        >
                          Clear due date
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {editedTask.dueDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearDueDate}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-sm font-medium">Projects</span>
                  <Select
                    onValueChange={handleSelectChange('projectId')}
                    defaultValue={editedTask.projectId || ''}
                  >
                    <SelectTrigger className="w-[140px] h-7 text-xs">
                      <SelectValue placeholder="Add to projects" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add project options here */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Description</span>
                <Textarea
                  name="description"
                  value={editedTask.description || ''}
                  onChange={handleChange}
                  placeholder="What is this task about?"
                  className="min-h-[100px] focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" size="sm">
                + Add subtask
              </Button>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Comments</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  All activity
                </Button>
              </div>
              <div className="flex items-start space-x-2">
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Add a comment"
                  className="min-h-[80px] focus-visible:ring-0"
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
