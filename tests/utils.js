function addElement(parent, tag, attrs) {
  const elem = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    elem.setAttribute(k, v);
  });

  parent.appendChild(elem);
  return elem;
}
  
function addFieldset(parent, attrs) {
  return addElement(parent, 'fieldset', attrs);
};
  
function addInput(parent, attrs) {
  return addElement(parent, 'input', attrs);
};
  
function addSelect(parent, attrs) {
  return addElement(parent, 'select', attrs);
};
  
function addButton(parent, attrs) {
  return addElement(parent, 'button', attrs);
};

export function getEditFormElements() {
  const fE = document.createElement('form');
  fE.id = 'editPersonForm';

  addInput(fE, { name: 'surNames', disabled: 'disabled' });
  addInput(fE, { name: 'birthName', disabled: 'disabled' });
  
  const eElems = {
    personId: addInput(fE, { name: 'id' }),
    firstName: addInput(fE, { name: 'firstName' }),
    lastName: addInput(fE, { name: 'lastName' }),
    partners: addSelect(fE, { name: 'partners', disabled: 'disabled' }),
    children: addSelect(fE, { name: 'children', disabled: 'disabled' }),
    birthday: addInput(fE, { name: 'birthday', type: 'date', disabled: 'disabled' }),
    deathday: addInput(fE, { name: 'deathday', type: 'date', disabled: 'disabled' }),  
    candidates: addSelect(fE, { name: 'candidates', disabled: 'disabled' }),
    partnersBtn: addButton(fE, { name: 'partners_remove', disabled: 'disabled' }),
    childrenBtn: addButton(fE, { name: 'children_remove', disabled: 'disabled' }),
  };

  addInput(fE, { name: 'portraitId' });
  addElement(fE, 'img', { id: 'person-portrait' });
  addInput(fE, { name: 'relType' });
  addInput(fE, { name: 'relStart' });
  addInput(fE, { name: 'relEnd' });

  addFieldset(fE, { name: 'fs_buttons', disabled: 'disabled' });
  addFieldset(fE, { name: 'fs_portrait', disabled: 'disabled' });
  eElems.relationsFs = addFieldset(fE, { name: 'fs_relations', disabled: 'disabled' });
  eElems.addChildBtn = addButton(eElems.relationsFs, { name: 'btn_addChild', disabled: 'disabled' });

  eElems.personForm = fE;

  return eElems;
};

export function getMetadataFormElements() {
  const metadataForm = document.createElement('form');
  metadataForm.id = 'uploadMetadataForm';

  const mediaTable = document.createElement('table');
  mediaTable.id = 'existingMetadata'

  addFieldset(metadataForm, { name: 'fs_add' });

  return {
    metadataForm,
    mediaTable,
    uploadButton: addButton(metadataForm, { id: 'upload-metadata-button', disabled: 'disabled' }),
  };
};
