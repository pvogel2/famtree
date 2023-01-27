import PersonEditor from './personEditor.js';
import { Person } from './person.js';
import { addButton, addElement, addFieldset, addInput, addSelect } from '../../tests/utils.js';

function mountForms() {
  const f = document.createElement('form');
  f.id = 'editPersonForm';

  const fm = document.createElement('form');
  fm.id = 'uploadMetadataForm';

  const firstName = addInput(f, { name: 'firstName' });
  const lastName = addInput(f, { name: 'lastName' });
  const partners = addSelect(f, { name: 'partners', disabled: 'disabled' });
  const children = addSelect(f, { name: 'children', disabled: 'disabled' });
  const candidates = addSelect(f, { name: 'candidates', disabled: 'disabled' });
  const partnersBtn = addButton(f, { name: 'partners_remove', disabled: 'disabled' });
  const childrenBtn = addButton(f, { name: 'children_remove', disabled: 'disabled' });

  addInput(f, { name: 'portraitImageId' });
  addElement(f, 'img', { id: 'person-portrait' });
  addInput(f, { name: 'relType' });
  addInput(f, { name: 'relStart' });
  addInput(f, { name: 'relEnd' });

  addFieldset(f, { name: 'fs_buttons', disabled: 'disabled' });
  addFieldset(f, { name: 'fs_portrait', disabled: 'disabled' });
  const relationsFs = addFieldset(f, { name: 'fs_relations', disabled: 'disabled' });

  addFieldset(fm, { name: 'fs_add' });
  const addChildBtn = addButton(relationsFs, { name: 'btn_addChild', disabled: 'disabled' });

  const form = document.body.appendChild(f);
  document.body.appendChild(fm);

  return { form, firstName, lastName, partners, children, candidates, partnersBtn, childrenBtn, addChildBtn };
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

  describe('when reseted', () => {
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
      const { form, firstName, lastName, partners, partnersBtn, children, childrenBtn, candidates, addChildBtn } = mountForms();

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
      expect(addChildBtn.disabled).toBe(true);
    });

    it('activates the entire form for firstname and lastname set', () => {
      const { form, firstName, lastName, partners, children, candidates } = mountForms();

      new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);

      setName(firstName, lastName);

      expect(firstName.value).toBe('First');
      expect(lastName.value).toBe('Last');

      expect(partners.disabled).toBe(true);
      expect(children.disabled).toBe(true);
      expect(candidates.disabled).toBe(false);

      expect(form.elements['fs_portrait'].disabled).toBe(false);
      expect(form.elements['fs_relations'].disabled).toBe(false);
    });

    describe('for relation', () => {
      it('when partner is added activates relation fields', () => {
        const { firstName, lastName, partners, partnersBtn, children, childrenBtn, addChildBtn } = mountForms();

        const pe = new PersonEditor();
 
        spyPersonFilter.mockReturnValueOnce([person]);

        setName(firstName, lastName);

        spyPersonFind.mockReturnValueOnce(partner);

        pe.edit.addRelation(relation);

        expect(partners.disabled).toBe(false);
        expect(partnersBtn.disabled).toBe(false);
        expect(children.disabled).toBe(true);
        expect(childrenBtn.disabled).toBe(true);
        expect(addChildBtn.disabled).toBe(false);
      });

      it('when last partner is removed deactivates add child button', () => {
        const { firstName, lastName, partners, partnersBtn, children, childrenBtn, addChildBtn } = mountForms();

        const pe = new PersonEditor();
 
        spyPersonFilter.mockReturnValueOnce([person]);

        setName(firstName, lastName);

        spyPersonFind.mockReturnValueOnce(partner);

        const addedId = pe.edit.addRelation(relation);

        const rId = pe.edit.removeRelation();

        expect(rId).toBe(addedId);
        expect(partners.disabled).toBe(true);
        expect(partnersBtn.disabled).toBe(true);
        expect(children.disabled).toBe(true);
        expect(childrenBtn.disabled).toBe(true);
        expect(addChildBtn.disabled).toBe(true);
      });
    });

    describe('findInvolvedRelation', () => {
      const params = [
        { id: relation.members[0], found: true },
        { id: relation.members[1], found: true },
        { id: 5000, found: false },
      ];
      it.each(params)('returns the relation if id $id of one members matches', ({ id, found }) => {
        mountForms();
        const pe = new PersonEditor();

        spyPersonFind.mockReturnValueOnce({ ...person, id });

        pe.edit.addRelation(relation);
        const result = !!pe.edit.findInvolvedRelation(id);

        expect(result).toBe(found);
      });

      it('returns no deleted relation even if id of one members matches', () => {
        mountForms();
        const pe = new PersonEditor();
        const pId = relation.members[0];

        spyPersonFind.mockReturnValueOnce({ ...person, id: pId });

        pe.edit.addRelation({ ...relation });
        pe.edit.removeRelation();

        const result = !!pe.edit.findInvolvedRelation(pId);

        expect(result).toBe(false);
      });
    });

    describe('children', () => {
    it('fields activated when child is added to partner', () => {
      const { firstName, lastName, children, childrenBtn } = mountForms();

      const pe = new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);

      setName(firstName, lastName);

      spyPersonFind.mockReturnValueOnce(partner);

      pe.edit.addRelation(relation);

      spyPersonFind.mockReturnValueOnce(child);

      pe.edit.addChild(child.id);

      expect(children.disabled).toBe(false);
      expect(childrenBtn.disabled).toBe(false);
    });

    it('do not add a child when already existing', () => {
      const { firstName, lastName, children } = mountForms();

      const pe = new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);

      setName(firstName, lastName);

      spyPersonFind.mockReturnValueOnce(partner);

      pe.edit.addRelation(relation);
      const rl = pe.edit.relations[0];

      spyPersonFind.mockReturnValueOnce(child);
      spyPersonFind.mockReturnValueOnce(child);

      pe.edit.addChild(child.id);
      pe.edit.addChild(child.id);

      expect(rl.children).toHaveLength(1);
      expect(children.options).toHaveLength(1);
    });

    it('are deactivated when last child removed', () => {
      const { firstName, lastName, children, childrenBtn, addChildBtn } = mountForms();

      const pe = new PersonEditor();
 
      spyPersonFilter.mockReturnValueOnce([person]);
      setName(firstName, lastName);

      spyPersonFind.mockReturnValueOnce(partner);
      pe.edit.addRelation(relation);

      spyPersonFind.mockReturnValueOnce(child);
      pe.edit.addChild(child.id);

      pe.edit.removeChild(child.id);

      expect(children.disabled).toBe(true);
      expect(childrenBtn.disabled).toBe(true);
      expect(addChildBtn.disabled).toBe(false);
    });
    });
  });
});