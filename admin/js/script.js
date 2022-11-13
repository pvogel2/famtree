window.pedigree = window.pedigree || {};

window.pedigree.saveRelations = function() {
  const rls = personEditor.edit.relations.filter((rl) => rl.modified);
  const ps = [];

  // replace current relation in array
  const rIndex = rls.findIndex((rl) => rl.id === personEditor.edit.relation?.id);
  if (rIndex > -1) {
    rls.splice(rIndex, 1, personEditor.edit.relation.clone());
  } else if (personEditor.edit.relation) {
    rls.push(personEditor.edit.relation.clone());
  }

  rls.forEach((rl) => {
    const deleted = rl.deleted === true;
    if (rl.id < 0 && deleted) { // new relation directly removed in edit mode, nothing to save
      return;
    }

    const options = {
      path: `pedigree/v1/relation/${rl.id >= 0 ? rl.id : ''}`,
      type: deleted ? 'DELETE' : 'POST',
    };

    if (!deleted) {
      options.data = rl.serialize();
      if (options.data.id < 0) { // new relation
        delete options.data.id;
      }
    };

    ps.push(wp.apiRequest(options));
  });

  return ps;
}

window.pedigree.saveAll = function() {
  const ps = window.pedigree.saveRelations();
  ps.push(window.pedigree.savePerson());

  Promise.allSettled(ps).then((ress) => {
    document.location.reload();
  });
}

window.pedigree.loadFamilies = async () => {
  const options = {
    path: 'pedigree/v1/family/',
    type: 'GET',
  };

  return wp.apiRequest(options);
}

window.pedigree.loadMetadata = async (id) => {
  const options = {
    path: `pedigree/v1/person/${id}/metadata`,
    type: 'GET',
  };

  return wp.apiRequest(options);
}

window.pedigree.savePerson = function() {
  const person = personEditor.edit.getPerson();
  if (!person.firstName || !person.lastName) {
    return;
  };

  // get root information from table, the only place where it is modified
  const input = document.querySelector(`.wp-list-table tbody tr[data-id="${person.id}"] .root input`);
  if (input) {
    person.root = input.checked;
  }

  const options = {
    path: `pedigree/v1/person${person.id ? `/${person.id}` : ''}`,
    type: 'POST',
    data: { ...person },
  };

  return wp.apiRequest(options);
}

window.addEventListener('DOMContentLoaded', async () => {
  const { relations, persons } = await window.pedigree.loadFamilies();

  relations.forEach((r) => {
    Relation.add(r);
  });

  const relatedPersons = [];

  persons.forEach((p) => {
    const rls = relations
      .filter((r) => !!r.members.filter((mId) => mId === parseInt(p.id)).length)
      .map((r) => r.id)
    ;

    p.relations = rls;
    Person.add(p);
  
    if (p.relations.length) {
      relatedPersons.push(p.id);
    }
  });

  relatedPersons.forEach((pId) => {
    const person = Person.find(pId);
    const select = document.querySelector(`.wp-list-table tbody tr[data-id="${pId}"] .relations select`);

    if (!person || !select) {
      return;
    }

    person.relations.forEach((rId) => {
      const rl = Relation.find(rId);

      if (!rl)  return;

      // find member
      const mId = pId != rl.members[0] ? rl.members[0] : rl.members[1];
      const ps = Person.find(mId);

      const o = document.createElement('option');
      o.value = ps.id;
      o.innerText = `${ps.name}`; 
      select.appendChild(o);
      select.disabled = false;

      rl.children.forEach((cId) => {
        const ps = Person.find(cId);
        const o = document.createElement('option');
        o.value = ps.id;
        o.innerText = `>  ${ps.name}`; 
        select.appendChild(o);
      });
    });
  });
});

window.pedigree.partnerSelected = () => {
  const form = personEditor.edit.getForm();
  const partnersSelect = form.partners;

  const relation = Relation.find(partnersSelect.value);
  if (relation) {
    personEditor.edit.setRelation(new Relation(relation));
  }
};

window.pedigree.relMetaChanged = () => {
  if (personEditor.edit.relation) {
    const f = personEditor.edit.getForm();
    personEditor.edit.relation.start = f.relStart.value;
    personEditor.edit.relation.end = f.relEnd.value;
    personEditor.edit.relation.type = f.relType.value;
  }
};

window.pedigree.removePartner = () => {
  const form = personEditor.edit.getForm();
  const partnersSelect = form.partners;
  const rId = parseInt(partnersSelect.value);
  if (rId) {
    const options = [...partnersSelect.options];
    const option = options.find(o =>parseInt(o.value) === rId);
  
    // remove option
    if (option) {
      partnersSelect.removeChild(option);
      Relation.remove(rId);
      personEditor.edit.removeRelation(rId);
    }
  }
}

window.pedigree.addPartner = (id) => {
  let pId = parseInt(id);
  if (isNaN(pId)) {
    const cSelect = document.getElementById('candidates');
    pId =  parseInt(cSelect.value);
  }
  if (isNaN(pId)) return;

  const form = personEditor.edit.getForm();
  const partnersSelect = form.partners;

  let relation = null;
  personEditor.edit.relations.forEach((rId) => {
    const rel = Relation.find(rId);
    if (rel.members.find((mId) => mId == pId)) {
      relation = { ...rel };
    }
  });

  const options = [...partnersSelect.options];
  const option = options.find(o => o.value == relation?.id);

  if (!option) {
    // new relation
    relation = {
      start: null,
      end: null,
      children: [],
      members: [form.id.value, pId],
    };
    const rId = personEditor.edit.addRelation(relation);
    const newOption = document.createElement('option');
    const partnerPerson = Person.find(pId);
    newOption.setAttribute('value', rId);
    newOption.text = `${partnerPerson.name} (p:${partnerPerson.id}, r:${rId})`;
    partnersSelect.appendChild(newOption);
    partnersSelect.disabled = false;
    partnersSelect.setAttribute('value', rId);
    relation.id = rId;
    Relation.add({ ...relation, members: [...relation.members], children: [...relation.children] });
  }
};

window.pedigree.removeChild = () => {
  if (!personEditor.edit.relation) return;
  personEditor.edit.removeChild();
}

window.pedigree.addChild = (id) => {
  let cId = parseInt(id);
  if (isNaN(cId)) {
    const cSelect = document.getElementById('candidates');
    cId =  parseInt(cSelect.value);
  }
  if (!personEditor.edit.relation || isNaN(cId)) return;
  personEditor.edit.addChild(cId);
};

window.pedigree.getMediaType = (mimetype) => {
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

window.pedigree.editPerson = (id) => {
  const person = Person.find(id);
  if (person) {
    personEditor.edit.setPerson(person);

    const portraitForm = personEditor.portrait.getForm();
    portraitForm.id.value = id;
    personEditor.portrait.setSource(person.portraitUrl);

    const metadataForm = personEditor.metadata.getForm();
    metadataForm.refid.value = id;

    window.pedigree.loadMetadata(id)
      .then((results) => {
        const table = document.getElementById('existingMetadata');
        table.innerHTML = '';
        results.forEach((item) => {
          const tr = document.createElement('tr');
          const thumbTd = document.createElement('td');
          const excerptTd = document.createElement('td');
          const editTd = document.createElement('td');
          if (!item.thumbnail) {
            thumbTd.innerHTML = `<span class="ped-dashicons-thumb dashicons dashicons-media-document"></span>`;
          } else {
            thumbTd.innerHTML = `<img title='${item.title}' src='${item.thumbnail}' />`;
          }
          excerptTd.innerHTML = `<span>${item.excerpt}</span>`;
          editTd.innerHTML = `<button type="button" class="button icon" onclick="window.pedigree.editMedia(${item.mediaId})"><span class="dashicons dashicons-edit"></span></button>`;
          tr.appendChild(thumbTd);
          tr.appendChild(excerptTd);
          tr.appendChild(editTd);
          table.appendChild(tr);
        });
      })
      .catch((err) => {
        console.log('Could not load metadata', err);
      });
  }
};

window.pedigree.resetPerson = () => {
  personEditor.edit.reset();
  personEditor.portrait.reset();
  personEditor.metadata.reset();
};

window.pedigree.deletePerson = async () => {
  const person = personEditor.edit.getPerson();
  const pId = person.id;
  if (!pId) return;

  const options = {
    path: `pedigree/v1/person/${pId}`,
    type: 'DELETE',
  };

  wp.apiRequest(options).then(() => {
    // remove from global list
    Person.remove(pId);

    // remove from person editor
    if (personEditor.edit.getPerson().id === pId) {
      window.pedigree.resetPerson();
    }

    // remove from html
    const tBody = document.getElementById('the-list');
    const tr = tBody.querySelector(`[data-id="${pId}"]`);
    if (tr) {
      tBody.removeChild(tr);
    };
    console.log('all updated');
  });

}


window.pedigree.editMedia = (mediaId) => {
  const mediaLib = window.pedigree.wkEditMedia.open();
  // setTimeout(() => {
  //   mediaLib.$el[0].querySelector(`[data-id="${mediaId}"]`).click();
  // }, 1000);
}

window.pedigree.updateRoot = async (elem, pId) => {
  const root = elem.checked;

  const options = {
    path: `pedigree/v1/root/${pId}`,
    type: 'POST',
    data: { root },
  };

  return wp.apiRequest(options);
}

jQuery(function($){
  let wkMedia;

  window.pedigree.wkEditMedia = wp.media({
    title: 'Edit media',
    button: {
    text: 'Save'
  }, multiple: false });

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

  document.querySelector('#upload-metadata-button').addEventListener('click', (e) => {
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
      personEditor.metadata.update(attachment);
    });
    // Open the upload dialog
    wkMedia.open();
  });
});

