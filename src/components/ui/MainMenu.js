import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SpeedDial, SpeedDialIcon,  } from '@mui/material';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { FamilyRestroom, Person } from '@mui/icons-material';

import { showPersonDialog } from '../../store/dialogsReducer';
import FamilyDialog from './FamilyDialog';


const actions = [
  { icon: <FamilyRestroom />, name: 'Founder' },
  { icon: <Person />, name: 'Person' },
];

function MainMenu() {
  const [familyOpen, setFamilyOpen] = useState(false);

  const dispatch = useDispatch();

  const handleActionClick = async function(action) {
    if (action === 'founder') {
      setFamilyOpen(true);
    } else if (action === 'person') {
      dispatch(showPersonDialog());
    }
  }

  return (
    <>
    <SpeedDial
      ariaLabel="SpeedDial main menu"
      sx={{ position: 'absolute', bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
      qa={ `main-menu` }
    >
      {actions.map((action) => (
        <SpeedDialAction
          qa={ `main-menu-action-${action.name.toLowerCase()}` }
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={ () => handleActionClick(action.name.toLowerCase()) }
        />
      ))}
    </SpeedDial>
    <FamilyDialog open={ familyOpen } setOpen={ setFamilyOpen } />
    </>
  );
}

export default MainMenu;