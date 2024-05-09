import ManagedSelect from './ManagedSelect.js';
import Metadata from './Metadata.js';
import PersonList from '../../../public/js/PersonList.js';
import Person from '../../../public/js/Person.js';
import Relation from '../Relation.js';
import PersonRelations from './PersonRelations.js';
import PersonForm from './PersonForm.js';

export default class PersonEditor {
  constructor() {
    this.metadata = new Metadata();
    this.edit.personForm = new PersonForm();

    const checkForEditing = (ev) => {
      const wasEditing = !!this.edit.editing;
      this.edit.editing = this.edit.personForm.isEnabled(); // !!firstname.value && !!lastname.value;
      if (wasEditing !== this.edit.editing) {
        this.edit.update(this.edit.editing);
        this.metadata.update(this.edit.editing);
      }
    };

    this.edit.personForm.onFirstname(checkForEditing);
    this.edit.personForm.onLastname(checkForEditing);
  }

  edit = {
    stageCounter: -1,
    editing: false,
    relations: new PersonRelations(),
    relation: null, //Relation class instance

    update(editing) {
      this.personForm.onEditing(editing);
      this.updateCandidatesSelect();
    },

    getNonce() {
      return this.personForm.getNonce();
    },

    setRelations(rs) {
      const pId = this.personForm.getId();

      if (!pId) {
        return;
      };

      this.relations.set(rs);
      this.personForm.rSelect.reset();
      this.setPartnersSelect();

      const rl = this.relations.getFirst();
      if (rl) {
        this.setRelation(rl);
        this.personForm.enableAddChild(true);
      };
    },

    setPartnersSelect() {
      const pId = parseInt(this.personForm.getId());
      this.relations.getMembers(pId).forEach(({ rId, mId }) =>  {
        const person = PersonList.find(mId);
        this.personForm.rSelect.addOption(person.name, rId);
      });
    },

    updateRelations() {
      this.relations.sanitize();
    },

    setPerson(p) {
      this.reset();

      this.personForm.setPerson(p);
      this.personForm.dispatchFirstname();
      this.personForm.dispatchLastname();
  
      this.setPortrait({ id: p.portraitId, url: p.portraitUrl });

      const rs = Relation.filter((r) => r.members.includes(p.id));

      this.setRelations(rs);
      this.setCandidatesSelect();
    },

    setPortrait(data = {}) {
      this.personForm.setPortrait(data.id, data.url);
    },

    updateCandidatesSelect() {
      if (this.editing) {
        this.setCandidatesSelect();
      } else {
        this.personForm.caSelect.reset();
      }
    },

    setCandidatesSelect() {
      const pId = parseInt(this.personForm.getId());
      const cs = PersonList.filter((p) => (pId !== p.id));
      cs.forEach((p) => {
        this.personForm.caSelect.addOption(p.name, p.id);
      });
      this.personForm.caSelect.setIndex();
    },

    /**
     * get the person currenlty edited
     * 
     * @returns Person
     */
    getPerson() {
      const pId = this.personForm.getId();
      const imageId = this.personForm.getPortrait();
      const person = this.personForm.getPerson();
      const p = new Person({
        ...person,
        id: (pId ? parseInt(pId) : ''),
        portraitId: (imageId ? parseInt(imageId) : ''),
      });

      return p;
    },

    removePerson(id) {
      const pId = parseInt(this.personForm.getId());
      const rId = parseInt(id);

      if (pId !== rId) {
       return;
      }

      this.reset();
    },

    reset() {
      this.personForm.reset();
      this.setPortrait();
      this.relation = null;
      this.relations.reset();
      this.editing = false;
    },

    getRelation() {
      return this.personForm.rSelect.value();
    },

    updateRelation() {
      if (this.relation) {
        this.personForm.setRelStart(this.relation.start);
        this.personForm.setRelEnd(this.relation.end);
        this.personForm.setRelType(this.relation.type);
      }
    },

    removeRelation() {
      const rId = this.personForm.rSelect.removeSelected();

      if (this.relation) {
        this.relation = null;
      }

      this.relations.setDeleted(rId);

      this.personForm.cSelect.reset();
      this.personForm.enableAddChild(!this.personForm.rSelect.isDisabled());
      return rId;
    },

    hasRelation(personId) {
      return this.relations.hasRelation(personId);
    },

    addRelation(r) {
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

      this.personForm.rSelect.addOption(newPartner.name, rId);

      this.personForm.enableAddChild(true);

      return rId;
    },

    removeChild() {
      const cId = this.personForm.cSelect.value();
      const rId = this.personForm.rSelect.value();

      if (cId) {
        // update current relation
        this.relation.removeChild(cId);

        // update current staged relation
        this.relations.removeChild(rId, cId);

        this.personForm.cSelect.removeOption(cId);
      }
    },

    setChildrenSelect(cnIds) {
      cnIds.forEach((cId)=>{
        const person = PersonList.find(cId);
        if (!person) {
          return;
        }
        
        this.personForm.cSelect.addOption(person.name, person.id);
      });
      
      this.personForm.cSelect.setIndex();
    },

    setRelation(rl = null) {
      this.personForm.cSelect.reset();
      this.personForm.setRelStart(null);
      this.personForm.setRelEnd(null);
      this.personForm.setRelType(null);

      this.relation = rl;

      if (this.relation) {
        this.setChildrenSelect(rl.children);
        this.updateRelation();
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

      this.personForm.cSelect.addOption(person.name, person.id);
      this.personForm.cSelect.setLast();
    },
  }
};
