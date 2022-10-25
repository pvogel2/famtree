import React from 'react';
import { cleanup } from '@testing-library/react';
import { Vector3, Group } from 'three';

import U from '../../lib/tests/utils';
import ChildRelation from './ChildRelation';

afterEach(cleanup);

it('renders null for Node', () => {
  const { container } = U.renderWithContext(<ChildRelation />);
  expect(container.firstChild).toBeNull();
});

it('adds a renderable object for relation', () => {
  const source = new Vector3();
  const target = new Vector3(0, 0, 4);
  const childrenThreeGroup = new Group();

  U.renderWithContext(<ChildRelation source={ source } target={ target } parent={ childrenThreeGroup }/>);

  expect(childrenThreeGroup.children).toHaveLength(1);
});

it('renderable object is of type LineSegments', () => {
  const source = new Vector3();
  const target = new Vector3(0, 0, 4);
  const partnersThreeGroup = new Group();
  U.renderWithContext(<ChildRelation source={ source } target={ target } parent={ partnersThreeGroup }/>);

  const relationLine = partnersThreeGroup.children[0];

  expect(relationLine.isLine).toEqual(true);
});
  