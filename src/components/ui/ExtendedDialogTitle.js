import { Avatar, DialogTitle, IconButton } from '@mui/material';
import { CloseRounded, Info } from '@mui/icons-material';

export default function ExtendedDialogTitle(props) {
  const {
    onClose = null,
    title = '',
    icon = <Info />,
  } = props;
  return <DialogTitle>
    <div style={{
      display: 'flex',
      alignItems: 'center',
    }}>
    <Avatar
      style={{
        marginRight: '16px',
      }}
    >
      { icon }
    </Avatar>
    <div style={{
      flexGrow: 1,
    }}>{ title }</div>
    {
      onClose ? <IconButton
        aria-label="close"
        qa="dialog-close"
        onClick={ onClose }
        sx={{
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseRounded />
      </IconButton> : null
    }
    </div>
  </DialogTitle>;
}