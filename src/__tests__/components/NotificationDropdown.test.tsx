import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

import { NotificationDropdown } from '@/components/notifications/notification-dropdown';
import * as notificationService from '@/services/notification-service';

// Mock the next-auth/react module
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'user1' } },
    status: 'authenticated',
  })),
}));

// Mock the notification service
jest.mock('@/services/notification-service');

// Mock the NotificationListener component
jest.mock('@/components/notifications/notification-listener', () => ({
  NotificationListener: () => null,
}));

describe('NotificationDropdown', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'TASK_ASSIGNMENT',
      message: 'You have been assigned a new task',
      read: false,
      createdAt: new Date().toISOString(),
      relatedId: 'task1',
    },
    {
      id: '2',
      type: 'PROJECT_UPDATE',
      message: 'Project XYZ has been updated',
      read: true,
      createdAt: new Date().toISOString(),
      relatedId: 'project1',
    },
  ];

  beforeEach(() => {
    (notificationService.useNotifications as jest.Mock).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      error: null,
    });
  });

  const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NotificationDropdown />
        </SessionProvider>
      </QueryClientProvider>
    );
  };

  it('renders the notification bell icon', () => {
    renderComponent();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the correct number of unread notifications', () => {
    renderComponent();
    const unreadBadge = screen.getByText('1');
    expect(unreadBadge).toBeInTheDocument();
  });

  it('opens the dropdown when clicked', async () => {
    renderComponent();
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(
        screen.getByText('You have been assigned a new task')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Project XYZ has been updated')
      ).toBeInTheDocument();
    });
  });

  it('displays "Mark all as read" button when there are unread notifications', async () => {
    renderComponent();
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText('Mark all as read')).toBeInTheDocument();
    });
  });

  it('does not display "Mark all as read" button when all notifications are read', async () => {
    (notificationService.useNotifications as jest.Mock).mockReturnValue({
      data: mockNotifications.map((n) => ({ ...n, read: true })),
      isLoading: false,
      error: null,
    });

    renderComponent();
    const bellIcon = screen.getByRole('button');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
    });
  });

  // Add more tests as needed for other functionalities
});
