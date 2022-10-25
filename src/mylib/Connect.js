import apiFetch from '@wordpress/api-fetch';

let currentFamily = 'default';
// const family = 'test';

export async function loadFamily() {
  const data = await apiFetch({ path: `pedigree/v1/family/${currentFamily}` });
  const { persons = [], relations = [], families = {} } = { ...data };

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
      personsObj[id].relations.push(r.id);
    });
  });

  return { persons: Object.values(personsObj), families: Object.values(families), relations };
}

export async function savePerson(person) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(person),
  };
  const response = await fetch(`http://localhost:4000/${currentFamily}`, options);
  return response.json();
}

export async function updatePerson(person) {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(person),
  };
  const response = await fetch( `http://localhost:4000/${currentFamily}/${person.id}`, options);
  return response.json();
}

export async function setFamilyContext(family) {
  currentFamily = family;
}

export async function getFamilies() {
  currentFamily = family;
}
