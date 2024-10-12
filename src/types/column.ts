export type ColumnId = 'tasks' | 'projects' | 'collaborators';

export interface Column {
  id: ColumnId;
  title: string;
}
