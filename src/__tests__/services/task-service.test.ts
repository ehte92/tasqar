import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '@/services/task-service';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import fetchMock from 'jest-fetch-mock';

describe('Task Service', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch tasks for a given user', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date('2023-12-31'),
          userId: 'user1',
          projectId: null,
          assigneeId: null,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          columnId: 'column1',
          content: 'Test Content',
        },
      ];

      fetchMock.mockResponseOnce(JSON.stringify(mockTasks));

      const result = await fetchTasks('user1');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tasks?userId=user1&assigneeId=user1'
      );
      expect(result).toEqual(mockTasks);
    });

    it('should throw an error if the fetch fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(fetchTasks('user1')).rejects.toThrow(
        'Failed to fetch tasks'
      );
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const newTask: Partial<Task> = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        userId: 'user1',
      };

      const createdTask: Task = {
        ...newTask,
        id: '2',
        createdAt: new Date(),
        updatedAt: new Date(),
        columnId: 'column1',
        content: '',
        dueDate: null,
        projectId: null,
        assigneeId: null,
      } as Task;

      fetchMock.mockResponseOnce(JSON.stringify(createdTask));

      const result = await createTask(newTask);

      expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          status: TaskStatus[newTask.status!],
          assigneeId: null,
        }),
      });
      expect(result).toEqual(createdTask);
    });

    it('should throw an error if the creation fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(
        createTask({ title: 'Test', userId: 'user1' })
      ).rejects.toThrow('Failed to create task');
    });
  });

  // Add more test cases for updateTask, deleteTask, and reorderTasks...
});
