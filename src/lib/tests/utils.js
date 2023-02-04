import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { getByRole, getAllByRole, fireEvent } from '@testing-library/react';
import {
  Group as MockGroup,
  Mesh as MockMesh,
  MeshBasicMaterial as MockMaterial,
  BoxGeometry as MockGeometry,
} from 'three';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import RenderContext from '../../components/RenderContext';
import personsReducer, { setPersons } from '../../store/personsReducer';
import selectedPersonReducer, { setPerson as setSelected } from '../../store/selectedPersonReducer';
import focusedPersonReducer, { setPerson } from '../../store/focusedPersonReducer';
import dialogsReducer, { showPersonDialog } from '../../store/dialogsReducer';
import runtimeReducer from '../../store/runtimeReducer';
import layoutReducer from '../../store/layoutReducer';
import relationsReducer, { setRelations } from '../../store/relationsReducer';
import familiesReducer from '../../store/familiesReducer';
import { getAssetsGroup, getSymbolGroup, getNavigationGroup } from '../../lib/nodes/utils';

import DataPerson from './../Person';

jest.mock('../../assets/images/avatar.png', () => {
  return {};
});

jest.mock('../../lib/three/Text3D');
jest.mock ('../../lib/three/PreparedMeshes', () => {
  const personMesh = new MockGroup();
  const portraitMaterial = new MockMaterial({ name: 'personMeshPortrait' });
  const portraitMesh = new MockMesh(new MockGeometry(), portraitMaterial);
  const baseMaterial = new MockMaterial({ name: 'personMeshBase' });
  const baseMesh = new MockMesh(new MockGeometry(), baseMaterial);
  personMesh.add(portraitMesh);
  personMesh.add(baseMesh);
  personMesh.userData.refId = '1';

  const arrowMesh = new MockMesh(new MockGeometry(), new MockMaterial());
  return {
    getPerson: () => personMesh,
    getNavigationArrow: () => arrowMesh,
  };
}
);


const renderer = {
  addObject: jest.fn((id, obj, intersect, parent) => {
    parent.add(obj);
  }),
  removeObject: jest.fn(),
  registerEventCallback: jest.fn(),
  unregisterEventCallback: jest.fn(),
  transition: jest.fn(),
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

function getPersonWithChilds(persons = [], relations = [], n = 1) {
  const ps = getPerson();
  const pr = getPerson();

  const rl = getRelation([ps.id, pr.id]);

  for (let i = 0; i < n; i++) {
    const c = getPerson();
    rl.children.push(c.id);
    persons.push(c);
  }

  ps.addRelation(rl.id);
  persons.push(ps, pr);
  relations.push(rl);

  return ps;
}

function getPersonWithPartner() {
  return getPersonWithListing('addPartner');
}

function findDataGroup(n) {
  return n.children.find((g) => g.name === 'data');
}

function findRelationsGroup(n) {
  return n.children.find((g) => g.name.startsWith('relations'));
}

function getChildNodes(n) {
  const rg = findRelationsGroup(n);
  if (!rg) {
    return [];
  }

  return rg.children.filter((c) => c.name.startsWith('person'));
}

function getPartnerNodes(n) {
  const rg = findRelationsGroup(n);
  if (!rg) {
    return [];
  }

  return rg.children.filter((c) => c.name.startsWith('partner'));
}

function findSymbolsGroup(n) {
  return n.children.find((g) => g.name === 'symbols');
}

function findAssetsGroup(n) {
  return n.children.find((g) => g.name === 'assets');
}

function findNavigationGroup(n) {
  return n.children.find((g) => g.name === 'navigation');
}

function renderWithContext(node, config = {}) {
  const {
    focusedPerson = null,
    selectedPerson = null,
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
    families: familiesReducer,
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

  if (selectedPerson) {
    store.dispatch(setSelected(selectedPerson));
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

function getRenderer() {
  return renderer;
}

function createPersonMesh() {
  const m = new MockMesh(new MockGeometry(), new MockMaterial());
  m.name = 'person';
  const assetsGroup = getAssetsGroup(m);
  m.add(getSymbolGroup(getPerson().serialize()));
  const naviGroup = getNavigationGroup(m);

  naviGroup.visible = false;
  return {
    personMesh: m,
    assetsGroup,
    naviGroup,
  };
}

function createNaviMesh(config = { refId: 1, parent: null }) {
  const m = new MockMesh(new MockGeometry(), new MockMaterial());
  const parent = config.parent || new MockGroup();
  parent.add(m);

  if (!config.parent) {
    parent.name = 'navigation';
  }
  m.userData.refId = config.refId;

  return m;
}

export default {
  renderWithContext,
  getPerson,
  getRelation,
  clonePerson,
  getPersonWithChilds,
  getPersonWithPartner,
  findDataGroup,
  findRelationsGroup,
  getChildNodes,
  getPartnerNodes,
  findAssetsGroup,
  findSymbolsGroup,
  findNavigationGroup,
  getRenderer,
  createPersonMesh,
  createNaviMesh,
};