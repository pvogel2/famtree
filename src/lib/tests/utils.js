import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { getByRole, getAllByRole, fireEvent } from '@testing-library/react';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import RenderContext from '../../components/RenderContext';
import personsReducer, { setPersons } from '../../store/personsReducer';
import selectedPersonReducer from '../../store/selectedPersonReducer';
import focusedPersonReducer, { setPerson } from '../../store/focusedPersonReducer';
import dialogsReducer, { showPersonDialog } from '../../store/dialogsReducer';
import runtimeReducer from '../../store/runtimeReducer';
import layoutReducer from '../../store/layoutReducer';
import relationsReducer, { setRelations } from '../../store/relationsReducer';

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
let globalRelationCounter = 1;

function getRelation(members = [],  children = []) {
  return {
    id: globalRelationCounter++,
    members,
    children,
    start: null,
    end: null,
    type: null,
  };
}

function getPerson(config = { relations: [] }) {
  return new DataPerson({
    id: globalPersonCounter++,
    firstName: `First${Math.random()}`,
    lastName: 'Book',
    ...config,
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

function getRelationsThreeGroup(n) {
  // console.log('->', n.name, '<->', n.children.length);
  // n.children.forEach((g) => console.log('name', g.name));
  return n.children.find((g) => g.name.startsWith('relations'));
}

function getAssetsThreeGroup(n) {
  return n.children.find((g) => g.name === 'assets');
}

function renderWithContext(node, config = {}) {
  const {
    focusedPerson = null,
    persons = [],
    relations = [],
  } = config;

  const store = configureStore({ reducer: {
    runtime: runtimeReducer,
    focusedPerson: focusedPersonReducer,
    persons: personsReducer,
    config: dialogsReducer,
    layout: layoutReducer,
    selectedPerson: selectedPersonReducer,
    relations: relationsReducer,
  }});

  if (persons.length) {
    store.dispatch(setPersons(persons.map((p) => p.serialize())));
  }

  if (relations.length) {
    store.dispatch(setRelations(relations));
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

  renderer._objects = {};
  renderer.addObject.mockImplementation((meshId, m, doIntercept, parent) => {
    if (parent) {
      parent.add(m);
    };
    renderer._objects[meshId] = m;
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
  getRelation,
  clonePerson,
  getPersonWithChild,
  getPersonWithPartner,
  getPartnerThreeGroup,
  getDataThreeGroup,
  getRelationsThreeGroup,
  getAssetsThreeGroup,
};