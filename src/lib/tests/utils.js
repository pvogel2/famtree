import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { getByRole, getAllByRole, fireEvent } from '@testing-library/react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import RenderContext from '../../components/RenderContext';
import personsReducer, { setPersons } from '../../store/personsReducer';
import focusedPersonReducer, { setPerson } from '../../store/focusedPersonReducer';
import dialogsReducer, { showPersonDialog } from '../../store/dialogsReducer';
import runtimeReducer from '../../store/runtimeReducer';
import DataPerson from './../Person';

const renderer = {
  addObject: jest.fn(),
  removeObject: jest.fn(),
  registerEventCallback: jest.fn(),
  unregisterEventCallback: jest.fn(),
};

function getPersonWithListing(add, n = 1) {
  const p = getPerson();
  for (let i = 0; i < n; i++) {
    const x = getPerson();
    p[add](x.id);
  }
  return p;
}

/* Interface ------------------------------------------------------------- */

let globalPersonCounter = 1;
function getPerson() {
  return new DataPerson({
    id: `p${globalPersonCounter++}`,
    firstName: `First${Math.random()}`,
    lastName: 'Book',
  });
}

export function getDefaultPerson() {
  return new DataPerson({
    id: 'p0',
    firstName: 'Dummy',
    lastName: 'Person',
  });
}

function clonePerson(original) {
  return new DataPerson(original.serialize());
}

function getPersonWithChild(n = 1) {
  return getPersonWithListing('addChild', n);
}

function getPersonWithPartner() {
  return getPersonWithListing('addPartner');
}

function getPartnerThreeGroup(n) {
  return n.children.find((g) => g.name === 'partners');
}

function getDataThreeGroup(n) {
  return n.children.find((g) => g.name === 'data');
}

function getChildrenThreeGroup(n) {
  return n.children.find((g) => g.name === 'children');
}

function getAssetsThreeGroup(n) {
  return n.children.find((g) => g.name === 'assets');
}

function renderWithContext(node, persons = [], config = {}) {
  let focusedPerson;

  if (!Array.isArray(persons)) {
    config = persons.config || {};
    focusedPerson = persons.focusedPerson || null;
    persons = persons.persons || [];
  }

  const store = configureStore({ reducer: {
    runtime: runtimeReducer,
    focusedPerson: focusedPersonReducer,
    persons: personsReducer,
    config: dialogsReducer,
  }});

  if (persons.length) {
    store.dispatch(setPersons(persons.map((p) => p.serialize())));
  }

  const {
    edit = null,
  } = config;

  if (edit !== null) {
    store.dispatch(showPersonDialog(config));
  }

  if (focusedPerson) {
    store.dispatch(setPerson(focusedPerson));
  }

  renderer.addObject.mockImplementation((meshId, m, doIntercept, parent) => {
    if (parent) {
      parent.add(m);
    };
  });

  const result = render(
    <LocalizationProvider dateAdapter={ AdapterDateFns }>
      <Provider store={ store }>
        <RenderContext.Provider value={ { renderer } }>
          { node }
        </RenderContext.Provider>
      </Provider>
    </LocalizationProvider>
  );

  return {
    container: result.container,
    debug: result.debug,
    baseElement: result.baseElement,
    getByRole: result.getByRole,
    renderer,
    store,
  };
}

export async function getSelectOptions(base, container) {
  const s = await getByRole(container, 'button');
  fireEvent.mouseDown(s);
  const l = await getByRole(base, 'listbox');
  return await getAllByRole(l, 'option');
}

export default {
  renderWithContext,
  getPerson,
  clonePerson,
  getPersonWithChild,
  getPersonWithPartner,
  getPartnerThreeGroup,
  getDataThreeGroup,
  getChildrenThreeGroup,
  getAssetsThreeGroup,
};