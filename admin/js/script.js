const personEditor = {
  edit: {
    form: '#editPersonForm',
    getForm() {
      return document.querySelector(this.form);
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

window.pedigree = window.pedigree || {
  persons: [],
};

window.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('.wp-list-table tbody tr');
  rows.forEach(row => {
    window.pedigree.persons.push(
      window.pedigree.getPerson({
        id: Number(row.dataset.id),
        root: row.querySelector('.root').firstChild.checked,
        family: row.querySelector('.family').textContent.trim(),
        firstName: row.querySelector('.firstName').textContent.trim(),
        surNames: row.querySelector('.surNames').textContent.trim(),
        lastName: row.querySelector('.lastName').textContent.trim(),
        birthName: row.querySelector('.birthName').textContent.trim(),
        birthday: row.querySelector('.birthday').textContent.trim(),
        deathday: row.querySelector('.deathday').textContent.trim(),
        children: row.querySelector('.children').textContent.trim(),
        partners: row.querySelector('.partners').textContent.trim(),
        portraitUrl: row.querySelector('.root').firstChild.dataset.portraitUrl,
      })
    );
  });
});

window.pedigree.getPerson = (json) => {
  return {
    id: json.id,
    family: json.family || '',
    root: !!json.root,
    firstName: json.firstName || '',
    surNames: json.surNames || '',
    lastName: json.lastName || '',
    birthName: json.birthName || '',
    birthday: json.birthday ||null,
    deathday: json.deathday || null,
    partners: json.partners ? JSON.parse(json.partners) : [],
    children: json.children ? JSON.parse(json.children) : [],
    portraitUrl: json.portraitUrl || '',
  };
};

window.pedigree.togglePartner = (id) => {
  const field = document.getElementById('partners');
  if (!field._values) {
    field._values = [];
  }
  const idx = field._values.findIndex(_id => _id === id);
  if (idx === -1) {
    field._values.push(id);
  } else {
    field._values.splice(idx, 1);
  }
  field.value = field._values.join(', ');
};

window.pedigree.toggleChild = (id) => {
  const field = document.getElementById('children');
  if (!field._values) {
    field._values = [];
  }

  const idx = field._values.findIndex(_id => _id === id);
  if (idx === -1) {
    field._values.push(id);
  } else {
    field._values.splice(idx, 1);
  }
  field.value = field._values.join(', ');
};

window.pedigree.editPerson = (id) => {
  const person = window.pedigree.persons.find((p) => p.id === id);
  if (person) {
    const form = personEditor.edit.getForm();
    form.family.value = person.family;
    form.id.value = person.id;
    form.firstName.value = person.firstName;
    form.surNames.value = person.surNames;
    form.lastName.value = person.lastName;
    form.birthName.value = person.birthName;

    form.birthday.value = person.birthday;
    form.deathday.value = person.deathday;

    const partners = form.partners;
    partners._values = [...person.partners];
    partners.value = partners._values.join(', ');

    const children = form.children;
    children._values = [...person.children];
    children.value = children._values.join(', ');

    const portraitForm = personEditor.portrait.getForm();

    portraitForm.id.value = id;
    personEditor.portrait.setSource(person.portraitUrl);
  }
};

window.pedigree.resetPerson = () => {
  const form = personEditor.edit.getForm();
  form.reset();

  const partners = form.partners;
  partners._values = [];

  const children = form.children;
  children._values = [];

  personEditor.portrait.reset();
};

window.pedigree.removePerson = async (id) => {
  const form = document.getElementById('deletePersonForm');
  form['deleteId'].value = id;
  form.requestSubmit();
}

window.pedigree.addFamily = () => {
  const input = document.getElementById('pedigreeFamiliesInput');
  const container = document.getElementById('pedigreeKnownFamilies');
  const newFamily = input.value;
  if (newFamily) {
    const newLabel = document.createElement('label');
    newLabel.id=`pedigree_families_${newFamily}_container`;
    newLabel.innerHTML = `
      <input type="text" readonly name="pedigree_families[${newFamily}]" value="${newFamily}" />
    `;
    container.appendChild(newLabel);
  }
};

window.pedigree.setFamily = (id = 'default') => {
  const personInput = document.getElementById('family');
  if (id) {
    personInput.value = id;
  }
};

window.pedigree.removeFamily = (id) => {
  // alert(`remove family ${id}`)
  const row = document.getElementById(`pedigree_families_${id}_container`);
  row.remove();
  const family = document.getElementById('family');
  family.querySelectorAll('option').forEach((o) => {
    if (o.value === id) {
      family.removeChild(o);
    }
  });
}

window.pedigree.updateRoot = async (id) => {
  const form = document.getElementById('updateRootForm');
  const person = window.pedigree.persons.find((p) => p.id === id);
  if (!person) {
    return;
  }

  form['rootId'].value = id;
  form['rootValue'].value = !person.root;
  form.requestSubmit();
}

jQuery(function($){
  let wkMedia;

  document.querySelector('#upload-button').addEventListener('click', (e) => {
    e.preventDefault();
    // If the upload object has already been created, reopen the dialog
      if (wkMedia) {
        wkMedia.open();
        return;
    }
    // Extend the wp.media object
    wkMedia = wp.media({
      title: 'Select media',
      button: {
      text: 'Select media'
    }, multiple: false });

    // When a file is selected, grab the URL and set it as the text field's value
    wkMedia.on('select', function() {
      const attachment = wkMedia.state().get('selection').first().toJSON();
      personEditor.portrait.update(attachment);
    });
    // Open the upload dialog
    wkMedia.open();
  });
});

