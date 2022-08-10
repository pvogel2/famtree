import apiFetch from '@wordpress/api-fetch';

let currentFamily = 'dummy';
// const family = 'test';

/* export async function loadFamily() {
  const options = {};
  const response = await fetch(`http://localhost:4000/${currentFamily}`, options);
  return response.json();
} */

export async function loadFamily() {
  const persons = await apiFetch({ path: `pedigree/v1/family/${currentFamily}` });
  persons.forEach(p => {
    p.id = Number(p.id);
    p.children = JSON.parse(p.children);
    p.partners = JSON.parse(p.partners);
  });
  console.log(persons);
  return persons;
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
