import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(authenticated)/dashboard/page';

// Mock the dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: any[]) => {
    const mockComponent = () => <div>Mocked Component</div>;
    mockComponent.displayName = args[0].displayName;
    return mockComponent;
  },
}));

// Mock the ContentLayout component
jest.mock('@/components/layouts/content-layout', () => ({
  ContentLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-layout">{children}</div>
  ),
}));

describe('DashboardPage', () => {
  it('renders the dashboard page with correct layout and components', () => {
    render(<DashboardPage />);

    // Check if ContentLayout is rendered
    expect(screen.getByTestId('content-layout')).toBeInTheDocument();

    // Check if the main container is rendered
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8');

    // Check if all sections are rendered
    const sections = screen.getAllByRole('region');
    expect(sections).toHaveLength(3);

    // Check if DashboardGreeting is rendered
    expect(screen.getByText('Mocked Component')).toBeInTheDocument();

    // Check if TaskStats is rendered
    expect(screen.getByText('Mocked Component')).toBeInTheDocument();

    // Check if KanbanBoard is rendered
    expect(screen.getByText('Mocked Component')).toBeInTheDocument();
  });
});
