export default class Person {
  static all = {};

  static add(data) {
    data.id = parseInt(data.id);
    data.root = data.root === '1';
    Person.all[data.id] = data;
  }

  static find(id) {
    const p = Person.all[id];
    return (p ? new Person(p) : null);
  }

  static filter(filter) {
    if (!filter) return [];
    return Object.values(Person.all).filter(filter).map((p) => new Person(p));
  }

  static remove(id) {
    delete Person.all[id];
  }

  constructor(p = {}) {
    const id = parseInt(p.id);
    this._id = isNaN(id) ? null : id;

    this._firstName = typeof p.firstName === 'string' ? p.firstName.trim() : '';
    this._lastName = typeof p.lastName === 'string' ? p.lastName.trim() : '';
    this._surNames = typeof p.surNames === 'string' ? p.surNames.trim() : '';
    this._birthName = typeof p.birthName === 'string' ? p.birthName.trim() : '';

    this._birthday = p.birthday || null;
    this._deathday = p.deathday || null;

    this._portraitId = p.portraitImageId || null;
    this._portraitUrl = p.portraitUrl || '';
    this._relations = p.relations || [];
    this._root = !!p.root;

    this._modified = false;
  }

  get id() {
    return this._id;
  }

  get firstName() {
    return this._firstName;
  }

  get lastName() {
    return this._lastName;
  }

  get surNames() {
    return this._surNames;
  }

  get birthName() {
    return this._birthName;
  }

  get name() {
    return [this._firstName, this._surNames, this._lastName].filter((n => !!n)).join(' ');
  } 

  
  get birthday() {
    return this._birthday;
  }

  get deathday() {
    return this._deathday;
  }

  get relations() {
    return [...this._relations];
  }

  get portraitUrl() {
    return this._portraitUrl;
  }

  get portraitId() {
    return this._portraitId;
  }

  isRoot() {
    return this._root;
  }
}
