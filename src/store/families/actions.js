import Person from '../../lib/Person';


const dummyPerson = new Person({
  id: 0.1,
  firstName: 'Dummy',
  lastName: 'Person',
});

export function setFamilies(families) {
  if (families && Array.isArray(families)) {
    return {
      type: 'SET_FAMILIES',
      families: structuredClone(families),
    };
  }

  return {
    type: 'SET_FAMILIES',
    families: ['default'],
  };
}

export function setFounder(founder) {
  return {
    type: 'SET_FOUNDER',
    founder: founder ? parseInt(founder) : null,
  };
}

export function setFocused(focused) {
  return {
    type: 'SET_FOCUSED',
    focused: focused ? structuredClone(focused) : null,
  };
}

export function setSelected(selected) {
  return {
    type: 'SET_SELECTED',
    selected: selected ? structuredClone(selected) : null,
  };
}

export function setMetadata(metadata) {
  return {
    type: 'SET_METADATA',
    metadata: metadata ? structuredClone(metadata): [],
  };
}

export function setSelectedMeta(selectedMeta) {
  return {
    type: 'SET_SELECTED_META',
    selectedMeta,
  };
}

export function setRelations(relations) {
  if (relations && Array.isArray(relations)) {
    return {
      type: 'SET_RELATIONS',
      relations: structuredClone(relations),
    };
  }

  return {
    type: 'SET_RELATIONS',
    relations: [],
  };
}

export function setPersons( persons ) {
  if (persons && Array.isArray(persons)) {
    return {
      type: 'SET_PERSONS',
      persons: structuredClone(persons),
    };
  }

  return {
    type: 'SET_PERSONS',
    persons: [structuredClone(dummyPerson)],
  };
}
