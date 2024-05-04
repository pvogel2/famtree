function getMediaType(mimetype) {
  if (!(typeof mimetype === 'string')) {
    return 'unknown';
  }

  if (mimetype.startsWith('image')) {
    return 'image';
  }

  if (mimetype.startsWith('video')) {
    return 'video';
  }

  if (mimetype.endsWith('pdf') || mimetype.endsWith('msword')) {
    return 'document';
  }

  if (mimetype.startsWith('text')) {
    return 'text';
  }

  return 'unknown';
};

export default class MetadataTable {
  constructor(selector) {
    const elements = document.querySelectorAll(selector);
    // console.log('length', elements.length);
    this.element = elements[0];
  }

  removeRow(id) {
    this.removeRowOnly(id);
    if (!this.element.getElementsByTagName('tr').length) {  
      this.addPlaceholder();
    }
  }

  removeRowOnly(id) {
    const table = this.element;
    const tr = table.querySelector(`[data-id="${id}"]`);

    if (tr) {
      table.removeChild(tr);
    };
  }

  clearAll() {
    this.element.innerHTML = '';
    this.addPlaceholder();
  }

  addPlaceholder() {
    const tr = document.createElement('tr');
    tr.dataset.id = 'nocontent';
    const nocontentTd = document.createElement('td');
    nocontentTd.classList.add('column-nocontent');
    nocontentTd.setAttribute('colspan', '5');
    nocontentTd.innerText = 'no files available';
    tr.appendChild(nocontentTd);
    this.element.appendChild(tr);
  }

  removePlaceholder() {
    this.removeRowOnly('nocontent');
  }

  addRow(item) {
    const tr = document.createElement('tr');
    tr.dataset.id = item.id;
    const thumbTd = document.createElement('td');
    const nameTd = document.createElement('td');
    const excerptTd = document.createElement('td');
    const editTd = document.createElement('td');
    const removeTd = document.createElement('td');
    editTd.classList.add('column-edit');
    removeTd.classList.add('column-remove');

    if (!item.thumbnail) {
      const type = getMediaType(item.mimetype);
      thumbTd.innerHTML = `<span title='${item.title}' class="famtree-dashicons-thumb dashicons dashicons-media-${type}"></span>`;
    } else {
      thumbTd.innerHTML = `<img title='${item.title}' src='${item.thumbnail}' />`;
    }
    nameTd.innerText = item.title;
    
    excerptTd.innerHTML = `<span>${item.excerpt}</span>`;
    editTd.innerHTML = `<button type="button" title="edit" class="button icon" onclick="window.famtree.editMedia(${item.mediaId})"><span class="dashicons dashicons-edit"></span></button>`;
    removeTd.innerHTML = `<button type="button" title="remove" class="button icon" onclick="window.famtree.removeMeta(${item.id})"><span class="dashicons dashicons-trash"></span></button>`;
    tr.appendChild(thumbTd);
    tr.appendChild(nameTd);
    tr.appendChild(excerptTd);
    tr.appendChild(editTd);
    tr.appendChild(removeTd);

    this.removePlaceholder();

    this.element.appendChild(tr);
  }
}
