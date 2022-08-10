import { useEffect, useContext, useState, Fragment } from 'react';
import { Vector3, Group } from 'three';
import RenderContext from './RenderContext.js';
import PartnerRelation from './relations/PartnerRelation';
import ChildRelation from './relations/ChildRelation';
import { useSelector } from 'react-redux';

import { getMesh, addDataToMesh, addLabelText } from '../lib/nodes/utils';
import Person from '../lib/Person';
import Partner from './Partner';

const nodeDist = 6;
const genDist = 6;
const prtOffset = nodeDist * 0.5;
const cldDist = nodeDist;
const selfOffset = new Vector3(0, 0, prtOffset);
const partnerOffset = new Vector3(0, 0, -prtOffset).sub(selfOffset);
const childOffset = new Vector3(0, genDist, 0);

function findTypedGroup(m, name) {
  return m.children.find(c => c.name === name);
}

function createTypedGroup(m, name) {
  const g = new Group();
  g.name = name;
  m.add(g);
  return g;
}

function getPartnersGroup(m) {
  let g = findTypedGroup(m, 'partners');
  if (!g) {
    g = createTypedGroup(m, 'partners');
    g.position.add(partnerOffset);
  }
  return g;
}

function getAssetsGroup(m) {
  let g = findTypedGroup(m, 'assets');
  if (!g) {
    g = createTypedGroup(m, 'assets');
  }
  return g;
}

function getChildrenGroup(m) {
  let g = findTypedGroup(m, 'children');
  if (!g) {
    g = createTypedGroup(m, 'children');
    g.name = 'children';
    g.position.add(childOffset);
  }
  return g;
}

function centerPartners(m) {
  m.position.add(selfOffset);
}

function addAssetsToMesh(m) {
  return getAssetsGroup(m);
}

const findMembers = (typedArr = [], persons = []) => {
  const knownMembers = typedArr;
  const foundMembers = [];
  knownMembers.forEach((mId) => {
    const member = persons.find((p) => {
      return p.id === mId;
    });
    if (member) {
      foundMembers.push(member);
    }
  });
  return foundMembers;
}

const getPersons = (state) => state.persons;

function getChildSize(id, szs) {
  const s = szs[id];
  if (!s) {
    return 0;
  }
  return s;
}

function getChildrenGroupSize(cs, szs) {
  let groupSize = cs.reduce((total, c) => total += getChildSize(c.id, szs), 0) + Math.max((cs.length - 1), 0) * cldDist;
  return groupSize;
}

function getGroupSize(p, cs, szs) {
  let groupSize = getChildrenGroupSize(cs, szs);

  if (p.partners.length) {
    groupSize = Math.max(groupSize, 6);
  }
  return groupSize;
}

function Node(props) {
  const { person, parent, offset, sendSize = () => 0 } = props;

  const [mesh, setMesh] = useState(null);
  const [size, setSize] = useState(0);
  const [sizes] = useState({});

  const { renderer } = useContext(RenderContext);

  const persons = useSelector(getPersons);
  const children = findMembers(person?.children, persons);

  const partners = findMembers(person?.partners, persons);

  useEffect(() => {
    if (!person) return;
    const groupSize = getGroupSize(person, children, sizes);

    const newSize = groupSize > 0 ? groupSize : 0;

    if (newSize !== size) {
      sendSize(newSize);
    }
  }, [person, size, sizes, sendSize, children]);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const usedPerson = new Person(person);
    const meshId = `node${usedPerson.id}`;

    const m = getMesh();
    m.name = meshId;
    m.userData.id = usedPerson.id;
    if (offset) {
      m.position.add(offset);
    }

    renderer.addObject(meshId, m, true, parent);

    addAssetsToMesh(m);

    const dataGroup = addDataToMesh(m);
    const text = addLabelText(dataGroup, usedPerson.name);

    const childGroup = getChildrenGroup(m);

    if (usedPerson.hasPartners()) {
      childGroup.position.sub(selfOffset);
      if (!parent) {
        centerPartners(m);
      }
    }

    setMesh(m);

    return () => {
      m.clear();
      renderer.removeObject(meshId);
      text.remove(null, dataGroup);
    };
  }, [renderer, person, offset, parent]);

  if (!mesh) {
    return null;
  }

  const usedPerson = new Person(person);

  function getPartnerRelations() {
    if (!usedPerson.hasPartners()) {
      return null;
    }
    const partnersGroup = getPartnersGroup(mesh);
    const assetsGroup = getAssetsGroup(mesh);
    const partnerNodes = partners.map((p) => {
      const target = partnersGroup.position.clone();
      return (
        <Fragment key={ p.id }>
          <Partner person={ p } parent={ partnersGroup }/>
          <PartnerRelation parent={ assetsGroup } target={ target }/>
        </Fragment>
      );
    });
    return partnerNodes;
  }

  const updateSize = (s) => {
    let newSize = Math.max(s, size);

    if (usedPerson.hasPartners()) {
      newSize = Math.max(newSize, nodeDist);
    }

    if (newSize !== size) {
      setSize(s);
    }
  }

  function getChildrenRelations() {
      if (!usedPerson.hasChildren()) {
        return null;
      }
      const childGroup = getChildrenGroup(mesh);
      const groupSize = getChildrenGroupSize(children, sizes);

      const source = new Vector3(0, usedPerson.hasPartners() ? -4 : -genDist, 0);

      let currentChildPosition = groupSize * 0.5;

      // TODO: addPartnerOffset is a workaround for some partner related positioning problem, resolve later!
      let addPartnerOffset = false;
      const childNodes = children.map((c, idx) => {
        const childSize = getChildSize(c.id, sizes);

        currentChildPosition -= childSize * 0.5;
        addPartnerOffset = addPartnerOffset || c.partners.length;

        currentChildPosition += (c.partners.length && !idx ? 3 : 0);

        if (addPartnerOffset && !c.partners.length) {
          currentChildPosition -= 3;
        }

        const target = new Vector3(0, 0, currentChildPosition);

        const updateChildSize = (s) => {
          sizes[c.id] = s;
          updateSize(s);
        }

        currentChildPosition -= childSize * 0.5;
        currentChildPosition -= nodeDist;

        return (
          <Fragment key={ c.id }>
            <Node person={ c } sendSize={ updateChildSize } parent={ childGroup } offset={ target }/>
            <ChildRelation parent={ childGroup } source={ source } target={ target }/>
          </Fragment>
        );
      });
      return childNodes;
  }
  const partnerRelations = getPartnerRelations();
  const childRelations = getChildrenRelations();

  return <>
    { partnerRelations }
    { childRelations }
  </>;
};

export default Node;