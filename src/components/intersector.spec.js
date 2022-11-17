import React from 'react';
import { cleanup /*, fireEvent, act */} from '@testing-library/react';
import { Color } from 'three';
import { getMesh, addDataGroup, addLabelText, findLabelText } from '../lib/nodes/utils';

import U from '../lib/tests/utils';
import Intersector from './Intersector';
import { act } from 'react-dom/test-utils';

const defaultPerson = U.getPerson();
afterEach(cleanup);

it('renders null for Intersector', () => {
  const { container } = U.renderWithContext(<Intersector />);
  expect(container.firstChild).toBeNull();
});

describe('on intersection', () => {
  function triggerIntersection(renderer) {
    const moveCallbacks = renderer.registerEventCallback.mock.calls[0][1];

    const dummyMesh = getMesh();
    dummyMesh.userData.refId = defaultPerson.id;
    const dg = addDataGroup(dummyMesh);
    addLabelText(dg, 'name');

    const moveEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 100 });
    act(() => {
      moveCallbacks(moveEvent, [{ object: dummyMesh }]);
    });
    return dummyMesh;
  }

  it('node color updated', () => {
    const { renderer } = U.renderWithContext(<Intersector />);

    const dummyMesh = triggerIntersection(renderer);

    const expectedColor = new Color(1, 0, 0);
    expect(expectedColor).toEqual(dummyMesh.material.color);
  });

  it('text node scaling changed', () => {
    const { renderer } = U.renderWithContext(<Intersector />);

    const dummyMesh = triggerIntersection(renderer);
    const labelText = findLabelText(dummyMesh);

    const scale = labelText.material.uniforms.scale.value;
    expect(scale).toEqual(1);
  });

  it.only('dispatches focusedPerson', () => {
    const { store, renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });

    triggerIntersection(renderer);

    const state = store.getState();
    expect(state.focusedPerson).toEqual(expect.objectContaining(defaultPerson.serialize()));
  });

it.only('dispatches mouse move client position', () => {
    const { store, renderer } = U.renderWithContext(<Intersector />, { persons: [defaultPerson] });

    triggerIntersection(renderer);

    const point = { x: 100, y: 100 };
    const state = store.getState();

    expect(state.runtime).toEqual(expect.objectContaining({ move: point }));
  });
});