const defaultConfig = {
  firstName: 'firstName',
  lastName: 'lastName',
  birthday: null,
  surNames: '',
  birthName: '',
  deathday: null,
  portraitUrl: null,
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

function parseDate(d) {
  if (!d) {
    return null;
  }

  let result = '';
  result = new Date(d);
  if (!isNaN(result)) {
    return `${result.getTime()}`;
  }

  result = parseInt(d);
  if (!isNaN(result)) {
    return `${result}`;
  }

  return null;
}
export default class Person {
  constructor(config = defaultConfig) {
    if (!isValidId(config.id)) {
      throw new Error('Missing id');
    }

    this.pFirstName = config.firstName ?? defaultConfig.firstName;
    this.pLastName = config.lastName ?? defaultConfig.lastName;
    this.pBirthday = parseDate(config.birthday);

    this.pSurNames = config.surNames ?? defaultConfig.surNames;
    this.pBirthName = config.birthName ?? defaultConfig.birthName;
    this.pDeathday = parseDate(config.deathday);

    this.id = config.id || `${this.pFirstName}${this.pLastName}${this.pBirthday}`; // TODO: remove generated id stuff

    this.pRelations = getInitializedArray(config.relations);

    this.pPortraitUrl = config.portraitUrl ?? defaultConfig.portraitUrl;
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

  set portraitUrl(portraitUrl) {
    this.pPortraitUrl = portraitUrl;
  }

  get relations() {
    return this.pRelations.slice();
  }

  get portraitUrl() {
    return this.pPortraitUrl;
  }

  hasRelations() {
    return !!this.pRelations.length;
  }

  equals(p = {}) {
    return p?.id === this.id;
  }

  addRelation(newId) {
    if (!this.pRelations.find((id) => newId === id) && isValidId(newId)) {
      this.pRelations.push(newId);
    }
  }

  removeRelation(id) {
    removeItem(this.pRelations, id);
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
      relations: this.pRelations.slice(),
      portraitUrl: this.pPortraitUrl,
    };
  };
};