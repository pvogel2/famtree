import UIImportDialog from '../UIImportDialog.js';
import Parser from './parser.js';
import Mapper from './mapper.js';

const ELEMENT_ID = 'famtree_gedcom_import';

export default class GedcomImporter {
  static MODE_SKIP = 'skip';
  static MODE_ADD = 'add';
  static MODE_REPLACE = 'replace';
  static MODE_CANCEL = 'cancel';

  constructor() {
    this.parser = new Parser();
    this.modal = new UIImportDialog();

    this.element = document.getElementById(ELEMENT_ID);
  }

  async import() {
    const fs = this.element.files;

    return new Promise((resolve, reject) => {
      if (fs.length > 0) {
        const f = fs[0];
        const fr = new FileReader();

        const result = {
          persons: [],
          relations: [],
        }

        fr.addEventListener('load', () => {
          const gc = this.parser.parse(fr.result);
          const mpr = new Mapper(gc);
          result.persons = mpr.getPersons();
          result.relations = mpr.getRelations();
          resolve(result);
        });

        fr.addEventListener('error', () => {
          reject(fr.error);
        });

        fr.readAsText(f, 'UTF-8');
      } else {
        resolve(result);
      }
      this.element.value = '';
    });
  }

  async comparePersons(knownP, newP) {
    if (!knownP) {
      return { action: GedcomImporter.MODE_ADD, auto: false };
    }
    this.modal.setContent(knownP, newP);
    return this.modal.open();
  }
};
