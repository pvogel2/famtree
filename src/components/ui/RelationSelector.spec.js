import React from 'react';
import { cleanup } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

import U, { getSelectOptions } from '../../lib/tests/utils';

import RelationSelector from './RelationSelector';

async function selectFirstForRelation(base, container) {
  const selector = container.querySelector('[qa="add-relation-selector"]');
  const items = await getSelectOptions(base, selector);
  const selected = items[0];
  fireEvent.click(selected);
  return { selector, items, selected };
}

afterEach(cleanup);

it('renders elements for RelationSelector', () => {
  const { container } = U.renderWithContext(<RelationSelector />);
  expect(container.firstChild).not.toBeNull();
});

describe('add relation selector', () => {
  it('is in the document', async () => {
    const { container } = U.renderWithContext(<RelationSelector />);
  
    const addRelationSelector = container.querySelector('[qa="add-relation-selector"]');
    expect(addRelationSelector).toBeInTheDocument();
  });

  it('is disabled per default',  () => {
    const { container } = U.renderWithContext(<RelationSelector />);
  
    const addRelationNativeInput = container.querySelector('[qa="add-relation-selector"] input');
    expect(addRelationNativeInput).toHaveAttribute('disabled');
  });

  it('is enabled when person selected',  async () => {
    const dPerson = U.getPerson();
    const { container } = U.renderWithContext(<RelationSelector targetPerson={ dPerson } />);
    const addRelationNativeInput = container.querySelector('[qa="add-relation-selector"] input');

    expect(addRelationNativeInput).not.toHaveAttribute('disabled');
  });

  it('shows the name when person selected',  async () => {
    const dPerson = U.getPerson();
    const anotherDPerson = U.getPerson();
    const persons = [dPerson, anotherDPerson];

    const { baseElement, container } = U.renderWithContext(<RelationSelector targetPerson={ dPerson } />, persons);

    const { selector } = await selectFirstForRelation(baseElement, container);

    expect(selector).toHaveTextContent(anotherDPerson.name);
  });

  it('has persons different from selected person',  async () => {
    const dPerson = U.getPerson();
    const anotherDPerson = U.getPerson();
    const persons = [dPerson, anotherDPerson];

    const { baseElement, container } = U.renderWithContext(<RelationSelector targetPerson={ dPerson } />, persons);
    const { items } = await selectFirstForRelation(baseElement, container);

    expect(items).toHaveLength(1);
  });
});

const relations = [
  {
    name: 'child',
    listName: 'children',
  },
  {
    name: 'partner',
    listName: 'partners',
  },
];
describe.each(relations)('add $name button', ({ name, listName }) => {
  function getRelationButton(c) {
    return c.querySelector(`[qa="add-${name}"]`);
  }

  it('is in the document', async () => {
    const { container } = U.renderWithContext(<RelationSelector />);
    const relationButton = getRelationButton(container);

    expect(relationButton).toBeInTheDocument();
  });

  it('is disabled by default', async () => {
    const { container } = U.renderWithContext(<RelationSelector />);
    const relationButton = getRelationButton(container);

    expect(relationButton).toHaveAttribute('disabled');
  });

  it('is enabled when a person for relation is selected', async () => {
    const dPerson = U.getPerson();
    const anotherDPerson = U.getPerson();
    const persons = [dPerson, anotherDPerson];

    const { baseElement, container } = U.renderWithContext(<RelationSelector targetPerson={ dPerson } />, persons);
    const relationButton = getRelationButton(container);

    await selectFirstForRelation(baseElement, container);

    expect(relationButton).not.toHaveAttribute('disabled');
  });

  it('updates target person', async () => {
    const dPerson = U.getPerson();
    const anotherDPerson = U.getPerson();

    const { baseElement, container, store } = U.renderWithContext(<RelationSelector targetPerson={ dPerson } />, [dPerson, anotherDPerson]);
    await selectFirstForRelation(baseElement, container);


    const relationButton = getRelationButton(container);
    fireEvent.click(relationButton);

    const { persons } = store.getState();
    const relatedPeson = persons.find((p) => p.id === dPerson.id);

    expect(relatedPeson[listName]).toEqual(expect.arrayContaining([anotherDPerson.id]));
  });
});
