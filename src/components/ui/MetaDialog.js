import { connect, useDispatch } from 'react-redux';
import { Button, Card, CardMedia, CardActionArea, CardContent, CardActions } from '@mui/material';
import { setSelectedMeta } from '../../store/selectedPersonReducer';

function MetaDialog(props) {
  const { selectedMeta = null, metadata = [] } = props;

  const dispatch = useDispatch();

  if (!selectedMeta) {
    return null;
  }

  const index = metadata.findIndex((md) => md.id === selectedMeta.id);

  const previousMeta = () => {
    const md = metadata[index - 1];
    dispatch(setSelectedMeta(md.id));
  }

  const nextMeta = () => {
    const md = metadata[index + 1];
    dispatch(setSelectedMeta(md.id));
  }

  const isImage = selectedMeta.mimetype.startsWith('image');
  const isPDF = selectedMeta.mimetype === 'application/pdf';
  const isText = selectedMeta.mimetype === 'text/plain';

  return (
    <Card>
      <CardActionArea>
        { isImage && <CardMedia
          style={{
            width: '100%',
          }}
          component="img"
          image={ selectedMeta.original }
          alt={ selectedMeta.original }
        /> }
        { (isPDF || isText) && <CardMedia
          style={{
            width: '100%',
            height: '100%',
            minHeight: 640,
          }}
          component="object"
          data={ selectedMeta.original }
          type={ selectedMeta.mimetype }
        /> }
      </CardActionArea>
      <CardActions>
        <Button disabled={ index <= 0 } onClick={ previousMeta } variant="text">previous</Button>
        <Button disabled={ index >= metadata.length - 1 } onClick={ nextMeta } variant="text">next</Button>
      </CardActions>
    </Card>
  );
}

function mapStateToProps(state) {
  const selectedMeta = state.selectedPerson.selectedMeta;
  const metadata = state.selectedPerson.metadata;
  return { selectedMeta, metadata };
}

export default connect(mapStateToProps)(MetaDialog);
