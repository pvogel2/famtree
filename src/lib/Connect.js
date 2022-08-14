import apiFetch from '@wordpress/api-fetch';

let currentFamily = 'default';
let allFamilies = ['default'];
// const family = 'test';

/* export async function loadFamily() {
  const options = {};
  const response = await fetch(`http://localhost:4000/${currentFamily}`, options);
  return response.json();
} */

export async function loadFamily() {
  const data = await apiFetch({ path: `pedigree/v1/family/${currentFamily}` });
  const { persons = [], families = [] } = data;

  persons.forEach(p => {
    p.id = Number(p.id);
    p.children = JSON.parse(p.children);
    p.partners = JSON.parse(p.partners);
  });
  return { persons, families: Object.values(families) };
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
