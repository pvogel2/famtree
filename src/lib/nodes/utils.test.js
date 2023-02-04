import {
  Group as MockGroup,
  Mesh as MockMesh,
  MeshBasicMaterial as MockMaterial,
  BoxGeometry as MockGeometry,
} from 'three';

import U from '../tests/utils';
import * as utils from './utils';

jest.mock('../../assets/images/avatar.png', () => {
  return function() {
    return {};
  };
});


jest.mock('../../lib/three/Text3D', () => {
  return function() {
    return {
      attach: jest.fn(),
      remove: jest.fn(),
    };
  };
});

jest.mock ('../../lib/three/PreparedMeshes', () => {
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
});

afterEach(() => {
  jest.clearAllMocks()
});

describe('selectNode', () => {
  it('does not throw for no mesh', () => {
    expect(utils.selectNode).not.toThrow();
  });

  it('set navigation visible', () => {
    const { personMesh, naviGroup } = U.createPersonMesh();

    utils.selectNode(personMesh, { renderer: U.getRenderer() });
    expect(naviGroup.visible).toBe(true);
  });
});

describe('defocusNode', () => {
  it('does not throw for no mesh', () => {
    expect(utils.defocusNode).not.toThrow();
  });

  it('set navigation invisible', () => {
    const { personMesh, naviGroup } = U.createPersonMesh();

    utils.selectNode(personMesh, { renderer: U.getRenderer() });
    utils.defocusNode(personMesh, { renderer: U.getRenderer() });
    expect(naviGroup.visible).toBe(false);
  });
});

describe('isNavigationNode', () => {
  it('does not throw error', () => {
    expect(utils.isNavigationNode).not.toThrow();
  });

  it('return true for navigation node', () => {
    const g = new MockGroup();
    g.name = 'navigation';
    const naviMesh = U.createNaviMesh();
    g.add(naviMesh);
    const value = utils.isNavigationNode(naviMesh);
    expect(value).toEqual(true);
  });
});

describe('isValidNode', () => {
  it('does not throw error', () => {
    expect(utils.isValidNode).not.toThrow();
  });

  it('returns false for no data', () => {
    expect(utils.isValidNode()).toBe(false);
  });

  it('returns true for refId defined', () => {
    const m = new MockMesh(new MockGeometry(), new MockMaterial());
    m.userData.refId = 1;
    expect(utils.isValidNode(m)).toBe(true);
  });
});

describe('isValidId', () => {
  it.each([undefined, null, '', [], {}, 'test'])('returns false for %o', (value) => {
    expect(utils.isValidId(value)).toBe(false);
  });

  it.each([0, 1, '3'])('returns true for number like value %o', (value) => {
    expect(utils.isValidId(value)).toBe(true);
  });
});
