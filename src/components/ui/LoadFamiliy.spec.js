import React from 'react';
import { cleanup, fireEvent, act } from '@testing-library/react';

import U from '../../lib/tests/utils';

import LoadFamily from './LoadFamily';

jest.useFakeTimers();

jest.mock("../../lib/Connect");

afterEach(cleanup);

beforeEach(() => {
  jest.restoreAllMocks();
});

it('renders elements for LoadFamily', () => {
  const { container } = U.renderWithContext(<LoadFamily />);
  expect(container.firstChild).not.toBeNull();
});
