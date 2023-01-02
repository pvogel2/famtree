import React from 'react';
import {
  Color,
  Vector3,
  Group as MockGroup,
  Mesh as MockMesh,
  MeshBasicMaterial as MockMaterial,
  BoxGeometry as MockGeometry,
} from 'three';
import U from '../lib/tests/utils';
import Partner from './Partner';

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

function getAddObjectNode(r, id) {
  const calls = r.addObject.mock.calls.filter((c) => c[0] === id)
  return calls[calls.length - 1][1];
}

const serializedPerson = U.getPerson().serialize();

it.only('renders null for Partner', () => {
  const { container } = U.renderWithContext(<Partner />);
  expect(container.firstChild).toBeNull();
});

it.only('adds no mesh without given person', () => {
  const { renderer } = U.renderWithContext(<Partner />);
  expect(renderer.addObject).not.toHaveBeenCalled();
});

it.only('adds a mesh to the scene', () => {
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.any(String), expect.any(Object), false, undefined);
});

  
it.only('adds foreground color to node', () => {
  const { renderer, store } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  const symbols = renderer.addObject.mock.lastCall[1];

  const base = symbols.children.find((m) => m.material.name ==='personMeshBase');
  const state = store.getState();
  const expected = new Color(state.layout.foreground).multiplyScalar(0.75);
  expect(base.material.color).toEqual(expected);
});

it.only('adds several properties to the mesh', () => {
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
  const id = serializedPerson.id;
  expect(node.name).toEqual('partner');
  expect(node.userData.refId).toEqual(id);
});

it.only('adds an offset to the node', () => {
  const offset = new Vector3(0, 1, 1);
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson } offsetY={ offset.y } offsetZ={ offset.z }/>);
  const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
  expect(node.position).toEqual(offset);
});

describe('For the data', () => {
  it.only('adds a data group to the node', () => {
    const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
    const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
    const data = U.getDataThreeGroup(node);

    expect(data.isGroup).toEqual(true);
  });
});
