import { Mesh, Group, SphereGeometry, MeshBasicMaterial, Vector3, Color } from 'three';
import ThreeText from '../../lib/three/Text';

export function findTypedGroup(m, name) {
  return m.children.find(c => c.name === name);
}

function createTypedGroup(m, name) {
  const g = new Group();
  g.name = name;
  m.add(g);
  return g;
}

function getDataGroup(m) {
  let g = findTypedGroup(m, 'data');
  if (!g) {
    g = createTypedGroup(m, 'data');
  }
  return g;
}

export function getMesh(layout = {}) {
  const foreground = layout.foreground ? layout.foreground : '#888888';
  const color = new Color(foreground);
  const r = 0.5;
  const g = new SphereGeometry(r);
  const m = new MeshBasicMaterial({ color });

  g.computeBoundingSphere();
  return new Mesh(g, m);
}

export function addDataToMesh(m) {
  return getDataGroup(m);
}

export function addLabelText(p, label, color = null) {
  const text = new ThreeText({
    text: label,
    position: new Vector3(1, -1, 0),
    rotation: new Vector3(0, Math.PI * 0.5, 0),
    scale: 0.4,
    color,
  });

  text.attach(null, p);
  text.textMesh.geometry.center();
  return text;
}

export function findLabelText(m) {
  const dg = findTypedGroup(m, 'data');

  if(dg && dg.children.length) {
    return dg.children[0];
  }
return null;
}

export function focusNode(m, config = {}) {
  const {
    highlight = '#770000',
  } = config;

  if (m.type !== 'Mesh') {
    return;
  }
  m.material.color = new Color(highlight);
  m.material.needsUpdate = true;
  /* const text = findLabelText(m);
  if (text) {
    text.material.uniforms.scale.value = 1;
    text.material.needsUpdate = true;
  } */
}

export function defocusNode(m, config = {}) {
  const {
    foreground = '#FFFFFF',
  } = config;
  m.material.color = m.name.startsWith('node') ? new Color(foreground) : (new Color(foreground)).multiplyScalar(0.75);
  /* const text = findLabelText(m);
  if(text) {
    text.material.uniforms.scale.value = 0.4;
    text.material.needsUpdate = true;
  } */
}
