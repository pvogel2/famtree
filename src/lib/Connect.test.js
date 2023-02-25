import apiFetch from '@wordpress/api-fetch';
import { loadFamily } from "./Connect";
import U from './tests/utils';

jest.mock('@wordpress/api-fetch');

describe('loadFamily', () => {
  it('is a function', () => {
    expect(loadFamily).toEqual(expect.any(Function));
  });

  it('calls api fetch', async () => {
    const persons = [U.getPerson().serialize()];
    apiFetch.mockReturnValueOnce(Promise.resolve({ persons }));

    const result = await loadFamily();
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ persons, relations: [] }));
  });
});
