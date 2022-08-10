const defaultConfig = {
  firstName: 'firstName',
  lastName: 'lastName',
  birthday: null,
  surNames: '',
  birthName: '',
  deathday: null,
};

function isValidId(id) {
  return id && (typeof id === 'string' || typeof id === 'number');
}

function getInitializedArray(arr = []) {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.filter((p) => isValidId(p));
}

function removeItem(arr = [], id) {
  const idx = arr.findIndex((item) => item === id);
  if (idx > -1) {
    arr.splice(idx, 1);
  }
}

export default class Person {
  constructor(config = defaultConfig) {
    if (!isValidId(config.id)) {
      throw new Error('Missing id');
    }

    this.pFirstName = config.firstName ?? defaultConfig.firstName;
    this.pLastName = config.lastName ?? defaultConfig.lastName;
    this.pBirthday = isNaN(parseInt(config.birthday)) ? defaultConfig.birthday : config.birthday;

    this.pSurNames = config.surNames ?? defaultConfig.surNames;
    this.pBirthName = config.birthName ?? defaultConfig.birthName;
    this.pDeathday = isNaN(parseInt(config.deathday)) ? defaultConfig.deathday : config.deathday;

    this.id = config.id || `${this.pFirstName}${this.pLastName}${this.pBirthday}`; // TODO: remove generated id stuff
    this.pChildren = getInitializedArray(config.children);
    this.pPartners = getInitializedArray(config.partners);
  }

  get name() {
    return `${this.pFirstName} ${this.pLastName}`;
  }

  get firstName() {
    return this.pFirstName;
  }

  set firstName(firstName) {
    this.pFirstName = firstName;
  }

  get lastName() {
    return this.pLastName;
  }

  set lastName(lastName) {
    this.pLastName = lastName;
  }

  get birthday() {
    return this.pBirthday;
  }

  set birthday(birthday) {
    this.pBirthday = birthday;
  }

  get deathday() {
    return this.pDeathday;
  }

  set deathday(deathday) {
    this.pDeathday = deathday;
  }

  get birthName() {
    return `${this.pBirthName}`;
  }

  set birthName(birthName) {
    this.pBirthName = birthName;
  }

  get surNames() {
    return `${this.pSurNames}`;
  }

  set surNames(surNames) {
    this.pSurNames = surNames;
  }

  get children() {
    return this.pChildren.slice();
  }

  get partners() {
    return this.pPartners.slice();
  }

  hasChildren() {
    return !!this.pChildren.length;
  }
  
  hasPartners() {
    return !!this.pPartners.length;
  }

  equals(p = {}) {
    return p?.id === this.id;
  }

  addChild(newId) {
    if (!this.pChildren.find((id) => newId === id) && isValidId(newId)) {
      this.pChildren.push(newId);
    }
  }

  removeChild(id) {
    removeItem(this.pChildren, id);
  }

  addPartner(newId) {
    if (!this.pPartners.find((id) => newId === id) && isValidId(newId)) {
      this.pPartners.push(newId);
    }
  }

  removePartner(id) {
    removeItem(this.pPartners, id);
  }

  serialize() {
    return {
      id: this.id,
      firstName: this.pFirstName,
      surNames: this.pSurNames,
      lastName: this.pLastName,
      birthName: this.pBirthName,
      birthday: this.pBirthday,
      deathday: this.pDeathday,
      partners: this.pPartners.slice(),
      children: this.pChildren.slice(),
    };
  };
};