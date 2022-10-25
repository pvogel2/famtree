import { useState } from 'react';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { FamilyRestroom } from  '@mui/icons-material';
import { FormGroup, FormControl, Select, MenuItem } from '@mui/material';
import { Button, Grid } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

import ExtendedDialogTitle from './ExtendedDialogTitle';
import { setPersons } from '../../store/personsReducer';
import { setFamily } from '../../store/familyReducer';
import { loadFamily, updatePerson, savePerson, setFamilyContext } from './../../lib/Connect';

const families = ['twoChilds', 'test', 'default', 'dummy'];

export default function FamilyDialog(props) {
  const persons = useSelector((state) => state.persons);
  const family = useSelector((state) => state.family);

  const {
    open = false,
    setOpen = () => {},
  } = props;

  const [knownIds, setKnownIds] = useState([]);

  const dispatch = useDispatch();
    
  const handleClose = () => {
    setOpen(false);
  };

  const handleLoad = async () => {
    try {
      const loadedPersons = await loadFamily();
      setKnownIds(loadedPersons.map((p) => p.id));
      await dispatch(setPersons(loadedPersons));
      handleClose();
    } catch(err) {
      console.log(err);
    }
  };

  const handleSave = () => {
    try {
      persons.forEach((p) => {
        knownIds.includes(p.id) ? updatePerson(p) : savePerson(p);
      });
    } catch(err) {
      console.log(err);
    }
  };

  const handleFamilyChange = async (event) => {
    const value = event.target.value;
    if (families.find((f) => f === value)) {
      setFamilyContext(value);
      await dispatch(setFamily(value));
    }
  }

  const familyItems = families.map((item) => {
    return <MenuItem value={ item } key={ item }>{ item }</MenuItem>
  });

  return (
      <Dialog
        qa="family-dialog"
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { position: 'absolute', top: '20px', right: '20px' } }}
        hideBackdrop
        fullWidth
      >
        <ExtendedDialogTitle
          title="Family"
          icon={ <FamilyRestroom /> }
          onClose={ handleClose }
        />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormGroup>
                <FormControl>
                  <Select
                    qa="family-selector"
                    value={ family || '' }
                    onChange={ handleFamilyChange }
                  >
                    { familyItems }
                  </Select>
                </FormControl>
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button qa="family-load" disableElevation onClick={ handleLoad }>Load</Button>
          <Button qa="family-save" variant="contained" disableElevation onClick={ handleSave }>Save</Button>
        </DialogActions>
      </Dialog>
  );
}