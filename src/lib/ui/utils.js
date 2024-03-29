import { CardMedia } from '@mui/material';

export const DATE_FORMAT = 'dd.MM.yyyy';

export function showDate(ts = null) {
  try {
    if (ts) {
      return new Date(ts).toLocaleDateString();
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