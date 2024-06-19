import { useEffect, useContext, useState, useMemo, Fragment } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical } from 'three';
import RenderContext from './RenderContext.js';
import PartnerRelation from './relations/PartnerRelation';
import ChildRelation from './relations/ChildRelation';
import KNavigation from './KeyboardNavigation';
import ClassicLayout from './layouts/ClassicLayout';
import CylinderLayout from './layouts/CylinderLayout';
import { isValidId, createTreeNode, getRelationsGroup, getAssetsGroup, createNavigationNode } from '../lib/nodes/utils';
import Partner from './Partner';

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

function getNextChild(cs, idx) {
  return cs.length > idx ? cs[idx + 1]?.id : null;
}

function getParnterId(rl, pId) {
  const id =  rl?.members.find((id) => id !== pId);
  return isValidId(id) ? id : null;
}

function getLayout(id) {
  return id !== 'classic' ? CylinderLayout : ClassicLayout;
}

function createLayout(id, root) {
  return new (getLayout(id))(root);
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

  const { text, foreground, highlight, selection, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      text: store.getText(),
      foreground: store.getForeground(),
      highlight: store.getHighlight(),
      selection: store.getSelection(),
      treeLayout: store.getTreeLayout(),
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
    
    const { clean } = createNavigationNode(person, { renderer, root, navi });

    return clean;
  }, [renderer, person, root, navi]);

  // calculate overall node size
  useEffect(() => {
    const layout = createLayout(treeLayout);

    relations.forEach((r) => {
      const children = findItems(r.children, persons);
      layout.updateNodeSize(children, sizes);
    });
  
    const newTotalSize = layout.nodeSize;

    if (totalSize !== newTotalSize) {
      setTotalSize(newTotalSize);
    }
  }, [relations, sizes, totalSize, treeLayout, setTotalSize]);

  // send updated node size to parent
  useEffect(() => {
    if (!person || !sendSize) return;

    sendSize(prevSizes => ({ ...prevSizes, [person.id]: totalSize }));
  }, [person, sendSize, totalSize]);

  // render visual node
  useEffect(() => {
    if (!renderer || !person?.id) return;
    const Layout = getLayout(treeLayout);

    const offset = Layout.calcOffset(offsetX, offsetY, offsetZ);
    const colors = { foreground, text };
    const { root: newRoot, clean } = createTreeNode(person, { renderer, parent }, { offset, colors });

    setRoot(newRoot);

    return clean;
  }, [renderer, person, foreground, offsetX, offsetY, offsetZ, parent, text, treeLayout]);

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

    const layout = createLayout(treeLayout, root);

    return relations.map((r, idx) => {
      const partner = findPartner(r, person, persons);
      if (!partner) {
        return null;
      }

      rightPartnerId = getParnterId(relations[idx + 1], person.id) || nextSiblingId;

      const children = findItems(r.children, persons);

      layout.setRelation(children, sizes);

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

      let previousNodeId = null;

      const childNode = children.map((c, idx) => {
        const childFocused = c.id === focusedPerson?.id;
        const childSelected = c.id === selectedPerson?.id;

        layout.setChild(c, sizes);

        const fragment = (
          <Fragment key={ `children${c.id}` }>
            <Node
              sendSize={ setSizes }
              person={ c }
              parentId={ person.id }
              parent={ relationsGroup }
              { ...layout.getPartnerChildOffset() }
              nextSiblingId={ getNextChild(children, idx) }
              previousSiblingId={ previousNodeId }
            />
            <ChildRelation
              highlight={ childSelected ? selection : (childFocused ? highlight : undefined) }
              parent={ assetsGroup }
              { ...layout.getChildRelationSource() }
              { ...layout.getChildRelationTarget() }
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
