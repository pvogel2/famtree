export function getFamilies( state ) {
  if (!state.families) {
    return [];
  }  
  return state.families;
}
 
export function getFounder( state ) {
  return state.founder;
}

export function getRelations( state ) {
  return state.relations;
}

export function getFocused( state ) {
  return state.focused;
}

export function getSelected( state ) {
  return state.selected;
}

export function getMetadata( state ) {
  return state.metadata;
}

export function getSelectedMeta( state ) {
  return state.selectedMeta;
}

export function getPersons( state ) {
  if (!state.persons) {
    return [];
  }  
  return state.persons;
}
