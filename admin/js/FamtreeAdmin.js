import PersonEditor from './editor/PersonEditor.js';
import PersonList from '../../public/js/PersonList.js';
import Relation from './Relation.js';
import RestClient from './rest.js';

/*
  window.famtree.saveAll
  window.famtree.saveRelations
  window.famtree.loadFamilies
  window.famtree.loadMetadata
  window.famtree.savePerson
  window.famtree.partnerSelected
  window.famtree.relMetaChanged
  window.famtree.removePartner
  window.famtree.addPartner
  window.famtree.removeChild
  window.famtree.addChild
  window.famtree.editPerson
  window.famtree.resetPerson
  window.famtree.deletePerson
  window.famtree.editMedia
  window.famtree.removeMeta
  window.famtree.showMessage
  window.famtree.hideMessage
  window.famtree.saveMeta
  window.famtree.updateRoot
*/

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

    this.restClient = new RestClient();

  }

  saveAll() {
    const person = this.pe.edit.getPerson();
  
    // validate minimal valid input
    if (!person.hasMinimumData()) {
      this.showMessage('Persons need at least firstname and lastname', 'error');
      return;
    };
  
    const ps = this.saveRelations();
    ps.push(this.savePerson(person));
  
    Promise.allSettled(ps).then(() => {
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
      const deleted = rl.deleted === true;
  
      if (rl.id < 0 && deleted) { // new relation directly removed in edit mode, nothing to save
        return;
      }

      const endpoint = `/relation/${rl.id >= 0 ? rl.id : ''}`;
      const nonce = this.pe.edit.getNonce();

      if (!deleted) {
        const data = rl.serialize();
        if (data.id < 0) { // new relation
          delete data.id;
        }
        ps.push(this.restClient.post(endpoint, nonce, data));
      } else {
        ps.push(this.restClient.delete(endpoint, nonce));
      }
    });

    return ps;
  }

  loadFamilies() {
    return this.restClient.get('/family/');
  }

  async loadMetadata(id) {
    return this.restClient.get(`/person/${id}/metadata`);
  }

  /**
   * Save the person object to the database.
   * @param {Person} person 
   * @returns Promise
   */
  savePerson(person) {
    // get root information from table, the only place where it is modified
    const input = document.querySelector(`.wp-list-table tbody tr[data-id="${person.id}"] .root input`);
    if (input) {
      person.root = input.checked;
    }

    const endpoint = `/person${person.id ? `/${person.id}` : ''}`
    const nonce = this.pe.edit.getNonce();
    const data = person.serialize();
    return this.restClient.post(endpoint, nonce, data);
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

    this.restClient.delete(`/person/${pId}`, this.pe.edit.getNonce()).then(() => {
      // remove from global list
      PersonList.remove(pId);

      // remove from person editor
      this.pe.edit.removePerson(pId);

      // remove from html
      const tBody = document.getElementById('the-list');
      const tr = tBody.querySelector(`[data-id="${pId}"]`);
      if (tr) {
        tBody.removeChild(tr);
      };
    });
  }

  editMedia() {
    this.wkEditMedia.open();
  }

  removeMeta(mId) {
    const endpoint = `/metadata/${mId}`;
    const nonce = this.pe.metadata.getNonce();

    this.restClient.delete(endpoint, nonce).then(() => {    
      this.pe.metadata.remove(mId); // remove from html
      this.showMessage('Additional file removed');
    })
    .fail((request, statusText) => {
      this.showMessage('Additional file remove failed', 'error');
      console.log('error', statusText)
    });
  }

  showMessage(message, type = 'success') {
    const m = document.getElementById('famtree-message');
    m.classList.remove('famtree-hidden', 'notice-success', 'notice-error');
    m.classList.add(`notice-${type}`);
    const p = m.querySelector('.famtree-message__text');
    p.textContent = message;
    window.scrollTo(0,0);
  }

  hideMessage() {
    const m = document.getElementById('famtree-message');
    m.classList.add('famtree-hidden');
  }

  saveMeta(attachment) {
    const metadataForm = this.pe.metadata.getForm();

    const item = {
      mediaId: attachment.id,
      refId: metadataForm.refid.value,
    };

    const endpoint = '/metadata/';
    const nonce = this.pe.metadata.getNonce();;
    const data = { ...item };

    this.restClient.post(endpoint, nonce, data).then((resultData) => {
      this.pe.metadata.addItem(resultData);
      this.showMessage('Additional file saved');
    })
    .fail((request, statusText) => {
      console.log('error', statusText);
      this.showMessage('Saving of additional file failed', 'error');
    });
  }

  async updateRoot(elem, pId) {
    const root = elem.checked;
    const ps = PersonList.find(pId);

    const endpoint = `/root/${pId}`;
    const nonce = { name: 'update-root-nonce', value: document.getElementById('update-root-nonce').value };
    const data = { root };

    this.restClient.post(endpoint, nonce, data).then(() => {
      this.showMessage(`${ root ? 'Added' : 'Removed'} ${ ps.name } as available family founder.`);
    })
    .fail((request, statusText) => {
      console.log('error', statusText);
      this.showMessage('Updating roots failed', 'error');
    });
  }
}
