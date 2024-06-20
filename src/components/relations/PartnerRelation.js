import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical } from 'three';
import ClassicLayout from '../layouts/ClassicLayout';
import CylinderLayout from '../layouts/CylinderLayout';
import RenderContext from './../RenderContext.js';

function getLayout(id) {
  return id !== 'classic' ? CylinderLayout : ClassicLayout;
}

function PartnerRelation(props) {
  const { foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
      treeLayout: store.getTreeLayout(),
    }
  });

  const { highstart = foreground, highend = foreground, targetX = 0, targetY = 0, targetZ = 0, parent, offsetX = 0, offsetY = 0, offsetZ = 0 } = props;
  const { renderer } = useContext(RenderContext);


  useEffect(() => {
    if (!renderer || !parent) return;

    const Layout = getLayout(treeLayout);
    let lines;
    if (treeLayout === 'rounded') {
      const v2 = new Vector3();
      parent.getWorldPosition(v2);  
      const source = new Cylindrical().setFromVector3(v2);
      const target = new Cylindrical(targetX, targetY, targetZ);
      const offset = new Cylindrical(offsetX, offsetY, offsetZ);
      lines = Layout.getPartnerLines(source, target, { foreground, highstart, highend, offset });
      parent.add(lines);
    } else {
      const target = new Vector3(targetX, targetY, targetZ);
      const offset = new Vector3(offsetX, offsetY, offsetZ);
      lines = Layout.getPartnerLines(new Vector3(), target, { foreground, highstart, highend, offset });
      parent.add(lines);
    }

    return () => {
      parent.remove(lines);
    };
  }, [renderer, parent, targetX, targetY, targetZ, offsetX, offsetY, offsetZ, foreground, highstart, highend]);
      
  return null;
};

export default PartnerRelation;