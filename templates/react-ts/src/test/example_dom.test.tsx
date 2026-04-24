import { render } from '../config/setupTests';

// @vitest-environment jsdom
describe('Example', () => {
  Array.from({ length: 1_00 }).forEach(() => {
    it('Basic component test', () => {
      render(<div>Lorem ipsum dolor sit amet.</div>);
    });
  });
});
