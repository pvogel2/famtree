
import MetadataEditor from './MetadataEditor.js';
import { getMetadataFormElements } from '../../../tests/utils.js';

function render() {
  const fElems = getMetadataFormElements();
  document.body.appendChild(fElems.metadataForm);
  document.body.appendChild(fElems.metaTable);

  const md = new MetadataEditor();

  return { md, ...fElems };
}

describe('metadata', () => {
  const item = { id: 1, title: 'The title' };

  function isEmptyMetaTable(t) {
    expect(t.children).toHaveLength(1);
    expect(t.children[0].querySelector('td').classList.contains('column-nocontent')).toBe(true);
  }

  describe('calling set without items', () => {
    it('adds a placeholder to table', () => {
      const { md, metaTable } = render();

      md.set([]);

      isEmptyMetaTable(metaTable);
    });
  });

  describe('addItem', () => {
    it('adds a new row to the media table', () => {
      const { md, metaTable } = render();

      md.addItem({ ...item, id: 25 });

      expect(metaTable.children).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('cleans media table with placeholder', () => {
      const { md, metaTable } = render();
      md.addItem({ ...item });

      md.remove(item.id);

      isEmptyMetaTable(metaTable);
    });
  });

  describe('reset', () => {
    it('cleans media table with placeholder', () => {
      const { md, metaTable } = render();
      const item = {};
      md.addItem(item);

      md.reset();

      isEmptyMetaTable(metaTable);
    });
  });
});
