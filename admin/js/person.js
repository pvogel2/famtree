class Person {
  static all = {};

  static add(data) {
    Person.all[data.id] = data;
  }

  static find(id) {
    return Person.all[id] || null;
  }

  static filter(filter) {
    if (!filter) return [];
    return Object.values(Person.all).filter(filter);
  }

  static remove(id) {
    Person.all[id] = undefined;
  }

  constructor(r) {
    this._id = parseInt(r.id) || null;
    this.family = r.family;
    this._modified = false;
  }
}
