export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null; // Changed from string | null to Date | null
  createdAt: Date; // Changed from string to Date
  updatedAt: Date; // Changed from string to Date
  userId: string;
  projectId?: string | null;
  columnId: string;
  content: string;
  assigneeId?: string | null;
}
