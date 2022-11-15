import { TextureLoader, Mesh, Group, CylinderGeometry, SphereGeometry, MeshBasicMaterial, Vector3, Color } from 'three';
import ThreeText from '../../lib/three/Text';

const textureLoader = new TextureLoader();

export function findTypedGroup(m, name) {
  return m.children.find(c => c.name === name);
}

export function isValidNode(o = {}) {
  return o?.userData?.type && o?.userData?.id;
}

export function isPersonNode(o = {}) {
  const type = o?.userData?.type ||'';
  return type.match(/^(node|partner)$/);
}

export function isMetaResourceNode(o = {}) {
  const type = o?.userData?.type ||'';
  return type.match(/^meta/);
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
  const options = { color };

  if (typeof layout.opacity === 'number') {
    options.opacity = layout.opacity;
    options.transparent = true;
  };

  const r = 0.5;
  const g = new SphereGeometry(r);
  const m = new MeshBasicMaterial(options);

  g.computeBoundingSphere();
  return new Mesh(g, m);
}

export function getPersonMesh(layout = {}) {
  const foreground = layout.foreground ? layout.foreground : '#888888';
  const color = new Color(foreground);

  const options = { color };
  if (layout.mapUrl) {
    options.color = '#ffffff';
    options.map = textureLoader.load(layout.mapUrl);
  }

  if (typeof layout.opacity === 'number') {
    options.opacity = layout.opacity;
    options.transparent = true;
  };

  const g = new CylinderGeometry(0.8, 0.6, 0.1, 64, 1);
  g.rotateZ(Math.PI * 0.5);
  g.rotateX(Math.PI);
  const m = new MeshBasicMaterial(options);

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
    highlight = '#ddffff',
    scale = 1,
  } = config;

  if (m.type !== 'Mesh') {
    return;
  }

  if (scale !== 1) {
    m.scale.set(scale, scale, scale);
  } else {
    m.material.color = m.material.map ? new Color('#ffcccc') : new Color(highlight);
    m.material.needsUpdate = true;
  }
  /* const text = findLabelText(m);
  if (text) {
    text.material.uniforms.scale.value = 1;
    text.material.needsUpdate = true;
  } */
}

export function defocusNode(m, config = {}) {
  const {
    foreground = '#ffffff',
  } = config;
  if (m.userData?.type?.startsWith('node')) {
    m.material.color = m.material.map ? new Color(new Color('#ffffff')) : new Color(foreground);
  }

  if (m.userData?.type?.startsWith('partner')) {
    m.material.color = m.material.map ? new Color(new Color('#ffffff')) : new Color(foreground).multiplyScalar(0.75);
  }

  if (isMetaResourceNode(m)) {
    m.scale.set(1, 1, 1);
  }
  /* const text = findLabelText(m);
  if(text) {
    text.material.uniforms.scale.value = 0.4;
    text.material.needsUpdate = true;
  } */
}
