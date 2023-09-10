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
