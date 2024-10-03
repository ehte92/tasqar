'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import TaskItem from './task-item';
import CreateTaskForm from './create-task-form';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Error fetching tasks. Please try again later.');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  if (isLoading)
    return <div className="text-center py-4">Loading tasks...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task List</h1>
      <CreateTaskForm onTaskCreated={handleTaskCreated} />
      {error ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={fetchTasks}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">
            No tasks found. Create a new task to get started!
          </p>
        </div>
      ) : (
        <ul className="space-y-4 mt-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
