export interface Notification {
  id: string;
  type:
    | 'CONNECTION_REQUEST'
    | 'TASK_ASSIGNMENT'
    | 'PROJECT_UPDATE'
    | 'TASK_DUE_SOON'
    | 'TASK_OVERDUE';
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}
