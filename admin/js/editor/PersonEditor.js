import ManagedSelect from './ManagedSelect.js';
import metadata from './metadata.js';
import PersonList from '../../../public/js/PersonList.js';
import Person from '../../../public/js/Person.js';
import Relation from '../Relation.js';
import PersonRelations from './PersonRelations.js';

export default class PersonEditor {
  metadata = metadata();

  constructor() {
    const f = this.edit.getForm();
    const firstname = f.elements.firstName;
    const lastname = f.elements.lastName;
    const partners = f.elements.partners;
    const partnersBtn = f.elements['partners_remove'];
    const children = f.elements.children;
    const childrenBtn = f.elements['children_remove'];
    const candidates = f.elements.candidates;
    const relType = f.elements.relType;
    const relStart = f.elements.relStart;
    const relEnd = f.elements.relEnd;

    if (!firstname || !lastname) {
      console.error('missing mandatory form elements');
      return;
    }

    const checkForEditing = (ev) => {
      const wasEditing = !!this.edit.editing;
      this.edit.editing = !!firstname.value && !!lastname.value;
      if (wasEditing !== this.edit.editing) {
        this.edit.update(this.edit.editing);
        this.metadata.update(this.edit.editing);
      }
    };

    firstname.addEventListener('input', checkForEditing);
    lastname.addEventListener('input', checkForEditing);
    this.edit.rSelect = new ManagedSelect(partners, partnersBtn, [relType, relStart, relEnd]);
    this.edit.cSelect = new ManagedSelect(children, childrenBtn);
    this.edit.caSelect = new ManagedSelect(candidates);
  }

  edit = {
    stageCounter: -1,
    editing: false,
    relations: new PersonRelations(),
    relation: null, //Relation class instance
    form: '#editPersonForm',
    rSelect: null,

    update(editing) {
      const f = this.getForm();
      f.elements['fs_buttons'].disabled = !editing;
      f.elements['fs_portrait'].disabled = !editing;
      f.elements['fs_relations'].disabled = !editing;
      this.updateCandidatesSelect();
    },

    getNonce() {
      const name = 'edit-person-nonce';
      return {
        name,
        value: this.getForm().elements[name].value,
      };
    },

    getForm() {
      return document.querySelector(this.form);
    },

    setRelations(rs) {
      const f = this.getForm();
      const pId = f.elements.id.value;

      if (!pId) {
        return;
      };

      this.relations.set(rs);

      this.rSelect.reset();
      this.setPartnersSelect();

      const rl = this.relations.getFirst();
      if (rl) {
        this.setRelation(rl);
        f.elements['btn_addChild'].disabled = false;
      };
    },

    setPartnersSelect() {
      const f = this.getForm();
      const pId = parseInt(f.elements.id.value);

      this.relations.getMembers(pId).forEach(({ rId, mId }) =>  {
        const person = PersonList.find(mId);
        this.rSelect.addOption(person.name, rId);
      });
    },

    updateRelations() {
      this.relations.sanitize();
    },

    setPerson(p) {
      this.reset();
      const f = this.getForm();

      f.elements.id.value = p.id;
      f.elements.firstName.value = p.firstName;
      f.elements.surNames.value = p.surNames;
      f.elements.lastName.value = p.lastName;
      f.elements.birthName.value = p.birthName;
      f.elements.birthday.value = p.birthday;
      f.elements.deathday.value = p.deathday;
      f.elements.portraitId.value = p.portraitId;

      f.elements.firstName.dispatchEvent(new Event('input'));
      f.elements.lastName.dispatchEvent(new Event('input'));

      this.setPortrait({ id: p.portraitId, url: p.portraitUrl });

      const rs = Relation.filter((r) => r.members.includes(p.id));

      this.setRelations(rs);
      this.setCandidatesSelect();
    },

    setPortrait(data = {}) {
      const f = this.getForm();

      const img = document.querySelector('#person-portrait');
      if (!this.defaultPortraitImage) {
        this.defaultPortraitImage = img.src;
      }

      img.src = data.url || this.defaultPortraitImage;
      f.elements.portraitId.value = data.id;
    },

    updateCandidatesSelect() {
      if (this.editing) {
        this.setCandidatesSelect();
      } else {
        this.caSelect.reset();
      }
    },

    setCandidatesSelect() {
      const f = this.getForm();
      const pId = parseInt(f.elements.id.value);
      const cs = PersonList.filter((p) => (pId !== p.id));
      cs.forEach((p) => {
        this.caSelect.addOption(p.name, p.id);
      });
      this.caSelect.setIndex();
    },

    /**
     * get the person currenlty edited
     * 
     * @returns Person
     */
    getPerson() {
      const f = this.getForm();
      const pId = f.elements.id.value;
      const imageId = f.elements.portraitId.value;
      const p = new Person({
        id: (pId ? parseInt(pId) : ''),
        firstName: f.elements.firstName.value,
        surNames: f.elements.surNames.value,
        lastName: f.elements.lastName.value,
        birthName: f.elements.birthName.value,
        birthday: f.elements.birthday.value,
        deathday: f.elements.deathday.value,
        portraitId: (imageId ? parseInt(imageId) : ''),
      });

      return p;
    },

    removePerson(id) {
      const f = this.getForm();
      const pId = parseInt(f.elements.id.value);
      const rId = parseInt(id);

      if (pId !== rId) {
       return;
      }

      this.reset();
    },

    reset() {
      const f = this.getForm();
      f.reset();
      this.cSelect.reset();
      this.rSelect.reset();
      this.caSelect.reset();
      this.setPortrait();
      this.relation = null;
      this.relations.reset();

      f.elements.firstName.dispatchEvent(new Event('input'));
      f.elements.lastName.dispatchEvent(new Event('input'));

      this.editing = false;
    },

    removeRelation() {
      const f = this.getForm();
      const rId = this.rSelect.removeSelected();

      if (this.relation) {
        this.relation = null;
      }

      this.relations.setDeleted(rId);

      this.cSelect.reset();
      f.elements['btn_addChild'].disabled = this.rSelect.isDisabled();
      return rId;
    },

    hasRelation(personId) {
      return this.relations.hasRelation(personId);
    },

    addRelation(r) {
      const f = this.getForm();
      const rl = new Relation({ ...r, id: this.stageCounter-- });
      const rId = rl.id; 

      // no partner is defined
      if (rl.members.length <= 1) {
        return null;
      }

      const pId = rl.members[1];
      const newPartner = PersonList.find(pId);
      // defined partner can not be found
      if (!newPartner) {
        return null;
      }

      rl.modified = true;
      this.relations.add(rl.serialize());

      this.setRelation(rl.clone());

      this.rSelect.addOption(newPartner.name, rId);

      f.elements['btn_addChild'].disabled = false;

      return rId;
    },

    removeChild() {
      const cId = this.cSelect.value();
      const rId = this.rSelect.value();

      if (cId) {
        // update current relation
        this.relation.removeChild(cId);

        // update current staged relation
        this.relations.removeChild(rId, cId);

        this.cSelect.removeOption(cId);
      }
    },

    setChildrenSelect(cnIds) {
      cnIds.forEach((cId)=>{
        const person = PersonList.find(cId);
        if (!person) {
          return;
        }
        
        this.cSelect.addOption(person.name, person.id);
      });
      
      this.cSelect.setIndex();
    },

    setRelation(rl = null) {
      const f = this.getForm();
      this.cSelect.reset();
      const rs = f.elements.relStart;
      rs.value = null;
      const re = f.elements.relEnd;
      re.value = null;
      const rt = f.elements.relType;
      rt.value = null;

      this.relation = rl;

      if (this.relation) {
        this.setChildrenSelect(rl.children);
        rs.value = this.relation.start;
        re.value = this.relation.end;
        rt.value = this.relation.type;
      }
    },
  
    addChild(id) {
      if (!this.relation) return;

      // add to current relation
      this.relation.addChild(id);

      // add to staged relation
      this.relations.addChild(this.relation.id, id);

      // add to form child options
      const person = PersonList.find(id);

      this.cSelect.addOption(person.name, person.id);
      this.cSelect.setLast();
    },
  }
};
