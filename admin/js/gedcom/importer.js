import UIImportDialog from '../UIImportDialog.js';
import Parser from './parser.js';
import Mapper from './mapper.js';

const ELEMENT_ID = 'famtree_gedcom_import';

export default class GedcomImporter {
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
          result.persons = mpr.persons();
          result.relations = mpr.relations();
          resolve(result);
        });

        fr.addEventListener('error', () => {
          reject(fr.error);
        });

        fr.readAsText(f, 'UTF-8');
      } else {
        resolve(result);
      }
    });
  }

  async comparePersons(knownP, newP) {
    this.modal.setContent(knownP, newP);
    return this.modal.open();
  }
};
