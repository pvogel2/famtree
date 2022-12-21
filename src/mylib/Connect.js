import apiFetch from '@wordpress/api-fetch';

export async function loadFamily() {
  const data = await apiFetch({ path: 'pedigree/v1/family/' });
  const { persons = [], relations = [] } = { ...data };

  persons.forEach(p => {
    p.id = Number(p.id);
    p.children = [];
    p.partners = [];
    p.root = p.root === '1';
  });

  const personsObj = persons.reduce((o, person) => Object.assign(o, { [person.id]: { ...person, relations: [] } }), {});

  relations.forEach(r => {
    r.id = Number(r.id);
    r.members = JSON.parse(r.members);
    r.children = JSON.parse(r.children);

    r.members.forEach((id) => {
      if (!personsObj[id]) {
        console.error('Relation Error: Could not find related person with id', id, ', skipping relation.');
        return;
      }
      personsObj[id].relations.push(r.id);
    });
  });

  return { persons: Object.values(personsObj), relations };
}


export async function loadMetadata(personId) {
  const data = await apiFetch({ path: `pedigree/v1/person/${personId}/metadata` });

  return data;
}

export function getBaseUrl() {
  return `${apiFetch.nonceEndpoint.replace(/(wp-admin).*/, '')}wp-content/plugins/pedigree/`;
}
