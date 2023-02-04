import U from '../lib/tests/utils';
import Navigation from './Navigation';

const focusedPerson = U.getPerson();
const defaultContext = { focusedPerson: focusedPerson.serialize() };

it('renders something for Navigation', () => {
  const { container } = U.renderWithContext(<Navigation />);
  expect(container.firstChild).toBeNull();
});

it('renders some component for focused person', () => {
  const { container } = U.renderWithContext(<Navigation />, { ...defaultContext });
  expect(container.firstChild).not.toBeNull();
});
