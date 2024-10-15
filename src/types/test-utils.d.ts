import { ReactElement } from 'react';

import { RenderOptions, RenderResult } from '@testing-library/react';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

declare module '@testing-library/react' {
  function render(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'queries'>
  ): RenderResult;
}
