import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import U from '../../lib/tests/utils';
import InfoDialog from './InfoDialog';

function getDialog(base) {
  return base.querySelector('[qa="info-dialog"]');
}

function getTitle(base) {
  const dialog = getDialog(base);
  return dialog.querySelector('.MuiDialogTitle-root');
}

afterEach(cleanup);

const focusedPerson = U.getPerson();
const defaultContext = { focusedPerson: focusedPerson.serialize() };

it('is not in the document', () => {
  const { baseElement } = U.renderWithContext(<InfoDialog />);
  const dialogElement = getDialog(baseElement);

  expect(dialogElement).not.toBeInTheDocument();
});

it('is in the document for focused person', () => {
  const { baseElement } = U.renderWithContext(<InfoDialog />, defaultContext);
  const dialogElement = getDialog(baseElement);

  expect(dialogElement).toBeInTheDocument();
});

it('is not in the document if person selected', () => {
  const selectedPerson = U.getPerson();

  const { baseElement } = U.renderWithContext(<InfoDialog />, { ...defaultContext, selectedPerson: selectedPerson.serialize() });
  const dialogElement = getDialog(baseElement);

  expect(dialogElement).not.toBeInTheDocument();
});

it('title is the persons name', () => {
  const { baseElement } = U.renderWithContext(<InfoDialog />, defaultContext);
  const title = getTitle(baseElement);

  expect(title).toHaveTextContent(focusedPerson.name);
});

/* it('PersonDialog has a person selector', () => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);

  const personSelector = dialogElement.querySelector('[qa="person-selector"]');
  expect(personSelector).toBeInTheDocument();
});

describe('PersonDialog close button', () => {
  it('is in the document', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);

    const actionButton = dialogElement.querySelector('[qa="person-close"]');
    expect(actionButton).toBeInTheDocument();
  });

  it('closes dialog on click', () => {
    const { baseElement, container, store } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);

    const actionButton = dialogElement.querySelector('[qa="person-close"]');
    act(() => {
      fireEvent.click(actionButton);
    });

    const state = store.getState();
    expect(state.config).toBe(null);
  });
});

describe('PersonDialog save button', () => {
  it('is in the document', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);

    const saveButton = dialogElement.querySelector('[qa="person-save"]');
    expect(saveButton).toBeInTheDocument();
  });

  it.each(editableProps)('updates person for edited property %s', async (propName) => {
    const dPerson = U.getPerson();
    const { store, baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [dPerson] });

    const { dialog } = await initializeAndGetFirstPerson(baseElement, container);

    const value = setPropField(propName, dialog);

    const saveButton = dialog.querySelector('[qa="person-save"]');
    act(() => {
      fireEvent.click(saveButton);
    });

    const { persons } = store.getState();
    const storedValue = persons[0][propName];
    expect(storedValue).toEqual(value);
  });
});

describe('person selector',() => {
  it('has an option',  async () => {
    const dPerson = U.getPerson();
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [dPerson] });
    const { item } = await initializeAndGetFirstPerson(baseElement, container);

    expect(item).toHaveTextContent(dPerson.name);
  });
  
  it('on selection set value of selector', async () => {
    const dPerson = U.getPerson();
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [dPerson] });
    const { selector } = await initializeAndGetFirstPerson(baseElement, container);
  
    expect(selector).toHaveTextContent(dPerson.name);
  });
});

describe.each(editableProps)('for editable property %s', (propName) => {
  it('PersonDialog has form field', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);
  
    const field = dialogElement.querySelector(`[name="${propName}"]`);
    expect(field).toBeInTheDocument();
  });

  it('on selection sets value', async () => {
    const dPerson = U.getPerson();
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [dPerson] });

    const { dialog } = await initializeAndGetFirstPerson(baseElement, container);

    const propField = dialog.querySelector(`[name="${propName}"]`);
    expect(propField.value).toEqual(dPerson[propName]);
  });

  it('field value is set on change', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);
    const propField = dialogElement.querySelector(`[name="${propName}"]`);
  
    const newValue = setPropField(propName, dialogElement);
    expect(propField.value).toEqual(newValue);
  });
});

it.each(['save', 'clear', 'close'])('has a %s button', (type) => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);
  const button = dialogElement.querySelector(`[qa="person-${type}"]`);
  expect(button).toBeInTheDocument();
});

it('adds new person when no one is selected', () => {
  const { store, baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);
  const saveButton = dialogElement.querySelector('[qa="person-save"]');  

  setPropField('firstName', dialogElement);
  setPropField('lastName', dialogElement);

  fireEvent.click(saveButton);

  const { persons } = store.getState();

  // store holds a single person as default
  expect(persons).toHaveLength(2);
});

it('clear button resets the selections', async () => {
  const person = U.getPerson();

  const persons = [person];
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons });
  const { selector, dialog } = await initializeAndGetFirstPerson(baseElement, container);

  const clearButton = dialog.querySelector('[qa="person-clear"]');  

  act(() => {
    fireEvent.click(clearButton);
  });
  const input = selector.querySelector('input');
  expect(input).toHaveValue('');
});
*/
