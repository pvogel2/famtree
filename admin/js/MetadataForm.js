const ELEMENT_ID = 'uploadMetadataForm';

export default class MetadataForm {
  constructor() {
    this.element = document.getElementById(ELEMENT_ID);
  }

  enableUpload(enable) {
    const fieldset = this.element.elements['fs_add'];
    fieldset.disabled = !enable;
  }

  getRefId() {
    return this.element.refid.value;
  }

  setRefId(id) {
    return this.element.refid.value = id;
  }

  getNonce() {
    const name = 'edit-metadata-nonce';
    return {
      name,
      value: this.element.elements[name].value,
    };
  }
};
