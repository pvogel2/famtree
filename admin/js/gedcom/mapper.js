import Person from '../../../public/js/Person.js';
import Relation from '../../../admin/js/Relation.js';
import { TAGS } from './parser.js';

export default class GedcomMapper {
  constructor(json = { children: [] }) {
    this.json = json;
    this.idMap = {};
    this.result = {
      head: null,
      finish: null,
      individuals: [],
      relations: [],
    };

    this.#mapParts();

    this.persons = this.#persons();
    this.relations = this.#relations();
  }

  getResult() {
    return this.result;
  }

  #mapParts() {
    this.json.children.forEach((c) => {
      switch (c.tag) {
        case 'HEAD': this.HEAD(this.result, c); break;
        case 'INDI': this.INDI(this.result, c); break;
        case 'FAM': this.FAM(this.result, c); break;
        case 'TRLR': this.result.finish = c; break;
      }
    });
    // console.log(this.result);
  }

  #mapChildren(p, n) {
    n.children.forEach((c) => {
      if (this[c.tag]) {
        this[c.tag](p, c);
      }
    });
  }

  INDI(parent, node) {
    if (!parent.individuals) {
      parent.individuals = [];
    }

    const indi = { id: node.id };
    this.#mapChildren(indi, node);

    parent.individuals.push(indi);
  }

  SURN(parent, node) {
    parent.surn = node.value;
  }

  /**
   * @param {*} node 
   * required for LINEAGE-LINKED
   * requires SOUR, DEST, SUBM, GEDC, CHAR
   */
  HEAD(parent, node) {
    parent.head = {};
    this.#mapChildren(parent.head, node);
  }

  GEDC(parent, node) {
    parent.gedc = {};
    this.#mapChildren(parent.gedc, node);
  }

  VERS(parent, node) {
    parent.version = node.value;
  }

  FORM(parent, node) {
    parent.format = node.value;
  }

  NAME(parent, node) {
    parent.name = node.value;

    this.#mapChildren(parent, node);
  }

  BIRT(parent, node) {
    const birth = {};

    this.#mapChildren(birth, node);

    parent.birthday = birth.date;
  }

  DEAT(parent, node) {
    const death = {};

    this.#mapChildren(death, node);

    parent.deathday = death.date;
  }

  DATE(parent, node) {
    parent.date = node.value;
  }

  FAM(parent, node) {
    if (!parent.relations) {
      parent.relations = [];
    }

    const rela = { id: node.id };
    this.#mapChildren(rela, node);

    parent.relations.push(rela);
  }

  HUSB(parent, node) {
    parent.husb = node.value;
  }

  WIFE(parent, node) {
    parent.wife = node.value;
  }

  CHIL(parent, node) {
    if (!parent.children) {
      parent.children = [];
    }

    parent.children.push(node.value);
  }

  #parseDate(date = '') {
    if (date.match(/^[0-9]+\s[A-Za-z]+\s[0-9]+/)) {
      const d = new Date(date);// yyyy-mm-dd
      return d.toISOString().substring(0,10);
    }
    return null;
  }

  #persons() {
    const ps = [];
    let id = -1;

    this.result.individuals.forEach((indi) => {
      const config = {
        id: id--,
        lastName: indi.surn || '',
        firstName: indi.name.replace(/\/.*\//g, '').replace(/".*"/g, '').trim() || '',
        birthday: this.#parseDate(indi.birthday),
        deathday: this.#parseDate(indi.deathday),
      };

      this.idMap[indi.id] = config.id;

      const p = new Person(config);
      ps.push(p);
    });

    return ps;
  }

  #relations() {
    const rs = [];

    this.result.relations.forEach((rela) => {
      const config = {
        members: [],
        children: [],
      };

      // console.log('rela', rela);
      if (rela[TAGS.WIFE]) {
        config.members.push(this.idMap[rela[TAGS.WIFE]]);
      }

      if (rela[TAGS.HUSB]) {
        config.members.push(this.idMap[rela[TAGS.HUSB]]);
      }

      if (rela.children?.length) {
        rela.children.forEach((cId) => {
          config.children.push(this.idMap[cId]);
        });
      }

      const r = new Relation(config);
      rs.push(r);
    });

    return rs;
  }

  getPersons() {
    return this.persons;
  }

  getRelations() {
    return this.relations;
  }
}
