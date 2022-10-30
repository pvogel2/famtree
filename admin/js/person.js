class Person {
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
    Person.all[id] = undefined;
  }

  constructor(p) {
    this._id = parseInt(p.id) || null;
    this._family = p.family;
    this._firstName = p.firstName || '';
    this._lastName = p.lastName || '';
    this._surNames = p.surNames || '';
    this._birthName = p.birthName || '';

    this._birthday = p.birthday || null;
    this._deathday = p.deathday || null;

    this._portraitImageId = p.portraitImageId || null;
    this._portraitImageUrl = p.portraitImageUrl || '';
    this._relations = p.relations || [];
    this._root = !!p.root;
    this._modified = false;
  }

  get id() {
    return this._id;
  }

  get family() {
    return this._family;
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
    return `${this._firstName} ${this._lastName}`;
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

  isRoot() {
    return this._root;
  }
}
