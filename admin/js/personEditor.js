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
      const pSelcet = f.partners;
      const pId = f['id'].value;

      if (!pId) {
        return;
      };

      this.relations = rs.map((r) => new Relation(r));

      this.resetPartnersSelect();

      rs.forEach((r, idx) => {
        const ps = r.members.filter((id) => id != parseInt(pId));
        const person = window.pedigree.persons.find((p) => p.id === ps[0]);

        this._addOption(pSelcet, person, r.id);
        
        if (idx === 0) {
          pSelcet.setAttribute('value', r.id);
          this.setRelation(new Relation(r));
        }
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
      f.family.value = p.family;
      f.id.value = p.id;
      f.firstName.value = p.firstName;
      f.surNames.value = p.surNames;
      f.lastName.value = p.lastName;
      f.birthName.value = p.birthName;
      f.birthday.value = p.birthday;
      f.deathday.value = p.deathday;

      const rs = window.pedigree.relations.filter((r) => r.members.includes(p.id));
      this.setRelations(rs);
      this.setCandidates();
    },

    setCandidates() {
      const f = this.getForm();
      const candidates = f.candidates;
      const family = f.family.value;
      const id = parseInt(f.id.value);
      const cs = window.pedigree.persons.filter((p) => (p.family === family && id !== p.id));

      cs.forEach((p, idx) => {
        this._addOption(candidates, p);
        if (idx === 0) {
          candidates.setAttribute('value', p.id);
        }
      });
    },

    getPerson() {
      const f = this.getForm();
      const id = f['id'].value;

      const p = {
        family: f['family'].value,
        id: (id ? parseInt(id) : ''),
        firstName: f['firstName'].value,
        surNames: f['surNames'].value,
        lastName: f['lastName'].value,
        birthName:f['birthName'].value,
        birthday: f['birthday'].value,
        deathday: f['deathday'].value,
      };
      return p;
    },

    reset() {
      const f = this.getForm();
      f.reset();
      this.resetChildrenSelect();
      this.resetPartnersSelect();
      this.resetCandidatesSelect();
      this.relation = [];
      this.relations = [];

    },

    removeRelation(id) {
      const rl = this.relations.find(rl => rl.id === id);
      if (rl) {
        if (this.relation?.id == id) {
          this.relation = null;
        }
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
          .findAll((o) => parseInt(o.value) === cId)
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
      o.text = `${person.firstName} ${person.lastName} (${v})`;
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
      const children = this.getForm().children;

      cnIds.forEach((cId)=>{
        const person = window.pedigree.persons.find((p) => p.id === cId);
        if (!person) {
          return;
        }

        this._addOption(children, person);
      });

      if (cnIds.length) {
        children.value = cnIds[0];
        children.disabled = false;
      }
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
        f.relStart.value = r.start;
        f.relEnd.value = r.end;
        f.relType.value = r.type;
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
      const person = window.pedigree.persons.find((p) => p.id === id);

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
};
