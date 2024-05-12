import MetadataTable from '../MetadataTable.js';
import MetadataForm from '../MetadataForm.js';

export default class MetadataEditor {
  constructor() {
    this.table = new MetadataTable();
    this.form = new MetadataForm();
  }

  getNonce() {
    return this.form.getNonce();
  }

  getRefId() {
    return this.form.getRefId();
  }

  setRefId(id) {
    this.form.setRefId(id);
  }

  update(enable) {
    this.form.enableUpload(enable);
  }

  addItem(item) {
    this.table.addRow(item);
  }

  set(items) {
    this.table.clearAll();

    items.forEach((item) => {
      this.table.addRow(item);
    });

    this.form.enableUpload(true);
  }

  remove(id) {
    this.table.removeRow(id);
  }

  reset() {
    this.table.clearAll();
  }
};
