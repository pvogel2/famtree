import Relation from '../Relation.js';

export default class PersonRelations {
  #relations = [];

  set(rs) {
    this.#relations = rs.map((r) => this.#parse(r));
  }

  add(r) {
    if (this.#find(r.id)) {
      return false;
    }
    this.#relations.push(this.#parse(r));
    return true;
  }

  reset() {
    this.#relations = [];
  }

  getFirst() {
    if (this.#relations.length) {
      return this.#relations[0].clone();
    }
    return null;
  }

  getModified() {
    return this.#relations
      .filter((rl) => rl.modified)
      .map((rl) => rl.clone());
  }

  setDeleted(id) {
    const rl = this.#find(id);
    if (rl) {
      rl.deleted = true;
    }
  }

  hasRelation(pId) {
    return !!this.#relations.find((rl) => (rl.hasMember(pId) && !rl.deleted));
  }

  addChild(id, cId) {
    const rl = this.#find(id);
    if (rl) {
      rl.addChild(cId);
    }
  }

  removeChild(id, cId) {
    const rl = this.#find(id);
    if (rl) {
      rl.removeChild(cId);
    }
  }

  /**
   * Returns an array of members of person with memberId including relation id 
   * @param {number|string|undefined} memberId 
   * @returns [{ mId: number, rId: number }]
   */
  getMembers(memberId) {
    const ms = this.#relations.map((r) => {
      const _ms = r.members.filter((m) => m !== memberId);
      const rId = r.id;
      return {mId: _ms[0], rId }; // currenlty only one other member supported
    });
    return ms;
  }

  sanitize() {
    this.#relations = this.#relations.filter((rl) => !rl.deleted);
    this.#relations.forEach((rl) => {
      rl.modified = false;
    });
  }

  #find(id) {
    return this.#relations.find((rl) => rl.id === parseInt(id));
  }

  #parse(r) {
    const rl = new Relation(r);
    rl.modified = !!r.modified; // modified is false for new Relations
    rl.deleted = !!r.deleted; // deleted is false for new Relations
    return rl;
   }
}
