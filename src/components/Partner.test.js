import {
  Color,
  Vector3,
} from 'three';
import U from '../lib/tests/utils';
import Partner from './Partner';

function getAddObjectNode(r, id) {
  const calls = r.addObject.mock.calls.filter((c) => c[0] === id)
  return calls[calls.length - 1][1];
}

function getControlNode(parent, id) {
  return parent.children.find((c) => c.userData.refId === id);
}

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
  expect(renderer.addObject).toHaveBeenCalledWith(expect.any(String), expect.any(Object), false, undefined);
});

  
it('adds foreground color to node', () => {
  const { renderer, store } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  const symbols = renderer.addObject.mock.lastCall[1];

  const base = symbols.children.find((m) => m.material.name ==='personMeshBase');
  const state = store.getState();
  const expected = new Color(state.layout.foreground).multiplyScalar(0.75);
  expect(base.material.color).toEqual(expected);
});

it('adds several properties to the mesh', () => {
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
  const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
  const id = serializedPerson.id;
  expect(node.name).toEqual('partner');
  expect(node.userData.refId).toEqual(id);
});

it('adds an offset to the node', () => {
  const offset = new Vector3(0, 1, 1);
  const { renderer } = U.renderWithContext(<Partner person={ serializedPerson } offsetY={ offset.y } offsetZ={ offset.z }/>);
  const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
  expect(node.position).toEqual(offset);
});

describe('For the data', () => {
  it('adds a data group to the node', () => {
    const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
    const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
    const data = U.findDataGroup(node);

    expect(data.isGroup).toEqual(true);
  });
});

describe('containing the navigation group', () => {
  const arrOff = 0.2;
  const naviOff = 0.9;

  it('adds the nvaigation to the root node', () => {
    const { renderer } = U.renderWithContext(<Partner person={ serializedPerson }/>);
    const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
    const naviGroup = U.findNavigationGroup(node);

    expect(naviGroup).toBeDefined();
    expect(naviGroup.type).toBe('Group');
    expect(naviGroup.position).toEqual(expect.objectContaining({ x: arrOff, y: naviOff, z: -naviOff}));
    expect(naviGroup.visible).toBe(false);
  });

  describe('for parent navigation control mesh', () => {
    it('is rendered', () => {
      const refId = 14;
      const pos = [0, -arrOff, 0];

      const { renderer } = U.renderWithContext(<Partner parentId={ refId } person={ serializedPerson }/>);
      const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
      const naviGroup = U.findNavigationGroup(node);
      const toParent = getControlNode(naviGroup, refId);
  
      expect(toParent).toBeDefined();
      expect(toParent.position.toArray()).toEqual(pos);
    });
  });

  describe('for child navigation control mesh', () => {
    it('is rendered', () => {
      const refId = 14;
      const pos = [0, arrOff, 0];

      const { renderer } = U.renderWithContext(<Partner toChildId={ refId } person={ serializedPerson }/>);
      const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
      const naviGroup = U.findNavigationGroup(node);
      const toParent = getControlNode(naviGroup, refId);
  
      expect(toParent).toBeDefined();
      expect(toParent.position.toArray()).toEqual(pos);
    });
  });

  describe('for left navigation control mesh', () => {
    it('is rendered', () => {
      const refId = 14;
      const pos = [0, 0, arrOff];

      const { renderer } = U.renderWithContext(<Partner toLeftId={ refId } person={ serializedPerson }/>);
      const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
      const naviGroup = U.findNavigationGroup(node);
      const toLeft = getControlNode(naviGroup, refId);
  
      expect(toLeft).toBeDefined();
      expect(toLeft.position.toArray()).toEqual(pos);
    });
  });

  describe('for right navigation control mesh', () => {
    it('is rendered', () => {
      const refId = 14;
      const pos = [0, 0, -arrOff];

      const { renderer } = U.renderWithContext(<Partner toRightId={ refId } person={ serializedPerson }/>);
      const node = getAddObjectNode(renderer, `person${serializedPerson.id}`);
      const naviGroup = U.findNavigationGroup(node);
      const toRight = getControlNode(naviGroup, refId);
  
      expect(toRight).toBeDefined();
      expect(toRight.position.toArray()).toEqual(pos);
    });
  });
});
