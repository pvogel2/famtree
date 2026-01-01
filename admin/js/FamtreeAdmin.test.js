import Famtree from './FamtreeAdmin';
import GedcomImporter from './gedcom/importer';
import { U } from '@tests/setup.js'; 
import Person from '@public/js/Person.js';

jest.mock('./editor/PersonEditor.js', () => {
  return function() {
    return  {
      getNonce: jest.fn(),
      registerCallback: jest.fn(),
    };
  };
});

jest
  .spyOn(GedcomImporter.prototype, 'import')
  .mockImplementation(jest.fn());

jest
  .spyOn(GedcomImporter.prototype, 'comparePersons')
  .mockImplementation(() => Promise.resolve(GedcomImporter.MODE_ADD));

jest.mock('./PersonTable.js', () => {
  return function() {
    return  {
      getNonce: jest.fn(),
    };
  };
});

jest.mock('./UIMessage.js');
jest.mock('./UIImportDialog.js');

const wpMocked = {
  media: jest.fn(),
};

describe('The Famtree class', () => {

  afterEach(() => {
    // jest.clearAllMocks();
  });

  it('is defined', () => {
    expect(Famtree).toBeDefined();
  });

  it('is initialized correctly', () => {
    expect(() => {
      process.nextTick
      new Famtree(wpMocked);
    }).not.toThrow();
  });

  describe('gedcom import', () => {
    const gedcomImporter = new GedcomImporter();

    function getImportData() {
      return {
        persons: [],
        relations: [],
      };
    }

    it('does nothing for empty imports', () => {
      const famtree = new Famtree(wpMocked);
      gedcomImporter.import.mockReturnValueOnce(Promise.resolve(getImportData()));

      expect(famtree.importGedcom()).resolves.toBeUndefined();
    });

    it.only('imports single person', async () => {
      const famtree = new Famtree(wpMocked);
      const data = { id: -1, firstName: 'Hans', lastName: 'Wurst' };
      const singleImport = getImportData();
      singleImport.persons.push(new Person());
      gedcomImporter.import.mockReturnValueOnce(Promise.resolve(singleImport));

      jest
        .spyOn(famtree, 'savePersons')
        .mockImplementationOnce(() => Promise.resolve({ ...data, id: 1 }));

      await expect(famtree.importGedcom()).resolves.toBeUndefined();

      expect(famtree.savePersons).toHaveBeenCalled();
   });
  });
});
