import U from '../lib/tests/utils';
import Placeholder from './Placeholder';


it('renders something for Placeholder', () => {
  const { container } = U.renderWithContext(<Placeholder />);

  expect(container.firstChild).toBeNull();
});
  
it('adds generic node to renderer', () => {
  const { container, renderer } = U.renderWithContext(<Placeholder />);

  expect(renderer.addObject).toHaveBeenCalled();
});
