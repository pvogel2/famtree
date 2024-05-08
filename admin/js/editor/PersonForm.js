import ManagedSelect from './ManagedSelect.js';

const ELEMENT_ID = 'editPersonForm';

export default class PersonForm {
  constructor() {
    this.element = document.getElementById(ELEMENT_ID);
    
    const partners = this.element.elements.partners;
    const partnersBtn = this.element.elements['partners_remove'];
    const children = this.element.elements.children;
    const childrenBtn = this.element.elements['children_remove'];
    const candidates = this.element.elements.candidates;
    const relType = this.element.elements.relType;
    const relStart = this.element.elements.relStart;
    const relEnd = this.element.elements.relEnd;

    this.rSelect = new ManagedSelect(partners, partnersBtn, [relType, relStart, relEnd]);
    this.cSelect = new ManagedSelect(children, childrenBtn);
    this.caSelect = new ManagedSelect(candidates);
  }

  isEnabled() {
    return !!this.element.elements.firstName.value && !!this.element.elements.lastName.value;
  }

  getNonce() {
    const name = 'edit-person-nonce';
    return {
      name,
      value: this.element.elements[name].value,
    };
  }

  getId() {
    return this.element.elements.id.value;
  }

  getPerson() {
    const f = this.element;
    return {
      id: this.getId(),
      firstName: f.elements.firstName.value,
      surNames: f.elements.surNames.value,
      lastName: f.elements.lastName.value,
      birthName: f.elements.birthName.value,
      birthday: f.elements.birthday.value,
      deathday: f.elements.deathday.value,
    };
  }

  setPerson(p) {
    const f = this.element;
    f.elements.id.value = p.id;
    f.elements.firstName.value = p.firstName;
    f.elements.surNames.value = p.surNames;
    f.elements.lastName.value = p.lastName;
    f.elements.birthName.value = p.birthName;
    f.elements.birthday.value = p.birthday;
    f.elements.deathday.value = p.deathday;
  }

  setPortrait(id) {
    this.element.elements.portraitId.value = id;
  }

  getPortrait() {
    return this.element.elements.portraitId.value;
  }

  onEditing(isEditing) {
    this.element.elements['fs_buttons'].disabled = !isEditing;
    this.element.elements['fs_portrait'].disabled = !isEditing;
    this.element.elements['fs_relations'].disabled = !isEditing;
  }

  enableAddChild(enable) {
    this.element.elements['btn_addChild'].disabled = !enable;
  }

  setRelStart(v) {
    this.element.elements.relStart.value = v;
  }

  setRelEnd(v) {
    this.element.elements.relEnd.value = v;
  }

  setRelType(v) {
    this.element.elements.relType.value = v;
  }

  reset() {
    this.element.reset();
    this.cSelect.reset();
    this.rSelect.reset();
    this.caSelect.reset();
    this.dispatchFirstname();
    this.dispatchLastname();
  }

  onFirstname(callback) {
    this.element.elements.firstName.addEventListener('input', callback);
  }

  onLastname(callback) {
    this.element.elements.lastName.addEventListener('input', callback);
  }

  dispatchFirstname() {
    this.element.elements.firstName.dispatchEvent(new Event('input'));
  }

  dispatchLastname() {
    this.element.elements.lastName.dispatchEvent(new Event('input'));
  }
}
