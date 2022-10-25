class Relation {
  constructor(r) {
    this._id = parseInt(r.id) || null;
    this.family = r.family;
    this._members = r.members.map((m) => parseInt(m));
    this._children = r.children.map((c) => parseInt(c));
    this.start = r.start || null;
    this.end = r.end || null;
    this.type = r.type || null;
    this._deleted = false;
    this._modified = false;
  }

  get children() {
    return [...this._children];
  }

  set children(cn) {
    this._children = cn.splice(0);
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

  addChild(id) {
    const newId = parseInt(id);
    if (this._children.findIndex(_id => _id === newId) === -1) {
      this._children.push(newId);
      this.modified = true;
    }
  }

  removeChild(id) {
    const newId = parseInt(id);
    const idx = this._children.findIndex(_id => _id === newId);

    if (idx > -1) {
      this._children.splice(idx, 1);
      this.modified = true;
    }
  }

  serialize() {
    return {
      family: this.family,
      id: this.id,
      start: this.start,
      end: this.end,
      type: this.type,
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
