import PersonEditor from './PersonEditor.js';
import Person from './Person.js';
import Relation from './Relation.js';
import { getEditFormElements, getMetadataFormElements } from '../../tests/utils.js';

function render() {
  const eElems = getEditFormElements();
  const fElems = getMetadataFormElements();
  document.body.appendChild(eElems.form);
  document.body.appendChild(fElems.form);

  const pe = new PersonEditor();

  return { pe, eElems };
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

const spyRelationFilter = jest.spyOn(Relation, 'filter');

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
    render();

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

    const person = {name: 'person', id: 1, firstName: 'First', lastName: 'Last' };
    const partner = { name: 'partner', id: 2 };
    const child = { name: 'child', id: 3 };
  
    const relation = {
      start: null,
      end: null,
      children: [],
      members: [person.id, partner.id],
    };

    it('resets the entire form', () => {
      const { pe, eElems } = render();
      const { form, firstName, lastName, partners, partnersBtn, children, childrenBtn, candidates, addChildBtn } = eElems;

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
      const { form, firstName, lastName, partners, children, candidates } = render().eElems;
 
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

    describe('setting a person for editing', () => {
      it('enables correct person fields', () => {
        const { pe, eElems } = render();
        const { personId, firstName, lastName } = eElems;

        pe.edit.setPerson(person);

        expect(parseInt(personId.value)).toBe(person.id);
        expect(firstName.value).toBe(person.firstName);
        expect(lastName.value).toBe(person.lastName);
      });

      it('enables correct relation fields', () => {
        const { pe, eElems } = render();

        spyRelationFilter.mockReturnValueOnce([relation]);
        spyPersonFind.mockReturnValueOnce([person]);

        pe.edit.setPerson(person);

        expect(eElems.addChildBtn.disabled).toBe(false);
      });
    });

    describe('for relation', () => {
      it('when partner is added activates relation fields', () => {
        const { pe, eElems } = render();
        const { firstName, lastName, partners, partnersBtn, children, childrenBtn, addChildBtn } = eElems;

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
        const { pe, eElems } = render();
        const { firstName, lastName, partners, partnersBtn, children, childrenBtn, addChildBtn } = eElems;

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
        const { pe } = render();

        spyPersonFind.mockReturnValueOnce({ ...person, id });
        pe.edit.addRelation(relation);

        const result = !!pe.edit.findInvolvedRelation(id);
        expect(result).toBe(found);
      });

      it('returns no deleted relation even if id of one members matches', () => {
        const { pe } = render();
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
      const { pe, eElems } = render();
      const { firstName, lastName, children, childrenBtn } = eElems;

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
      const { pe, eElems } = render();
      const { firstName, lastName, children } = eElems;

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
      const { pe, eElems } = render();
      const { firstName, lastName, children, childrenBtn, addChildBtn } = eElems;

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