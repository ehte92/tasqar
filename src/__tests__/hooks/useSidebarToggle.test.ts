import { act, renderHook } from '@testing-library/react-hooks';

import { useSidebarToggle } from '@/hooks/use-sidebar-toggle';

describe('useSidebarToggle', () => {
  beforeEach(() => {
    // Clear the persisted state before each test
    localStorage.removeItem('sidebar-toggle');
  });

  it('should initialize with isOpen as true', () => {
    const { result } = renderHook(() => useSidebarToggle());
    expect(result.current.isOpen).toBe(true);
  });

  it('should toggle isOpen state when toggle is called', () => {
    const { result } = renderHook(() => useSidebarToggle());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should persist the state across hook re-renders', () => {
    const { result, rerender } = renderHook(() => useSidebarToggle());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(false);

    // Re-render the hook
    rerender();

    // State should persist
    expect(result.current.isOpen).toBe(false);
  });
});
