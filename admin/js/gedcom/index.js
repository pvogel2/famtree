const TAGS = {
  HEAD: 'head',
  GEDC: 'gedc',
  VERS: 'version',
};

const re = new RegExp(/(?<level>^\d+)\s(?<tag>[a-zA-Z@]+)\s?(?<value>.*)/);
export default class GedcomParser {
  constructor(raw = '') {
    this.raw = raw;
  }

  parse() {
    const tags = this.raw.split('\n');
    const result = {};
    let current;

    tags.forEach((line) => {
      const match = line.match(re);

      if (match) {
        const level = Number(match.groups.level);
        const tag = TAGS[match.groups.tag] || null;
        const { value } = match.groups;

        if (level === 0 && tag) {
          current = {};
          if (value) {
            result[tag] = value;
          } else {
            result[tag] = {};
            current = result[tag];
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

      // console.log('root', root);
    });
  
    return result;
  }
}
