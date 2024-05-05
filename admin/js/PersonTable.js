export default class PersonTable {
  constructor() {
    const container = document.getElementById('persons_table_container');
    this.table = container.querySelector('table');
  }

  removePerson(personId) {
    const tr = this.#getTr(personId);
    if (tr) {
      tr.parentElement.removeChild(tr);
    };

  }

  isFounder(personId) {
    const input = this.#getTr(personId)?.querySelector('.root input');
    return (input ? input.checked : false);
  }

  getNonce() {
    const name = 'update-root-nonce';
    const value = document.getElementById(name).value;
    return {
      name,
      value,
    };
  }

  #getTr(personId) {
    return this.table.querySelector(`tr[data-id="${personId}"]`);
  }
}
