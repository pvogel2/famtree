import Person from '../../lib/js/Person.js';


const all = {};

export default {
  add(data) {
    data.id = parseInt(data.id);
    data.root = data.root === '1';
    all[data.id] = data;
  },
  
  find(id) {
    const p = all[id];
    return (p ? new Person(p) : null);
  },
  
  filter(filter) {
    if (!filter) return [];
    return Object.values(all).filter(filter).map((p) => new Person(p));
  },
  
  remove(id) {
    delete all[id];
  },
};
