export function addElement(parent, tag, attrs) {
    const elem = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      elem.setAttribute(k, v);
    });
  
    parent.appendChild(elem);
    return elem;
  }
  
  export function addFieldset(parent, attrs) {
    return addElement(parent, 'fieldset', attrs);
  };
  
  export function addInput(parent, attrs) {
    return addElement(parent, 'input', attrs);
  };
  
  export function addSelect(parent, attrs) {
    return addElement(parent, 'select', attrs);
  };
  
  export function addButton(parent, attrs) {
    return addElement(parent, 'button', attrs);
  };
  