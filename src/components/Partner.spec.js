import React from 'react';
import { cleanup } from '@testing-library/react';
import { Color, Vector3 } from 'three';

import U from '../lib/tests/utils';
import Partner from './Partner';

afterEach(cleanup);

const serializedPerson = U.getPerson().serialize();

it('renders null for Partner', () => {
  const { container } = U.renderWithContext(<Partner />);
  expect(container.firstChild).toBeNull();
});

it('adds no mesh without given person', () => {
  const { renderer } = U.renderWithContext(<Partner />);
  expect(renderer.addObject).not.toHaveBeenCalled();
});

it('adds a mesh to the scene', () => {
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.any(String), expect.any(Object), true, undefined);
});

  
it('adds grey color to node', () => {
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  const node = renderer.addObject.mock.lastCall[1];

  expect(node.material.color).toEqual(new Color(0.5, 0.5, 0.5));
});

it('adds several properties to the mesh', () => {
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  const node = renderer.addObject.mock.lastCall[1];

  const id = serializedPerson.id;
  expect(node.name).toEqual(`partner${id}`);
  expect(node.userData.id).toEqual(id);
});

it('adds an offset to the node', () => {
  const offset = new Vector3(1, 1, 1);
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson } offset={ offset }/>);
  const node = renderer.addObject.mock.calls[0][1];
  expect(node.position).toEqual(offset);
});

describe('For the data', () => {
  it('adds a data group to the node', () => {
    const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const data = U.getDataThreeGroup(node);

    expect(data.isGroup).toEqual(true);
  });

  it('adds a child to the data group', () => {
    const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const data = U.getDataThreeGroup(node);

    expect(data.children.length).toEqual(1);
  });
});
