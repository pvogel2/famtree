import React from 'react';
import {
  Group as MockGroup,
  Mesh as MockMesh,
  MeshBasicMaterial as MockMaterial,
  BoxGeometry as MockGeometry,
} from 'three';
import { getMesh, getDataGroup, addLabelText3D, focusNode } from '../lib/nodes/utils';

import U from '../lib/tests/utils';
import Intersector from './Intersector';
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

describe('on intersection', () => {
  function triggerIntersection(renderer) {
    const moveCallbacks = renderer.registerEventCallback.mock.calls[0][1];

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

    const moveEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    act(() => {
      moveCallbacks(moveEvent, [{ object: dummyMesh }]);
    });
    return dummyMesh;
  }

  it('tirggers focus on node', () => {
    const { renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });

    const m = triggerIntersection(renderer);

    expect(focusNode).toHaveBeenCalledWith(m, expect.anything());
  });

  it('dispatches mouse move client position', () => {
    const { store, renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });

    triggerIntersection(renderer);

    const point = { x: 100, y: 100 };
    const state = store.getState();

    expect(state.runtime).toEqual(expect.objectContaining({ move: point }));
  });
});