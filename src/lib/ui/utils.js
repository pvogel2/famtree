import { CardMedia } from '@mui/material';
import { format } from 'date-fns';

export const DATE_FORMAT = 'dd.MM.yyyy';

export function showDate(ts = null) {
  try {
    if (!isNaN(parseInt(ts))) {
      return format(new Date(parseInt(ts)), DATE_FORMAT);
    }
  } catch (err) {
    console.log(err);
  }
  return null;
}

export function getMetaContainer(md = { mimetype: '' }) {
  if (md.mimetype.startsWith('image')) return (<CardMedia
    sx={{
      height: '100%',
      objectFit: 'contain',
    }}
    component="img"
    image={ md.original }
    alt={ md.original }
  />);

  if (md.mimetype === 'application/pdf' || md.mimetype === 'text/plain') return (<CardMedia
    style={{
      width: '100%',
      height: '100%',
    }}
    component="object"
    data={ md.original }
    type={ md.mimetype }
  />);

  
  if (md.mimetype.startsWith('video')) return (<CardMedia
    style={{
      width: '100%',
      height: '100%',
    }}
    component="video"
    src={ md.original }
    type={ md.mimetype }
    controls
    preload='metadata'
  />);

  return 'unknown file';
}