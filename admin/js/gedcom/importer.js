import Parser from './parser.js';
import Mapper from './mapper.js';

const ELEMENT_ID = 'famtree_gedcom_import';

export default class GedcomImporter {
  constructor() {
    this.parser = new Parser();

    this.element = document.getElementById(ELEMENT_ID);
    if (this.element) {
      this.element.addEventListener('change', this.onChange.bind(this));
    }
  }

  onChange() {
    const fs = this.element.files;

    if (fs.length > 0) {
      const f = fs[0];
      const fr = new FileReader();

      fr.addEventListener('load', () => {
        const gc = this.parser.parse(fr.result);
        console.log(gc);
        const mpr = new Mapper(gc);
        const persons = mpr.persons();
        const relations = mpr.relations();
        console.log(persons, relations);
      });

      fr.addEventListener('error', () => {
        console.log('error', fr.error);
      });

      fr.readAsText(f, 'UTF-8');
    }
  }
};
