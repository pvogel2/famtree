import { cleanup } from '@testing-library/react';

import U from '../../lib/tests/utils';

import LoadFamily from './LoadFamily';

jest.useFakeTimers();

jest.mock('../../lib/Connect');

afterEach(cleanup);

beforeEach(() => {
  jest.restoreAllMocks();
});

it('renders elements for LoadFamily', () => {
  const persons = [];
  const families = [];
  const { container } = U.renderWithContext(<LoadFamily />, { persons, families });
  expect(container.firstChild).not.toBeNull();
});

it('is disabled for no families defined', () => {
  const { container } = U.renderWithContext(<LoadFamily />);
  const button = container.firstChild;

  expect(button.attributes.getNamedItem('disabled')).toBeDefined();
});

it('is disabled for only one family present', () => {
  const person = U.getPerson({ root: true });
  const { container } = U.renderWithContext(<LoadFamily />, { persons: [person] });
  const button = container.firstChild;

  expect(button.attributes.getNamedItem('disabled')).toBeDefined();
});

it('is enabled for only one family present', () => {
  const person1 = U.getPerson({ root: true });
  const person2 = U.getPerson({ root: true });
  const { container } = U.renderWithContext(<LoadFamily />, { persons: [person1, person2], families:[person1.id, person2.id] });
  const button = container.firstChild;

  expect(button.attributes.getNamedItem('disabled')).toEqual(null);
});

