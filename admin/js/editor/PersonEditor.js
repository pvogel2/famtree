import PersonList from '../../../public/js/PersonList.js';
import Person from '../../../public/js/Person.js';
import Relation from '../Relation.js';
import PersonRelations from './PersonRelations.js';
import PersonForm from './PersonForm.js';

export default class PersonEditor {
  personForm = null
  stageCounter = -1
  editing = false
  relations = null
  relation = null //Relation class instance
  onUpdate = []


  constructor() {
    this.personForm = new PersonForm();
    this.relations = new PersonRelations();

    const checkForEditing = (ev) => {
      const wasEditing = !!this.editing;
      this.editing = this.personForm.isEnabled(); // !!firstname.value && !!lastname.value;
      if (wasEditing !== this.editing) {
        this.update();
      }
    };

    this.personForm.onFirstname(checkForEditing);
    this.personForm.onLastname(checkForEditing);
  }

  registerCallback(cb) {
    this.onUpdate.push(cb);
  }

    update() {
      this.onUpdate.forEach((cb) => {
        cb(this.editing);
      });
      this.personForm.onEditing(this.editing);
      this.editing
        ? this.setCandidates()
        : this.personForm.caSelect.reset();
    }

    getNonce() {
      return this.personForm.getNonce();
    }

    setRelations(rs) {
      const pId = this.personForm.getId();

      if (!pId) {
        return;
      };

      this.relations.set(rs);
      this.personForm.rSelect.reset();
      this.setPartners();

      const rl = this.relations.getFirst();
      if (rl) {
        this.setRelation(rl);
        this.personForm.enableAddChild(true);
      };
    }

    setPartners() {
      const pId = this.personForm.getId();
      this.relations.getMembers(pId).forEach(({ rId, mId }) =>  {
        const person = PersonList.find(mId);
        this.personForm.rSelect.addOption(person.name, rId);
      });
    }

    setPerson(p) {
      this.reset();

      this.personForm.setPerson(p);
      this.personForm.dispatchFirstname();
      this.personForm.dispatchLastname();
  
      this.setPortrait({ id: p.portraitId, url: p.portraitUrl });

      const rs = Relation.filter((r) => r.members.includes(p.id));

      this.setRelations(rs);
      this.setCandidates();
    }

    setPortrait(data = {}) {
      this.personForm.setPortrait(data.id, data.url);
    }

    setCandidates() {
      const pId = this.personForm.getId();
      const cs = PersonList.filter((p) => (pId !== p.id));
      cs.forEach((p) => {
        this.personForm.caSelect.addOption(p.name, p.id);
      });
      this.personForm.caSelect.setIndex();
    }

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
        id: Person.isValidId(pId) ? pId : null,
        portraitId: Person.isValidId(imageId) ? imageId : null,
      });

      return p;
    }

    removePerson(id) {
      const pId = this.personForm.getId();
      const rId = parseInt(id);

      if (pId !== rId) {
       return;
      }

      this.reset();
    }

    reset() {
      this.personForm.reset();
      this.setPortrait();
      this.relation = null;
      this.relations.reset();
      this.editing = false;
    }

    getRelation() {
      return this.personForm.rSelect.value();
    }

    updateRelation() {
      if (this.relation) {
        const rData = this.personForm.getRelationData();
        this.relation.start = rData.start;
        this.relation.end = rData.end;
        this.relation.type = rData.type;
      }
    }

    removeRelation() {
      const rId = this.personForm.rSelect.removeSelected();

      if (this.relation) {
        this.relation = null;
      }

      this.relations.setDeleted(rId);

      this.personForm.cSelect.reset();
      this.personForm.enableAddChild(!this.personForm.rSelect.isDisabled());
      return rId;
    }

    hasRelation(personId) {
      return this.relations.hasRelation(personId);
    }

    addRelation() {
      const pId =  this.personForm.caSelect.value();
      const newPartner = PersonList.find(pId);
      const person = this.getPerson();

      if (isNaN(pId) || !newPartner || !person || this.hasRelation(pId)) return;
  
        // new relation
      const rId = this.stageCounter--;
      const relation = {
        start: null,
        end: null,
        children: [],
        members: [person.id, pId],
        id: rId,
      };
  
      const rl = new Relation(relation);

      rl.modified = true;
      this.relations.add(rl.serialize());

      this.setRelation(rl.clone());

      this.personForm.rSelect.addOption(newPartner.name, rId);
      this.personForm.rSelect.setLast();

      this.personForm.enableAddChild(true);

      Relation.add(rl.serialize());
    }

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
    }

    setChildren(cnIds) {
      cnIds.forEach((cId)=>{
        const person = PersonList.find(cId);
        if (!person) {
          return;
        }
        
        this.personForm.cSelect.addOption(person.name, person.id);
      });
      
      this.personForm.cSelect.setIndex();
    }

    setRelation(rl = null) {
      this.personForm.cSelect.reset();
      this.personForm.setRelationData();

      this.relation = rl;

      if (this.relation) {
        this.setChildren(rl.children);
        this.personForm.setRelationData(rl);
      }
    }
  
    addChild() {
      const cId =  this.personForm.caSelect.value();

      if (!this.relation || isNaN(cId)) return;
  
      // add to current relation
      this.relation.addChild(cId);

      // add to staged relation
      this.relations.addChild(this.relation.id, cId);

      // add to form child options
      const person = PersonList.find(cId);

      this.personForm.cSelect.addOption(person.name, person.id);
      this.personForm.cSelect.setLast();
    }
};
