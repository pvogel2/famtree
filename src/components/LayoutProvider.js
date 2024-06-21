import LayoutContext from './LayoutContext.js';
import ClassicLayout from './layouts/ClassicLayout';
import CylinderLayout from './layouts/CylinderLayout';

function LayoutProvider(props) {
  const { treeLayout = 'classic', children } = props;

  const Layout = treeLayout !== 'classic' ? CylinderLayout : ClassicLayout;

  return (
    <LayoutContext.Provider value={ Layout }>
      { children }
    </LayoutContext.Provider>
  );
}

export default LayoutProvider;

