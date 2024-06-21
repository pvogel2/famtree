const DEFAULT_STATE = {
  move: null,
  foreground: '#888888',
  background: '#CCCCCC',
  text: '#333333',
  highlight: '#770000',
  selection: '#ffffff',
};

export default function reducer( state = DEFAULT_STATE, action ) {
  switch ( action.type ) {
    case 'SET_MOVE':
      return {
        ...state,
        move: action.move,
      };
    case 'SET_FOREGROUND':
      return {
        ...state,
        foreground: action.foreground,
      };
    case 'SET_BACKGROUND':
      return {
        ...state,
        background: action.background,
      };
    case 'SET_TEXT':
      return {
        ...state,
        text: action.text,
      };
    case 'SET_HIGHLIGHT':
      return {
        ...state,
        highlight: action.highlight,
      };
    case 'SET_SELECTION':
      return {
        ...state,
        selection: action.selection,
      };
    default:
      return { ...state };
  }
}
