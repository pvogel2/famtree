import {
  Color,
  Vector3,
  Group,
} from 'three';
import { waitFor } from '@testing-library/react';
import U from '../lib/tests/utils';
import Node from './Node';

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

it('adds several groups to the mesh', async () => {
  const { renderer } = U.renderWithContext(<Node person={ U.getPerson().serialize() } parent={ new Group() }/>);

  await waitFor(() => expect(renderer.addObject).toHaveBeenCalledWith(expect.stringMatching(/^symbol/), expect.anything(), expect.anything(), expect.anything()));
  await waitFor(() => expect(renderer.addObject).toHaveBeenCalledWith(expect.stringMatching(/^person/), expect.anything(), expect.anything(), expect.anything()));
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
    const relationsGroup = U.findRelationsGroup(node);

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
    const data = U.findDataGroup(node);

    expect(data.isGroup).toEqual(true);
  });
});

describe('For the assets', () => {
  it('adds an assets group to the node', async () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 0);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });

    const node = renderer.addObject.mock.calls[0][1];
    await waitFor(() => {
      const assetsGroup = U.findAssetsGroup(node);

      return expect(assetsGroup.isGroup).toEqual(true);
    });
  });

  it('adds a relation visualization to the assets group', async () => {
    const persons = [];
    const relations = [];
    const person = getPersonWithChilds(persons, relations, 0);

    const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
    const node = renderer.addObject.mock.calls[0][1];

    await waitFor(() => {
      const symbolsGroup = U.findSymbolsGroup(node);
      const relationNode = symbolsGroup.children[0];
      return expect(relationNode?.material?.color).toEqual(new Color(1, 1, 1));
    });
  });

  describe('containing the navigation group', () => {
    async function getControlNode(parent, id) {
      let control;
      await waitFor(() => {
        control = parent.children.find((c) => c.userData.refId === id);
        return expect(control).toBeDefined();
      });
      return control;
    }

    function getNaviGroup(renderer) {
      const node = renderer.addObject.mock.calls[0][1];
      return U.findNavigationGroup(node);
    };

    const arrOff = 0.2;
    const naviOff = 0.9;

    it('adds the navigation to the root node', () => {
      const { renderer } = U.renderWithContext(<Node person={ U.getPerson().serialize() }/>);
      const node = renderer.addObject.mock.calls[0][1];

      const naviGroup = U.findNavigationGroup(node);
      expect(naviGroup).toBeDefined();
      expect(naviGroup.type).toBe('Group');
      expect(naviGroup.position).toEqual(expect.objectContaining({ x: arrOff, y: naviOff, z: -naviOff}));
    });

    describe('for parent navigation control mesh', () => {
      const person = U.getPerson();
      const refId = 14;

      it('is rendered', async () => {
        const pos = [0, -arrOff, 0];

        const { renderer } = U.renderWithContext(<Node parentId={ refId } person={ person.serialize() }/>);

        const naviGroup = getNaviGroup(renderer);
        const toParent = await getControlNode(naviGroup, refId);

        expect(naviGroup.visible).toEqual(false);
        expect(toParent.type).toBe('Mesh');
        expect(toParent.position.toArray()).toEqual(pos);
      });

      it('is configured for intersection', async () => {
        const { renderer } = U.renderWithContext(<Node parentId={ refId } person={ person.serialize() }/>);
        const naviGroup = getNaviGroup(renderer);
        const toParent = await getControlNode(naviGroup, refId);

        expect(renderer.addObject).toHaveBeenCalledWith(`parentNavi${person.id}`, toParent, true, naviGroup);
      });
    });

    describe('for child navigation control mesh', () => {
      it('is rendered', async () => {
        const persons = [];
        const relations = [];
        const person = getPersonWithChilds(persons, relations);
        const pos = [0, arrOff, 0];
        const refId = relations[0].children[0];

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() } />, { persons, relations });
        const naviGroup = getNaviGroup(renderer);
        const toChild = await getControlNode(naviGroup, refId);

        expect(naviGroup.visible).toEqual(false);
        expect(toChild).toBeDefined();
        expect(toChild.type).toBe('Mesh');
        expect(toChild.position.toArray()).toEqual(pos);
      });

      it('is configured for intersection', async () => {
        const persons = [];
        const relations = [];
        const person = getPersonWithChilds(persons, relations);
        const refId = relations[0].children[0];

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() } />, { persons, relations });
        const naviGroup = getNaviGroup(renderer);
        const toChild = await getControlNode(naviGroup, refId);

        expect(renderer.addObject).toHaveBeenCalledWith(`childNavi${person.id}`, toChild, true, naviGroup);
      });
    });

    describe('for right navigation control mesh', () => {
      it('is rendered', async () => {
        const persons = [];
        const relations = [];
        const person = U.getPersonWithRelations(persons, relations);
        const pos = [0, 0, -arrOff];
        const refId = relations[0].members[1];

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
        const naviGroup = getNaviGroup(renderer);
        const toPartner = await getControlNode(naviGroup, refId);

        expect(naviGroup.visible).toEqual(false);
        expect(toPartner).toBeDefined();
        expect(toPartner.type).toBe('Mesh');
        expect(toPartner.position.toArray()).toEqual(pos);
      });

      it('correct property set on partner node', async () => {
        const persons = [];
        const relations = [];
        const person = U.getPersonWithRelations(persons, relations);

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
        const node = renderer.addObject.mock.calls[0][1];
        const relationsGroup = node.children.find((c) => c.name === 'relations');
        const subNaviGroup = relationsGroup.children[0].children.find((c) => c.name === 'navigation');
        const toPerson = await getControlNode(subNaviGroup, person.id);

        expect(toPerson).toBeDefined();
      });
 
      it('correct property set on multiple partner nodes', async () => {
        const persons = [];
        const relations = [];
        const person = U.getPersonWithRelations(persons, relations, 2);

        const personId = person.id;
        const partnerIds = relations.map((r) => r.members[1]);

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
        const node = renderer.addObject.mock.calls[0][1];
        const relationsGroup = node.children.find((c) => c.name === 'relations');
        const partnerNodes = relationsGroup.children;
        const subNaviGroup0 = partnerNodes[0].children.find((c) => c.name === 'navigation');
        const toPerson0 = await getControlNode(subNaviGroup0, personId);

        const subNaviGroup1 = partnerNodes[1].children.find((c) => c.name === 'navigation');
        const toPerson1 = await getControlNode(subNaviGroup1, partnerIds[0]);

        expect(toPerson0).toBeDefined();
        expect(toPerson1).toBeDefined();
      });

      it('renders navigation for next sibling', async () => {
        const person = U.getPerson();
        const pos = [0, 0, -arrOff];
        const refId = 14;

        const { renderer } = U.renderWithContext(<Node nextSiblingId={ refId } person={ person.serialize() }/>);
        const naviGroup = getNaviGroup(renderer);
        const toNextSibling = await getControlNode(naviGroup, refId);

        expect(toNextSibling).toBeDefined();
        expect(toNextSibling.type).toBe('Mesh');
        expect(toNextSibling.position.toArray()).toEqual(pos);
      });

      it('renders navigation for previous sibling', async () => {
        const person = U.getPerson();
        const pos = [0, 0, arrOff];
        const refId = 14;

        const { renderer } = U.renderWithContext(<Node previousSiblingId={ refId } person={ person.serialize() }/>);
        const naviGroup = getNaviGroup(renderer);
        const toPreviousSibling = await getControlNode(naviGroup, refId);

        expect(toPreviousSibling).toBeDefined();
        expect(toPreviousSibling.type).toBe('Mesh');
        expect(toPreviousSibling.position.toArray()).toEqual(pos);
      });
    });

    describe('for left navigation of partner nodes', () => {
      it('property not set on partner node', async () => {
        const persons = [];
        const relations = [];
        const person = U.getPersonWithRelations(persons, relations);

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
        const node = renderer.addObject.mock.calls[0][1];
        const relationsGroup = node.children.find((c) => c.name === 'relations');
        const subNaviGroup = relationsGroup.children[0].children.find((c) => c.name === 'navigation');
        const toPerson = await getControlNode(subNaviGroup, person.id);

        expect(toPerson).toBeDefined();
        expect(subNaviGroup.children).toHaveLength(1);
      });

      it('correct property set on multiple partner nodes', async () => {
        const persons = [];
        const relations = [];
        const person = U.getPersonWithRelations(persons, relations, 2);

        const partnerIds = relations.map((r) => r.members[1]);

        const { renderer } = U.renderWithContext(<Node person={ person.serialize() }/>, { persons, relations });
        const node = renderer.addObject.mock.calls[0][1];
        const relationsGroup = node.children.find((c) => c.name === 'relations');
        const partnerNodes = relationsGroup.children;
        const subNaviGroup0 = partnerNodes[0].children.find((c) => c.name === 'navigation');
        const toPerson = await getControlNode(subNaviGroup0, partnerIds[1]);

        expect(toPerson).toBeDefined();
      });
    });
  });
});
