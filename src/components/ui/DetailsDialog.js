import { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button, Popover, Grid, Typography, CardActionArea, CardContent, CardActions } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

import ExtendedDialogTitle from './ExtendedDialogTitle';
import PersonDetails from './PersonDetails';
import RenderContext from '../RenderContext.js';

import Person from '../../lib/Person';
import { clearPerson, setSelectedMeta } from '../../store/selectedPersonReducer';
import { getMetaContainer } from '../../lib/ui/utils';


function DetailsDialog(props) {
  const { selectedPerson = null, selectedMeta = null, metadata = [] } = props;

  if (!selectedPerson) {
    return null;
  }

  const { renderTarget } = useContext(RenderContext);
  const dispatch = useDispatch();

  const index = metadata.findIndex((md) => md.id === selectedMeta?.id);

  const previousMeta = () => {
    const md = metadata[index - 1];
    dispatch(setSelectedMeta(md.id));
  }

  const nextMeta = () => {
    const md = metadata[index + 1];
    dispatch(setSelectedMeta(md.id));
  }

  const handleClose = () => {
    dispatch(clearPerson());
  };

  const currentPerson = selectedPerson ? new Person(selectedPerson) : new Person({ id: -1 });

  return (
    <Popover open={ true } anchorEl={ renderTarget.current }
      placement="top-start"
        qa="details-dialog"
        onClose={ handleClose }
        hideBackdrop={ true }
        transformOrigin={{
          horizontal: selectedMeta ? 0 : -16,
          vertical: selectedMeta ? 0 : -16,
        }}
        sx={{
          pointerEvents: 'none',
        }}
        PaperProps={{
          sx: {
            pointerEvents: 'all',
            width: selectedMeta ? '100vw' : undefined,
            bottom: selectedMeta ? 40 : undefined,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        }}
      >
        <ExtendedDialogTitle
          title={ currentPerson.name }
          portrait={ currentPerson.portraitUrl }
          icon={ <PersonIcon /> }
          onClose={ handleClose }
        />
          <CardContent sx={{ flex: '1 0 auto', height: 'calc(100% - 160px)' }}>
            <Grid container sx={{ height: '100%' }} columnSpacing={ 2 }>
              <Grid item xs={ selectedMeta ? 4 : 12 } sx={{ height: '100%', overflowY: 'auto' }}>
                <PersonDetails person={ currentPerson } />
                { selectedMeta?.excerpt && (
                <Typography gutterBottom variant="h6" component="div">
                  Excerpt
                </Typography>) }
                { selectedMeta?.excerpt && (
                <Typography variant="body2" color="text.secondary">
                  { selectedMeta.excerpt }
                </Typography>) }
                { selectedMeta?.description && (
                <Typography gutterBottom variant="h6" component="div">
                  Description
                </Typography>) }
                { selectedMeta?.description && (
                <Typography variant="body2" color="text.secondary">
                  { selectedMeta.description }
                </Typography>) }
            </Grid>
            { selectedMeta && (
            <Grid item xs={8} sx={{ height: '100%', overflowY: 'auto' }}>
              <CardActionArea  sx={{ height: '100%' }}>
              { getMetaContainer(selectedMeta) }
              </CardActionArea>
          </Grid>) }
        </Grid>
      </CardContent>
      { selectedMeta && (
      <CardActions sx={{ flex: '0 0 auto', justifyContent: 'flex-end' }}>
        <Button disabled={ index <= 0 } onClick={ previousMeta } variant="text">previous</Button>
        <Button disabled={ index >= metadata.length - 1 } onClick={ nextMeta } variant="text">next</Button>
      </CardActions>) }
    </Popover>
  );
}

function mapStateToProps(state) {
  const selectedPerson = state.selectedPerson.person;
  const selectedMeta = state.selectedPerson.selectedMeta;
  const metadata = state.selectedPerson.metadata;
  return { selectedPerson, selectedMeta, metadata };
}

export default connect(mapStateToProps)(DetailsDialog);
