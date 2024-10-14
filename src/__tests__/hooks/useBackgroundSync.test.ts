import { renderHook, act } from '@testing-library/react-hooks';
import { useBackgroundSync } from '@/hooks/use-background-sync';
import { useQueryClient } from '@tanstack/react-query';

// Mock the useQueryClient hook
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

describe('useBackgroundSync', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should set up an interval and invalidate queries', () => {
    const mockInvalidateQueries = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });

    const queryKey = ['testQuery'];
    const interval = 5000;

    renderHook(() => useBackgroundSync(queryKey, interval));

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(
      expect.any(Function),
      interval
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(interval);
    });

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });

    // Fast-forward time again
    act(() => {
      jest.advanceTimersByTime(interval);
    });

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
  });

  it('should clear the interval on unmount', () => {
    const { unmount } = renderHook(() =>
      useBackgroundSync(['testQuery'], 5000)
    );

    unmount();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });
});
