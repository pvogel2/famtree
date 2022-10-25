import { cleanup, fireEvent, act } from '@testing-library/react';

import U from '../../lib/tests/utils';
import DeletableList from './DeletableList';

function getButton(base) {
  return base.querySelector('[qa="listing-control-button"]');
}

function getMenu(base) {
  return base.querySelector('[qa="listing-menu"]');
}

function initializeMenu(items = [], itemClicked =() => {}) {
  const { container, baseElement } = U.renderWithContext(<DeletableList items={ items } itemClicked={ itemClicked }/>);
  const button = getButton(container);
  act(() => {
    fireEvent.click(button);
  });
  return getMenu(baseElement);
}

afterEach(cleanup);

it('is in the document', () => {
  const { container } = U.renderWithContext(<DeletableList />);
  expect(container.firstChild).not.toBeNull();
});

it('renders only a button', () => {
  const { container, baseElement } = U.renderWithContext(<DeletableList />);
  const button = getButton(container);
  const menu = getMenu(baseElement);

  expect(button).not.toBeNull();
  expect(menu).toBeNull();
});

it('does not trigger menu for empty items', () => {
  const menu = initializeMenu();

  expect(menu).toBeNull();
});

it('renders menu on click', () => {
  const person = U.getPerson();
  const menu = initializeMenu([person]);

  expect(menu).not.toBeNull();
});

it('calls callback with item clicked', () => {
  const person = U.getPerson();
  const itemClicked = jest.fn();
  const menu = initializeMenu([person], itemClicked);
  const items = menu.querySelectorAll('[qa=listing-item] button');
  fireEvent.click(items[0]);

  expect(itemClicked).toHaveBeenCalled();
});
