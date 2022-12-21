import { useState, useEffect } from 'react';
import { Fab, Menu, MenuItem } from '@mui/material';
import { FamilyRestroom } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

import { setFounder } from '../../store/familyReducer';

function LoadFamily(props) {
  const {
    readonly,
    instanceId,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const dispatch = useDispatch();
 
  const { families, persons } = useSelector((state) => state);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemClick = async (event) => {
    if (!readonly) {
      const value = parseInt(event.currentTarget.dataset.value);

      if (families.find((f) => f === value)) {
        await dispatch(setFounder(value));
      }
    }
    handleMenuClose();
  };

  const getContainer = () => {
    return document.getElementById(instanceId);
  };

  const founderItems = families.map((item) => {
    const person = persons.find((p) => p.id === item);
    if (!person) {
      return null;
    }
    const name = `${person.firstName} ${person.lastName}`;
    return <MenuItem data-value={ item } key={ item } onClick={ handleItemClick }>{ name }</MenuItem>
  });

  useEffect(() => {
    if (open) {
      document.addEventListener('scroll', handleMenuClose);   
    }

    return () => {
      document.removeEventListener('scroll', handleMenuClose);
    };
  }, [open]);

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        onClick={ handleMenuClick }
      >
        <FamilyRestroom />
      </Fab>
      <Menu
        anchorEl={ anchorEl }
        open={ open }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        disableScrollLock={ true }
        container={ getContainer }
      >
        { founderItems }
      </Menu>
    </>
  );
}

export default LoadFamily;