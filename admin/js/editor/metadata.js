import MetadataTable from '../MetadataTable.js';

export default () => ({
  uploadButton: '#upload-metadata-button',
  default: '',
  form: '#uploadMetadataForm',
  table: null,

  getNonce() {
    const name = 'edit-metadata-nonce';
    return {
      name,
      value: this.getForm().elements[name].value,
    };
  },

  getForm() {
    return document.querySelector(this.form);
  },

  getTable() {
    if (!this.table) {
      this.table = new MetadataTable('#existingMetadata');
    }
    return this.table;
  },

  update(enable) {
    const f = this.getForm();
    f.elements['fs_add'].disabled = !enable;
  },

  addItem(item) {
    this.getTable().addRow(item);
  },

  set(items) {
    const form = this.getForm();
    const btn = form.querySelector(this.uploadButton);

    this.getTable().clearAll();

    items.forEach((item) => {
      this.getTable().addRow(item);
    });

    btn.disabled = false;
  },

  remove(id) {
    this.getTable().removeRow(id);
  },

  reset() {
    this.getTable().clearAll();
  },
});
