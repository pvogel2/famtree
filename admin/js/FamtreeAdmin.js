import PersonEditor from './editor/PersonEditor.js';
import MetadataEditor from './editor/MetadataEditor.js';
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
    this.persEditor = new PersonEditor();
    this.metaEditor = new MetadataEditor();

    this.wkEditMedia = wp.media({
      title: 'Edit media',
      button: {
      text: 'Save'
    }, multiple: false });

    this.message = new UIMessage();
    this.personTable = new PersonTable();

    this.client = new FamtreeClient(wp, {
      person: this.persEditor.getNonce.bind(this.persEditor),
      metadata: this.metaEditor.getNonce.bind(this.metaEditor),
      root: this.personTable.getNonce.bind(this.personTable),
    });

    const editCb = (isEditing) => {
      this.metaEditor.update(isEditing);
    }
    this.persEditor.registerCallback(editCb);
  }

  saveAll() {
    const person = this.persEditor.getPerson();
  
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
    const ps = [];
    const rls = this.persEditor.getModifiedRelations();

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
    const relation = Relation.find(this.persEditor.getRelation());
    if (relation) {
      this.persEditor.setRelation(new Relation(relation));
    }
  }

  relationModified() {
    this.persEditor.updateRelation();
  }

  removePartner() {
    const rId = this.persEditor.removeRelation();
    if (rId) {
      Relation.remove(rId);
    }
  }

  addPartner() {
    this.persEditor.addRelation();
  }

  removeChild() {
    if (!this.persEditor.relation) return;
    this.persEditor.removeChild();
  }

  addChild() {
    this.persEditor.addChild();
  };

  setPortrait(portrait) {
    this.persEditor.setPortrait(portrait);
  }

  editPerson(id) {
    const person = PersonList.find(id);
    if (person) {
      window.scrollTo(0, 0);
      this.persEditor.setPerson(person);

      this.metaEditor.setRefId(id);

      this.loadMetadata(id)
        .then((results) => {
          this.metaEditor.set(results);
        })
        .catch((err) => {
          console.log('Could not load metadata', err);
        });
    }
  }

  resetPerson() {
    this.persEditor.reset();
    this.metaEditor.reset();
  };

  deletePerson() {
    const person = this.persEditor.getPerson();
    const pId = person.id;
    if (!pId) return;

    this.client.deletePerson(pId).then(() => {
      // remove from global list
      PersonList.remove(pId);

      // remove from person editor
      this.persEditor.removePerson(pId);

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
      this.metaEditor.remove(mId);
      this.message.success('Additional file removed');
    })
    .fail((request, statusText) => {
      this.message.error('Additional file remove failed');
      console.log('error', statusText)
    });
  }

  saveMeta(attachment) {
    const data = {
      mediaId: attachment.id,
      refId: this.metaEditor.getRefId(),
    };

    this.client.createMetadata(data).then((resultData) => {
      this.metaEditor.addItem(resultData);
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
