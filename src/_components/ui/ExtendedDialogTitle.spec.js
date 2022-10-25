import React from 'react';
import { cleanup } from '@testing-library/react';
import U from '../../lib/tests/utils';

import ExtendedDialogTitle from './ExtendedDialogTitle';

afterEach(cleanup);

it('is in the document', () => {
  const { container } = U.renderWithContext(<ExtendedDialogTitle />);

  expect(container.firstChild).not.toBeNull();
});
