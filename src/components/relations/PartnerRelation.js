import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import RenderContext from './../RenderContext.js';
import LayoutContext from './../LayoutContext.js';

function PartnerRelation(props) {
  const { foreground } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
    }
  });

  const { highstart = foreground, highend = foreground, targetX = 0, targetY = 0, targetZ = 0, parent, offsetX = 0, offsetY = 0, offsetZ = 0 } = props;
  const { renderer } = useContext(RenderContext);
  const Layout = useContext(LayoutContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    const offset = Layout.getVector(offsetX, offsetY, offsetZ);
    const target = Layout.getVector(targetX, targetY, targetZ);
    const lines = Layout.getPartnerLines(offset, target, { foreground, highstart, highend });

    parent.add(lines);

    return () => {
      parent.remove(lines);
    };
  }, [renderer, parent, targetX, targetY, targetZ, offsetX, offsetY, offsetZ, foreground, highstart, highend, Layout]);
      
  return null;
};

export default PartnerRelation;