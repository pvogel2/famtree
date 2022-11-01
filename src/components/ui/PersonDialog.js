import { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { FormGroup, FormControl } from '@mui/material';
import { Select, TextField, MenuItem, Button, Grid, InputAdornment } from '@mui/material';
import { Flare, Church, Person as PersonIcon } from '@mui/icons-material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import RelationSelector from './RelationSelector';

import ExtendedDialogTitle from './ExtendedDialogTitle';
import Person from '../../lib/Person';
import { DATE_FORMAT } from '../../lib/ui/utils';
import { addPerson, updatePerson } from '../../store/personsReducer';
import { showPersonDialog, hidePersonDialog } from '../../store/dialogsReducer';
import { clearPerson } from '../../store/focusedPersonReducer';
import { updatePerson as updateConnectPerson, savePerson as saveConnectPerson } from './../../lib/Connect';

function PersonDialog(props) {
  const { persons = [], relations = [], founder } = props;

  const [editedPerson, setEditedPerson] = useState({});

  const config = useSelector((state) => state.config);
  const open = config.edit !== null;
  const id = config.edit;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [deathday, setDeathday] = useState(null);
  const [birthName, setBirthName] = useState('');
  const [surNames, setSurNames] = useState('');

  const findPerson  = useCallback((id) => persons.find((p) => p.id === id), [persons]);

  function getFreePersonId() {
    let id = persons.length;
    persons.forEach((p) => {
      if (p.id >= id) {
        id = p.id + 1;
      }
    });
    return id;
  }

  const editableStringProps = [
    { name: 'firstName', value: firstName, setter: setFirstName },
    { name: 'surNames', value: surNames, setter: setSurNames },
    { name: 'lastName', value: lastName, setter: setLastName },
    { name: 'birthName', value: birthName, setter: setBirthName },
  ];

  const editableDateProps = [
    { name: 'birthday', value: birthday, setter: setBirthday, icon: <Flare /> },
    { name: 'deathday', value: deathday, setter: setDeathday, icon: <Church /> },
  ];

  useEffect(() => {
    if (editedPerson.id) return;

    const foundPerson = findPerson(id);
    if (foundPerson) {
      setEditedPerson(new Person(foundPerson));
      editableStringProps.forEach((ep) => {
        ep.setter(foundPerson[ep.name] || '');
      });
      editableDateProps.forEach((ep) => {
        ep.setter(foundPerson[ep.name] || '');
      });
    }
    return () => {
      if (foundPerson && editedPerson.id) {
        setEditedPerson({});
      }
    }
  }, [id, findPerson, editedPerson]);

  const dispatch = useDispatch();

  const resetEditedPerson = () => {
    setFirstName('');
    setLastName('');
    setBirthday(null);
    setDeathday(null);
    setBirthName('');
    setSurNames('');
    setEditedPerson({});

    dispatch(clearPerson());
  }

  const handleClear = () => {
    resetEditedPerson();
    dispatch(showPersonDialog({ edit: ''}));
  };

  const handleClose = () => {
    resetEditedPerson();
    dispatch(hidePersonDialog());
  };

  const currentRelations = relations.filter((r) => r.members.includes(editedPerson.id));

  const personItems = persons.map((item) => {
    return <MenuItem value={ item.id } key={ item.id }>{ item.name }</MenuItem>
  });

  const handleEditedPersonChange = (event) => {
    const p = findPerson(event.target.value);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setBirthday(p.birthday);
    setDeathday(p.deathday);
    setBirthName(p.birthName);
    setSurNames(p.surNames);

    setEditedPerson(new Person(p));
  };

  const handleSave = async () => {
    let person;
    if (!editedPerson.id) {
      person = new Person({
        id: getFreePersonId(),
        firstName,
        lastName,
        birthday,
        deathday,
        birthName,
        surNames,
        founder,
      });
      await dispatch(addPerson(person.serialize()));
      saveConnectPerson(person.serialize());
    } else {
      person = new Person(findPerson(editedPerson.id));
      person.firstName = firstName;
      person.lastName = lastName;
      person.birthday = birthday;
      person.deathday = deathday;
      person.birthName = birthName;
      person.surNames = surNames;
      await dispatch(updatePerson(person.serialize()));
      updateConnectPerson(person.serialize());
  }
    setEditedPerson(person);
  };

  const textFields = editableStringProps.map(
    (p) => <TextField margin="dense" key={ p.name } value={ p.value } name={ p.name } label={ p.name } onChange={  (event) =>p.setter(event.target.value) }/>
  );

  const dateFields = editableDateProps.map(
    (p) => (
      <DatePicker
        disableFuture={ true }
        key={ p.name }
        label={ p.name }
        value={ p.value }
        minDate={ (new Date()).setFullYear(1800) }
        inputFormat={ DATE_FORMAT }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              { p.icon }
            </InputAdornment>
          ),
        }}
        onChange={ (newValue) => {
          p.setter(newValue !== null ? newValue.valueOf() : null);
        } }
        // onError={ () => { p.setter(null); } } // this way validation is disabled, see https://github.com/mui/material-ui-pickers/issues/836
        renderInput={(params) => <TextField margin="dense" name={ p.name } { ...params } />}
      />
    )
  );

  return (
       <Dialog
        qa="person-dialog"
        open={ open }
        onClose={ handleClose }
        PaperProps={{ sx: { position: 'absolute', top: '50px', left: '20px' } }}
        hideBackdrop
      >
        <ExtendedDialogTitle
          title="Person"
          icon={ <PersonIcon /> }
          onClose={ handleClose }
        />
        <DialogContent>
          <Grid container spacing={ 2 }>
            <Grid item xs={ 6 }>
              <FormGroup>
                <FormControl>
                  <Select
                    qa="person-selector"
                    value={ editedPerson.id || '' }
                    onChange={ handleEditedPersonChange }
                  >
                    { personItems }
                  </Select>
                </FormControl>
              </FormGroup>
              <FormGroup>
                { textFields }
                { dateFields }
              </FormGroup>
            </Grid>
            <Grid item xs={6}>
              <RelationSelector relations={ currentRelations } targetPerson={ findPerson(editedPerson.id) } />
           </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button qa="person-clear" disableElevation onClick={ handleClear }>Clear</Button>
          <Button qa="person-save" variant="contained" disableElevation onClick={ handleSave }>Save</Button>
        </DialogActions>
      </Dialog>
  );
}

function mapStateToProps(state) {
  const persons = state.persons.map((data) => new Person(data));
  const relations = state.relations;
  const founder = state.founder;
  return { persons, relations, founder };
}

export default connect(mapStateToProps)(PersonDialog);
