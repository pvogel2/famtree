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
      this.edit.editing = !!firstname.value && !!lastname.value;
      console.log('>>>', this.edit.editing);
    };
    firstname.addEventListener('input', checkForEditing);

    lastname.addEventListener('input', checkForEditing);
  },
  edit: {
    stageCounter: -1,
    editing: false,
    relations: [], // Relation class instances
    relation: null, //Relation class instance
    form: '#editPersonForm',

    getForm() {
      return document.querySelector(this.form);
    },

    setRelations(rs) {
      const f = this.getForm();
      const relType = f.relType;
      const pId = f['id'].value;
      relType.disabled = false;

      if (!pId) {
        return;
      };

      this.relations = rs.map((r) => new Relation(r));

      this.resetPartnersSelect();
      this.setPartnersSelect();
      if (this.relations.length) {
        this.setRelation(this.relations[0].clone());
      }
    },

    setPartnersSelect() {
      const f = this.getForm();
      const select = f.partners;
      const pId = parseInt(f['id'].value);

      this.relations.forEach((r) => {
        const ps = r.members.filter((id) => id !== pId);
        const person = Person.find(ps[0]);
  
        this._addOption(select, person.name, r.id);
      });

      select.selectedIndex = 0;
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

    setCandidatesSelect() {
      const f = this.getForm();
      const select = f.candidates;
      const id = parseInt(f.id.value);
      const cs = Person.filter((p) => (id !== p.id));

      cs.forEach((p) => {
        this._addOption(select, p.name, p.id);
      });

      select.selectedIndex = 0;
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
      this.resetChildrenSelect();
      this.resetPartnersSelect();
      this.resetCandidatesSelect();
      this.setPortrait();
      this.relation = null;
      this.relations = [];
      this.editing = false;
   },

    removeRelation() {
      if (!this.relation) return;
      const rId = this.relation.id;
      this.relation = null;

      const rl = this.relations.find(rl => rl.id === rId);
      if (rl) {
        rl.deleted = true;
      }
      this.resetChildrenSelect();
    },

    addRelation(r) {
      const rl = new Relation({ ...r, id: this.stageCounter-- });
      const rId = rl.id; 

      // no partner is defined
      if (!rl.members.length > 1) {
        return;
      }

      const pId = rl.members[1];
      const newPartner = Person.find(pId);

      // defined partner can not be found
      if (!newPartner) {
        return;
      }

      rl.modified = true;
      this.relations.push(rl.clone());
      this.setRelation(rl.clone());

      const partners = this.getForm().partners;
      this._addOption(partners, newPartner.name, rId);

      return rId;
    },

    removeChild() {
      const childrenSelect = this.getForm().children;
      const partnersSelect = this.getForm().partners;
      const cId = parseInt(childrenSelect.value);
      const rId = parseInt(partnersSelect.value);

      if (cId) {
        // update current relation
        this.relation.removeChild(cId);

        // update current staged relation
        const rl = this.relations.find((r) => r.id === rId);
        if (rl) {
          rl.removeChild(cId);
        }

        // update form children options
        [...childrenSelect.options]
          .filter((o) => parseInt(o.value) === cId)
          .forEach((o) => childrenSelect.remove(o))
        ;
      }
    },

    _isId(v) {
      return !isNaN(v) && typeof(v) === 'number';
    },

    _resetSelect(name) {
      const s = this.getForm()[name];
      if (!s) return;

      while (s.options.length > 0) {
        s.remove(s.options[0]);
      }
      s.disabled = 'disabled';
      const b = this.getForm()[`${name}_remove`];
      if (b) {
        b.disabled = 'disabled';
      }
    },

    _addOption(select, text, value) {
      if (!text || !this._isId(value)) return;

      const o = document.createElement('option');

      o.setAttribute('value', value);
      o.text = `${text} (${value})`;
      select.appendChild(o);
      select.disabled = false;

      const rmBtn = this.getForm()[`${select.name}_remove`];
      if (rmBtn) {
        rmBtn.disabled = false;
      }
    },

    resetChildrenSelect() {
      this._resetSelect('children');
    },

    resetPartnersSelect() {
      this._resetSelect('partners');
    },

    resetCandidatesSelect() {
      this._resetSelect('candidates');
    },

    setChildrenSelect(cnIds) {
      const select = this.getForm().children;

      cnIds.forEach((cId)=>{
        const person = Person.find(cId);
        if (!person) {
          return;
        }

        this._addOption(select, person.name, person.id);
      });

      select.selectedIndex = 0;
    },

    setRelation(rl = null) {
      const f = this.getForm();
      this.resetChildrenSelect();
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
      const children = this.getForm().children;
      const person = Person.find(id);

      this._addOption(children, person.name, person.id);
      children.value = id;
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

    update(data) {
      const form = this.getForm();
      // const inp = form[this.idInput];
      // inp.value = data.id;
      // form.submit();
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
