import { Table, TableBody, TableRow, TableCell } from '@mui/material';

import { showDate } from '../../lib/ui/utils';

function PersonDetails(props) {
  const { person } = props;

  const birthDate = showDate(person?.birthday);
  const deathDate = showDate(person?.deathday);

  return (birthDate || deathDate) ? (
    <Table
      size="small"
      sx={{ width: '100%', marginBottom: 2 }}
    >
      <TableBody>
        { birthDate ? (<TableRow>
          <TableCell sx={{ border: 0 }}>Birth</TableCell>
          <TableCell sx={{ border: 0 }}>{ birthDate }</TableCell>
        </TableRow>) : null }
        { deathDate ? (<TableRow>
          <TableCell sx={{ border: 0 }}>Death</TableCell>
          <TableCell sx={{ border: 0 }}>{ deathDate }</TableCell>
        </TableRow>) : null }
      </TableBody>
    </Table>
  ) : null;
}

export default PersonDetails;
