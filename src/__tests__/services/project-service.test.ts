import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  fetchProjectById,
} from '@/services/project-service';
import { Project, ProjectStatus } from '@/types/project';
import fetchMock from 'jest-fetch-mock';

describe('Project Service', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('fetchProjects', () => {
    it('should fetch projects for a given user', async () => {
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'Test Project',
          description: 'Test Description',
          status: ProjectStatus.PLANNED,
          userId: 'user1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      fetchMock.mockResponseOnce(JSON.stringify(mockProjects));

      const result = await fetchProjects('user1');

      expect(fetchMock).toHaveBeenCalledWith('/api/projects?userId=user1');
      expect(result).toEqual(mockProjects);
    });

    it('should throw an error if the fetch fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(fetchProjects('user1')).rejects.toThrow(
        'Failed to fetch projects'
      );
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const newProject = {
        title: 'New Project',
        description: 'New Description',
        userId: 'user1',
      };

      const createdProject: Project = {
        ...newProject,
        id: '2',
        status: ProjectStatus.PLANNED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      fetchMock.mockResponseOnce(JSON.stringify(createdProject));

      const result = await createProject(newProject);

      expect(fetchMock).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProject,
          status: ProjectStatus.PLANNED,
        }),
      });
      expect(result).toEqual(createdProject);
    });

    it('should throw an error if the creation fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(
        createProject({ title: 'Test', userId: 'user1' })
      ).rejects.toThrow('Failed to create project. Please try again.');
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const projectId = '1';
      const updateData = {
        title: 'Updated Project',
        description: 'Updated Description',
      };

      const updatedProject: Project = {
        id: projectId,
        ...updateData,
        status: ProjectStatus.PLANNED,
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      fetchMock.mockResponseOnce(JSON.stringify(updatedProject));

      const result = await updateProject(projectId, updateData);

      expect(fetchMock).toHaveBeenCalledWith(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updatedProject);
    });

    it('should throw an error if the update fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(updateProject('1', { title: 'Test' })).rejects.toThrow(
        'Failed to update project'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const projectId = '1';

      fetchMock.mockResponseOnce(JSON.stringify({}));

      await deleteProject(projectId);

      expect(fetchMock).toHaveBeenCalledWith(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw an error if the deletion fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(deleteProject('1')).rejects.toThrow(
        'Failed to delete project'
      );
    });
  });

  describe('reorderProjects', () => {
    it('should reorder projects', async () => {
      const reorderData = {
        userId: 'user1',
        projectIds: ['1', '2', '3'],
      };

      fetchMock.mockResponseOnce(JSON.stringify({}));

      await reorderProjects(reorderData);

      expect(fetchMock).toHaveBeenCalledWith('/api/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData),
      });
    });

    it('should throw an error if the reordering fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(
        reorderProjects({ userId: 'user1', projectIds: ['1', '2'] })
      ).rejects.toThrow('Failed to reorder projects');
    });
  });

  describe('fetchProjectById', () => {
    it('should fetch a project by id', async () => {
      const projectId = '1';
      const mockProject: Project = {
        id: projectId,
        title: 'Test Project',
        description: 'Test Description',
        status: ProjectStatus.PLANNED,
        userId: 'user1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockProject));

      const result = await fetchProjectById(projectId);

      expect(fetchMock).toHaveBeenCalledWith(`/api/projects/${projectId}`);
      expect(result).toEqual(mockProject);
    });

    it('should throw an error if the project is not found', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ message: 'Project not found' }),
        { status: 404 }
      );

      await expect(fetchProjectById('1')).rejects.toThrow('Project not found');
    });

    it('should throw an error if the fetch fails', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));

      await expect(fetchProjectById('1')).rejects.toThrow(
        'Failed to fetch project'
      );
    });
  });
});
