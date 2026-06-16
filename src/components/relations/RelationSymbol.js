import { useEffect, useContext } from '@wordpress/element';
import RenderContext from './../RenderContext.js';
import ThreePreparedMeshes from '../../lib/three/PreparedMeshes';
import { NODE_SIZE } from '../../lib/nodes/utils';
import { MARR_TYPES } from '../../lib/gedcom/utils.js';

function RelationSymbol(props) {
  const { type, end, parent, targetX, targetY, targetZ } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    let relationSymbol;
    async function setSymbolMesh() {
      if (type === MARR_TYPES.MARRIAGE && !end) {
        relationSymbol = (await ThreePreparedMeshes.getMarriageSymbol()).clone();
        parent.add(relationSymbol);
        relationSymbol.scale.set(0.5, 0.5, 0.5);
        renderer.registerEventCallback('render', () => {
            relationSymbol.rotation.z = (relationSymbol.rotation.z + 0.005) % (2 * Math.PI);
        });
        relationSymbol.position.set(targetX, targetY, targetZ + 0.5 * NODE_SIZE);
      }
    }
    setSymbolMesh();

    return () => {
      if (relationSymbol) {
        parent.remove(relationSymbol);
      }
    };
  }, [renderer, parent, type, end, targetX, targetY, targetZ]);

  return null;
};

export default RelationSymbol;
