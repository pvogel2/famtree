import { PersonEditor } from './personEditor.js';
import { Person } from './person.js';

window.famtree = window.famtree || {};

window.famtree.saveRelations = function() {
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
      path: `famtree/v1/relation/${rl.id >= 0 ? rl.id : ''}`,
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

window.famtree.saveAll = function() {
  const person = personEditor.edit.getPerson();

  // validate minimal valid input
  if (!person.firstName || !person.lastName) {
    window.famtree.showMessage('Persons need at least firstname and lastname', 'error');
    return;
  };

  const ps = window.famtree.saveRelations();
  ps.push(window.famtree.savePerson(person));

  Promise.allSettled(ps).then((ress) => {
    document.location.reload();
  });
}

window.famtree.loadFamilies = async () => {
  const options = {
    path: 'famtree/v1/family/',
    type: 'GET',
  };

  return wp.apiRequest(options);
}

window.famtree.loadMetadata = async (id) => {
  const options = {
    path: `famtree/v1/person/${id}/metadata`,
    type: 'GET',
  };

  return wp.apiRequest(options);
}

// returns a Promise
window.famtree.savePerson = function(person) {
  // get root information from table, the only place where it is modified
  const input = document.querySelector(`.wp-list-table tbody tr[data-id="${person.id}"] .root input`);
  if (input) {
    person.root = input.checked;
  }

  const options = {
    path: `famtree/v1/person${person.id ? `/${person.id}` : ''}`,
    type: 'POST',
    data: { ...person },
  };

  return wp.apiRequest(options);
}

let personEditor;

window.addEventListener('DOMContentLoaded', async () => {
  const { relations, persons } = await window.famtree.loadFamilies();

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

      if (!ps) {
        console.warn('Relation Error: Could not find partner relation with id', mId, ', skipping relation.');
        return;
      }

      const o = document.createElement('option');
      o.value = ps.id;
      o.innerText = `${ps.name}`; 
      select.appendChild(o);
      select.disabled = false;

      rl.children.forEach((cId) => {
        const ps = Person.find(cId);

        if (!ps) {
          console.warn('Relation Error: Could not find child with id', cId, ', skipping relation.');
          return;
        }

        const o = document.createElement('option');
        o.value = ps.id;
        o.innerText = `>  ${ps.name}`; 
        select.appendChild(o);
      });
    });
  });

  personEditor = new PersonEditor();
});

window.famtree.partnerSelected = () => {
  const form = personEditor.edit.getForm();
  const partnersSelect = form.partners;

  const relation = Relation.find(partnersSelect.value);
  if (relation) {
    personEditor.edit.setRelation(new Relation(relation));
  }
};

window.famtree.relMetaChanged = () => {
  if (personEditor.edit.relation) {
    const f = personEditor.edit.getForm();
    personEditor.edit.relation.start = f.relStart.value;
    personEditor.edit.relation.end = f.relEnd.value;
    personEditor.edit.relation.type = f.relType.value;
  }
};

window.famtree.removePartner = () => {
  const rId = personEditor.edit.rSelect.removeSelected();
  if (rId) {
    Relation.remove(rId);
    personEditor.edit.removeRelation(rId);
  }
}

window.famtree.addPartner = (id) => {
  let pId = parseInt(id);
  if (isNaN(pId)) {
    const cSelect = document.getElementById('candidates');
    pId =  parseInt(cSelect.value);
  }
  if (isNaN(pId)) return;

  const person = personEditor.edit.getPerson();
  if (!personEditor.edit.findInvolvedRelation(pId)) {
    // new relation
    const relation = {
      start: null,
      end: null,
      children: [],
      members: [person.id, pId],
    };

    const rId = personEditor.edit.addRelation(relation);

    if (!rId) {
      return;
    }

    relation.id = rId;
    Relation.add({ ...relation, members: [...relation.members], children: [...relation.children] });
  }
};

window.famtree.removeChild = () => {
  if (!personEditor.edit.relation) return;
  personEditor.edit.removeChild();
}

window.famtree.addChild = (id) => {
  let cId = parseInt(id);
  if (isNaN(cId)) {
    const cSelect = document.getElementById('candidates');
    cId =  parseInt(cSelect.value);
  }
  if (!personEditor.edit.relation || isNaN(cId)) return;
  personEditor.edit.addChild(cId);
};

window.famtree.getMediaType = (mimetype) => {
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

window.famtree.editPerson = (id) => {
  const person = Person.find(id);
  if (person) {
    window.scrollTo(0, 0);
    personEditor.edit.setPerson(person);

    const metadataForm = personEditor.metadata.getForm();
    metadataForm.refid.value = id;

    window.famtree.loadMetadata(id)
      .then((results) => {
        personEditor.metadata.set(results);
      })
      .catch((err) => {
        console.log('Could not load metadata', err);
      });
  }
};

window.famtree.resetPerson = () => {
  personEditor.edit.reset();
  personEditor.metadata.reset();
};

window.famtree.deletePerson = async () => {
  const person = personEditor.edit.getPerson();
  const pId = person.id;
  if (!pId) return;

  const options = {
    path: `famtree/v1/person/${pId}`,
    type: 'DELETE',
  };

  wp.apiRequest(options).then(() => {
    // remove from global list
    Person.remove(pId);

    // remove from person editor
    personEditor.edit.removePerson(pId);

    // remove from html
    const tBody = document.getElementById('the-list');
    const tr = tBody.querySelector(`[data-id="${pId}"]`);
    if (tr) {
      tBody.removeChild(tr);
    };
  });

}

window.famtree.editMedia = (mediaId) => {
  const mediaLib = window.famtree.wkEditMedia.open();
  // setTimeout(() => {
  //   mediaLib.$el[0].querySelector(`[data-id="${mediaId}"]`).click();
  // }, 1000);
}

window.famtree.removeMeta = (mId) => {
  const options = {
    path: `famtree/v1/metadata/${mId}`,
    type: 'DELETE',
  };

  wp.apiRequest(options).then(() => {    // remove from html
    personEditor.metadata.remove(mId);
    window.famtree.showMessage('Additional file removed');
 })
  .fail((request, statusText) => {
    window.famtree.showMessage('Additional file remove failed', 'error');
    console.log('error', statusText)
  });
}

window.famtree.showMessage = (message, type = 'success') => {
  const m = document.getElementById('famtree-message');
  m.classList.remove('famtree-hidden', 'notice-success', 'notice-error');
  m.classList.add(`notice-${type}`);
   const p = m.querySelector('.famtree-message__text');
  p.textContent = message;
  window.scrollTo(0,0);
}

window.famtree.hideMessage = () => {
  const m = document.getElementById('famtree-message');
  m.classList.add('famtree-hidden');
}

window.famtree.saveMeta = (attachment) => {
  const metadataForm = personEditor.metadata.getForm();

  const item = {
    mediaId: attachment.id,
    refId: metadataForm.refid.value,
  };

  const options = {
    path: 'famtree/v1/metadata/',
    type: 'POST',
    data: { ...item },
  };

  wp.apiRequest(options).then((resultData) => {
    personEditor.metadata.addItem(resultData);
    window.famtree.showMessage('Additional file saved');
  })
  .fail((request, statusText) => {
    console.log('error', statusText);
    window.famtree.showMessage('Saving of additional file failed', 'error');
  });
}

window.famtree.updateRoot = async (elem, pId) => {
  const root = elem.checked;

  const options = {
    path: `famtree/v1/root/${pId}`,
    type: 'POST',
    data: { root },
  };

  const ps = Person.find(pId);

  wp.apiRequest(options).then(() => {
    window.famtree.showMessage(`${ root ? 'Added' : 'Removed'} ${ ps.name } as available family founder.`);
  })
  .catch((err) => {
    window.famtree.showMessage('Updating roots failed', 'error');
  });
}

jQuery(function($){
  let wkMedia;

  window.famtree.wkEditMedia = wp.media({
    title: 'Edit media',
    button: {
    text: 'Save'
  }, multiple: false });

  document.querySelector('#portrait-upload-button').addEventListener('click', (e) => {
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
      personEditor.edit.setPortrait(attachment);
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
      window.famtree.saveMeta(attachment);
    });
    // Open the upload dialog
    wkMedia.open();
  });
});

