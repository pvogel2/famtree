import { useState, useEffect } from 'react';
import { Fab, Menu, MenuItem } from '@mui/material';
import { FamilyRestroom } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

import { setPersons } from '../../store/personsReducer';
import { setFamily } from '../../store/familyReducer';
import { loadFamily, setFamilyContext } from './../../lib/Connect';

// const families = ['twoChilds', 'test', 'default', 'dummy'];

function LoadFamily(props) {
  const {
    readonly,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const dispatch = useDispatch();
 
  const families = useSelector((state) => state.families);

  const handleLoad = async () => {
    try {
      const { persons } = await loadFamily();

      await dispatch(setPersons(persons));
      handleMenuClose();
    } catch(err) {
      console.log(err);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const updateFamily = async (value) => {
    if (families.find((f) => f === value)) {
      setFamilyContext(value);
      await dispatch(setFamily(value));
      handleLoad();
    }
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemClick = async (event) => {
    const { value } = event.currentTarget.dataset;
    await updateFamily(value);
    handleMenuClose();
  };

  const getContainer = () => {
    return document.getElementById('thepedegreerenderer');
  };

  const familyItems = families.map((item) => {
    return <MenuItem data-value={ item } key={ item } onClick={ handleItemClick }>{ item }</MenuItem>
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
        disabled={ readonly }
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
        { familyItems }
      </Menu>
    </>
  );
}

export default LoadFamily;