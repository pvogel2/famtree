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
  const isImage = md.mimetype.startsWith('image');
  const isPDF = md.mimetype === 'application/pdf';
  const isText = md.mimetype === 'text/plain';

  if (isImage) return (<CardMedia
    sx={{
      height: '100%',
      objectFit: 'contain',
    }}
    component="img"
    image={ md.original }
    alt={ md.original }
  />);

  if (isPDF || isText) return (<CardMedia
    style={{
      width: '100%',
      height: '100%',
    }}
    component="object"
    data={ md.original }
    type={ md.mimetype }
  />);

  return '';
}