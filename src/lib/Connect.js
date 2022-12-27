export async function loadFamily() {
  const options = {};
  const pResponse = await fetch('http://localhost:4000/persons', options);
  const persons = await pResponse.json();
  const rResponse = await fetch('http://localhost:4000/relations', options);
  const relations = await rResponse.json();

  const personsObj = persons.reduce((o, person) => Object.assign(o, { [person.id]: { ...person, relations: [] } }), {});

  relations.forEach((r) => {
    const members = r.members;
    members.forEach((id) => {
      if (!personsObj[id]) {
        console.warn('Relation Error: Could not find related person with id', id, ', skipping relation.');
        return;
      }
      personsObj[id].relations.push(r.id);
    });
  });

  return {
    persons: Object.values(personsObj),
    relations,
  };
}

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
