import Person from '../../../public/js/Person.js';
import Relation from '../../../admin/js/Relation.js';
import { TAGS } from './parser.js';

export default class GedcomMapper {
  constructor(json = { individuals: [] }) {
    this.json = json;
    this.idMap = {};
  }

  persons() {
    const ps = [];
    let id = -1;

    this.json.individuals.forEach((indi) => {
      const config = {
        id: id--,
        lastName: indi.surn || '',
        firstName: indi.name.replace(/\/.+\//g, '').trim() || '',
      };

      this.idMap[indi.id] = config.id;

      const p = new Person(config);
      ps.push(p);
    });

    return ps;
  }

  relations() {
    const rs = [];

    this.json.relations.forEach((rela) => {
      const config = {
        members: [],
        children: [],
      };

      console.log('rela', rela);
      if (rela[TAGS.WIFE]) {
        config.members.push(this.idMap[rela[TAGS.WIFE]]);
      }

      if (rela[TAGS.HUSB]) {
        config.members.push(this.idMap[rela[TAGS.HUSB]]);
      }

      if (rela[TAGS.CHIL]) {
        config.children.push(this.idMap[rela[TAGS.CHIL]]);
      }

      const r = new Relation(config);
      rs.push(r);
    });

    return rs;
  }
}
