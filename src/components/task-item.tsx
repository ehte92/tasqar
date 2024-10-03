import React, { useState } from 'react';
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, title: editedTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks?id=${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      onTaskDeleted(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <li className="bg-white shadow rounded-lg p-4">
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      ) : (
        <h3 className="text-lg font-semibold">{task.title}</h3>
      )}
      <p className="text-gray-600">{task.description}</p>
      <p className="text-sm text-gray-500">Status: {task.status}</p>
      <div className="mt-2 space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
