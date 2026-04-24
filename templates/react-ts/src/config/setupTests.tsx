import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// eslint-disable-next-line react-refresh/only-export-components
const ProvidersWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {/* Add providers here */}
    {children}
  </>
);


const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: ProvidersWrapper, ...options });

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { customRender as render };
