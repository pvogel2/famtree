import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';

import { FormGroup, FormControl } from '@mui/material';
import { Select, MenuItem, Button } from '@mui/material';

import DeletableList from './DeletableList';

import Person from '../../lib/Person';
import { updateRelation, addRelation, removeRelation } from '../../store/relationsReducer';
import { updatePerson } from '../../store/personsReducer';

import { deleteRelation as deleteConnectRelation, updateRelation as updateConnectRelation, saveRelation as saveConnectRelation } from '../../lib/Connect';

function RelationSelector(props) {
  const { targetPerson, relations = [], persons = [], founder = -1 } = props;

  const [relatedPerson, setRelatedPerson] = useState({});
  const [editedRelation, setEditedRelation] = useState({});

  const childrenIds = [];
  const partnersIds = [];
  relations.forEach((r) => {
    childrenIds.push(...r.children);
    partnersIds.push(...r.members);
  });

  const children = editedRelation.children ? persons.filter((item) => editedRelation.children.includes(item.id)) : [];

  const dispatch = useDispatch();

  const findPerson  = (id) => persons.find((p) => p.id === id);

  const handleRelatedPersonChange = (event) => {
    const p = findPerson(event.target.value);
    setRelatedPerson(p);
  }

  const handleEditedRelationChange = (event) => {
    const r = relations.find((item) =>  item.id === event.target.value);
    setEditedRelation(r);
  };

  
  const handleChildClicked = async (item) => {
    if (editedRelation.children.includes(item.id)) {
      const changedRelation = { ...editedRelation };
      changedRelation.children = editedRelation.children.filter((id) => id !== item.id);
      await dispatch(updateRelation(changedRelation));
      await updateConnectRelation(changedRelation);
    }
  };

  const handleAddChildClick = async () => {
    const id = relatedPerson.id;

    if (!editedRelation.children.includes(id)) {
      const changedRelation = { ...editedRelation };
      changedRelation.children = [...editedRelation.children];
      changedRelation.children.push(id);
      await dispatch(updateRelation(changedRelation));
      await updateConnectRelation(changedRelation);
    }
  }

  const handleAddPartnerClick = async () => {
    const newRelation = {
      founder,
      members: [targetPerson.id, relatedPerson.id],
      type: null,
      start: null,
      end: null,
      children: [],
    };
    const result = await dispatch(addRelation(newRelation));
    const relation = result.payload;

    if (!isNaN(relation.id)) {
      await saveConnectRelation(relation);
      const modifiedTargetPerson = { ...targetPerson.serialize() };
      modifiedTargetPerson.relations.push(relation.id);
      await dispatch(updatePerson(modifiedTargetPerson));

      const modifiedRelatedPerson = { ...relatedPerson.serialize() };
      modifiedRelatedPerson.relations.push(relation.id);
      await dispatch(updatePerson(modifiedRelatedPerson));
    } else {
      console.log('WARNING, missing data in processed payload:', relation);
    }
  }

  const handleRemovePartnerClick = async () => {
    const relId = editedRelation.id;

    await dispatch(removeRelation(relId));
    await deleteConnectRelation(relId);

    const modifiedTargetPerson = { ...targetPerson.serialize() };
    modifiedTargetPerson.relations = targetPerson.filter((rId) => rId !== relId);
    await dispatch(updatePerson(modifiedTargetPerson));

    const modifiedRelatedPerson = { ...relatedPerson.serialize() };
    modifiedRelatedPerson.relations = relatedPerson.filter((rId) => rId !== relId);
    await dispatch(updatePerson(modifiedRelatedPerson));
  }

  const relationItems = persons.map((p) => {
    if (p.id === targetPerson?.id || childrenIds.includes(p.id) || partnersIds.includes(p.id)) {
      return null;
    }
    return <MenuItem value={ p.id } key={ p.id }>{ p.name }</MenuItem>;
  });

  const currentRelationItems = relations.map((item) => {
    const partnerId = item.members.find((mId) => mId !== targetPerson.id);
    const partner = persons.find((item) => item.id === partnerId);
    return <MenuItem value={ item.id } key={ item.id }>{ partner.name }</MenuItem>
  });

  return (
    <FormGroup>
      <FormControl>
        <Select
          disabled={ !targetPerson }
          qa="add-relation-selector"
          value={ relatedPerson.id || '' }
          onChange={ handleRelatedPersonChange }
         >
          { relationItems }
        </Select>
      </FormControl>
      <Button
        disabled={ !relatedPerson.id || !editedRelation.id }
        onClick={ handleAddChildClick }
        qa="add-child" >
          add as child
      </Button>
      <Button
        disabled={ !relatedPerson.id }
        onClick={ handleAddPartnerClick }
        qa="add-partner" >
          add as partner
      </Button>
      <FormControl>
        <Select
          qa="relation-selector"
          value={ editedRelation.id || '' }
          onChange={ handleEditedRelationChange }
        >
          { currentRelationItems }
        </Select>
      </FormControl>
      <Button
        disabled={ !editedRelation.id }
        onClick={ handleRemovePartnerClick }
        qa="remove-partner" >
          remove as partner
      </Button>
      <FormControl>
        <DeletableList label="current children" items={ children } itemClicked={ handleChildClicked }/>
      </FormControl>
    </FormGroup>
  );
}

function mapStateToProps(state) {
  const persons = state.persons.map((data) => new Person(data));
  const founder = state.founder;
  return { persons, founder };
}

export default connect(mapStateToProps)(RelationSelector);
