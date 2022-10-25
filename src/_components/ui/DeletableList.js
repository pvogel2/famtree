import { useState } from 'react';
import { Menu, MenuItem, Button } from '@mui/material';
import { ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function DeletableList(props) {
  const {
    items = [],
    label = 'show list',
    itemClicked = () => {},
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item) => {
    itemClicked(item);
  }

  const menuItems = items.map((item) => (
    <MenuItem key={ item.id } qa="listing-item">
      <ListItemText>{ item.name }</ListItemText>
      <IconButton edge="end" aria-label="delete" onClick={ () => handleItemClick(item) }>
        <DeleteIcon />
      </IconButton>
    </MenuItem>
    )
  );
  return <>
    <Button
      qa="listing-control-button"
      onClick={ handleClick }
      disabled={ !menuItems.length }
    >
      { label }
    </Button>
    <Menu
      qa="listing-menu"
      open={ open }
      anchorEl={ anchorEl }
      onClose={ handleClose }
      anchorOrigin={ { horizontal: 'left', vertical: 'top' } }
    >
      { menuItems }
    </Menu>
  </>
};

export default DeletableList;
