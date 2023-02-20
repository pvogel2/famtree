import React from 'react';
import {
  Group as MockGroup,
  Mesh as MockMesh,
  MeshBasicMaterial as MockMaterial,
  BoxGeometry as MockGeometry,
} from 'three';

import U from '../lib/tests/utils';
import Intersector from './Intersector';
import { getMesh, getDataGroup, addLabelText3D, focusNode, isNavigationNode } from '../lib/nodes/utils';
import { act } from 'react-dom/test-utils';

jest.mock('../lib/Connect.js', () => {
  return {
    loadMetadata: jest.fn(() => []),
  };
});

jest.mock('../lib/nodes/utils', () => {
  const origUtils = jest.requireActual('../lib/nodes/utils');

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...origUtils,
    focusNode: jest.fn(),
  };
});

jest.mock('../assets/images/avatar.png', () => {
  return {};
});

jest.mock('../lib/three/Text', () => {
  return {};
});

jest.mock('../lib/three/Text3D', () => {
  return function() {
    return {
      attach: jest.fn(),
      remove: jest.fn(),
    };
  };
});

jest.mock ('../lib/three/PreparedMeshes', () => {
  const personMesh = new MockGroup();
  const portraitMaterial = new MockMaterial({ name: 'personMeshPortrait' });
  const portraitMesh = new MockMesh(new MockGeometry(), portraitMaterial);
  const baseMaterial = new MockMaterial({ name: 'personMeshBase' });
  const baseMesh = new MockMesh(new MockGeometry(), baseMaterial);
  personMesh.add(portraitMesh);
  personMesh.add(baseMesh);
  personMesh.userData.refId = '1';
  return {
    getPerson: () => personMesh,
  };
}
);

const defaultPerson = U.getPerson();

afterEach(() => {
  jest.clearAllMocks()
});

it('renders null for Intersector', () => {
  const { container } = U.renderWithContext(<Intersector />);
  expect(container.firstChild).toBeNull();
});

function createPersonMesh() {
  const dummyMesh = getMesh();
  const parent1 = new MockGroup();
  const parent2 = new MockGroup();
  parent1.add(parent2);
  parent2.add(dummyMesh);

  dummyMesh.userData.refId = defaultPerson.id;
  parent1.userData.refId = defaultPerson.id;
  parent1.name = 'person';
  const dg = getDataGroup(dummyMesh);
  addLabelText3D(dg, 'name');
  return dummyMesh;
}

function triggerIntersection(renderer, mesh = createPersonMesh()) {
  const moveCallback = renderer.registerEventCallback.mock.calls.find((c) => c[0] === 'move')[1];

  const point = { x: 100, y: 100 };
  const moveEvent = new MouseEvent('mousemove', { clientX: point.x, clientY: point.y});
  act(() => {
    moveCallback(moveEvent, [{ object: mesh }]);
  });
  return { mesh, point };
}

describe('intersector', () => {
  it.each(['move', 'click'])('sets callback on $s event', (event) => {
    const { renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });
    const callbacks = renderer.registerEventCallback.mock.calls.filter((c) => c[0] === event);
    expect(callbacks).toHaveLength(1);
  });
});

describe('on intersection', () => {
  it('tirggers focus on node', () => {
    const { renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });

    const { mesh } = triggerIntersection(renderer);

    expect(focusNode).toHaveBeenCalledWith(mesh, expect.anything());
  });

  it('dispatches mouse move client position', () => {
    const { store, renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });

    const { point } = triggerIntersection(renderer);

    const state = store.getState();

    expect(state.runtime).toEqual(expect.objectContaining({ move: point }));
  });

  it('adds click handler on hover', () => {
    const { renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });
    triggerIntersection(renderer, U.createNaviMesh());

    expect(renderer.registerEventCallback).toHaveBeenCalledWith('click', expect.anything());
  });

  it('removes click handler on hover lost', () => {
    const { renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });
    triggerIntersection(renderer, U.createNaviMesh());    
    triggerIntersection(renderer, U.createNaviMesh());

    expect(renderer.unregisterEventCallback).toHaveBeenCalledWith('click', expect.anything());
  });
});

describe('on parent navi click', () => {
  it('selects the parent node', () => {
    const parentPerson = U.getPerson();
    const { renderer, store } = U.renderWithContext(<Intersector />, { persons: [defaultPerson, parentPerson] });
    triggerIntersection(renderer, U.createNaviMesh({ refId: parentPerson.id }));

    const naviClickCallback = renderer.registerEventCallback.mock.calls.filter((c) => c[0] === 'click')[1];
    naviClickCallback[1]();

    const state = store.getState();
    const currentSelectionId = state.selectedPerson.person.id;
    expect(currentSelectionId).toBe(parentPerson.id);
  });
});
