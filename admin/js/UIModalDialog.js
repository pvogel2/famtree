const ELEMENT_ID = 'famtree-modal-dialog';
 
export default class UIModalDialog {
  static CONTAINER_SELECTOR = '.famtree-modal-dialog__content';
  static RETURN_CODE_CLOSE = 'close';

  constructor(elementId = ELEMENT_ID) {
    if (!window.jQuery) {
      throw new Error('mandatory jQuery framework not found');
    }

    this.element = jQuery(document.getElementById(elementId));
    if (!this.element) {
      throw new Error('mandatory modal dialog element not found');
    }
  }

  open() {
    const p = new Promise((resolve, reject) => {
      this.element.on('dialogclose', () => {
        resolve(UIModalDialog.RETURN_CODE_CLOSE);
      });
    });
    this.element.dialog('open');
    return p;
  }

  setContent(text) {
    const elem = this.element.find(UIModalDialog.CONTAINER_SELECTOR);
    elem.text(text);
  }
}
