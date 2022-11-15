import { useEffect, useContext, useState, Fragment } from 'react';
import { Vector3, Group } from 'three';
import RenderContext from './RenderContext.js';
import PartnerRelation from './relations/PartnerRelation';
import ChildRelation from './relations/ChildRelation';
import { useSelector } from 'react-redux';

import { getPersonMesh, addDataToMesh, addLabelText } from '../lib/nodes/utils';
import Person from '../lib/Person';
import Partner from './Partner';

const nodeDist = 6;
const genDist = 6;
const cldDist = nodeDist;

function findTypedGroup(m, name) {
  return m.children.find(c => c.name === name);
}

function createTypedGroup(m, name) {
  const g = new Group();
  g.name = name;
  m.add(g);
  return g;
}

function getRelationsGroup(m) {
  let g = findTypedGroup(m, 'relations');
  if (!g) {
    g = createTypedGroup(m, 'relations');
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

const findPartner = (relation, person, persons = []) => {
  if (!relation.members.length > 1) {
    return null;
  }

  const pIds = relation.members.filter((id) => id !== person.id);

  const found =  findMembers(pIds, persons);

  if (!found.length) {
    return null;
  }

  return found[0];
}

const getPersons = (state) => state.persons;

const getRelations = (state) => state.relations;

const getText = (state) => state.layout.text;

function getChildSize(id, szs) {
  const s = szs[id];
  if (!s) {
    return 0;
  }
  return s;
}

function getChildrenGroupSize(cs, szs) {
  let groupSize = cs.reduce((total, c) => {
    return total += getChildSize(c.id, szs);
  }, 0) + Math.max((cs.length - 1), 0) * cldDist;
  return groupSize;
}

function getNormalizedDistance(dist) {
  return Math.max((dist - nodeDist) * 0.5, 0);
}

function addChildSourceOffset(rTarget, cSource) {
  cSource.setZ(rTarget.z + nodeDist * 0.5); // update childPosition to new relation target
}

function addRelationMinDist(rTarget) {
  rTarget.add(new Vector3(0, 0,  -nodeDist));
}

const defaultSendSize = () => 0;


function Node(props) {
  const { person, parent, sendSize = defaultSendSize, offsetY = 0, offsetZ = 0 } = props;

  const [mesh, setMesh] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [sizes] = useState({});

  const { renderer } = useContext(RenderContext);

  const persons = useSelector(getPersons);
  
  const text = useSelector(getText);

  const relations = useSelector(getRelations).filter((r) => r.members.includes(person?.id));;

  useEffect(() => {
    if (!person) return;

    let newTotalSize = 0;
    let childMinZ = 0;
    const relationTarget = new Vector3();

    relations.forEach((r, idx) => {
      const children = findMembers(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      if (idx === 0) {
        relationTarget.add(new Vector3(0, 0,  -nodeDist));
        childMinZ = relationTarget.z - getNormalizedDistance(childrenSize);
        newTotalSize += getNormalizedDistance(childrenSize); // left part of children group
      } else {
        if (children.length === 0) {
          relationTarget.add(new Vector3(0, 0, -nodeDist));
          childMinZ -= nodeDist;
        } else {
          if (childMinZ > relationTarget.z) { // childMinZ is left side from relation target
            relationTarget.add(new Vector3(0, 0, -nodeDist));
          } else {
            relationTarget.setZ(childMinZ - nodeDist - childrenSize * 0.5);
            childMinZ = relationTarget.z - childrenSize * 0.5;
          }
        }
      }
    });

    newTotalSize += Math.abs(childMinZ);

    sendSize(newTotalSize);
    if (totalSize !== newTotalSize) {
      setTotalSize(newTotalSize);
    }
  }, [person, relations, sizes, sendSize]);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const usedPerson = new Person(person);

    const meshOffset = new Vector3(0, offsetY, offsetZ);
    const meshId = `node${usedPerson.id}`;

    const m = getPersonMesh({ mapUrl: person.portraitUrl });
    m.name = meshId;

    m.userData.id = usedPerson.id;
    m.userData.type = 'node';

    m.position.add(meshOffset);

    renderer.addObject(meshId, m, true, parent);

    const dataGroup = addDataToMesh(m);
    const labelText = addLabelText(dataGroup, usedPerson.name, text);

    setMesh(m);

    return () => {
      m.clear();
      renderer.removeObject(meshId);
      labelText.remove(null, dataGroup);
    };
  }, [renderer, person, offsetY, offsetZ, parent, text]);

  if (!mesh) {
    return null;
  }

  function getNodeRelations() {
    if (!relations?.length) {
      return null;
    }

    const relationsGroup = getRelationsGroup(mesh);
    const assetsGroup = getAssetsGroup(mesh);

    const relationTarget = new Vector3();
    const childPosition = new Vector3();
    let childMinZ = 0;

    childPosition.add(new Vector3(0, genDist - 4, 0));

    return relations.map((r, idx) => {
      const partner = findPartner(r, person, persons);
      if (!partner) {
        return null;
      }

      const children = findMembers(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      const childSourceOffset = new Vector3(0, idx * -0.2, 0);

      addRelationMinDist(relationTarget);

      if (idx === 0) {
        childMinZ = relationTarget.z - getNormalizedDistance(childrenSize);
      } else if (children.length && childMinZ <= relationTarget.z) { // childMin is right side from relation target
        relationTarget.setZ(childMinZ - (childrenSize + nodeDist) * 0.5);
        addRelationMinDist(relationTarget);
        childMinZ = relationTarget.z - childrenSize * 0.5;
      }

      addChildSourceOffset(relationTarget, childPosition);

      const partnerNode = (
        <>
          <Partner
            person={ partner }
            parent={ relationsGroup }
            offsetY={ relationTarget.y }
            offsetZ={ relationTarget.z }
          />
          <PartnerRelation
            parent={ assetsGroup }
            targetX={ relationTarget.x }
            targetY={ relationTarget.y }
            targetZ={ relationTarget.z }
            offsetX={ childSourceOffset.x }
            offsetY={ childSourceOffset.y }
            offsetZ={ childSourceOffset.z }
          />
        </>
      );

      const childSource = childPosition.clone().add(childSourceOffset);

      childPosition.add(new Vector3(0, 0, childrenSize * 0.5));

      const childNode = children.map((c, idx) => {
        const updateNodeSize = (s) => {
          sizes[c.id] = s;
        }
        const firstChild = idx === 0;

        const childSize = getChildSize(c.id, sizes);
        const childTarget = childPosition.clone().add(new Vector3(0, genDist - 2, firstChild ? 0 : -getNormalizedDistance(childSize)));
        const lastChild = idx === children.length - 1;

        childPosition.add(new Vector3(0, 0, -childSize - (lastChild ? 0 : nodeDist)));

        return (
          <Fragment key={ `children${c.id}` }>
            <Node
              sendSize={ updateNodeSize }
              person={ c }
              parent={ relationsGroup }
              offsetY={ childTarget.y }
              offsetZ={ childTarget.z }
            />
            <ChildRelation
              parent={ assetsGroup }
              sourceX={ childSource.x  }
              sourceY={ childSource.y  }
              sourceZ={ childSource.z  }
              targetX={ childTarget.x }
              targetY={ childTarget.y }
              targetZ={ childTarget.z }
            />
          </Fragment>
        );
      });

      return (
        <Fragment key={ `relation${r.id}` }>
          { partnerNode }
          { childNode }
        </Fragment>
      );
    });
  }

  return getNodeRelations();
};

export default Node;
