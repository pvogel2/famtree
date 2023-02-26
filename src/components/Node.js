import { useEffect, useContext, useState, useMemo, Fragment } from 'react';
import { Vector3 } from 'three';
import RenderContext from './RenderContext.js';
import PartnerRelation from './relations/PartnerRelation';
import ChildRelation from './relations/ChildRelation';
import { useSelector } from 'react-redux';
import KNavigation from './KeyboardNavigation';

import { isValidId, createTreeNode, getRelationsGroup, getAssetsGroup, createNavigationNode } from '../lib/nodes/utils';
import Partner from './Partner';

const NODE_DIST = 6;
const NODE_SIZE = 6;
const GEN_DIST = 6;

function getFirstChildOfRelations(rs) {
  const fr = rs.find((rl) => rl.children.length);
  return fr?.children[0];
}

function getLastRelation(rs) {
  const lr = rs[rs.length - 1];
  return isValidId(lr) ? lr : null;
}

const findIems = (typedArr = [], persons = []) => {
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

  const found = findIems(pIds, persons);

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
    return NODE_SIZE;
  }
  return s;
}

function getChildrenGroupSize(cs, szs) {
  let groupSize = cs.reduce((total, c) => {
    return total += getChildSize(c.id, szs);
  }, 0); //  + Math.max((cs.length - 1), 0) * cldDist;
  return groupSize;
}

function getNextChild(cs, idx) {
  return cs.length > idx ? cs[idx + 1]?.id : null;
}

function getParnterId(rl, pId) {
  const id =  rl?.members.find((id) => id !== pId);
  return isValidId(id) ? id : null;
}

function Node(props) {
  const {
    person,
    parent,
    parentId = null,
    sendSize,
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0,
    previousSiblingId = null,
    nextSiblingId = null,
  } = props;

  const [root, setRoot] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [sizes, setSizes] = useState({});

  const { renderer } = useContext(RenderContext);

  const persons = useSelector(getPersons);
  const { text, foreground, highlight, selection } = useSelector(getLayout); 
  const focusedPerson = useSelector(getFocusedPerson);
  const selectedPerson = useSelector(getSelectedPerson);
  const allRelations = useSelector(getRelations);

  const relations = useMemo(() => allRelations.filter((r) => r.members.includes(person?.id)), [allRelations, person]);

  const isFocused = focusedPerson && focusedPerson?.id === person?.id;
  const isSelected = selectedPerson && selectedPerson?.id === person?.id;

  const navi = useMemo(() => {
    const rightNeighborId = relations.length ? getParnterId(relations[0], person?.id) : nextSiblingId;
    const firstChildId = getFirstChildOfRelations(relations);
  
    return {
      parent: { refId: parentId },
      child: { refId: firstChildId },
      left: { refId: previousSiblingId },
      right: { refId: rightNeighborId },
    };
  }, [person, parentId, previousSiblingId, nextSiblingId, relations]);

  // render visual node navigation
  useEffect(() => {
    if (!renderer || !person?.id || !root) return;

    const { clean } = createNavigationNode(person, { renderer, parent: root, navi });

    return clean;
  }, [renderer, person, root, navi]);

  // calculate overall node size
  useEffect(() => {
    let newTotalSize = NODE_SIZE;
    let childMinZ = 0;
    const relationTarget = new Vector3();

    relations.forEach((r, idx) => {
      const children = findIems(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      if (idx === 0) {
        relationTarget.add(new Vector3(0, 0,  -NODE_DIST));
        childMinZ = relationTarget.z;
      } else if (children.length > 0) {
        if (childMinZ > relationTarget.z) { // childMinZ is left side from relation target
          relationTarget.add(new Vector3(0, 0, -NODE_DIST));
        } else {
          relationTarget.setZ(childMinZ - childrenSize * 0.5);
          childMinZ = relationTarget.z - childrenSize * 0.5;
        }
      }

      const oldTotalSize = newTotalSize;
      if (newTotalSize < childrenSize) {
        newTotalSize = childrenSize;
      }

      if (newTotalSize < (oldTotalSize + NODE_SIZE)) { // minimum if relation existent
        newTotalSize += NODE_SIZE;
      }
    });

    setTotalSize(newTotalSize);
  }, [relations, sizes, totalSize]);

  // send updated node size to parent
  useEffect(() => {
    if (!person || !sendSize) return;

    sendSize(prevSizes => ({ ...prevSizes, [person.id]: totalSize }));
  }, [person, sendSize, totalSize]);

  // render visual node
  useEffect(() => {
    if (!renderer || !person?.id) return;

    const offset = new Vector3(offsetX, offsetY, offsetZ);
    const colors = { foreground, text };
    const { root: newRoot, clean } = createTreeNode(person, { renderer, parent }, { offset, colors });

    setRoot(newRoot);

    return clean;
  }, [renderer, person, foreground, offsetX, offsetY, offsetZ, parent, text]);

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
    let leftPartnerId = person.id;
    let rightPartnerId = null;

    const module3D = {
      setRelationMinDist: (v, idx = 0, max = 1) => {
        const ang = idx * 2 * Math.PI / max;
        const d = new Vector3(Math.sin(ang) * NODE_DIST, 0, -Math.cos(ang) * NODE_DIST);
        v.set(d.x, d.y, d.z);
      },
      getChildSource: (idx, vTarget) => {
        const n = vTarget.clone().setY(0).normalize();
        return new Vector3(vTarget.x - n.x * NODE_DIST * 0.5, GEN_DIST / 3, vTarget.z - n.z * NODE_DIST * 0.5);
      },
      getInitialChildTarget: (vSource, childrenSize) => {
        const n = vSource.clone().setY(0).normalize();
        const target = vSource.clone();
        target.setY(GEN_DIST);
        // target.add(new Vector3(n.x * NODE_DIST * 0.5, 0, n.z * NODE_DIST * 0.5));
        return target;
      },
      getCurrentChildTarget: (vCurrent, childSize, relationDistance) => {
        const n = vCurrent.clone().setY(0).normalize();
        const offset = 0.5 * childSize + relationDistance;
        return vCurrent.clone().add(new Vector3(n.x * offset, 0, n.z * offset));
      },
    };

    const module2D = {
      setRelationMinDist: (v) => v.add(new Vector3(0, 0, -NODE_DIST)),
      getChildSource: (idx, vTarget) => new Vector3(0, GEN_DIST / 3  - idx * 0.2, vTarget.z + NODE_DIST * 0.5),
      getInitialChildTarget: (vSource, childrenSize) => {
        const target = vSource.clone();
        target.setY(GEN_DIST);
        target.add(new Vector3(0, 0, childrenSize * 0.5));
        return target;
      },
      getCurrentChildTarget: (vCurrent, childSize, relationDistance) => {
        const target = vCurrent.clone();
        target.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
        target.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined
        return target;
      },
    };

    return relations.map((r, idx) => {
      const module = module3D;
      const partner = findPartner(r, person, persons);
      if (!partner) {
        return null;
      }

      rightPartnerId = getParnterId(relations[idx + 1], person.id) || nextSiblingId;

      const children = findIems(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      module.setRelationMinDist(relationTarget, idx, relations.length);

      // TODO: care for module 2d and 3d
      if (module === module2D) {
        if (idx === 0) {
          childMinZ = relationTarget.z - childrenSize * 0.5;
        } else if (children.length && childMinZ <= relationTarget.z) { // childMin is right side from relation target
          relationTarget.setZ(childMinZ - (childrenSize + NODE_DIST) * 0.5);
          childMinZ = relationTarget.z - childrenSize * 0.5;
        }
      }
      
      const childSource = module.getChildSource(idx, relationTarget); // set start point for childSource

      const partnerFocused = partner.id === focusedPerson?.id;
      const partnerSelected = partner.id === selectedPerson?.id;

      const partnerNode = (
        <>
          <Partner
            person={ partner }
            parent={ relationsGroup }
            offsetX={ relationTarget.x }
            offsetY={ relationTarget.y }
            offsetZ={ relationTarget.z }
            parentId={ parentId }
            toChildId={ children[0]?.id }
            toLeftId={ (isValidId(leftPartnerId) ? leftPartnerId : null) }
            toRightId={ (isValidId(rightPartnerId) ? rightPartnerId : null) }
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

      const currentChildTarget = module.getInitialChildTarget(childSource, childrenSize);

      let previousNodeId = null;

      const childNode = children.map((c, idx) => {
        const childSize = getChildSize(c.id, sizes);
        const relationDistance = c.relations.length ? c.relations.length * 0.5 * NODE_SIZE : 0;

        const childTarget = module.getCurrentChildTarget(currentChildTarget, childSize, relationDistance);
        // const childTarget = currentChildTarget.clone();
        // childTarget.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
        // childTarget.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined
        
        const childFocused = c.id === focusedPerson?.id;
        const childSelected = c.id === selectedPerson?.id;

        currentChildTarget.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)

        const fragment = (
          <Fragment key={ `children${c.id}` }>
            <Node
              sendSize={ setSizes }
              person={ c }
              parentId={ person.id }
              parent={ relationsGroup }
              offsetX={ childTarget.x }
              offsetY={ childTarget.y }
              offsetZ={ childTarget.z }
              nextSiblingId={ getNextChild(children, idx) }
              previousSiblingId={ previousNodeId }
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

        previousNodeId = c.id;

        const lastChildRelation = getLastRelation(c.relations);
        if (isValidId(lastChildRelation)) {
          const lcRl = allRelations.find((r) => r.id === lastChildRelation);
          previousNodeId = getParnterId(lcRl, c.id);
        }

        return fragment;
      });

      leftPartnerId = partner.id;

      return (
        <Fragment key={ `relation${r.id}` }>
          { partnerNode }
          { childNode }
        </Fragment>
      );
    });
  }

  return (
    <Fragment>
      { getNodeRelations() }
      { isSelected && <KNavigation upId={ navi.child.refId } downId={ navi.parent.refId } leftId={ navi.left.refId } rightId={ navi.right.refId }/> }
    </Fragment>
  );
};

export default Node;
