import { cleanup } from '@testing-library/react';
import { enableFetchMocks } from 'jest-fetch-mock';

import { loadFamily, savePerson, updatePerson, setFamilyContext } from "./Connect";
import U from './tests/utils';

enableFetchMocks();

beforeEach(() => {
  fetch.resetMocks();
});

afterEach(cleanup);

describe('loadFamily', () => {
  it('is a function', () => {
    expect(loadFamily).toEqual(expect.any(Function));
  });

  it('calls fetch', async () => {
    const person = U.getPerson();

    fetch.mockResponseOnce(JSON.stringify([person.serialize()]));
    const result = await loadFamily();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining(person.serialize())]));
  });
});

describe('savePerson', () => {
  it('is a function', () => {
    expect(savePerson).toEqual(expect.any(Function));
  });

  it('calls fetch with correct options ', async () => {
    fetch.mockResponseOnce('{}');
    await savePerson();
    const [_, options] = [...fetch.mock.calls[0]];

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(options).toEqual(expect.objectContaining({
       method: 'POST',
       headers: {
        'Content-Type': 'application/json',
       },
    }));
  });
});

describe('updatePerson', () => {
  it('is a function', () => {
    expect(savePerson).toEqual(expect.any(Function));
  });

  it('calls fetch with correct options ', async () => {
    const person = U.getPerson();
    fetch.mockResponseOnce('{}');
    await updatePerson(person.serialize());
    const [url, options] = [...fetch.mock.calls[0]];

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(options).toEqual(expect.objectContaining({
       method: 'PATCH',
       headers: {
        'Content-Type': 'application/json',
       },
    }));
    expect(url).toEqual(expect.stringContaining(person.id));
  });
});

describe('setFamily', () => {
  it('is a function', () => {
    expect(setFamilyContext).toEqual(expect.any(Function));
  });

  /* it('calls fetch with correct options ', async () => {
    const person = U.getPerson();
    fetch.mockResponseOnce('{}');
    await updatePerson(person.serialize());
    const [url, options] = [...fetch.mock.calls[0]];

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(options).toEqual(expect.objectContaining({
       method: 'PATCH',
       headers: {
        'Content-Type': 'application/json',
       },
    }));
    expect(url).toEqual(expect.stringContaining(person.id));
  }); */
});

