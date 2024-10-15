import { useEffect, useState } from 'react';

import { StoreApi, UseBoundStore } from 'zustand';

type ExtractState<S> = S extends { getState: () => infer T } ? T : never;

export function useStore<S extends UseBoundStore<StoreApi<object>>, U>(
  store: S,
  selector: (state: ExtractState<S>) => U
): U | undefined {
  const [state, setState] = useState<U | undefined>(() => {
    try {
      return selector(store.getState() as ExtractState<S>);
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    const unsubscribe = store.subscribe((storeState) => {
      try {
        const newState = selector(storeState as ExtractState<S>);
        setState(newState as U);
      } catch {
        setState(undefined);
      }
    });

    return unsubscribe;
  }, [store, selector]);

  return state;
}
