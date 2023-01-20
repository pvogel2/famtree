const personEditor = {
  initialize() {
    const f = this.edit.getForm();
    const firstname = f['firstName'];
    const lastname = f['lastName'];

    if (!firstname || !lastname) {
      console.error('missing mandatory form elements');
      return;
    }

    const checkForEditing = () => {
      const wasEditing = !!this.edit.editing;
      this.edit.editing = !!firstname.value && !!lastname.value;
      if (wasEditing !== this.edit.editing) {
        f['fs_buttons'].disabled = !this.edit.editing;
        this.edit.update(this.edit.editing);
        this.metadata.update(this.edit.editing);
      }
    };

    firstname.addEventListener('input', checkForEditing);
    lastname.addEventListener('input', checkForEditing);

    this.edit.rSelect = new ManagedSelect(f.partners, f[`${f.partners.name}_remove`], [f.relType, f.relStart, f.relEnd]);
    this.edit.cSelect = new ManagedSelect(f.children, f[`${f.children.name}_remove`]);
    this.edit.caSelect = new ManagedSelect(f.candidates);
  },
  edit: {
    stageCounter: -1,
    editing: false,
    relations: [], // Relation class instances
    relation: null, //Relation class instance
    form: '#editPersonForm',
    rSelect: null,

    update(editing) {
      const f = this.getForm();
      f['fs_portrait'].disabled = !editing;
      f['fs_relations'].disabled = !editing;
      this.updateCandidatesSelect();
    },

    getForm() {
      return document.querySelector(this.form);
    },

    setRelations(rs) {
      const f = this.getForm();
      const pId = f['id'].value;

      if (!pId) {
        return;
      };

      this.relations = rs.map((r) => new Relation(r));

      this.rSelect.reset();
      this.setPartnersSelect();
      if (this.relations.length) {
        this.setRelation(this.relations[0].clone());
      }
    },

    setPartnersSelect() {
      const f = this.getForm();
      const pId = parseInt(f['id'].value);

      this.relations.forEach((r) => {
        const ps = r.members.filter((id) => id !== pId);
        const person = Person.find(ps[0]);
  
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
      f.id.value = p.id;
      f.firstName.value = p.firstName;
      f.surNames.value = p.surNames;
      f.lastName.value = p.lastName;
      f.birthName.value = p.birthName;
      f.birthday.value = p.birthday;
      f.deathday.value = p.deathday;
      f.portraitImageId.value = p._portraitId;

      f.firstName.dispatchEvent(new Event('input'));
      f.lastName.dispatchEvent(new Event('input'));

      this.setPortrait({ id: p._portraitId, url: p._portraitUrl });

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
      f.portraitImageId.value = data.id;
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
      const cs = Person.filter((p) => (id !== p.id));

      cs.forEach((p) => {
        this.caSelect.addOption(p.name, p.id);
      });
      this.caSelect.setIndex();
    },

    getPerson() {
      const f = this.getForm();
      const id = f.id.value;
      const imageId = f.portraitImageId.value;
      const p = {
        id: (id ? parseInt(id) : ''),
        firstName: f.firstName.value,
        surNames: f.surNames.value,
        lastName: f.lastName.value,
        birthName:f.birthName.value,
        birthday: f.birthday.value,
        deathday: f.deathday.value,
        portraitImageId: (imageId ? parseInt(imageId) : ''),
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

      f.firstName.dispatchEvent(new Event('input'));
      f.lastName.dispatchEvent(new Event('input'));

      this.editing = false;
    },

    removeRelation() {
      const f = this.getForm();
      if (!f.partners.options.length) {
        this.rSelect.reset();
      }

      if (!this.relation) return;
      const rId = this.relation.id;
      this.relation = null;

      const rl = this.relations.find(rl => rl.id === rId);
      if (rl) {
        rl.deleted = true;
      }
      this.cSelect.reset();
    },

    findInvolvedRelation(personId) {
      let r = null;
      this.relations.forEach((rl) => {
        if (rl.hasMember(personId)) {
          r = rl.serialize();
        }
      });
      return r;
    },

    addRelation(r) {
      const rl = new Relation({ ...r, id: this.stageCounter-- });
      const rId = rl.id; 

      // no partner is defined
      if (!rl.members.length > 1) {
        return null;
      }

      const pId = rl.members[1];
      const newPartner = Person.find(pId);

      // defined partner can not be found
      if (!newPartner) {
        return null;
      }

      rl.modified = true;
      this.relations.push(rl.clone());

      this.setRelation(rl.clone());

      this.rSelect.addOption(newPartner.name, rId);

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
        const person = Person.find(cId);
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
      f.relStart.value = null;
      f.relEnd.value = null;
      f.relType.value = null;

      this.relation = rl;

      if (this.relation) {
        this.setChildrenSelect(rl.children);
        f.relStart.value = this.relation.start;
        f.relEnd.value = this.relation.end;
        f.relType.value = this.relation.type;
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
      const person = Person.find(id);

      this.cSelect.addOption(person.name, person.id);
      this.cSelect.setLast();
    },
  },

  metadata: {
    mediaTable: '#existingMetadata',
    uploadButton: '#upload-metadata-button',
    // idInput: 'metadata-id',
    default: '',
    form: '#uploadMetadataForm',

    getForm() {
      return document.querySelector(this.form);
    },

    update(enable) {
      const f = this.getForm();
      f['fs_add'].disabled = !enable;
    },

    addItem(item) {
      const table = document.querySelector(this.mediaTable);
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
      const form = this.getForm();
      // const btn = form.querySelector(this.uploadButton);
      const table = document.querySelector(this.mediaTable);
      // btn.disabled = true;
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
        const type = window.famtree.getMediaType(item.mimetype);
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
  },
};
