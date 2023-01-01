import { useEffect, useContext, useState, Fragment } from 'react';
import { Vector3 } from 'three';
import RenderContext from './RenderContext.js';
import PartnerRelation from './relations/PartnerRelation';
import ChildRelation from './relations/ChildRelation';
import { useSelector } from 'react-redux';

import { getPersonGroup, getSymbolGroup, getDataGroup, getAssetsGroup, addLabelText3D, findNamedGroup, createNamedGroup } from '../lib/nodes/utils';
import Person from '../lib/Person';
import Partner from './Partner';

const nodeDist = 6;

const nodeSize = 6;

const genDist = 6;

function getRelationsGroup(m) {
  return (findNamedGroup(m, 'relations') || createNamedGroup(m, 'relations'));
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
const getLayout = (state) => state.layout; 
const getFocusedPerson = (state) => state.focusedPerson;
const getSelectedPerson = (state) => state.selectedPerson.person;

function getChildSize(id, szs) {
  const s = szs[id];
  if (!s) {
    return nodeSize;
  }
  return s;
}

function getChildrenGroupSize(cs, szs) {
  let groupSize = cs.reduce((total, c) => {
    return total += getChildSize(c.id, szs);
  }, 0); //  + Math.max((cs.length - 1), 0) * cldDist;
  return groupSize;
}

const defaultSendSize = () => 0;

const debugId = null;

function Node(props) {
  const { person, parent, sendSize = defaultSendSize, offsetY = 0, offsetZ = 0 } = props;

  const [root, setRoot] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [sizes] = useState({});

  const { renderer } = useContext(RenderContext);

  const persons = useSelector(getPersons);
  const { text, foreground, highlight, selection } = useSelector(getLayout); 
  const focusedPerson = useSelector(getFocusedPerson);
  const selectedPerson = useSelector(getSelectedPerson);
  const relations = useSelector(getRelations).filter((r) => r.members.includes(person?.id));;

  const isFocused = focusedPerson?.id === person?.id;
  const isSelected = selectedPerson?.id === person?.id;

  useEffect(() => {
    if (!person) return;
    let newTotalSize = nodeSize;
    let childMinZ = 0;
    const relationTarget = new Vector3();

    relations.forEach((r, idx) => {
      const children = findMembers(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      if (person.id === debugId) console.log('Relation no ', idx, 'children length', children.length, 'childrenSize', childrenSize);

      if (person.id === debugId) console.log('idx', idx);

      if (idx === 0) {
        relationTarget.add(new Vector3(0, 0,  -nodeDist));
        childMinZ = relationTarget.z;// - getNormalizedDistance(childrenSize);
      } else {
        if (children.length === 0) {
        } else {
          if (childMinZ > relationTarget.z) { // childMinZ is left side from relation target
            relationTarget.add(new Vector3(0, 0, -nodeDist));
          } else {
            relationTarget.setZ(childMinZ - childrenSize * 0.5); // - nodeDist);
            childMinZ = relationTarget.z - childrenSize * 0.5;
          }
        }
      }
      const oldTotalSize = newTotalSize;
      if (newTotalSize < childrenSize) {
        newTotalSize = childrenSize;
      }

      const members = r.members;
      if (person.id === debugId) console.log('members', members, 'idx', idx, 'newTotalSize', newTotalSize);

      if (newTotalSize < (oldTotalSize + nodeSize)) { // minimum if relation existent
        newTotalSize += nodeSize ;
      }
    });

    if (person.id === debugId) console.log('newTotalSize', newTotalSize);

    sendSize(newTotalSize);
    if (totalSize !== newTotalSize) {
      if (person.id === debugId) console.log('set newTotalSize', newTotalSize);
      setTotalSize(newTotalSize);
    }
  }, [person, relations, sizes, sendSize]);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const usedPerson = new Person(person);

    const rootOffset = new Vector3(0, offsetY, offsetZ);
    const rootId = `person${usedPerson.id}`;

    const newRoot = getPersonGroup(usedPerson);
    newRoot.position.add(rootOffset);

    const symbolGroup = getSymbolGroup(person, { foreground });
    const symbolId = `symbol${usedPerson.id}`;
  
    renderer.addObject(rootId, newRoot, false, parent);
    renderer.addObject(symbolId, symbolGroup, true, newRoot);

    const dataGroup = getDataGroup(newRoot);
    const labelText = addLabelText3D(dataGroup, usedPerson.name, text);

    setRoot(newRoot);

    return () => {
      newRoot.clear();
      renderer.removeObject(rootId);
      renderer.removeObject(symbolId);
      labelText.remove(null, dataGroup);
    };
  }, [renderer, person, foreground, offsetY, offsetZ, parent, text]);

  if (!root) {
    return null;
  }

  function getNodeRelations() {
    if (!relations?.length) {
      return null;
    }

    const relationsGroup = getRelationsGroup(root);
    const assetsGroup = getAssetsGroup(root);

    const relationTarget = new Vector3();
    let childMinZ = 0;


    return relations.map((r, idx) => {
      const partner = findPartner(r, person, persons);
      if (!partner) {
        return null;
      }

      const children = findMembers(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      relationTarget.add(new Vector3(0, 0,  -nodeDist));

      if (idx === 0) {
        childMinZ = relationTarget.z - childrenSize * 0.5; // getNormalizedDistance(childrenSize);
      } else if (children.length && childMinZ <= relationTarget.z) { // childMin is right side from relation target
        relationTarget.setZ(childMinZ - (childrenSize + nodeDist) * 0.5);
        childMinZ = relationTarget.z - childrenSize * 0.5;
      }
      
      const childSource = new Vector3(0, genDist / 3  - idx * 0.2, relationTarget.z + nodeDist * 0.5); // set start point for childSource

      const partnerFocused = partner.id === focusedPerson?.id;
      const partnerSelected = partner.id === selectedPerson?.id;

      const partnerNode = (
        <>
          <Partner
            person={ partner }
            parent={ relationsGroup }
            offsetY={ relationTarget.y }
            offsetZ={ relationTarget.z }
          />
          <PartnerRelation
            highstart={ isSelected ? selection : (isFocused ? highlight : undefined) }
            highend={ partnerSelected ? selection : (partnerFocused ? highlight : undefined) }
            parent={ assetsGroup }
            targetX={ relationTarget.x }
            targetY={ relationTarget.y }
            targetZ={ relationTarget.z }
            offsetX={ 0 }
            offsetY={ childSource.y }
            offsetZ={ 0 }
          />
        </>
      );

      const currentChildTarget = childSource.clone();
      currentChildTarget.setY(genDist);
      currentChildTarget.add(new Vector3(0, 0, childrenSize * 0.5))

      const childNode = children.map((c) => {
        const updateNodeSize = (s) => {
          sizes[c.id] = s;
        }

        const childSize = getChildSize(c.id, sizes);
        const relationDistance = c.relations.length ? c.relations.length * 0.5 * nodeSize : 0;

        const childTarget = currentChildTarget.clone();
        childTarget.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
        childTarget.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined
        
        const childFocused = c.id === focusedPerson?.id;
        const childSelected = c.id === selectedPerson?.id;

        currentChildTarget.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)

        if (person.id === debugId) {
          console.log('childTarget', c.id, childTarget.z);
        }
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
              highlight={ childSelected ? selection : (childFocused ? highlight : undefined) }
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
