const defaultConfig = {
  firstName: '',
  lastName: '',
  birthday: null,
  surNames: '',
  birthName: '',
  deathday: null,
  portraitUrl: null,
  portraitId: null,
};

function getInitializedArray(arr = []) {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.filter((p) => Person.isValidId(p));
}

function removeItem(arr = [], id) {
  const idx = arr.findIndex((item) => item === id);
  if (idx > -1) {
    arr.splice(idx, 1);
  }
}

function parseDate(d) {
  if (!d || !typeof d == 'string' || !d.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return null;
  }

  return d;
}

export default class Person {
  /**
   * Valid id has to be non empty string or a number.
   * @param {*} id 
   * @returns boolean
   */
  static isValidId(id) {
    return ((typeof id === 'string' && !!id) || (typeof id === 'number' && !isNaN(id)));
  }
    
  constructor(config = defaultConfig) {
    this.pFirstName = config.firstName ? config.firstName.trim() : defaultConfig.firstName;
    this.pLastName = config.lastName ? config.lastName.trim() : defaultConfig.lastName;
    this.pBirthday = parseDate(config.birthday);

    this.pSurNames = config.surNames ? config.surNames.trim() : defaultConfig.surNames;
    this.pBirthName = config.birthName ? config.birthName.trim() : defaultConfig.birthName;
    this.pDeathday = parseDate(config.deathday);

    this.id = Person.isValidId(config.id) ? config.id : null; //  || `${this.pFirstName}${this.pLastName}${this.pBirthday}`; // TODO: remove generated id stuff

    this.pRelations = getInitializedArray(config.relations);

    this.pPortraitUrl = config.portraitUrl ?? defaultConfig.portraitUrl;
    this.pPortraitId = Person.isValidId(config.portraitId) ? Number(config.portraitId) : defaultConfig.portraitId;

  }

  get name() {
    return [this.pFirstName, this.pSurNames, this.pLastName].filter((n => !!n)).join(' ');
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
    this.pBirthday = parseDate(birthday);
  }

  get deathday() {
    return this.pDeathday;
  }

  set deathday(deathday) {
    this.pDeathday = parseDate(deathday);
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

  set portraitId(portraitId) {
    if (Person.isValidId(portraitId)) {
      this.pPortraitId = Number(portraitId);
    }
  }

  get relations() {
    return this.pRelations.slice();
  }

  get portraitUrl() {
    return this.pPortraitUrl;
  }

  get portraitId() {
    return this.pPortraitId;
  }

  hasRelations() {
    return !!this.pRelations.length;
  }

  hasId() {
    return Person.isValidId(this.id);
  }

  hasMinimumData() {
    return (!!this.firstName && !!this.lastName);
  }

  equals(p = {}) {
    return p?.id === this.id;
  }

  addRelation(newId) {
    if (!this.pRelations.find((id) => newId === id) && Person.isValidId(newId)) {
      this.pRelations.push(newId);
    }
  }

  removeRelation(id) {
    removeItem(this.pRelations, id);
  }

  hasDetails() {
    return !!this.pBirthday || !!this.pDeathday;
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
      portraitId: this.pPortraitId,
    };
  };
};