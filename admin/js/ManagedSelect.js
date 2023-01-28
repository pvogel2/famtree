export default class ManagedSelect {
    constructor(select, button, related = []) {
      this.s = select;
      this.b = button;
      this.related = [...related];
    }

    value() {
      return parseInt(this.s.value);
    }
  
    removeSelected() {
      const rId = this.s.value;
      if (rId) {
        this.removeOption(rId);
        this.disableIfEmpty();
        return parseInt(rId);
      }
      return null;
    }
  
    reset() {
      while (this.s.options.length > 0) {
        this.removeOption(this.s.options[0]);
      }
      this.disableIfEmpty();
    }
  
    isId(v) {
      return !isNaN(v) && typeof(v) === 'number';
    }
  
    setIndex(idx = 0) {
      if (this.s.options.length) {
        this.s.selectedIndex = idx;
      }
    }
  
    setLast() {
      if (this.s.options.length) {
        this.s.selectedIndx = this.s.options.length - 1;
      }
    }
  
    #getOption(value) {
      const os = [...this.s.options];
      return os.find((_o) => parseInt(_o.value) === parseInt(value));
    }

    addOption(text, value) {
      if (!text || !this.isId(value)) {
        return;
      }

      if (!!this.#getOption(value)) {
        return;
      }
  
      const o = document.createElement('option');
  
      o.setAttribute('value', value);
      o.text = `${text} (${value})`;
      this.s.appendChild(o);
      this.s.disabled = false;

      if (this.b) {
        this.b.disabled = false;
      }
  
      this.related.forEach((rl) => rl.disabled = false);
    }
  
    removeOption(valueOrOption) {
      if (typeof valueOrOption === 'string' || typeof valueOrOption === 'number') {
        const op = this.#getOption(valueOrOption);

        if (op) {
          this.s.removeChild(op);
        }
      } else {
        this.s.removeChild(valueOrOption);
      }
      this.disableIfEmpty();
    }

    disableIfEmpty() {
      if (!this.s.options.length) {
        this.s.disabled = true;
        this.related.forEach((rl) => rl.disabled = true);
        if (this.b) {
          this.b.disabled = true;
        }
      }
    }

    isDisabled() {
      return !!this.b.disabled;
    }
}
