function isValidId(id) {
  return (typeof id === 'number' && id >= 0);
} 

function getInitializedArray(arr = []) {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.filter((p) => isValidId(p));
}

function addItem(arr = [], nId) {
  if (!arr.find((id) => nId === id) && isValidId(nId)) {
    arr.push(nId);
  }
}

function removeItem(arr = [], id) {
  const idx = arr.findIndex((item) => item === id);
  if (idx > -1) {
    arr.splice(idx, 1);
  }
}

function nextItem(arr = [], id) {
  if (!arr.length) {
    return null;
  }

  if (typeof id === 'undefined') {
    return arr[0];
  }

  const idx = arr.findIndex((aId) => aId === id);
  return idx >= 0 && (idx + 1) < arr.length ? arr[idx + 1] : null;
}

function prevItem(arr = [], id) {
  if (!arr.length) {
    return null;
  }

  if (typeof id === 'undefined') {
    return arr[arr.length - 1];
  }

  const idx = arr.findIndex((aId) => aId === id);
  return idx > 0 && idx < arr.length ? arr[idx - 1] : null;
}

export default class Relation {
  constructor(config = {}) {
    if (!isValidId(config.id)) {
      throw new Error('Missing id');
    }
    this.id = config.id;
    this._members = getInitializedArray(config.members);
    this._children = getInitializedArray(config.children);
    this._start = config.start || null;
    this._end = config.end || null;
    this._type = config.type || null;
  }

  equals(p = {}) {
    return p?.id === this.id;
  }

  get members() {
    return this._members.slice();
  }

  addMember(newId) {
    addItem(this._members, newId);
  }

  removeMember(id) {
    removeItem(this._members, id);
  }

  hasMembers() {
    return !!this._members.length;
  }

  nextMember(id) {
    return nextItem(this._members, id);
  }

  prevMember(id) {
    return prevItem(this._members, id);
  }

  get children() {
    return this._children.slice();
  }

  addChild(newId) {
    addItem(this._children, newId);
  }

  removeChild(id) {
    removeItem(this._children, id);
  }

  hasChildren() {
    return !!this._children.length;
  }

  nextChild(id) {
    return nextItem(this._children, id);
  }

  prevChild(id) {
    return prevItem(this._children, id);
  }

  get type() {
    return this._type;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  set type(type) {
    this._type = type;
  }

  set start(start) {
    this._start = start;
  }

  set end(end) {
    this._end = end;
  }

  serialize() {
    return {
      id: this.id,
      start: this._start,
      end: this._end,
      type: this._type,
      members: [...this._members],
      children: [...this.children],
    };
  }
}
