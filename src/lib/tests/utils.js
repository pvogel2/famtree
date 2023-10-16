import { render } from '@testing-library/react';

import { RegistryProvider, createRegistry } from '@wordpress/data';
import registerFamiliesStore from '../../store/families';
import registerRuntimeStore from '../../store/runtime';

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
import { getAssetsGroup, getSymbolGroup, getNavigationGroup } from '../../lib/nodes/utils';

import Person from '../../../lib/js/Person';


if (!global.structuredClone) {
  global.structuredClone = (o) => JSON.parse(JSON.stringify(o));

}

jest.mock('../../assets/images/avatar.png', () => {
  return {};
});
[
  '../../assets/images/pdf.jpg',
  '../../assets/images/video.jpg',
  '../../assets/images/txt.jpg',
  '../../assets/images/file.jpg',
].forEach((path) => {
  jest.mock(path, () => {
    return {};
  });
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
  getObject: jest.fn(),
  start: jest.fn(),
  removeObject: jest.fn(),
  registerEventCallback: jest.fn(),
  unregisterEventCallback: jest.fn(),
  transition: jest.fn(),
  parent: {
    style: {},
  },
  three: {
    renderer: {
      setClearColor: jest.fn(),
    },
  },
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
  return new Person({
    id: globalPersonCounter++,
    firstName: `First${Math.random()}`,
    lastName: 'Book',
    ...config,
  });
}

export function getDefaultPerson() {
  return new Person({
    id: 'p0',
    firstName: 'Dummy',
    lastName: 'Person',
  });
}

function clonePerson(original) {
  return new Person(original.serialize());
}

function getPersonWithRelations(persons = [], relations = [], n = 1) {
  const ps = getPerson();
  persons.push(ps);

  for (let i = 0; i < n; i++) {
    const pr = getPerson();
    const rl = getRelation([ps.id, pr.id]);
    ps.addRelation(rl.id);
    persons.push(pr);
    relations.push(rl);
    }
  return ps;
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
    families = [],
    founder = null,
  } = config;

  const registry =  createRegistry({});
  registry.register(registerFamiliesStore());
  registry.register(registerRuntimeStore());

  const { setPersons, setFocused, setSelected, setRelations, setFamilies, setFounder } = registry.dispatch('famtree/families');

  if (persons.length) {
    setPersons(persons.map((p) => p.serialize()));
  }

  if (relations.length) {
    setRelations(relations);
  }

  if (families.length) {
    setFamilies(families);
  }

  if (typeof founder === 'number') {
    setFounder(founder);
  }

  if (focusedPerson) {
    setFocused(focusedPerson);
  }

  if (selectedPerson) {
    setSelected(selectedPerson);
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
      <RenderContext.Provider value={ { renderer } }>
        <RegistryProvider value={ registry }>
        { node }
        </RegistryProvider>
      </RenderContext.Provider>
    </LocalizationProvider>
  )

  return {
    container: result.container,
    debug: result.debug,
    baseElement: result.baseElement,
    getByRole: result.getByRole,
    renderer,
    registry,
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

async function createPersonMesh() {
  const m = new MockMesh(new MockGeometry(), new MockMaterial());
  m.name = 'person';
  const assetsGroup = getAssetsGroup(m);
  const sg = await getSymbolGroup(getPerson().serialize());
  m.add(sg);
  const naviGroup = getNavigationGroup(m);

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
  getPersonWithRelations,
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