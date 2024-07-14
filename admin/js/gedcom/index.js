const TAGS = {
  HEAD: 'head',
  INDI: 'indi',
  GEDC: 'gedc',
  VERS: 'version',
  NAME: 'name',
  GIVN: 'givn',
  SURN: 'surn',
};

const re = new RegExp(/^(?<level>^\d+)(\s(?<id>\@[a-zA-Z0-9]+\@))?\s(?<tag>[a-zA-Z]+)(\s(?<value>.*))?/);
export default class GedcomParser {
  constructor(raw = '') {
    this.raw = raw;
  }

  parse() {
    const tags = this.raw.split('\n');
    const result = {
      individuals: [],
    };
    let current;

    tags.forEach((line) => {
      const match = line.match(re);

      if (match) {
        const level = Number(match.groups.level);
        const tag = TAGS[match.groups.tag] || null;
        const { id, value } = match.groups;

        if (level === 0) {
          current = {};
          if (tag === TAGS.HEAD) {
            result.head = {};
            current = result.head;
          } else if (tag === TAGS.INDI) {
            current.id = id;
            result.individuals.push(current);
          }
        }

        if (level === 1 && tag) {
          if (value) {
            current[tag] = value;
          } else {
            current[tag] = {};
            current = current[tag];
          }
        }

        if (level === 2 && tag) {
          if (value) {
            current[tag] = value;
          } else {
            current[tag] = {};
            current = current[tag];
          }
        }
      };
    });
  
    return result;
  }
}
