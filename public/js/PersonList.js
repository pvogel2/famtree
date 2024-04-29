import Person from './Person.js';


const all = {};

export default {
  add(data) {
    data.id = parseInt(data.id);
    data.root = data.root === '1';
    all[data.id] = data;
  },
  
  /**
   * Find a person by id in all available data
   * @param {string} id
   * @returns Person | null
   */
  find(id) {
    const p = all[id];
    return (p ? new Person(p) : null);
  },
  
  /**
   * Filter persons on provided filter
   * @param {function} filter
   * @returns [Person]
   */
  filter(filter) {
    if (!filter) return [];
    return Object.values(all).filter(filter).map((p) => new Person(p));
  },
  
  remove(id) {
    delete all[id];
  },
};
