export type ColumnId = 'tasks' | 'projects' | 'collaborators';

export interface Column {
  id: string;
  title: string;
  type: 'tasks' | 'projects' | 'collaborators' | string;
  // ... other properties
}
