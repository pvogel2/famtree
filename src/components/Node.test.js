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
import Node from './Node';

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

const nodeDist = 6;
const genDist = 6;
const prtOffset = nodeDist * 0.5;
const cldDist = nodeDist;

afterEach(() => {
  jest.clearAllMocks()
});

function getPersonWithChilds(persons = [], relations = [], n = 1) {
  const ps = U.getPerson();
  const pr = U.getPerson();

  const rl = U.getRelation([ps.id, pr.id]);
  for (let i = 0; i < n; i++) {
    const c = U.getPerson();
    rl.children.push(c.id);
    persons.push(c);
  }

  ps.addRelation(rl.id);
  persons.push(ps, pr);
  relations.push(rl);

  return ps;
}

const serializedPerson = U.getPerson();
const serializedPartner = U.getPerson().serialize();
const serializedChild = U.getPerson().serialize();

const relation = U.getRelation([serializedPerson.id, serializedPartner.id]);
const relationWithChild = U.getRelation([serializedPerson.id, serializedPartner.id], [serializedChild.id]);

const serializedWithChild = U.clonePerson(serializedPerson);
serializedWithChild.addRelation(relationWithChild.id);

const serializedWithPartner = U.clonePerson(serializedPerson);
serializedWithPartner.addRelation(relation.id);

it('renders something for Node', () => {
  const { container } = U.renderWithContext(<Node />);
  expect(container.firstChild).toBeNull();
});

it('adds no mesh without given person', () => {
  const { renderer } = U.renderWithContext(<Node />);
  expect(renderer.addObject).not.toHaveBeenCalled();
});

it('adds a mesh to the scene', () => {
  const { renderer } = U.renderWithContext(<Node person={ serializedPerson.serialize() }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.any(String), expect.any(Object), false, undefined);
});

it('adds several groups to the mesh', () => {
  const { renderer } = U.renderWithContext(<Node person={ serializedPerson.serialize() } parent={ new MockGroup() }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.stringMatching(/^symbol/), expect.anything(), expect.anything(), expect.anything());
  expect(renderer.addObject).toHaveBeenCalledWith(expect.stringMatching(/^person/), expect.anything(), expect.anything(), expect.anything());
});

it('adds an offset to the node', () => {
  const offset = new Vector3(0, 1, 2);
  const { renderer } = U.renderWithContext(<Node person={ serializedPerson.serialize() } offsetY={ offset.y } offsetZ={ offset.z }/>);
  const node = renderer.addObject.mock.calls[0][1];
  expect(node.position).toEqual(offset);
});

describe('For a child', () => {
  it('use child nodes', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithChild.serialize() }/>, { relations: [relationWithChild] });
    const node = renderer.addObject.mock.calls[0][1];
    const relationsGroup = U.getRelationsThreeGroup(node);
    expect(relationsGroup.isGroup).toEqual(true);
  });
  
  it('adds correct y offset', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations);
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() } />, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const relationsGroup = U.getRelationsThreeGroup(node);
    const childNode = relationsGroup.children.find((c) => c.name.startsWith('person'));
    expect(childNode.position.y).toEqual(genDist);
  });
});

describe('For multiple childs', () => {
  it('adds correct child offsets for two childs', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 2);
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const relationsGroup = U.getRelationsThreeGroup(node);
    const childNodes = relationsGroup.children.filter((c) => c.name.startsWith('person'));

    expect(childNodes[0].position).toEqual(new Vector3(0, genDist, 0));
    expect(childNodes[1].position).toEqual(new Vector3(0, genDist, -cldDist));
  });

  it('adds correct child offsets for three childs', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 3);
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const relationsGroup = U.getRelationsThreeGroup(node);
    const childNodes = relationsGroup.children.filter((c) => c.name.startsWith('person'));

    expect(childNodes[0].position).toEqual(new Vector3(0, genDist, cldDist * 0.5));
    expect(childNodes[1].position).toEqual(new Vector3(0, genDist, -cldDist * 0.5));
    expect(childNodes[2].position).toEqual(new Vector3(0, genDist, -cldDist * 1.5));
  });
});

describe('For multiple grand childs', () => {
  it('adds correct child offsets', () => {
    const persons = [];
    const relations = [];
    const person = U.getPerson();
    const partner = U.getPerson();
    const childOne = getPersonWithChilds(persons, relations, 2);

    const relation = U.getRelation([person.id, partner.id], [childOne.id]);
    person.addRelation(relation.id);
  
    relations.push(relation);
    persons.push(person, partner);
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const grandChildNodes = U.getChildNodes(U.getChildNodes(node)[0]);
    expect(grandChildNodes[0].position).toEqual(new Vector3(0, genDist, 0));
    expect(grandChildNodes[1].position).toEqual(new Vector3(0, genDist, -cldDist));
  });

  it.only('adds correct grand child offsets for multiple childs', () => {
    const persons = [];
    const relations = [];
    const person = U.getPerson();
    const partner = U.getPerson();
    const childOne = getPersonWithChilds(persons, relations, 2);
    const childTwo = U.getPerson();

    const relation = U.getRelation([person.id, partner.id], [childOne.id, childTwo.id]);
    person.addRelation(relation.id);
  
    relations.push(relation);
    persons.push(person, partner, childTwo);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const childNodes = U.getChildNodes(node);
    expect(childNodes[0].position).toEqual(new Vector3(0, genDist, cldDist * 0.5));
    expect(childNodes[1].position).toEqual(new Vector3(0, genDist, -cldDist * 1.5));
  });
});

describe.skip('For a partner', () => {
  it('adds a mesh to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithPartner.serialize() }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const partnersGroup = U.getPartnerThreeGroup(node);

    expect(partnersGroup.isGroup).toEqual(true);
  });
  
  it('adds offset', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithPartner.serialize() }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const partnersGroup = U.getPartnerThreeGroup(node);

    expect(node.position).toEqual(new Vector3(0, 0, prtOffset));
    expect(partnersGroup.position).toEqual(new Vector3(0, 0, -prtOffset * 2));
  });
});

describe.skip('For the data', () => {
  it('adds a data group to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedPerson.serialize() }/>);
    const node = renderer.addObject.mock.lastCall[1];
    const data = U.getDataThreeGroup(node);

    expect(data.isGroup).toEqual(true);
  });
});

describe.skip('For the assets', () => {
  it('adds an assets group to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ serializedWithPartner.serialize() }/>);
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

  describe.skip.each([
    { desc: 'single parent', p: single, expds: singleExpects },
    { desc: 'parent couple', p: couple, expds: coupleExpects },
  ])('for $desc', ({ p, expds }) => {
    const expectedData = [...expds];

    it.each(children)('sets up founder variant $# correctly', ({ cs }) => {
      const person = p();
      const persons = [person];
      const { size: expectedSize, zs: expectedZs } = expectedData.shift();

      cs.forEach((c) => {
        const child = c();
        person.addChild(child.id);
        persons.push(child);
      });
    
      const getSize = jest.fn((s) => s);
      const { renderer } = U.renderWithContext(<Node sendSize={ getSize } person={ person.serialize() }/>, { persons });
    
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
