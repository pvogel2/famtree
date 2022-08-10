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
        firstName: fields[1].textContent.trim(),
        surNames: fields[2].textContent.trim(),
        lastName: fields[3].textContent.trim(),
        birthName: fields[4].textContent.trim(),
        birthday: fields[5].textContent.trim(),
        deathday: fields[6].textContent.trim(),
        children: fields[7].textContent.trim(),
        partners: fields[8].textContent.trim(),
      })
    );
  });
});

window.pedigree.getPerson = (json) => {
  return {
    id: json.id,
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
