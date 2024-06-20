import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical } from 'three';
import ClassicLayout from '../layouts/ClassicLayout';
import CylinderLayout from '../layouts/CylinderLayout';
import RenderContext from '../RenderContext.js';

function getLayout(id) {
  return id !== 'classic' ? CylinderLayout : ClassicLayout;
}

function ChildRelation(props) {
  const { foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
      treeLayout: store.getTreeLayout(),
    }
  });

  const { highlight = foreground, sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    const Layout = getLayout(treeLayout);
    let lines;
    if (treeLayout === 'rounded') {
      const v2 = new Vector3();
      parent.getWorldPosition(v2);  
      const offset = new Cylindrical().setFromVector3(v2);

      const source = new Cylindrical(sourceX, sourceY, sourceZ);
      const target = new Cylindrical(targetX, targetY, targetZ);
      lines = Layout.getChildLines(source, target, { foreground, highlight, offset });
      parent.add(lines);
    } else {
      const target = new Vector3(targetX, targetY, targetZ);
      const source = new Vector3(sourceX, sourceY, sourceZ);

      lines = Layout.getChildLines(source, target, { foreground, highlight });
      parent.add(lines);
    }

    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, highlight, treeLayout]);

  return null;
};

export default ChildRelation;