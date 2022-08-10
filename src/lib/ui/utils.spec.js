import { cleanup } from '@testing-library/react';

import { showDate } from './utils';
afterEach(cleanup);

it('shows the correct format for null', () => {
  const result = showDate();
  expect(result).toBe(null);
});

it('shows the correct format for 0', () => {
  const result = showDate(0);
  expect(result).toBe('01.01.1970');
});