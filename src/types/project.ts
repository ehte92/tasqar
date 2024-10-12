import { Task } from './task';

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate?: string;
  tasks?: Array<Task>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
