import ManagedSelect from './ManagedSelect.js';
import PersonList from '../../lib/js/PersonList.js';
import Relation from './Relation.js';

function getMediaType(mimetype) {
  if (!(typeof mimetype === 'string')) {
    return 'unknown';
  }

  if (mimetype.startsWith('image')) {
    return 'image';
  }

  if (mimetype.startsWith('video')) {
    return 'video';
  }

  if (mimetype.endsWith('pdf') || mimetype.endsWith('msword')) {
    return 'document';
  }

  if (mimetype.startsWith('text')) {
    return 'text';
  }

  return 'unknown';
};

function getDateValue(ts) {
  const DATE_FORMAT = 'yyyy-MM-dd';
  if (ts) {
    return new Date(parseInt(ts)).toISOString().substring(0,10);
  }
  return null;
}

export default class PersonEditor {
  constructor() {
    const f = this.edit.getForm();
    const firstname = f.elements['firstName'];
    const lastname = f.elements['lastName'];
    const partners = f.elements['partners'];
    const partnersBtn = f.elements['partners_remove'];
    const children = f.elements['children'];
    const childrenBtn = f.elements['children_remove'];
    const candidates = f.elements['candidates'];
    const relType = f.elements['relType'];
    const relStart = f.elements['relStart'];
    const relEnd = f.elements['relEnd'];

    if (!firstname || !lastname) {
      console.error('missing mandatory form elements');
      return;
    }

    const checkForEditing = (ev) => {
      const wasEditing = !!this.edit.editing;
      this.edit.editing = !!firstname.value && !!lastname.value;
      if (wasEditing !== this.edit.editing) {
        f.elements['fs_buttons'].disabled = !this.edit.editing;
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
    relations: [], // Relation class instances
    relation: null, //Relation class instance
    form: '#editPersonForm',
    rSelect: null,

    update(editing) {
      const f = this.getForm();
      f.elements['fs_portrait'].disabled = !editing;
      f.elements['fs_relations'].disabled = !editing;
      this.updateCandidatesSelect();
    },

    getForm() {
      return document.querySelector(this.form);
    },

    setRelations(rs) {
      const f = this.getForm();
      const pId = f.elements['id'].value;

      if (!pId) {
        return;
      };

      this.relations = rs.map((r) => new Relation(r));

      this.rSelect.reset();
      this.setPartnersSelect();
      if (this.relations.length) {
        this.setRelation(this.relations[0].clone());
        f.elements['btn_addChild'].disabled = false;
      }
    },

    setPartnersSelect() {
      const f = this.getForm();
      const pId = parseInt(f['id'].value);

      this.relations.forEach((r) => {
        const ps = r.members.filter((id) => id !== pId);
        const person = PersonList.find(ps[0]);
  
        this.rSelect.addOption(person.name, r.id);
      });
    },

    updateRelations() {
      this.relations = this.relations.filter((rl) => !rl.deleted);
      this.relations.forEach((rl) => {
        rl.modified = false;
      });
    },

    setPerson(p) {
      this.reset();
      const f = this.getForm();

      f.elements['id'].value = p.id;
      f.elements['firstName'].value = p.firstName;
      f.elements['surNames'].value = p.surNames;
      f.elements['lastName'].value = p.lastName;
      f.elements['birthName'].value = p.birthName;
      f.elements['birthday'].value = p.birthday;
      f.elements['deathday'].value = p.deathday;
      f.elements['portraitId'].value = p.portraitId;

      f.elements['firstName'].dispatchEvent(new Event('input'));
      f.elements['lastName'].dispatchEvent(new Event('input'));

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
      f.elements['portraitId'].value = data.id;
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
      const id = parseInt(f.id.value);
      const cs = PersonList.filter((p) => (id !== p.id));
      cs.forEach((p) => {
        this.caSelect.addOption(p.name, p.id);
      });
      this.caSelect.setIndex();
    },

    getPerson() {
      const f = this.getForm();
      const id = f.id.value;
      const imageId = f.portraitId.value;
      const p = {
        id: (id ? parseInt(id) : ''),
        firstName: f.firstName.value,
        surNames: f.surNames.value,
        lastName: f.lastName.value,
        birthName:f.birthName.value,
        birthday: f.birthday.value,
        deathday: f.deathday.value,
        portraitId: (imageId ? parseInt(imageId) : ''),
      };
      return p;
    },

    removePerson(id) {
      const f = this.getForm();
      const pId = parseInt(f.id.value);
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
      this.relations = [];

      f.elements['firstName'].dispatchEvent(new Event('input'));
      f.elements['lastName'].dispatchEvent(new Event('input'));

      this.editing = false;
    },

    removeRelation() {
      const f = this.getForm();
      const rId = this.rSelect.removeSelected();

      if (this.relation) {
        this.relation = null;
      }

      const rl = this.relations.find(rl => rl.id === rId);
      if (rl) {
        rl.deleted = true;
      }

      this.cSelect.reset();
      f.elements['btn_addChild'].disabled = this.rSelect.isDisabled();
      return rId;
    },

    findInvolvedRelation(personId) {
      let r = null;
      this.relations.forEach((rl) => {
        if (rl.hasMember(personId) && !rl.deleted) {
          r = rl.serialize();
        }
      });
      return r;
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
      this.relations.push(rl.clone());

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
        const rl = this.relations.find((r) => r.id === rId);
        if (rl) {
          rl.removeChild(cId);
        }
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
      const rs = f.elements['relStart']
      rs.value = null;
      const re = f.elements['relEnd']
      re.value = null;
      const rt = f.elements['relType']
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
      // TODO do we need current relation
      this.relation.addChild(id);

      // add to staged relation
      const rl = this.relations.find((r) => r.id == this.relation.id);
      if (rl) {
        rl.addChild(id);
      }

      // add to form child options
      const person = PersonList.find(id);

      this.cSelect.addOption(person.name, person.id);
      this.cSelect.setLast();
    },
  }

  metadata = {
    mediaTable: '#existingMetadata',
    uploadButton: '#upload-metadata-button',
    default: '',
    form: '#uploadMetadataForm',

    getForm() {
      return document.querySelector(this.form);
    },

    update(enable) {
      const f = this.getForm();
      f.elements['fs_add'].disabled = !enable;
    },

    addItem(item) {
      this.tableAddRow(item);
    },

    set(items) {
      const form = this.getForm();
      const table = document.querySelector(this.mediaTable);
      const btn = form.querySelector(this.uploadButton);

      table.innerHTML = '';
      items.forEach((item) => {
        this.tableAddRow(item);
      });

      btn.disabled = false;

      if (!items.length) {
        this.tableAddPlaceholder();
      }
    },

    remove(id) {
      const table = document.querySelector(this.mediaTable);
      const tr = table.querySelector(`[data-id="${id}"]`);

      if (tr) {
        table.removeChild(tr);
      };

      if (!table.getElementsByTagName('tr').length) {  
        this.tableAddPlaceholder();
      }
    },

    reset() {
      const table = document.querySelector(this.mediaTable);
      table.innerHTML = '';
      this.tableAddPlaceholder();
    },

    tableAddPlaceholder() {
      const table = document.querySelector(this.mediaTable);
      const tr = document.createElement('tr');
      const nocontentTd = document.createElement('td');
      nocontentTd.classList.add('column-nocontent');
      nocontentTd.setAttribute('colspan', '5');
      nocontentTd.innerText = 'no files available';
      tr.appendChild(nocontentTd);
      table.appendChild(tr);
    },

    tableAddRow(item) {
      const table = document.querySelector(this.mediaTable);

      const tr = document.createElement('tr');
      tr.dataset.id = item.id;
      const thumbTd = document.createElement('td');
      const nameTd = document.createElement('td');
      const excerptTd = document.createElement('td');
      const editTd = document.createElement('td');
      const removeTd = document.createElement('td');
      editTd.classList.add('column-edit');
      removeTd.classList.add('column-remove');

      if (!item.thumbnail) {
        const type = getMediaType(item.mimetype);
        thumbTd.innerHTML = `<span title='${item.title}' class="famtree-dashicons-thumb dashicons dashicons-media-${type}"></span>`;
      } else {
        thumbTd.innerHTML = `<img title='${item.title}' src='${item.thumbnail}' />`;
      }
      nameTd.innerText = item.title;
      
      excerptTd.innerHTML = `<span>${item.excerpt}</span>`;
      editTd.innerHTML = `<button type="button" title="edit" class="button icon" onclick="window.famtree.editMedia(${item.mediaId})"><span class="dashicons dashicons-edit"></span></button>`;
      removeTd.innerHTML = `<button type="button" title="remove" class="button icon" onclick="window.famtree.removeMeta(${item.id})"><span class="dashicons dashicons-trash"></span></button>`;
      tr.appendChild(thumbTd);
      tr.appendChild(nameTd);
      tr.appendChild(excerptTd);
      tr.appendChild(editTd);
      tr.appendChild(removeTd);

      table.appendChild(tr);
    }
  }
};
