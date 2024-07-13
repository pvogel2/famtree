import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import RenderContext from './../RenderContext.js';
import LayoutContext from './../LayoutContext.js';

function ChildRelation(props) {
  const { foreground } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
    }
  });

  const { highlight = foreground, sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { renderer } = useContext(RenderContext);
  const Layout = useContext(LayoutContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    const source = Layout.getVector(sourceX, sourceY, sourceZ);
    const target = Layout.getVector(targetX, targetY, targetZ);
    const lines = Layout.getChildLines(source, target, { foreground, highlight, parent });
    parent.add(lines);

    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, highlight, Layout]);

  return null;
};

export default ChildRelation;