import U from '../lib/tests/utils';
import Metadata from './Metadata';
import { loadMetadata } from '../lib/Connect.js';
import { act } from 'react-dom/test-utils';


async function renderWithActContext(conpoment, options) {
  let container;

  await act(async () => {
    container = await (U.renderWithContext(conpoment, options)).container;
  });
  return container;
};

jest.mock('./relations/MetadataRelation.js', () => jest.fn(() => <div>X</div>));
jest.mock('../lib/Connect.js', () => {
  return {
    loadMetadata: jest.fn(() => []),
  };
});
  
it('renders nothing for non existing Metadata', () => {
  const { container } = U.renderWithContext(<Metadata />);
  expect(container.firstChild).toBeNull();
});  

it('renders nothing for non existing Metadata if person selected', async () => {
  const selectedPerson = U.getPerson();

  const container = await renderWithActContext(<Metadata />, { selectedPerson: selectedPerson.serialize() });

  expect(container.firstChild).toBeNull();
});  

it('renders node for existing Metadata and existing metadata for person selected', async () => {
  const selectedPerson = U.getPerson();
  loadMetadata.mockReturnValueOnce([{
    id: 1,
    mimetype: '',
  }]);
  const mesh = await U.createPersonMesh();

  const renderer = U.getRenderer();
  renderer.getObject.mockReturnValue({ obj: mesh.personMesh });

  const container = await renderWithActContext(<Metadata />, { selectedPerson: selectedPerson.serialize() });

  expect(container.firstChild).not.toBeNull();
});
