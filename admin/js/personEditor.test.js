import { PersonEditor } from './personEditor.js';
import { Person } from './person.js';
import { addButton, addElement, addFieldset, addInput, addSelect } from '../../tests/utils.js';

function mountForms() {
const f = document.createElement('form');
f.id = 'editPersonForm';

const fm = document.createElement('form');
fm.id = 'uploadMetadataForm';

const firstName = addInput(f, { name: 'firstName' });
const lastName = addInput(f, { name: 'lastName' });
const partners = addSelect(f, { name: 'partners' });
const children = addSelect(f, { name: 'children' });
const candidates = addSelect(f, { name: 'candidates' });
const partnersBtn = addButton(f, { name: 'partners_remove' });
const childrenBtn = addButton(f, { name: 'children_remove' });

addInput(f, { name: 'portraitImageId' });
addElement(f, 'img', { id: 'person-portrait' });
addInput(f, { name: 'relType' });
addInput(f, { name: 'relStart' });
addInput(f, { name: 'relEnd' });

addFieldset(f, { name: 'fs_buttons' });
addFieldset(f, { name: 'fs_portrait' });
addFieldset(f, { name: 'fs_relations' });

addFieldset(fm, { name: 'fs_add' });

const form = document.body.appendChild(f);
document.body.appendChild(fm);
return { form, firstName, lastName, partners, children, candidates, partnersBtn, childrenBtn };
}

function unmountForm() {
  ['editPersonForm', 'uploadMetadataForm'].forEach((fId) => {
    const f = document.getElementById(fId);
    if (f) {
      f.remove();
    }
  });
}

const spyPersonFilter = jest.spyOn(Person, 'filter');
const spyPersonFind = jest.spyOn(Person, 'find');

describe('The person editor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    unmountForm();
  });

  it('is defined', () => {
    expect(PersonEditor).toBeDefined();
  });

  it('initialized correctly', () => {
    mountForms();

    expect(() => {process.nextTick
      new PersonEditor();
    }).not.toThrow();
  });

  describe('resting the editor', () => {
    function setName(fn, ln) {
      fn.value = 'First';
      ln.value = 'Last';
      fn.dispatchEvent(new Event('input'));
      ln.dispatchEvent(new Event('input'));
    }

    const person = {name: 'person', id: 1 };
    const partner = { name: 'partner', id: 2 };
    const child = { name: 'child', id: 3 };
  
    const relation = {
      start: null,
      end: null,
      children: [],
      members: [person.id, partner.id],
    };

    it('resets the entire form', () => {
      const { form, firstName, lastName, partners, partnersBtn, children, childrenBtn, candidates } = mountForms();

      const pe = new PersonEditor();
      const resetSpy = jest.spyOn(form, 'reset');

      setName(firstName, lastName);

      pe.edit.reset();

      expect(resetSpy).toHaveBeenCalled();
      expect(firstName.value).toBe('');
      expect(lastName.value).toBe('');
      expect(partners.disabled).toBe(true);
      expect(partnersBtn.disabled).toBe(true);
      expect(children.disabled).toBe(true);
      expect(childrenBtn.disabled).toBe(true);
      expect(candidates.disabled).toBe(true);
      expect(form.elements['fs_portrait'].disabled).toBe(true);
      expect(form.elements['fs_relations'].disabled).toBe(true);
    });

    it('activates the entire form for firstname and lastname set', () => {
      const { form, firstName, lastName, partners, children, candidates } = mountForms();

      const pe = new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);
      pe.edit.reset();

      setName(firstName, lastName);

      expect(firstName.value).toBe('First');
      expect(lastName.value).toBe('Last');

      expect(partners.disabled).toBe(true);
      expect(children.disabled).toBe(true);
      expect(candidates.disabled).toBe(false);

      expect(form.elements['fs_portrait'].disabled).toBe(false);
      expect(form.elements['fs_relations'].disabled).toBe(false);
    });

    it('activates relation fields when partner is selected', () => {
      const { firstName, lastName, partners, partnersBtn, children } = mountForms();

      const pe = new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);
      pe.edit.reset();

      setName(firstName, lastName);

      spyPersonFind.mockReturnValueOnce(partner);

      pe.edit.addRelation(relation);

      expect(partners.disabled).toBe(false);
      expect(partnersBtn.disabled).toBe(false);
      expect(children.disabled).toBe(true);
    });

    it('activates children fields when child is added to partner', () => {
      const { firstName, lastName, children, childrenBtn } = mountForms();

      const pe = new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);
      pe.edit.reset();

      setName(firstName, lastName);

      spyPersonFind.mockReturnValueOnce(partner);

      pe.edit.addRelation(relation);

      spyPersonFind.mockReturnValueOnce(child);

      pe.edit.addChild(child.id);

      expect(children.disabled).toBe(false);
      expect(childrenBtn.disabled).toBe(false);
    });
  });
});