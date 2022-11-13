const personEditor = {
  edit: {
    stageCounter: -1,
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
  
        this._addOption(select, person, r.id);
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

      const rs = Relation.filter((r) => r.members.includes(p.id));
      this.setRelations(rs);
      this.setCandidatesSelect();
    },

    setCandidatesSelect() {
      const f = this.getForm();
      const select = f.candidates;
      const id = parseInt(f.id.value);
      const cs = Person.filter((p) => (id !== p.id));

      cs.forEach((p) => {
        this._addOption(select, p);
      });

      select.selectedIndex = 0;
    },

    getPerson() {
      const f = this.getForm();
      const id = f['id'].value;

      const p = {
        id: (id ? parseInt(id) : ''),
        firstName: f.firstName.value,
        surNames: f.surNames.value,
        lastName: f.lastName.value,
        birthName:f.birthName.value,
        birthday: f.birthday.value,
        deathday: f.deathday.value,
      };
      return p;
    },

    reset() {
      const f = this.getForm();
      f.reset();
      this.resetChildrenSelect();
      this.resetPartnersSelect();
      this.resetCandidatesSelect();
      this.relation = null;
      this.relations = [];

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
      rl.modified = true;
      this.relations.push(rl.clone());
      this.setRelation(rl.clone());
      return rl.id;
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
    },

    _addOption(select, person, value) {
      if (!person) return;

      const o = document.createElement('option');
      const v = this._isId(value) ? value : person.id;

      o.setAttribute('value', v);
      o.text = `${person.name} (${v})`;
      select.appendChild(o);
      select.disabled = false;
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

        this._addOption(select, person);
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

      this._addOption(children, person);
      children.value = id;
    },
  },

  portrait: {
    img: '#person-portrait',
    idInput: 'portrait-id',
    uploadButton: '#upload-submit',
    default: '',
    form: '#uploadPortraitForm',

    getForm() {
      return document.querySelector(this.form);
    },

    setSource(s) {
      const img = document.querySelector(this.img);
      if (!this.default) {
        this.default = img.src;
      }
      img.src = s || this.default;
    },

    reset() {
      if (this.default) {
        this.setSource(this.default);
      }

      const form = this.getForm();
      const inp = form[this.idInput];
      const subm = form.querySelector(this.uploadButton);
      inp.value = '';
      subm.disabled = true;
    },

    update(data) {
      this.setSource(data.url);

      const form = this.getForm();
      const inp = form[this.idInput];
      const subm = form.querySelector(this.uploadButton);
      inp.value = data.id;
      subm.disabled = false;
    },
  },
  metadata: {
    img: '#person-metadata',
    mediaTable: '#existingMetadata',
    uploadButton: '#upload-metadata-submit',
    idInput: 'metadata-id',
    default: '',
    form: '#uploadMetadataForm',

    getForm() {
      return document.querySelector(this.form);
    },

    setSource(s) {
      const img = document.querySelector(this.img);
      if (!this.default) {
        this.default = img.src;
      }
      img.src = s || this.default;
    },

    update(data) {
      this.setSource(data.url);
      const form = this.getForm();
      const inp = form[this.idInput];
      const subm = form.querySelector(this.uploadButton);
      inp.value = data.id;
      subm.disabled = false;
    },

    reset() {
      if (this.default) {
        this.setSource(this.default);
      }

      const form = this.getForm();
      const inp = form[this.idInput];
      const subm = form.querySelector(this.uploadButton);
      const table = document.querySelector(this.mediaTable);
      inp.value = '';
      subm.disabled = true;
      table.innerHTML = '';
    },
  },
};
