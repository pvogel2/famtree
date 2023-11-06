import PersonEditor from './PersonEditor.js';
import PersonList from '../../public/js/PersonList.js';
import Relation from './Relation.js';
import { getEditFormElements, getMetadataFormElements } from '../../tests/utils.js';

function setName(fn, ln) {
  fn.value = 'First';
  ln.value = 'Last';
  fn.dispatchEvent(new Event('input'));
  ln.dispatchEvent(new Event('input'));
}

function render({ person } = {}) {
  const eElems = getEditFormElements();
  const fElems = getMetadataFormElements();
  document.body.appendChild(eElems.personForm);
  document.body.appendChild(fElems.metadataForm);
  document.body.appendChild(fElems.mediaTable);

  const pe = new PersonEditor();

  if (person) {
    pe.edit.setPerson(person);
  }
  return { pe, ...eElems, ...fElems };
}

function resetDOM() {
  document.body.innerHTML = '';
}

const spyRelationFilter = jest.spyOn(Relation, 'filter');

describe('The person editor', () => {
  const person = {name: 'person', id: 1, firstName: 'First', lastName: 'Last', deathday: '2023-11-02', birthday: '2023-11-01' };
  const partner = { name: 'partner', id: 2 };
  const child = { name: 'child', id: 3 };

  const relation = {
    start: null,
    end: null,
    children: [],
    members: [person.id, partner.id],
  };

  beforeAll(() => {
    PersonList.add(person);
    PersonList.add(partner);
    PersonList.add(child);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetDOM();
    
  });

  it('is defined', () => {
    expect(PersonEditor).toBeDefined();
  });

  it('is initialized correctly', () => {
    render();

    expect(() => {process.nextTick
      new PersonEditor();
    }).not.toThrow();
  });

  describe('when reseted', () => {
    it('resets the entire form', () => {
      const { pe, personForm, firstName, lastName, partners, partnersBtn, children, childrenBtn, candidates, addChildBtn } = render({ person });

      const resetSpy = jest.spyOn(personForm, 'reset');

      pe.edit.reset();

      expect(resetSpy).toHaveBeenCalled();
      expect(firstName.value).toBe('');
      expect(lastName.value).toBe('');
      expect(partners.disabled).toBe(true);
      expect(partnersBtn.disabled).toBe(true);
      expect(children.disabled).toBe(true);
      expect(childrenBtn.disabled).toBe(true);
      expect(candidates.disabled).toBe(true);
      expect(personForm.elements['fs_portrait'].disabled).toBe(true);
      expect(personForm.elements['fs_relations'].disabled).toBe(true);
      expect(addChildBtn.disabled).toBe(true);
    });

    it('activates the entire form for firstname and lastname set', () => {
      const { personForm, firstName, lastName, partners, children, candidates } = render();

      setName(firstName, lastName);

      expect(firstName.value).toBe('First');
      expect(lastName.value).toBe('Last');

      expect(partners.disabled).toBe(true);
      expect(children.disabled).toBe(true);
      expect(candidates.disabled).toBe(false);

      expect(personForm.elements['fs_portrait'].disabled).toBe(false);
      expect(personForm.elements['fs_relations'].disabled).toBe(false);
    });
  });

  describe('setting a person for editing', () => {
    it('enables correct person fields', () => {
      const { pe, personId, firstName, lastName } = render();

      pe.edit.setPerson(person);

      expect(parseInt(personId.value)).toBe(person.id);
      expect(firstName.value).toBe(person.firstName);
      expect(lastName.value).toBe(person.lastName);
    });

    it('sets birthday', () => {
      const { pe, birthday } = render();

      pe.edit.setPerson(person);

      expect(birthday.value).toBe('2023-11-01');
    });

    it('sets deathday', () => {
      const { pe, deathday } = render();

      pe.edit.setPerson(person);

      expect(deathday.value).toBe('2023-11-02');
    });

    it('enables correct relation fields', () => {
      const { pe, addChildBtn } = render();
      spyRelationFilter.mockReturnValueOnce([relation]);

      pe.edit.setPerson(person);

      expect(addChildBtn.disabled).toBe(false);
    });
  });

  describe('for relation', () => {
    it('when partner is added activates relation fields', () => {
      const { pe, partners, partnersBtn, children, childrenBtn, addChildBtn } = render({ person });

      const returnedId = pe.edit.addRelation(relation);

      expect(returnedId).toEqual(expect.any(Number));
      expect(partners.disabled).toBe(false);
      expect(partnersBtn.disabled).toBe(false);
      expect(children.disabled).toBe(true);
      expect(childrenBtn.disabled).toBe(true);
      expect(addChildBtn.disabled).toBe(false);
    });

    it.each([
      {
        start: null,
        end: null,
        children: [],
        members: [person.id, 5000],
        desc: 'unknown partner',
      },
      {
        start: null,
        end: null,
        children: [],
        members: [person.id],
        desc: 'not enough members',
      },
    ])('for invalid relation in case of $desc', (r) => {
      const { pe, partners, partnersBtn } = render({ person });

      const returnedId = pe.edit.addRelation(r);

      expect(returnedId).toBe(null);
      expect(partners.disabled).toBe(true);
      expect(partnersBtn.disabled).toBe(true);
    });

    it('when last partner is removed deactivates add child button', () => {
      const { pe, partners, partnersBtn, children, childrenBtn, addChildBtn } = render({ person });

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
      const { pe } = render({ person });

      pe.edit.addRelation(relation);

      const result = !!pe.edit.findInvolvedRelation(id);
      expect(result).toBe(found);
    });

    it('returns no deleted relation even if id of one members matches', () => {
      const { pe } = render({ person });

      pe.edit.addRelation({ ...relation });
      pe.edit.removeRelation();

      const result = !!pe.edit.findInvolvedRelation(person.Id);
      expect(result).toBe(false);
    });
  });

  describe('children', () => {
    it('elements are updated with existing children if relation is set', () => {
      const otherRelation = {
        start: null,
        end: null,
        children: [child.id],
        members: [person.id, partner.id],
      };
    
      const { pe, children, childrenBtn } = render({ person });

      pe.edit.addRelation(otherRelation);

      expect(children.disabled).toBe(false);
      expect(children.children).toHaveLength(1);
      const option = children.children[0];
      expect(option.value).toEqual('3');
      expect(childrenBtn.disabled).toBe(false);
    });

    it('elements are not updated with unknowng children if relation is set', () => {
      const otherRelation = {
        start: null,
        end: null,
        children: [5000],
        members: [person.id, partner.id],
      };
    
      const { pe, children, childrenBtn } = render({ person });

      pe.edit.addRelation(otherRelation);

      expect(children.disabled).toBe(true);
      expect(children.children).toHaveLength(0);
      expect(childrenBtn.disabled).toBe(true);
    });

    it('fields activated when child is added to partner', () => {
      const { pe, children, childrenBtn } = render({ person });

      pe.edit.addRelation(relation);
      pe.edit.addChild(child.id);

      expect(children.disabled).toBe(false);
      expect(childrenBtn.disabled).toBe(false);
    });

    it('do not add a child when already existing', () => {
      const { pe, children } = render({ person });

      pe.edit.addRelation(relation);
      const rl = pe.edit.relations[0];

      pe.edit.addChild(child.id);
      pe.edit.addChild(child.id);

      expect(rl.children).toHaveLength(1);
      expect(children.options).toHaveLength(1);
    });

    it('are deactivated when last child removed', () => {
      const { pe, children, childrenBtn, addChildBtn } = render({ person });

      pe.edit.addRelation(relation);
      pe.edit.addChild(child.id);
      pe.edit.removeChild(child.id);

      expect(children.disabled).toBe(true);
      expect(childrenBtn.disabled).toBe(true);
      expect(addChildBtn.disabled).toBe(false);
    });
  });

  describe('metadata', () => {
    function isEmptyMediaTable(t) {
      expect(t.children).toHaveLength(1);
      expect(t.children[0].querySelector('td').classList.contains('column-nocontent')).toBe(true);
    }

    describe('calling set without items', () => {
      it('adds a placeholder to table', () => {
        const { pe, mediaTable } = render({ person });
        pe.metadata.set([]);

        isEmptyMediaTable(mediaTable);
      });
    });

    describe('addItem', () => {
      it('adds a new row to the media table', () => {
        const { pe, mediaTable } = render({ person });
        const item = {};
        pe.metadata.addItem(item)

        expect(mediaTable.children).toHaveLength(1);
      });
    });

    describe('remove', () => {
      it('cleans media table with placeholder', () => {
        const { pe, mediaTable } = render({ person });
        const id = 1;
        const item = { id };
        pe.metadata.addItem(item);

        pe.metadata.remove(id);

        isEmptyMediaTable(mediaTable);
      });
    });

    describe('reset', () => {
      it('cleans media table with placeholder', () => {
        const { pe, mediaTable } = render({ person });
        const item = {};
        pe.metadata.addItem(item);

        pe.metadata.reset();

        isEmptyMediaTable(mediaTable);
      });
    });
  });
});
