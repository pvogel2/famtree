import PersonEditor from './PersonEditor.js';
import PersonList from '../../../public/js/PersonList.js';
import Person from '../../../public/js/Person.js';
import Relation from '../Relation.js';
import { getEditFormElements, getMetadataFormElements } from '../../../tests/utils.js';

function setName(fn, ln) {
  fn.value = 'First';
  ln.value = 'Last';
  fn.dispatchEvent(new Event('input'));
  ln.dispatchEvent(new Event('input'));
}

function resetDOM() {
  document.body.innerHTML = '';
}

describe('The person editor', () => {
  const person = {name: 'person', id: 1, firstName: 'First', lastName: 'Last', deathday: '2023-11-02', birthday: '2023-11-01' };
  const partner = { name: 'partner', id: 2, firstName: 'PartnerFirst', lastName: 'PartnerLast' };
  const child = { name: 'child', id: 3, firstName: 'ChildFirst', lastName: 'ChildLast' };

  const defaultPersons = [person, partner, child];

  const relation = {
    id: 4,
    start: null,
    end: null,
    children: [],
    members: [person.id, partner.id],
  };

  const unknownId = 5000;
  const defaultRelations = [relation];

  function render({ person, persons = defaultPersons, relations = defaultRelations } = {}) {
    Relation.all = {}; // reset the global persistent object
    relations.forEach((r) => {
      Relation.add(r);
    });
    PersonList.clear();
    persons.forEach((p) => {
      PersonList.add(p);
    });
  
    const eElems = getEditFormElements();
    const fElems = getMetadataFormElements();
    document.body.appendChild(eElems.personForm);
    document.body.appendChild(fElems.metadataForm);
    document.body.appendChild(fElems.metaTable);
  
    const pe = new PersonEditor();
  
    if (person) {
      pe.edit.setPerson(person);
    }
    return { pe, ...eElems, ...fElems };
  }

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

      // this element covers addChild and addPartner availability
      expect(personForm.elements['fs_relations'].disabled).toBe(false);
    });
  });

  describe('sets a person for editing', () => {
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

      pe.edit.setPerson(person);

      expect(addChildBtn.disabled).toBe(false);
    });
  });

  describe('gets a person for editing', () => {
    it('for non editing returns empty person', () => {
      const { pe } = render();

      const p = pe.edit.getPerson();

      expect(p).toBeInstanceOf(Person);
      expect(p.hasId()).toBe(false);
    });

    it('returns the currently edited Person instance', () => {
      const { pe } = render();
      pe.edit.setPerson(person);
    
      const p = pe.edit.getPerson();
      expect(p).toBeInstanceOf(Person);
      expect(p.hasId()).toBe(true);
    });
  });

  describe('relation', () => {
    describe('adding', () => {
      it('for valid value activates relation fields', () => {
        const { pe, partners, partnersBtn, children, childrenBtn, addChildBtn } = render({ person, relations: [] });

        pe.edit.addRelation();

        expect(partners.disabled).toBe(false);
        expect(partnersBtn.disabled).toBe(false);
        expect(children.disabled).toBe(true);
        expect(childrenBtn.disabled).toBe(true);
        expect(addChildBtn.disabled).toBe(false);
      });

      it.each([
        {
          id: unknownId,
          name: 'Unknown',
          desc: 'unknown partner',
        },
        {
          name: 'Missing',
          desc: 'not enough members',
        },
      ])('does nothing in case of invalid partnerId', (p) => {
        const { pe, partners, partnersBtn } = render({ person, persons: [person, p], relations: [] });

        pe.edit.addRelation();

        expect(partners.disabled).toBe(true);
        expect(partnersBtn.disabled).toBe(true);
      });

      it('when last partner is removed deactivates add child button', () => {
        const { pe, partners, partnersBtn, children, childrenBtn, addChildBtn } = render({ person });

        pe.edit.removeRelation();

        expect(partners.disabled).toBe(true);
        expect(partnersBtn.disabled).toBe(true);
        expect(children.disabled).toBe(true);
        expect(childrenBtn.disabled).toBe(true);
        expect(addChildBtn.disabled).toBe(true);
      });
    });

    describe('hasRelation', () => {
      const params = [
        { id: relation.members[0], found: true },
        { id: relation.members[1], found: true },
        { id: unknownId, found: false },
      ];

      it.each(params)('returns the relation if id $id of one members matches', ({ id, found }) => {
        const { pe } = render({ person });

        const result = !!pe.edit.hasRelation(id);

        expect(result).toBe(found);
      });

      it('returns no deleted relation even if id of one members matches', () => {
        const { pe } = render({ person, relations: [] });

        pe.edit.addRelation();
        pe.edit.removeRelation();

        const result = !!pe.edit.hasRelation(person.id);
        expect(result).toBe(false);
      });
    });
  });

  describe('children', () => {
    it('elements are updated with existing children if relation is set', () => {
      const relations = [{ ...relation, children: [child.id] }];
    
      const { children, childrenBtn } = render({ person, relations });

      expect(children.disabled).toBe(false);
      expect(children.children).toHaveLength(1);
      const option = children.children[0];
      expect(option.value).toEqual('3');
      expect(childrenBtn.disabled).toBe(false);
    });

    it('elements are not updated with unknown children if relation is set', () => {
      const relations = [{ ...relation, children: [unknownId] }];
    
      const { pe, children, childrenBtn } = render({ person, relations });

      pe.edit.addRelation();

      expect(children.disabled).toBe(true);
      expect(children.children).toHaveLength(0);
      expect(childrenBtn.disabled).toBe(true);
    });

    it('fields activated when child is added to partner', () => {
      const relations = [relation];
      const { pe, children, childrenBtn } = render({ person, relations });
      pe.edit.addChild();

      expect(children.disabled).toBe(false);
      expect(childrenBtn.disabled).toBe(false);
    });

    it('do not add a child when already existing', () => {
      const { pe, children } = render({ person });

      pe.edit.addChild();
      pe.edit.addChild();

      const rl = pe.edit.relations.getFirst();

      expect(rl.children).toHaveLength(1);
      expect(children.options).toHaveLength(1);
    });

    it('are deactivated when last child removed', () => {
      const { pe, children, childrenBtn, addChildBtn } = render({ person });

      pe.edit.addRelation();
      pe.edit.addChild();
      pe.edit.removeChild();

      expect(children.disabled).toBe(true);
      expect(childrenBtn.disabled).toBe(true);
      expect(addChildBtn.disabled).toBe(false);
    });
  });

  describe('metadata', () => {
    const item = { id: 1, title: 'The title' };

    function isEmptyMetaTable(t) {
      expect(t.children).toHaveLength(1);
      expect(t.children[0].querySelector('td').classList.contains('column-nocontent')).toBe(true);
    }

    describe('calling set without items', () => {
      it('adds a placeholder to table', () => {
        const { pe, metaTable } = render({ person });

        pe.metadata.set([]);

        isEmptyMetaTable(metaTable);
      });
    });

    describe('addItem', () => {
      it('adds a new row to the media table', () => {
        const { pe, metaTable } = render({ person });

        pe.metadata.addItem({ ...item, id: 25 });

        expect(metaTable.children).toHaveLength(1);
      });
    });

    describe('remove', () => {
      it('cleans media table with placeholder', () => {
        const { pe, metaTable } = render({ person });
        pe.metadata.addItem({ ...item });

        pe.metadata.remove(item.id);

        isEmptyMetaTable(metaTable);
      });
    });

    describe('reset', () => {
      it('cleans media table with placeholder', () => {
        const { pe, metaTable } = render({ person });
        const item = {};
        pe.metadata.addItem(item);

        pe.metadata.reset();

        isEmptyMetaTable(metaTable);
      });
    });
  });
});
