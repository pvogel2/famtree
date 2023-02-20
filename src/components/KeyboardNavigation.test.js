import { fireEvent } from '@testing-library/react';
import U from '../lib/tests/utils';
import KNavigation from './KeyboardNavigation';

afterEach(() => {
  jest.clearAllMocks()
});

describe('renders', () => {
  it('without error for KNavigation', () => {
    const { container } = U.renderWithContext(<KNavigation />);
    expect(container.firstChild).toBeNull();
  });
});

describe.each([
  { prop: 'upId', key: 'ArrowUp', code: 'ArrowUp' },
  { prop: 'downId', key: 'ArrowDown', code: 'ArrowDown' },
  { prop: 'leftId', key: 'ArrowLeft', code: 'ArrowLeft' },
  { prop: 'rightId', key: 'ArrowRight', code: 'ArrowRight' },
])('keydown event handler for $prop', ({ prop, key, code }) => {
  it('is added to the page', () => {
    const addListenerSpy = jest.spyOn(document, 'addEventListener');

    const props = {
      [prop]: 14,
    };

    U.renderWithContext(<KNavigation { ...props } />);
    expect(addListenerSpy).toHaveBeenCalledWith('keydown', expect.anything());
  });

  it('triggers new selection', () => {
    const person = U.getPerson();

    const props = {
      [prop]: person.id,
    };

    const { store, container } = U.renderWithContext(<KNavigation { ...props } />, { persons: [person] });

    fireEvent.keyDown(container, { key, code, ctrlKey: true });

    const state = store.getState();
    const currentSelectionId = state.selectedPerson.person.id;

    expect(person.id).toBe(currentSelectionId);
  });
});
