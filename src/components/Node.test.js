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

function getAddObjectNode(r, id) {
  const calls = r.addObject.mock.calls.filter((c) => c[0] === id)
  return calls[calls.length - 1][1];
}

it('renders something for Node', () => {
  const { container } = U.renderWithContext(<Node />);
  expect(container.firstChild).toBeNull();
});

it('adds no mesh without given person', () => {
  const { renderer } = U.renderWithContext(<Node />);
  expect(renderer.addObject).not.toHaveBeenCalled();
});

it('adds a mesh to the scene', () => {
  const { renderer } = U.renderWithContext(<Node person={ U.getPerson().serialize() }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.any(String), expect.any(Object), false, undefined);
});

it('adds several groups to the mesh', () => {
  const { renderer } = U.renderWithContext(<Node person={ U.getPerson().serialize() } parent={ new MockGroup() }/>);
  expect(renderer.addObject).toHaveBeenCalledWith(expect.stringMatching(/^symbol/), expect.anything(), expect.anything(), expect.anything());
  expect(renderer.addObject).toHaveBeenCalledWith(expect.stringMatching(/^person/), expect.anything(), expect.anything(), expect.anything());
});

it('adds an offset to the node', () => {
  const offset = new Vector3(0, 1, 2);
  const { renderer } = U.renderWithContext(<Node person={ U.getPerson().serialize() } offsetY={ offset.y } offsetZ={ offset.z }/>);
  const node = renderer.addObject.mock.calls[0][1];
  expect(node.position).toEqual(offset);
});

describe('For a child', () => {
  it('use child nodes', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
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

    const childNodes = U.getChildNodes(node);

    expect(childNodes[0].position.y).toEqual(genDist);
  });
});

describe('For multiple childs', () => {
  it('adds correct child offsets for two childs', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 2);
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const childNodes = U.getChildNodes(node);

    expect(childNodes[0].position).toEqual(new Vector3(0, genDist, 0));
    expect(childNodes[1].position).toEqual(new Vector3(0, genDist, -cldDist));
  });

  it('adds correct child offsets for three childs', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 3);
 
    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    const childNodes = U.getChildNodes(node);

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

  it('adds correct grand child offsets for multiple childs', () => {
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

    const cOneNode = getAddObjectNode(renderer, `person${childOne.id}`);
    const cTwoNode = getAddObjectNode(renderer, `person${childTwo.id}`);

    expect(cOneNode.position).toEqual(new Vector3(0, genDist, 3));
    expect(cTwoNode.position).toEqual(new Vector3(0, genDist, -cldDist * 1.5));
  });
});

describe('For a partner', () => {
  it('adds a mesh to the node', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 0);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>,  { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];
    const partner = U.getPartnerNodes(node)[0];

    expect(partner.isGroup).toEqual(true);
  });
  
  it('adds offset', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 0);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>,  { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];
    const partner = U.getPartnerNodes(node)[0];

    expect(node.position).toEqual(new Vector3(0, 0, 0));
    expect(partner.position).toEqual(new Vector3(0, 0, -nodeDist));
  });
});

describe('For the data', () => {
  it('adds a data group to the node', () => {
    const { renderer } = U.renderWithContext(<Node person={ U.getPerson().serialize() }/>);
    const node = renderer.addObject.mock.calls[0][1];
    const data = U.getDataThreeGroup(node);

    expect(data.isGroup).toEqual(true);
  });
});

describe('For the assets', () => {
  it('adds an assets group to the node', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 0);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];
    const assetsGroup = U.getAssetsThreeGroup(node);

    expect(assetsGroup.isGroup).toEqual(true);
  });

  // TODO: find out what is wrong here....
  it('adds a relation visualization to the assets group', () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 0);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];
    const assetsGroup = U.getAssetsThreeGroup(node);
    const relationNode = assetsGroup.children[0];

    expect(relationNode?.material?.color).toEqual(new Color(1, 1, 1));
  });
});
