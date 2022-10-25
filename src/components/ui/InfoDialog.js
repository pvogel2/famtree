import { useRef } from 'react';
import { connect } from 'react-redux';
import { Card, CardContent } from '@mui/material';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

import ExtendedDialogTitle from './ExtendedDialogTitle';
import Person from '../../lib/Person';
import { showDate } from '../../lib/ui/utils';

function InfoDialog(props) {
  const {
    focusedPerson = null,
    readonly = false,
    position,
  } = props;

  const elementRef = useRef(null);

  if (!focusedPerson || readonly) {
    return null;
  }

  const currentPerson = new Person(focusedPerson);

  const pointOffset = 30;
  const currentWidth = elementRef.current?.clientWidth;
  const currentHeight = elementRef.current?.clientHeight;

  const rect = elementRef.current?.offsetParent.getBoundingClientRect();

  const deltaX = rect?.left || 0;
  const deltaY = rect?.top || 0;  
  const styles = {
    left: position?.x + pointOffset - deltaX || 20,
    top: position?.y + pointOffset - deltaY || 50,
  };

  if (window.innerWidth < (styles.left + currentWidth)) {
    styles.right = pointOffset;
    delete styles.left;
  }

  if (window.innerHeight < (styles.top + currentHeight)) {
    styles.bottom = pointOffset;
    delete styles.top;
  }

  const birthDate = showDate(currentPerson.birthday);
  const deathDate = showDate(currentPerson.deathday);
  return <Card
    qa="info-dialog"
    sx={{
      position: 'absolute',
      opacity: rect ? 0.9 : 0,
      ...styles,
    }}
    ref={ elementRef }
  >
    <ExtendedDialogTitle
      title={ currentPerson.name }
      portrait={ currentPerson.portraitUrl }
      icon={ <PersonIcon /> }
    />
    { (birthDate || deathDate) ? (<CardContent>
      <Table
        size="small"
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
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
  </Card>
}

function mapStateToProps(state) {
  return {
    position: state.runtime.move,
    focusedPerson: state.config.edit === null ? state.focusedPerson : null,
  };
}

export default connect(mapStateToProps)(InfoDialog);
