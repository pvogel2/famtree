import LayoutContext from './LayoutContext.js';
import ClassicLayout, { getClassicLayout } from './layouts/ClassicLayout';
import CylinderLayout, { getCylindricalLayout } from './layouts/CylinderLayout';

function LayoutProvider(props) {
  const { treeLayout = 'classic', roundedBending, children } = props;

  const Layout = treeLayout !== 'classic' ? getCylindricalLayout({ roundedBending }) : getClassicLayout();

  return (
    <LayoutContext.Provider value={ Layout }>
      { children }
    </LayoutContext.Provider>
  );
}

export default LayoutProvider;

