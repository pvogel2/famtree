import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import { __ } from '@wordpress/i18n';

import { showDate } from '../../lib/ui/utils';


function PersonDetails(props) {
  const { person } = props;

  const birthDate = showDate(person?.birthday);
  const deathDate = showDate(person?.deathday);

  return (person?.hasDetails()) ? (
    <Table
      size="small"
      sx={{ width: '100%', marginBottom: 2 }}
    >
      <TableBody>
        { birthDate ? (<TableRow>
          <TableCell sx={{ border: 0 }}>{ __('Birthday', 'famtree') }</TableCell>
          <TableCell sx={{ border: 0 }}>{ birthDate }</TableCell>
        </TableRow>) : null }
        { deathDate ? (<TableRow>
          <TableCell sx={{ border: 0 }}>{ __('Date of death', 'famtree') }</TableCell>
          <TableCell sx={{ border: 0 }}>{ deathDate }</TableCell>
        </TableRow>) : null }
      </TableBody>
    </Table>
  ) : null;
}

export default PersonDetails;
