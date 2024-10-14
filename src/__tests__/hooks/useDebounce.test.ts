import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce the value after the specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Initial value should be set immediately
    expect(result.current).toBe('initial');

    // Change the value
    act(() => {
      rerender({ value: 'updated', delay: 500 });
    });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 250ms
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still not have changed
    expect(result.current).toBe('initial');

    // Fast-forward time to 500ms
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous debounce when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Change the value multiple times rapidly
    act(() => {
      rerender({ value: 'change1', delay: 500 });
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      rerender({ value: 'change2', delay: 500 });
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    act(() => {
      rerender({ value: 'final', delay: 500 });
    });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast-forward time to 500ms after the last change
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now the value should be the final change
    expect(result.current).toBe('final');
  });
});
