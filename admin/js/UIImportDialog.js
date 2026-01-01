import UIModalDialog from './UIModalDialog.js';
import GedcomImporter from './gedcom/importer.js';


const ELEMENT_ID = 'famtree-import-dialog';
const AUTOUPDATE_ID = 'famtree-import-dialog__autoaction';

export default class UIImportDialog extends UIModalDialog {
  constructor() {
    super(ELEMENT_ID);
    this.autoAction = false;
    this.contentElement = this.element.find(UIModalDialog.CONTAINER_SELECTOR);

    const autoUpCheckbox = this.contentElement.find(`#${AUTOUPDATE_ID}`);
    autoUpCheckbox.on('change', (ev) => {
      this.autoAction = ev.target.checked;
      console.log('>>', this.autoAction);
    });
  }

  setContent(knownP, newP) {
    const knownPForm = this.contentElement.find('.famtree-known-person form');
    const newPForm = this.contentElement.find('.famtree-new-person form');
    this.#setFields(knownPForm, knownP);
    this.#setFields(newPForm, newP);
  }

  open() {
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
      'Cancel': () => {
        resolve({action: GedcomImporter.MODE_Cancel, auto: false});
        this.element.dialog('close');
      },
      'Skip': () => {
        resolve({action: GedcomImporter.MODE_SKIP, auto: this.autoAction});
        this.element.dialog('close');
      },
      'Add' : () => {
        resolve({action: GedcomImporter.MODE_ADD, auto: this.autoAction});
        this.element.dialog('close');
      },
      'Replace': () => {
        resolve({action: GedcomImporter.MODE_REPLACE, auto: this.autoAction});
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
