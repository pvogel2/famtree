import apiFetch from '@wordpress/api-fetch';
import { loadFamily, loadMetadata, getBaseUrl } from "./Connect";
import U from './tests/utils';

jest.mock('@wordpress/api-fetch');

afterEach(() => {
  jest.clearAllMocks();
});
describe('loadFamily', () => {
  it('is a function', () => {
    expect(loadFamily).toEqual(expect.any(Function));
  });

  it('returns list of persons', async () => {
    const persons = [U.getPerson().serialize()];
    apiFetch.mockReturnValueOnce(Promise.resolve({ persons }));

    const result = await loadFamily();
    expect(result).toEqual(expect.objectContaining({ persons, relations: [] }));
  });

  it('returns list of relations', async () => {
    const persons = [];
    const relations = [];
    U.getPersonWithRelations(persons, relations, 3);
    const returnedRelations = structuredClone(relations);
    returnedRelations.forEach((r) => {
      r.members = `[${r.members.join()}]`;
      r.children = `[${r.children.join()}]`;
    });
    apiFetch.mockReturnValueOnce(Promise.resolve({ persons, relations: returnedRelations }));

    const result = await loadFamily();
    expect(result).toEqual(expect.objectContaining({ relations }));
  });

  it('skips relation for unknown person', async () => {
    const persons = [];
    const relations = [];
    U.getPersonWithRelations(persons, relations, 3);
    const returnedRelations = structuredClone(relations);
    returnedRelations[0].members.push(100);
    returnedRelations.forEach((r) => {
      r.members = `[${r.members.join()}]`;
      r.children = `[${r.children.join()}]`;
    });
    apiFetch.mockReturnValueOnce(Promise.resolve({ persons, relations: returnedRelations }));

    const result = await loadFamily();
    expect( console ).toHaveWarnedWith(expect.any(String), 100, expect.any(String));
  });
});

describe('loadMetadata', () => {
  it('creates correct url call when called', async () => {
    const id = 12;
    apiFetch.mockReturnValueOnce(Promise.resolve([]));

    await loadMetadata(id);

    expect(apiFetch).toHaveBeenCalledWith(expect.objectContaining({ path: `famtree/v1/person/${id}/metadata` }));
  });

  it('returns data object', async () => {
    const id = 12;
    const metaData = [1, 2, 3, 4];
    apiFetch.mockReturnValueOnce(Promise.resolve(metaData));

    const data = await loadMetadata(id);

    expect(data).toEqual(metaData);
  });
});

describe('getBaseUrl', () => {
  let origNonceEndpoint;
  const expectedPath = 'wp-content/plugins/famtree/';

  beforeAll(() => {
    origNonceEndpoint = apiFetch.nonceEndpoint;
  });

  afterEach(() => {
    apiFetch.nonceEndpoint = origNonceEndpoint;
  });

  it('returns correct path', () => {
    apiFetch.nonceEndpoint = '';

    const path = getBaseUrl();

    expect(path).toBe(expectedPath);
  });

  it('replaces correct path', () => {
    apiFetch.nonceEndpoint = 'xxx/wp-admin/yyy/zzz/';

    const path = getBaseUrl();

    expect(path).toBe(`xxx/${expectedPath}`);
  });
});
