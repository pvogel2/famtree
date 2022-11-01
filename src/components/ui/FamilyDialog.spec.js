import React from 'react';
import { cleanup, fireEvent, act } from '@testing-library/react';
import U from '../../lib/tests/utils';
import { loadFamily, savePerson, updatePerson } from "../../lib/Connect";

import FamilyDialog from './FamilyDialog';

function getDialog(base) {
  return base.querySelector('[qa="founder-dialog"]');
}

function getCloseButton(dialog) {
  return dialog.querySelector('[qa="dialog-close"]');
}

jest.mock("../../lib/Connect");

afterEach(cleanup);

it('is in the document', () => {
  const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />);
  const dialogElement = getDialog(baseElement, container);

  expect(dialogElement).toBeInTheDocument();
});

it('has a close button', () => {
  const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />);
  const dialogElement = getDialog(baseElement, container);
  const button = getCloseButton(dialogElement);
  expect(button).toBeInTheDocument();
});

it.each(['save', 'load'])('has a %s button', (type) => {
  const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />);
  const dialogElement = getDialog(baseElement, container);
  const button = dialogElement.querySelector(`[qa="founder-${type}"]`);

  expect(button).toBeInTheDocument();
});

describe('FamilyDialog close button', () => {
  it('closes dialog on click', () => {
    const setFamilyOpen = jest.fn();
    const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } setOpen={ setFamilyOpen }/>);
    const dialogElement = getDialog(baseElement, container);
  
    const actionButton = getCloseButton(dialogElement);
    fireEvent.click(actionButton);
  
    expect(setFamilyOpen).toHaveBeenCalled();
  });
});

describe('FamilyDialog load button', () => {
  it('loads a founder from database', async () => {
    loadFamily.mockResolvedValueOnce([U.getPerson().serialize(), U.getPerson().serialize()]);
    const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />);
    const dialogElement = getDialog(baseElement, container);
  
    const loadButton = dialogElement.querySelector('[qa="founder-load"]');
    await act(() => {
      fireEvent.click(loadButton);
    });
  
    expect(loadFamily).toHaveBeenCalledTimes(1);
  });

  it('closes dialog after loading', async () => {
    const setFamilyOpen = jest.fn();

    loadFamily.mockResolvedValueOnce([U.getPerson().serialize(), U.getPerson().serialize()]);
    const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } setOpen={ setFamilyOpen } />);
    const dialogElement = getDialog(baseElement, container);
  
    const loadButton = dialogElement.querySelector('[qa="founder-load"]');
    await act(() => {
      fireEvent.click(loadButton);
    });
  
    expect(setFamilyOpen).toHaveBeenCalled();
  });
});

it('save button clicked creates data for new person', async () => {
  const personA = U.getPerson();
  loadFamily.mockResolvedValueOnce([personA.serialize()]);
  savePerson.mockResolvedValueOnce({});

  const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />, [personA]);
  const dialogElement = getDialog(baseElement, container);

  const saveButton = dialogElement.querySelector('[qa="founder-save"]');
  await act(() => {
    fireEvent.click(saveButton);
  });

  expect(savePerson).toHaveBeenCalledTimes(1);
});

it('action save clicked stores data for known person', async () => {
  const personA = U.getPerson();  
  loadFamily.mockResolvedValueOnce([personA.serialize()]);
  updatePerson.mockResolvedValueOnce({});

  const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />, [personA]);
  const dialogElement = getDialog(baseElement, container);

  const saveButton = dialogElement.querySelector('[qa="founder-save"]');
  const loadButton = dialogElement.querySelector('[qa="founder-load"]');

  await act(() => {
    fireEvent.click(loadButton);
  });

  await act(() => {
    fireEvent.click(saveButton);
  });

  expect(updatePerson).toHaveBeenCalledTimes(1);
});

describe('founder selector',() => {
  it('is in the document',  async () => {
    const { baseElement, container } = U.renderWithContext(<FamilyDialog open={ true } />);
    const dialogElement = getDialog(baseElement, container);
  
    const selector = dialogElement.querySelector('[qa="founder-selector"]');
    expect(selector).toBeInTheDocument();
  });
});
