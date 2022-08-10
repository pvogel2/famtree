import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';

import { FormGroup, FormControl } from '@mui/material';
import { Select, MenuItem, Button } from '@mui/material';

import Person from '../../lib/Person';
import { updatePersons } from '../../store/personsReducer';

function RelationSelector(props) {
  const { targetPerson, persons=[] } = props;

  const [relatedPerson, setRelatedPerson] = useState({});

  const dispatch = useDispatch();

  const findPerson  = (id) => persons.find((p) => p.id === id);

  const handleRelatedPersonChange = (event) => {
    const p = findPerson(event.target.value);
    setRelatedPerson(p);
  }

  const handleAddChildClick = () => {
    /* TODO: do not modify prop value */
    const updatedTarget = new Person(targetPerson.serialize());

    updatedTarget.addChild(relatedPerson.id);
    // relatedPerson.addParent(targetPerson.id);

    dispatch(updatePersons([updatedTarget.serialize(), relatedPerson.serialize()]));
  }

  const handleAddPartnerClick = () => {
    /* TODO: do not modify prop value */
    const updatedTarget = new Person(targetPerson.serialize());

    updatedTarget.addPartner(relatedPerson.id);
    relatedPerson.addPartner(targetPerson.id);

    dispatch(updatePersons([updatedTarget.serialize(), relatedPerson.serialize()]));
  }

  const relationItems = persons.map((p) => {
     return p.id !== targetPerson?.id ? <MenuItem value={ p.id } key={ p.id }>{ p.name }</MenuItem> : null;
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
        disabled={ !relatedPerson.id }
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
    </FormGroup>
  );
}
function mapStateToProps(state) {
  const persons = state.persons.map((data) => new Person(data));
  return { persons };
}

export default connect(mapStateToProps)(RelationSelector);
