import { cleanup } from '@testing-library/react';

import { showDate } from './utils';
afterEach(cleanup);

it('shows the correct format for null', () => {
  const result = showDate();
  expect(result).toBe(null);
});

it('shows the correct format for a valid date', () => {
  const result = showDate('1989-12-01');
  expect(result).toBe('1.12.1989');
});