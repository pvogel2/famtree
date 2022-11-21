import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Color, PlaneGeometry, Mesh, MeshBasicMaterial, DoubleSide } from 'three';
import RenderContext from '../RenderContext.js';

const OFFSET_LEFT = 0.4;

function getRelationPlane(config = { highlight, width, height }) {
  const highColor = new Color(config.highlight);
  const material = new MeshBasicMaterial({
    color: highColor,
    opacity: 0.1,
    transparent: true,
    side: DoubleSide,
  });    

  const frame = 0.2;
  const geometry = new PlaneGeometry(config.width + 2 * frame + OFFSET_LEFT, config.height + 2 * frame);
  return new Mesh(geometry, material);
}

const getLayout = (state) => state.layout;

function MetaRelation(props) {
  const {
    parent,
    width = 0,
    height = 0,
  } = props;

  const { selection } = useSelector(getLayout);
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    const center = new Vector3(0.975, 0, -width * 0.5 - 1.7 + OFFSET_LEFT * 0.5);

    const bgPlane = getRelationPlane({ highlight: selection, width, height });

    parent.add(bgPlane);

    bgPlane.rotateY(Math.PI * 0.5);
    bgPlane.position.copy(center);

    return () => {
      parent.remove(bgPlane);
    };
  }, [renderer, parent, selection, width, height]);

  return null;
};

export default MetaRelation;