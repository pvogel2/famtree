import PersonList from '../../public/js/PersonList.js';
import Relation from './Relation.js';
import Famtree from './FamtreeAdmin.js';


async function initializeFamtreeSettings() {
  window.famtree = new Famtree(wp);

  const { relations, persons } = await window.famtree.loadFamilies();

  relations.forEach((r) => {
    Relation.add(r);
  });

  const relatedPersons = [];

  persons.forEach((p) => {
    if (!p.id) {
      console.warn('Found person without id, skip usage.', p);
      return;
    }

    const rls = relations
      .filter((r) => !!r.members.filter((mId) => mId === parseInt(p.id)).length)
      .map((r) => r.id)
    ;

    p.relations = rls;
    PersonList.add(p);
  
    if (p.relations.length) {
      relatedPersons.push(p.id);
    }
  });

  relatedPersons.forEach((pId) => {
    const person = PersonList.find(pId);
    const select = document.querySelector(`.wp-list-table tbody tr[data-id="${pId}"] .relations select`);

    if (!person || !select) {
      return;
    }

    person.relations.forEach((rId) => {
      const rl = Relation.find(rId);

      if (!rl)  return;

      // find member
      const mId = pId != rl.members[0] ? rl.members[0] : rl.members[1];
      const ps = PersonList.find(mId);

      if (!ps) {
        console.warn('Relation Warning: Could not find partner relation with id', mId, ', skipping relation.');
        return;
      }

      const o = document.createElement('option');
      o.value = ps.id;
      o.innerText = `${ps.name}`; 
      select.appendChild(o);
      select.disabled = false;

      rl.children.forEach((cId) => {
        const ps = PersonList.find(cId);

        if (!ps) {
          console.warn('Relation Warning: Could not find child with id', cId, ', skipping relation.');
          return;
        }

        const o = document.createElement('option');
        o.value = ps.id;
        o.innerText = `>  ${ps.name}`; 
        select.appendChild(o);
      });
    });
  });
};

jQuery(async function($) {
  let wkMedia;

  await initializeFamtreeSettings();

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
      window.famtree.setPortrait(attachment);
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

