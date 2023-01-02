import React from 'react';
import { cleanup, fireEvent, act } from '@testing-library/react';

import U from '../../lib/tests/utils';

import MainMenu from './MainMenu';

jest.useFakeTimers();

jest.mock("../../lib/Connect");

jest.mock('@mui/material/SpeedDialAction', () => (props) => {
  const {
    qa = '',
    onClick = jest.fn(),
  } = props;
  return <div qa={ qa } onClick={ onClick }>speed dial action</div>;
});

afterEach(cleanup);

function clickMainMenuAction(c, action) {
  const ai = c.querySelector(`[qa="main-menu-action-${action}"]`);

  act(() => {
    fireEvent.click(ai);
  });
}

beforeEach(() => {
  jest.restoreAllMocks();
});

it('renders elements for MainMenu', () => {
  const { container } = U.renderWithContext(<MainMenu />);
  expect(container.firstChild).not.toBeNull();
});

it('has two action items', () => {
  const { container } = U.renderWithContext(<MainMenu />);
  const actions = container.querySelectorAll('[qa*="main-menu-action"]');
  expect(actions).toHaveLength(2);
});

describe.each(['person', 'founder'])('main menu action %s', (action) => {
  it('has a button', () => {
    const { container } = U.renderWithContext(<MainMenu />);
    const actionItem = container.querySelector(`[qa="main-menu-action-${action}"]`);
    expect(actionItem).not.toBeNull();
  });
});

it('action person triggers store change', () => {
  const { container, store } = U.renderWithContext(<MainMenu />);
  clickMainMenuAction(container, 'person');
  const state = store.getState();
  expect(state.config).not.toBe(null);
});