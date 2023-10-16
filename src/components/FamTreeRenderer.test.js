import U from '../lib/tests/utils';
import FamTreeRenderer from './FamTreeRenderer';


describe('FamTreeRenderer', () => {
  afterEach(() => {
    jest.clearAllMocks()
  });
  
  it('renders node if founder is defined', () => {
    const person = U.getPerson({ root: true });
    const { renderer } = U.renderWithContext(<FamTreeRenderer />, { persons: [person], families:[person.id], founder: person.id });

    expect(renderer.addObject).toHaveBeenNthCalledWith(1, 'person1', expect.any(Object), expect.any(Boolean), undefined);
  });

  it('renders placeholder if founder is not defined', () => {
    const { renderer } = U.renderWithContext(<FamTreeRenderer />);

    expect(renderer.addObject).toHaveBeenNthCalledWith(1, 'personGeneric', expect.any(Object), expect.any(Boolean), undefined);
  });
});
