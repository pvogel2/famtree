function isValidId(id) {
  return (typeof id === 'number');
} 

function getInitializedArray(arr = []) {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.filter((id) => isValidId(parseInt(id)));
}

function addItem(arr = [], nId) {
  const newId = parseInt(nId);
  if (!arr.find((id) => newId === id) && isValidId(newId)) {
    arr.push(newId);
    return true;
  }
  return false;
}

function removeItem(arr = [], rmId) {
  const removeId = parseInt(rmId);
  const idx = arr.findIndex((item) => item === removeId);
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
  static all = {};

  static add(data) {
    data.id = parseInt(data.id);
    if (!Array.isArray(data.children)) {
      data.children = JSON.parse(data.children);
    }
    if (!Array.isArray(data.members)) {
      data.members = JSON.parse(data.members);
    }

    Relation.all[data.id] = data;
  }

  static find(id) {
    return Relation.all[id] || null;
  }

  static remove(id) {
    Relation.all[id] = undefined;
  }

  static filter(filter) {
    if (!filter) return [];
    return Object.values(Relation.all).filter(filter);
  }

  // realy expensive
  static findByMembers(members) {
    return Object.values(Relation.all).filter((r) => {
      const ro = new Relation(r);
      let found = true;
      members.forEach((m) => {
        found = found &&  ro.hasMember(m);
      });
      return found;
    });
  }

  constructor(r) {
    this._id = parseInt(r.id) || null;
    this._members = getInitializedArray(r.members);
    this._children = getInitializedArray(r.children);
    this._start = r.start || null;
    this._end = r.end || null;
    this._type = r.type || null;
    this._deleted = false;
    this._modified = false;
  }

  get start() {
    return this._start;
  }

  set start(start) {
    this._start = start;
    this.modified = true;
  }

  get end() {
    return this._end;
  }

  set end(end) {
    this._end = end;
    this.modified = true;
  }

  get type() {
    return this._type;
  }

  set type(type) {
    this._type = type;
    this.modified = true;
  }

  get children() {
    return [...this._children];
  }

  get members() {
    return [...this._members];
  }

  set children(cn) {
    this._children = cn.splice(0);
    this.modified = true;
  }

  set members(ms) {
    this._members = ms.splice(0);
    this.modified = true;
  }

  get deleted() {
    return this._deleted;
  }

  set deleted(deleted) {
    if (this._deleted !== deleted) {
      this.modified = true;
    }
    this._deleted = !!deleted;

  }

  get modified() {
    return this._modified;
  }

  set modified(modified) {
    this._modified = !!modified;
  }

  get id() {
    return this._id;
  }

  set id(id) {
    this._id = parseInt(id);
  }

  replaceId(oldId, newId) {
    // console.log('replace', oldId, newId);
    const mIdx = this._members.findIndex(id => id === oldId);
    const cIdx = this._children.findIndex(id => id === oldId);
    this._members.splice(mIdx, 1, newId);
    this._children.splice(cIdx, 1, newId);
  }


  hasMember(id) {
    return this._members.includes(parseInt(id));
  }

  addMember(newId) {
    if (addItem(this._members, newId)) {
      this._modified = true;
    };
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

  setMembers(ids) {
    this._members = getInitializedArray(ids);
    this._modified = true;
  }

  addChild(newId) {
    if (addItem(this._children, newId)) {
      this._modified = true;
    };
  }

  removeChild(id) {
    const newId = parseInt(id);
    const idx = this._children.findIndex(_id => _id === newId);

    if (idx > -1) {
      this._children.splice(idx, 1);
      this.modified = true;
    }
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

  setChildren(ids) {
    this._children = getInitializedArray(ids);
    this._modified = true;
  }

  isNew() {
    return this._id < 0;
  }

  equals(p = {}) {
    return p?.id === this._id;
  }

  isObsolete() {
    return (this.isNew() && this._deleted === true); // new created new relation directly removed without saving
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

  clone() {
    const rl = new Relation(this.serialize());
    if (this._deleted === true) {
      rl.deleted = true;
    }
    if (this._modified === true) {
      rl.modified = true;
    }
    return rl;
  }
}
