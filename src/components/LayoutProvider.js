import LayoutContext from './LayoutContext.js';
import { getClassicLayout } from './layouts/ClassicLayout';
import { getCylindricalLayout } from './layouts/cylinder/TreeLayout';

function LayoutProvider(props) {
  const { treeLayout = 'classic', roundedBending, children } = props;

  const Layout = treeLayout !== 'classic' ? getCylindricalLayout({ bending: roundedBending }) : getClassicLayout();

  return (
    <LayoutContext.Provider value={ Layout }>
      { children }
    </LayoutContext.Provider>
  );
}

export default LayoutProvider;

