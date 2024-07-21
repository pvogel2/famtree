import Person from '../../../public/js/Person';
import Relation from '../../../admin/js/Relation';
import { TAGS } from './parser';

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

    console.log(this.idMap);
    this.json.relations.forEach((rela) => {
      const config = {
        members: [],
        children: [],
      };

      if (rela[TAGS.WIFE]) {
        config.members.push(this.idMap[rela[TAGS.WIFE]]);
      }
      if (rela[TAGS.HUSB]) {
        config.members.push(this.idMap[rela[TAGS.HUSB]]);
      }

      const r = new Relation(config);
      rs.push(r);
    });

    return rs;
  }
}
