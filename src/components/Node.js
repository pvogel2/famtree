import { useEffect, useContext, useState, useMemo, Fragment } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3 } from 'three';
import RenderContext from './RenderContext.js';
import PartnerRelation from './relations/PartnerRelation';
import ChildRelation from './relations/ChildRelation';
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

const findItems = (typedArr = [], persons = []) => {
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

  const found = findItems(pIds, persons);

  if (!found.length) {
    return null;
  }

  return found[0];
}

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

class Layout {
  rTarget = new Vector3();
  cTarget = new Vector3();
  cSource = new Vector3();
  currentCTarget = new Vector3();
  childMinZ = 0;

  updateRelationTarget(idx, length, childrenSize) {
    this.rTarget.add(new Vector3(0, 0,  -NODE_DIST));

    if (idx > 0 && length && this.childMinZ <= this.rTarget.z) { // childMin is right side from relation target
      this.rTarget.setZ(this.childMinZ - (childrenSize + NODE_DIST) * 0.5);
    }
    this.childMinZ = this.rTarget.z - childrenSize * 0.5;
  }

  getChildSource(idx) {
    const v = new Vector3(0, GEN_DIST / 3  - idx * 0.2, this.rTarget.z + NODE_DIST * 0.5);
    this.cSource.set(v.x, v.y, v.z);
    return this.cSource;
  }

  getCurrentChildTarget(childrenSize) {
    this.currentCTarget = this.cSource.clone();
    this.currentCTarget.setY(GEN_DIST);
    this.currentCTarget.add(new Vector3(0, 0, childrenSize * 0.5));

    return this.currentCTarget;
  }

  getChildTarget(relationsLength, childSize) {
    const relationDistance = relationsLength ? relationsLength * 0.5 * NODE_SIZE : 0;

    this.cTarget = this.currentCTarget.clone();
    this.cTarget.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
    this.cTarget.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined

    this.currentCTarget.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)
  }

  getPartnerOffset() {
    return {
      offsetX: this.rTarget.x,
      offsetY: this.rTarget.y,
      offsetZ: this.rTarget.z,
    };
  }

  getPartnerRelationOffset() {
    return {
      offsetX: 0,
      offsetY: this.cSource.y,
      offsetZ: 0,
    };
  }

  getPartnerRelationTarget() {
    return {
      targetX: this.rTarget.x,
      targetY: this.rTarget.y,
      targetZ: this.rTarget.z,
    };
  }

  getPartnerChildTarget() {
    return {
      targetX: this.cTarget.x,
      targetY: this.cTarget.y,
      targetZ: this.cTarget.z,
    };
  }

  getPartnerChildOffset() {
    return {
      offsetX: 0,
      offsetY: this.cTarget.y,
      offsetZ: this.cTarget.z,
    };
  }
}

function createLayout() {
  return new Layout();
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

  const personId = person?.id;

  const { focusedPerson, selectedPerson, persons, allRelations } = useSelect((select) => {
    const store = select('famtree/families');
    return {
      selectedPerson: store.getSelected(),
      focusedPerson: store.getFocused(),
      persons: store.getPersons(),
      allRelations: store.getRelations(),
    };
  }, []);

  const { text, foreground, highlight, selection } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      text: store.getText(),
      foreground: store.getForeground(),
      highlight: store.getHighlight(),
      selection: store.getSelection(),
    };
  });

  const relations = useMemo(() => {
    return allRelations.filter((r) => r.members.includes(personId));
  }, [allRelations, person]);

  const isFocused = focusedPerson && focusedPerson?.id === person?.id;
  const isSelected = selectedPerson && selectedPerson?.id === person?.id;

  const navi = useMemo(() => {
    const rightNeighborId = relations.length ? getParnterId(relations[0], personId) : nextSiblingId;
    const firstChildId = getFirstChildOfRelations(relations);
  
    return {
      parent: { refId: parentId, id: Math.random() },
      child: { refId: firstChildId },
      left: { refId: previousSiblingId },
      right: { refId: rightNeighborId },
    };
  }, [personId, parentId, previousSiblingId, nextSiblingId, relations]);

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
      const children = findItems(r.children, persons);
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

    if (totalSize !== newTotalSize) {
      setTotalSize(newTotalSize);
    }
  }, [relations, sizes, totalSize, setTotalSize]);

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

    let leftPartnerId = person.id;
    let rightPartnerId = null;
    const layout = createLayout();

    return relations.map((r, idx) => {
      const partner = findPartner(r, person, persons);
      if (!partner) {
        return null;
      }

      rightPartnerId = getParnterId(relations[idx + 1], person.id) || nextSiblingId;

      const children = findItems(r.children, persons);
      const childrenSize = getChildrenGroupSize(children, sizes);

      layout.updateRelationTarget(idx, children.length, childrenSize);

      const childSource = layout.getChildSource(idx);

      const partnerFocused = partner.id === focusedPerson?.id;
      const partnerSelected = partner.id === selectedPerson?.id;

      const partnerNode = (
        <>
          <Partner
            person={ partner }
            parent={ relationsGroup }
            { ...layout.getPartnerOffset() }
            parentId={ parentId }
            toChildId={ children[0]?.id }
            toLeftId={ (isValidId(leftPartnerId) ? leftPartnerId : null) }
            toRightId={ (isValidId(rightPartnerId) ? rightPartnerId : null) }
            />
          <PartnerRelation
            highstart={ isSelected ? selection : (isFocused ? highlight : undefined) }
            highend={ partnerSelected ? selection : (partnerFocused ? highlight : undefined) }
            parent={ assetsGroup }
            { ...layout.getPartnerRelationOffset() }
            { ...layout.getPartnerRelationTarget() }
          />
        </>
      );

      // const currentChildTarget = childSource.clone();
      // currentChildTarget.setY(GEN_DIST);
      // currentChildTarget.add(new Vector3(0, 0, childrenSize * 0.5));
      const currentChildTarget = layout.getCurrentChildTarget(childrenSize);

      let previousNodeId = null;

      const childNode = children.map((c, idx) => {
        const childSize = getChildSize(c.id, sizes);
        // const relationDistance = c.relations.length ? c.relations.length * 0.5 * NODE_SIZE : 0;

        // const childTarget = currentChildTarget.clone();
        // childTarget.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
        // childTarget.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined
        
        const childFocused = c.id === focusedPerson?.id;
        const childSelected = c.id === selectedPerson?.id;

        // currentChildTarget.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)
        layout.getChildTarget(c.relations.length, childSize);

        const fragment = (
          <Fragment key={ `children${c.id}` }>
            <Node
              sendSize={ setSizes }
              person={ c }
              parentId={ person.id }
              parent={ relationsGroup }
              // offsetX={ 0 }
              // offsetY={ childTarget.y }
              // offsetZ={ childTarget.z }
              { ...layout.getPartnerChildOffset() }
              nextSiblingId={ getNextChild(children, idx) }
              previousSiblingId={ previousNodeId }
            />
            <ChildRelation
              highlight={ childSelected ? selection : (childFocused ? highlight : undefined) }
              parent={ assetsGroup }
              sourceX={ childSource.x  }
              sourceY={ childSource.y  }
              sourceZ={ childSource.z  }
              { ...layout.getPartnerChildTarget() }
              // targetX={ childTarget.x }
              // targetY={ childTarget.y }
              // targetZ={ childTarget.z }
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
