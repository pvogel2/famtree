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
