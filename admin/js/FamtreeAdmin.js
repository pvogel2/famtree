import PersonEditor from './editor/PersonEditor.js';
import PersonList from '../../public/js/PersonList.js';
import Relation from './Relation.js';
import UIMessage from './UIMessage.js'
import PersonTable from './PersonTable.js';
import FamtreeClient from './FamtreeClient.js'

export default class Famtree {
  /**
   * 
   * @param {WordPressAPI} wp
   */
  constructor(wp) {
    this.pe = new PersonEditor();

    this.wkEditMedia = wp.media({
      title: 'Edit media',
      button: {
      text: 'Save'
    }, multiple: false });

    this.message = new UIMessage();
    this.personTable = new PersonTable();

    this.client = new FamtreeClient(wp, {
      person: this.pe.edit.getNonce.bind(this.pe.edit),
      metadata: this.pe.metadata.getNonce.bind(this.pe.metadata),
      root: this.personTable.getNonce.bind(this.personTable),
    });
  }

  saveAll() {
    const person = this.pe.edit.getPerson();
  
    // validate minimal valid input
    if (!person.hasMinimumData()) {
      this.message.error('Persons need at least firstname and lastname');
      return;
    };
  
    Promise.allSettled([
      this.saveRelations(),
      this.savePerson(person)],
    ).then(() => {
      document.location.reload();
    });
  }

  /**
   * Saves all modified relations.
   * @returns [Promise]
   */
  saveRelations() {
    const rls = this.pe.edit.relations.getModified();
    const ps = [];

    // replace current relation in array
    const rIndex = rls.findIndex((rl) => rl.id === this.pe.edit.relation?.id);
    if (rIndex > -1) {
      rls.splice(rIndex, 1, this.pe.edit.relation.clone());
    } else if (this.pe.edit.relation) {
      rls.push(this.pe.edit.relation.clone());
    }

    rls.forEach((rl) => {
      if (rl.isObsolete()) {
        return;
      }
      
      if (rl.deleted) {
        ps.push(this.client.deleteRelation(rl.id));
        return;
      }

      const data = rl.serialize();

      if (rl.isNew()) {
        delete data.id;
        ps.push(this.client.createRelation(data));
      } else {
        ps.push(this.client.updateRelation(rl.id, data));
      }
    });

    return ps;
  }

  loadFamilies() {
    return this.client.loadFamilies();
  }

  async loadMetadata(id) {
    return this.client.loadPersonMetadata(id);
  }

  /**
   * Save the person object to the database.
   * @param {Person} person 
   * @returns Promise
   */
  savePerson(person) {
    // get root information from table, the only place where it is modified
    person.root = this.personTable.isFounder(person.id);
    return this.client.savePerson(person.serialize());
  }

  partnerSelected() {
    const form = this.pe.edit.getForm();
    const partnersSelect = form.partners;

    const relation = Relation.find(partnersSelect.value);
    if (relation) {
      this.pe.edit.setRelation(new Relation(relation));
    }
  }

  relMetaChanged() {
    if (this.pe.edit.relation) {
      const f = this.pe.edit.getForm();
      this.pe.edit.relation.start = f.relStart.value;
      this.pe.edit.relation.end = f.relEnd.value;
      this.pe.edit.relation.type = f.relType.value;
    }
  }

  removePartner() {
    const rId = this.pe.edit.removeRelation();
    if (rId) {
      Relation.remove(rId);
    }
  }

  addPartner(id) {
    let pId = parseInt(id);
    if (isNaN(pId)) {
      const cSelect = document.getElementById('candidates');
      pId =  parseInt(cSelect.value);
    }
    if (isNaN(pId)) return;

    const person = this.pe.edit.getPerson();
    if (!this.pe.edit.hasRelation(pId)) {
      // new relation
      const relation = {
        start: null,
        end: null,
        children: [],
        members: [person.id, pId],
      };

      const rId = this.pe.edit.addRelation(relation);

      if (!rId) {
        return;
      }

      relation.id = rId;
      Relation.add({ ...relation, members: [...relation.members], children: [...relation.children] });
    }
  }

  removeChild() {
    if (!this.pe.edit.relation) return;
    this.pe.edit.removeChild();
  }

  addChild(id) {
    let cId = parseInt(id);
    if (isNaN(cId)) {
      const cSelect = document.getElementById('candidates');
      cId =  parseInt(cSelect.value);
    }
    if (!this.pe.edit.relation || isNaN(cId)) return;
    this.pe.edit.addChild(cId);
  };

  setPortrait(portrait) {
    this.pe.edit.setPortrait(portrait);
  }

  editPerson(id) {
    const person = PersonList.find(id);
    if (person) {
      window.scrollTo(0, 0);
      this.pe.edit.setPerson(person);

      const metadataForm = this.pe.metadata.getForm();
      metadataForm.refid.value = id;

      this.loadMetadata(id)
        .then((results) => {
          this.pe.metadata.set(results);
        })
        .catch((err) => {
          console.log('Could not load metadata', err);
        });
    }
  }

  resetPerson() {
    this.pe.edit.reset();
    this.pe.metadata.reset();
  };

  deletePerson() {
    const person = this.pe.edit.getPerson();
    const pId = person.id;
    if (!pId) return;

    this.client.deletePerson(pId).then(() => {
      // remove from global list
      PersonList.remove(pId);

      // remove from person editor
      this.pe.edit.removePerson(pId);

      // remove from table
      this.personTable.removePerson(pId);
    });
  }

  editMedia() {
    this.wkEditMedia.open();
  }

  removeMeta(mId) {
    this.client.deleteMetadata(mId).then(() => {
      // remove from html
      this.pe.metadata.remove(mId);
      this.message.success('Additional file removed');
    })
    .fail((request, statusText) => {
      this.message.error('Additional file remove failed');
      console.log('error', statusText)
    });
  }

  saveMeta(attachment) {
    const metadataForm = this.pe.metadata.getForm();

    const data = {
      mediaId: attachment.id,
      refId: metadataForm.refid.value,
    };

    this.client.createMetadata(data).then((resultData) => {
      this.pe.metadata.addItem(resultData);
      this.message.success('Additional file saved');
    })
    .fail((request, statusText) => {
      console.log('error', statusText);
      this.message.error('Saving of additional file failed');
    });
  }

  async updateRoot(root, pId) {
    const ps = PersonList.find(pId);
    const data = { root };

    this.client.updateRoot(pId, data).then(() => {
      this.message.success(`${ root ? 'Added' : 'Removed'} ${ ps.name } as available family founder.`);
    })
    .fail((request, statusText) => {
      console.log('error', statusText);
      this.message.error('Updating roots failed');
    });
  }
}
