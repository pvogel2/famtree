import React from 'react';
import { cleanup } from '@testing-library/react';
import { Color, Vector3 } from 'three';

import U from '../lib/tests/utils';
import Node from './Node';

jest.mock('../lib/nodes/utils', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getPersonGroup: () => ({}),
      getSymbolGroup: () => ({}),
      getDataGroup: () => ({}),
      getAssetsGroup: () => ({}),
      addLabelText3D: () => ({}),
      findNamedGroup: () => ({}),
      createNamedGroup: () => ({}),
    };
  });
});

const nodeDist = 6;
const genDist = 6;
const prtOffset = nodeDist * 0.5;
const cldDist = nodeDist;

afterEach(cleanup);

const serializedPerson = U.getPerson().serialize();
const serializedWithChild = U.getPersonWithChild().serialize();
const serializedWithPartner = U.getPersonWithPartner().serialize();

it.only('renders something for Node', () => {
  const { debug, container } = U.renderWithContext(<Node />);
  debug(container);
  expect(container.firstChild).toBeNull();
});

it('adds no mesh without given person', () => {
  const { renderer } = U.renderWithContext(<Node />);
  expect(renderer.addObject).not.toHaveBeenCalled();
});

it('adds a mesh to the scene', () => {
  const { renderer } = U.renderWithContext(<Node person={ serializedPerson }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.any(String), expect.any(Object), true, undefined);
});

it('adds a name to the mesh', () => {
  const { renderer } = U.renderWithContext(<Node person={ serializedPerson }/>);
  const node = renderer.addObject.mock.calls[0][1];
  expect(node.name).toEqual(expect.stringMatching(/^node/));
});

it('adds an offset to the node', () => {
  const offset = new Vector3(1, 1, 1);
  const { renderer } = U.renderWithContext(<Node person={ serializedPerson } offset={ offset }/>);
  const node = renderer.addObject.mock.calls[0][1];
  expect(node.position).toEqual(offset);
});

describe('For a child', () => {
  it('use child nodes', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithChild }/>);
    const node = renderer.addObject.mock.calls[0][1];
    expect(renderer.addObject).toHaveBeenCalledTimes(1);

    const childsGroup = U.getChildrenThreeGroup(node);
    expect(childsGroup.isGroup).toEqual(true);
  });
  
  it('adds correct y offset', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithChild }/>);
    const node = renderer.addObject.mock.calls[0][1];

    const childsGroup = U.getChildrenThreeGroup(node);
    expect(childsGroup.position).toEqual(new Vector3(0, genDist, 0));
  });
});

// TODO: correctly mock renderer.addObject
describe.skip('For multiple childs', () => {
  it('adds correct child offsets', () => {
    const person = U.getPerson();
    const childOne = U.getPerson();
    const childTwo = U.getPerson();
    person.addChild(childOne.id);
    person.addChild(childTwo.id);
    const persons = [person, childOne, childTwo];
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, persons);
    const node = renderer.addObject.mock.calls[0][1];

    const childNodes = node.children.find((c) => c.name === 'children');
    expect(childNodes.children[0].position).toEqual(new Vector3(0, 0, cldDist * 0.5));
    expect(childNodes.children[1].position).toEqual(new Vector3(0, 0, -cldDist * 0.5));
  });
});

describe('For multiple grand childs', () => {
  it('adds correct child offsets', () => {
    const person = U.getPerson();
    const childOne = U.getPerson();
    const GrandchildOne = U.getPerson();
    const GrandchildTwo = U.getPerson();
    childOne.addChild(GrandchildOne.id);
    childOne.addChild(GrandchildTwo.id);
    person.addChild(childOne.id);
    const persons = [person, childOne, GrandchildOne, GrandchildTwo];
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, persons);
    const node = renderer.addObject.mock.calls[0][1];

    const childNodes = node.children.find((c) => c.name === 'children');
    expect(childNodes.children[0].position).toEqual(new Vector3(0, 0, 0));
  });

  it('adds correct grand child offsets for multiple childs', () => {
    const person = U.getPerson();
    const childOne = U.getPerson();
    const childTwo = U.getPerson();
    const GrandchildOne = U.getPerson();
    const GrandchildTwo = U.getPerson();
    childOne.addChild(GrandchildOne.id);
    childOne.addChild(GrandchildTwo.id);
    person.addChild(childOne.id);
    const persons = [person, childOne, childTwo, GrandchildOne, GrandchildTwo];
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, persons);
    const node = renderer.addObject.mock.calls[0][1];

    const childNodes = node.children.find((c) => c.name === 'children');
    expect(childNodes.children[0].position).toEqual(new Vector3(0, 0, 0));
  });
});

describe('For a partner', () => {
  it('adds a mesh to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithPartner }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const partnersGroup = U.getPartnerThreeGroup(node);

    expect(partnersGroup.isGroup).toEqual(true);
  });
  
  it('adds offset', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithPartner }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const partnersGroup = U.getPartnerThreeGroup(node);

    expect(node.position).toEqual(new Vector3(0, 0, prtOffset));
    expect(partnersGroup.position).toEqual(new Vector3(0, 0, -prtOffset * 2));
  });
});

describe('For the data', () => {
  it('adds a data group to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedPerson }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const data = U.getDataThreeGroup(node);

    expect(data.isGroup).toEqual(true);
  });
});

describe('For the assets', () => {
  it('adds an assets group to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithPartner }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const assetsGroup = U.getAssetsThreeGroup(node);

    expect(assetsGroup.isGroup).toEqual(true);
  });

  // TODO: find out what is wrong here....
  it.skip('adds a relation visualization to the assets group', () => {
    const person = U.getPerson();
    const partner = U.getPerson();
    person.addPartner(partner.id);
    const persons = [person, partner];

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, persons);
    const node = renderer.addObject.mock.lastCall[1];
    const assetsGroup = U.getAssetsThreeGroup(node);
    const relationNode = assetsGroup.children[0];

    expect(relationNode?.material?.color).toEqual(new Color(0, 1, 0));
  });
});

// TODO: correctly mock renderer.addObject
describe.skip('calculates dimensions', () => {
  const single = () => U.getPerson();
  const couple = () => U.getPersonWithPartner();

  const children = [
    { cs: [] },
    { cs: [single] },
    { cs: [single, single] },
    { cs: [couple] },
    { cs: [single, couple] },
    { cs: [couple, single] },
  ];

  const singleExpects = [
    { size: [0, 0], zs: [] },
    { size: [0, 0], zs: [0] },
    { size: [-2, 2], zs: [2, -2] },
    { size: [-2, 2], zs: [2] },
    { size: [-4, 4], zs: [4, 0] },
    { size: [-4, 4], zs: [4, -4] },
  ];

  const coupleExpects = [
    { size: [-2, 2], zs: [] },
    { size: [-2, 2], zs: [0] },
    { size: [-2, 2], zs: [2, -2] },
    { size: [-2, 2], zs: [2] },
    { size: [-4, 4], zs: [4, 0] },
    { size: [-4, 4], zs: [4, -4] },
  ];

  describe.each([
    { desc: 'single parent', p: single, expds: singleExpects },
    { desc: 'parent couple', p: couple, expds: coupleExpects },
  ])('for $desc', ({ p, expds }) => {
    const expectedData = [...expds];

    it.only.each(children)('sets up founder variant $# correctly', ({ cs }) => {
      const person = p();
      const persons = [person];
      const { size: expectedSize, zs: expectedZs } = expectedData.shift();

      cs.forEach((c) => {
        const child = c();
        person.addChild(child.id);
        persons.push(child);
      });
    
      const getSize = jest.fn((s) => s);
      const { renderer } = U.renderWithContext(<Node sendSize={ getSize } person={ person.serialize() }/>, persons);
    
      expect(getSize).toHaveBeenCalledWith(expectedSize);
  
      const node = renderer.addObject.mock.calls[0][1];
      const childrenGroup = U.getChildrenThreeGroup(node);
  
      const childNodes = childrenGroup.children.filter((n) => n.name.startsWith('node'));
      expectedZs.forEach((z, idx) => {
        expect(childNodes[idx]?.position.z).toBe(z);
      });
    });
  });
});
