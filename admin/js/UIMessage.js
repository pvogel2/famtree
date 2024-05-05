const ELEMENT_ID = 'famtree-message';
const CLASS_TEXT = 'famtree-message__text';
const CLASS_HIDE = 'famtree-hidden';
const CLASS_SUCCESS = 'notice-success';
const CLASS_ERROR = 'notice-error';

export default class UIMessage {
  constructor() {
    this.element = document.getElementById(ELEMENT_ID);
    if (!this.element) {
      throw new Error('mandatory message element not found');
    }
  }

  success(message) {
    this.#show(message, CLASS_SUCCESS);
  }

  error(message) {
    this.#show(message, CLASS_ERROR);
  }

  hide() {
    this.element.classList.add(CLASS_HIDE);
    const p = this.element.querySelector(`.${CLASS_TEXT}`);
    p.textContent = '';
  }

  #show(message, css_class) {
    const m = 
    this.element.classList.remove(CLASS_HIDE, CLASS_SUCCESS, CLASS_ERROR);
    this.element.classList.add(css_class);
    const p = this.element.querySelector(`.${CLASS_TEXT}`);
    p.textContent = message;
    window.scrollTo(0,0);
  }
}
