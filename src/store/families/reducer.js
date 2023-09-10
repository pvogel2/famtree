import Person from '../../lib/Person';


const dummyPerson = new Person({
  id: 0.1,
  firstName: 'Dummy',
  lastName: 'Person',
});

const DEFAULT_STATE = {
  families: ['default'],
  founder: null,
  relations: [],
  focused: null,
  selected: null,
  metadata: [],
  selectedMeta: null,
  persons: [dummyPerson],

};

export default function reducer( state = DEFAULT_STATE, action ) {
  switch ( action.type ) {
    case 'SET_FAMILIES':
      return {
        ...state,
        families: action.families,
      };
    case 'SET_RELATIONS':
      return {
        ...state,
        relations: action.relations,
      };
    case 'SET_FOUNDER':
      return {
        ...state,
        founder: action.founder,
      };
    case 'SET_FOCUSED':
      return {
        ...state,
        focused: action.focused,
      };
    case 'SET_SELECTED':
      return {
        ...state,
        selected: action.selected,
        selectedMeta: action.selected ? state.selectedMeta : null,
      };
    case 'SET_METADATA':
      return {
        ...state,
        metadata: action.metadata,
      };
    case 'SET_SELECTED_META':
      const metadata = state.metadata.map((m) => ({ ...m }));
      const selectedMeta = action.selectedMeta
        ? structuredClone(metadata.find((md) => parseInt(md.id) === parseInt(action.selectedMeta)))
        : null;
      return {
        ...state,
        selectedMeta,
      };
    case 'SET_PERSONS':
      return {
        ...state,
        persons: action.persons,
      };
    default:
      return { ...state };
  }
}
