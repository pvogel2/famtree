window.pedigree = window.pedigree || {
  persons: [],
};

window.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('#familyTable tbody tr');
  rows.forEach(row => {
    const fields = row.querySelectorAll('td');
    window.pedigree.persons.push(
      window.pedigree.getPerson({
        id: Number(fields[0].textContent.trim()),
        family: fields[1].textContent.trim(),
        firstName: fields[2].textContent.trim(),
        surNames: fields[3].textContent.trim(),
        lastName: fields[4].textContent.trim(),
        birthName: fields[5].textContent.trim(),
        birthday: fields[6].textContent.trim(),
        deathday: fields[7].textContent.trim(),
        children: fields[8].textContent.trim(),
        partners: fields[9].textContent.trim(),
        root: fields[10].firstChild.checked,
      })
    );
  });
  window.pedigree.setFamily();
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
    document.getElementById('personId').value = person.id;
    document.getElementById('firstName').value = person.firstName;
    document.getElementById('surNames').value = person.surNames;
    document.getElementById('lastName').value = person.lastName;
    document.getElementById('birthName').value = person.birthName;

    document.getElementById('birthday').value = person.birthday;
    document.getElementById('deathday').value = person.deathday;

    const partners = document.getElementById('partners');
    partners._values = [...person.partners];
    partners.value = partners._values.join(', ');

    const children = document.getElementById('children');
    children._values = [...person.children];
    children.value = children._values.join(', ');
  }
};

window.pedigree.resetPerson = () => {
  const form = document.getElementById('editPersonForm');
  form.reset();

  const partners = document.getElementById('partners');
  partners._values = [];

  const children = document.getElementById('children');
  children._values = [];
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
    const newInput = document.createElement('input');
    newInput.type='text';
    newInput.name=`pedigree_families[${newFamily}]`;
    newInput.value = newFamily;
    newInput.text = newFamily;
    container.appendChild(newInput);
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

