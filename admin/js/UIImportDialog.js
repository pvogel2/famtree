import UIModalDialog from './UIModalDialog.js';


const ELEMENT_ID = 'famtree-import-dialog';

export default class UIImportDialog extends UIModalDialog {
  static RETURN_CODE_SKIP = 'skip';
  static RETURN_CODE_ADD = 'add';
  static RETURN_CODE_REPLACE = 'replace';

  constructor() {
    super(ELEMENT_ID);
  }

  setContent(knownP, newP) {
    const elem = this.element.find(UIModalDialog.CONTAINER_SELECTOR);
    const knownPForm = elem.find('.famtree-known-person form');
    const newPForm = elem.find('.famtree-new-person form');
    this.#setFields(knownPForm, knownP);
    this.#setFields(newPForm, newP);
  }

  open() {
    console.log('do open');
    const p = new Promise((resolve, reject) => {
      this.element.dialog('option', 'buttons', this.#setButtons(resolve));
      super.open().then((code) => {
        console.log('resolve with code', code);
        resolve(code);
      });

    });
    return p;
  }

  #setButtons(resolve) {
    return {
      'Skip': () => {
        resolve(UIImportDialog.RETURN_CODE_SKIP);
        this.element.dialog('close');
      },
      'Add' : () => {
        resolve(UIImportDialog.RETURN_CODE_ADD);
        this.element.dialog('close');
      },
      'Replace': () => {
        resolve(UIImportDialog.RETURN_CODE_REPLACE);
        this.element.dialog('close');
      },
      // currently not supported
      /* 'Merge': () => {
        resolve('merge');
        this.element.dialog('close');
      }, */
    };
  }

  #setFields(form, person) {
    form.find('[name="firstName"]').val(person.firstName);
    form.find('[name="surNames"]').val(person.surNames);
    form.find('[name="lastName"]').val(person.lastName);
    form.find('[name="birthName"]').val(person.birthName);
    form.find('[name="birthday"]').val(person.birthday);
  }
}
