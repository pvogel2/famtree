let currentFamily = 'default';
const family = 'default';

export async function loadFamily() {
  const options = {};
  const pResponse = await fetch(`http://localhost:4000/persons?family=${currentFamily}`, options);
  const persons = await pResponse.json();
  const fResponse = await fetch("http://localhost:4000/families", options);
  const families = await fResponse.json();
  const rResponse = await fetch(`http://localhost:4000/relations?family=${currentFamily}`, options);
  const relations = await rResponse.json();

  const personsObj = persons.reduce((o, person) => Object.assign(o, { [person.id]: { ...person, relations: [] } }), {});

  relations.forEach((r) => {
    const members = r.members;
    members.forEach((id) => {
      personsObj[id].relations.push(r.id);
    });
  });

  return {
    persons: Object.values(personsObj),
    families,
    relations,
  };
}

/* export async function loadFamily() {
  const data = await apiFetch({ path: `pedigree/v1/family/${currentFamily}` });
  const { persons = [], families = [] } = data;

  persons.forEach(p => {
    p.id = Number(p.id);
    p.children = JSON.parse(p.children);
    p.partners = JSON.parse(p.partners);
    p.root = p.root === '1';
  });
  return { persons, families: Object.values(families) };
} */

export async function savePerson(person) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(person),
  };
  const response = await fetch(`http://localhost:4000/persons`, options);
  return response.json();
}

export async function saveRelation(relation) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(relation),
  };
  const response = await fetch(`http://localhost:4000/relations`, options);
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
  const response = await fetch( `http://localhost:4000/persons/${person.id}`, options);
  return response.json();
}

export async function updateRelation(relation) {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(relation),
  };
  const response = await fetch( `http://localhost:4000/relations/${relation.id}`, options);
  return response.json();
}

export async function deleteRelation(relationId) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch( `http://localhost:4000/relations/${relationId}`, options);
  return response.json();
}

export async function setFamilyContext(family) {
  currentFamily = family;
}

export async function getFamilies() {
  currentFamily = family;
}
