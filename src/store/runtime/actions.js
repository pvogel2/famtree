export function setPoint(move) {
  return {
    type: 'SET_MOVE',
    move: move ? structuredClone(move) : null,
  };
}

export function setForeground(foreground) {
  return {
    type: 'SET_FOREGROUND',
    foreground,
  };
}

export function setBackground(background) {
  return {
    type: 'SET_BACKGROUND',
    background,
  };
}

export function setText(text) {
  return {
    type: 'SET_TEXT',
    text,
  };
}

export function setHighlight(highlight) {
  return {
    type: 'SET_HIGHLIGHT',
    highlight,
  };
}

export function setSelection(selection) {
  return {
    type: 'SET_SELECTION',
    selection,
  };
}
