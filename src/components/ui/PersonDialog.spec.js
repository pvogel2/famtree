import React from 'react';
import { cleanup, fireEvent, act } from '@testing-library/react';
import U, { getSelectOptions } from '../../lib/tests/utils';
import PersonDialog from './PersonDialog';

function getDialog(base) {
  return base.querySelector('[qa="person-dialog"]');
}

function getCloseButton(dialog) {
  return dialog.querySelector('[qa="dialog-close"]');
}

function setPropField(propertyKey, parent) {
  const value = `${propertyKey}-${Math.random()}`;
  const propField = parent.querySelector(`[name="${propertyKey}"]`);
  fireEvent.change(propField, { target: { value } });
  return value;
}

async function initializeAndGetFirstPerson(base, container) {
  const dialog = getDialog(base, container);
  const selector = dialog.querySelector('[qa="person-selector"]');
  const item = (await getSelectOptions(base, selector))[0];
  fireEvent.click(item);
  return { dialog, selector, item };
}

const editableStringProps = ['firstName', 'lastName', 'birthName', 'surNames'];
// const editableDateProps = ['birthday', 'deathday'];
afterEach(cleanup);

const defaultContext = { persons: [], config: { edit: 'p0' } };

it('is not in the document', () => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, { persons: [] });
  const dialogElement = getDialog(baseElement, container);

  expect(dialogElement).not.toBeInTheDocument();
});

it('is in the document', () => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);

  expect(dialogElement).toBeInTheDocument();
});

it('PersonDialog has a person selector', () => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);

  const personSelector = dialogElement.querySelector('[qa="person-selector"]');
  expect(personSelector).toBeInTheDocument();
});

describe('PersonDialog close button', () => {
  it('is in the document', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);

    const actionButton = getCloseButton(dialogElement);
    expect(actionButton).toBeInTheDocument();
  });

  it('closes dialog on click', () => {
    const { baseElement, container, store } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);

    const actionButton = getCloseButton(dialogElement);
    act(() => {
      fireEvent.click(actionButton);
    });

    const state = store.getState();
    expect(state.config.edit).toBe(null);
  });
});

describe('PersonDialog save button', () => {
  it('is in the document', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);

    const saveButton = dialogElement.querySelector('[qa="person-save"]');
    expect(saveButton).toBeInTheDocument();
  });

  it.each(editableStringProps)('updates person for edited property %s', async (propName) => {
    const person = U.getPerson();
    const { store, baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [person] });

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

  /* it.each(editableDateProps)('updates person for edited date property %s', async (propName) => {
    const person = U.getPerson();
    const { store, baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [person] });

    const { dialog } = await initializeAndGetFirstPerson(baseElement, container);

    const date = setDatePropField(propName, dialog);

    const saveButton = dialog.querySelector('[qa="person-save"]');
    act(() => {
      fireEvent.click(saveButton);
    });

    const { persons } = store.getState();
    const storedValue = persons[0][propName];
    expect(storedValue).toEqual(date.valueOf());
  }); */
});

describe('person selector',() => {
  it('has an option',  async () => {
    const person = U.getPerson();
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [person] });
    const { item } = await initializeAndGetFirstPerson(baseElement, container);

    expect(item).toHaveTextContent(person.name);
  });
  
  it('on selection set value of selector', async () => {
    const person = U.getPerson();
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [person] });
    const { selector } = await initializeAndGetFirstPerson(baseElement, container);
  
    expect(selector).toHaveTextContent(person.name);
  });
});

describe.each(editableStringProps)('for editable property %s', (propName) => {
  it('PersonDialog has form field', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);
  
    const field = dialogElement.querySelector(`[name="${propName}"]`);
    expect(field).toBeInTheDocument();
  });

  it('on selection sets value', async () => {
    const person = U.getPerson();
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [person] });

    const { dialog } = await initializeAndGetFirstPerson(baseElement, container);

    const propField = dialog.querySelector(`[name="${propName}"]`);
    expect(propField.value).toEqual(person[propName]);
  });

  it('field value is set on change', () => {
    const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
    const dialogElement = getDialog(baseElement, container);
    const propField = dialogElement.querySelector(`[name="${propName}"]`);
  
    const newValue = setPropField(propName, dialogElement);
    expect(propField.value).toEqual(newValue);
  });
});

it('has a close button', () => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);
  const button = getCloseButton(dialogElement);
  expect(button).toBeInTheDocument();
});

it.each(['save', 'clear'])('has a %s button', (type) => {
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, defaultContext);
  const dialogElement = getDialog(baseElement, container);
  const button = dialogElement.querySelector(`[qa="person-${type}"]`);
  expect(button).toBeInTheDocument();
});

it('adds new person when no one is selected', () => {
  const person = U.getPerson();
  const { store, baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons: [person] });
  const dialogElement = getDialog(baseElement, container);
  const saveButton = dialogElement.querySelector('[qa="person-save"]');  

  setPropField('firstName', dialogElement);
  setPropField('lastName', dialogElement);

  act(() => {
    fireEvent.click(saveButton);
  });

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

it('has shows the correct birthday', async () => {
  const person = U.getPerson();
  person.birthday = 0;

  const persons = [person];
  const { baseElement, container } = U.renderWithContext(<PersonDialog />, { ...defaultContext, persons });
  const { dialog } = await initializeAndGetFirstPerson(baseElement, container);

  const birthdayField = dialog.querySelector(`[name="birthday"]`);

  expect(birthdayField.value).toBe('01.01.1970');
});
