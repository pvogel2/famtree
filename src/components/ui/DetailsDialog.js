import { connect, useDispatch } from 'react-redux';
import { Popover, Grid, Typography, Card, CardContent, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

import ExtendedDialogTitle from './ExtendedDialogTitle';
import MetaDialog from './MetaDialog';

import Person from '../../lib/Person';
import { clearPerson } from '../../store/selectedPersonReducer';
import { showDate } from '../../lib/ui/utils';

function DetailsDialog(props) {
  const { selectedPerson = null, selectedMeta = null } = props;

  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(clearPerson());
  };

  if (!selectedPerson) {
    return null;
  }

  const currentPerson = selectedPerson ? new Person(selectedPerson) : new Person({ id: -1 });

  const anchorEl = document.getElementById('testtest');
  const birthDate = showDate(currentPerson.birthday);
  const deathDate = showDate(currentPerson.deathday);

  return (
    <Popover open={ true } anchorEl={ anchorEl }
      placement="top-start"
        qa="details-dialog"
        onClose={ handleClose }
        hideBackdrop={ true }
        disableBackdropClick={true}
        sx={{
          pointerEvents: 'none',
        }}
        PaperProps={{
          sx: {
            pointerEvents: 'all',
            width: selectedMeta ? '100vw' : 'auto',
          },
        }}
      >
        <ExtendedDialogTitle
          title={ currentPerson.name }
          portrait={ currentPerson.portraitUrl }
          icon={ <PersonIcon /> }
          onClose={ handleClose }
        />
          <Grid container>
            <Grid item xs={ 6 }>
        { (birthDate || deathDate) ? (<CardContent>
          <Table
            size="small"
            sx={{ width: '100%' }}
          >
            <TableBody>
              { birthDate ? (<TableRow>
                <TableCell>Birth</TableCell>
                <TableCell>{ birthDate }</TableCell>
              </TableRow>) : null }
              { deathDate ? (<TableRow>
                <TableCell>Death</TableCell>
                <TableCell>{ deathDate }</TableCell>
              </TableRow>) : null }
            </TableBody>
          </Table>
        </CardContent>) : null }
        { selectedMeta?.excerpt ? (<CardContent>
          { <Typography gutterBottom variant="h6" component="div">
            Excerpt
          </Typography> }
          <Typography variant="body2" color="text.secondary">
            { selectedMeta.excerpt }
          </Typography>
        </CardContent>) : null }
        { (selectedMeta?.description) ? (<CardContent>
          { <Typography gutterBottom variant="h6" component="div">
            Description
          </Typography> }
          <Typography variant="body2" color="text.secondary">
            { selectedMeta.description }
          </Typography>
        </CardContent>) : null }
        </Grid>
        <Grid item xs={6}>
          { selectedMeta ? <MetaDialog /> : null }
        </Grid>
      </Grid>
    </Popover>
  );
}

function mapStateToProps(state) {
  const selectedPerson = state.selectedPerson.person;
  const selectedMeta = state.selectedPerson.selectedMeta;
  return { selectedPerson, selectedMeta };
}

export default connect(mapStateToProps)(DetailsDialog);
