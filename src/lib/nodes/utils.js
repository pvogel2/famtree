import { TextureLoader, Mesh, Group, SphereGeometry, MeshBasicMaterial, Vector3, Color } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import ThreeText from '../../lib/three/Text';
import avatarImage from './../../assets/images/avatar.png';
import { getBaseUrl } from '../../mylib/Connect';

const textureLoader = new TextureLoader();
const gltfLoader = new GLTFLoader();

let personMesh;

function getGLTFPerson() {
  gltfLoader.load(`${getBaseUrl()}assets/models/personMesh.gltf`, (gltf) => {
    personMesh = gltf.scene.children[0];
  });
}
getGLTFPerson();

export function findTypedGroup(m, name) {
  return m.children.find(c => c.name === name);
}

export function isValidNode(o = {}) {
  const root = o?.parent?.parent;
  return (o?.userData?.type && o?.userData?.id) || (root?.userData?.type && root?.userData?.id);
}

export function isPersonNode(o = {}) {
  const root = o?.parent?.parent;
  const type = root?.userData?.type ||'';
  return !!type.match(/^(node|partner)$/);
}

export function isMetaResourceNode(o = {}) {
  const type = o?.userData?.type ||'';
  return !!type.match(/^meta/);
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
  const newPersonMesh = personMesh.clone();

  const portraitMesh = newPersonMesh.children.find((m) => m.material.name === 'personMeshPortrait');
  const baseMesh = newPersonMesh.children.find((m) => m.material.name === 'personMeshBase');

  baseMesh.material = baseMesh.material.clone();
  if (layout.foreground) {
    baseMesh.material.setValues({ color: layout.foreground });
  }

  if (layout.mapUrl) {
    portraitMesh.material = portraitMesh.material.clone();
    portraitMesh.material.setValues({ map: textureLoader.load(layout.mapUrl) });
  } else {
    portraitMesh.material.setValues({ map: textureLoader.load(avatarImage) });
  }

  const personGroup = new Group();
  newPersonMesh.rotateY(Math.PI * -0.5);
  newPersonMesh.rotateX(Math.PI * -0.5);
  personGroup.add(newPersonMesh);
  
  return personGroup;
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
  } else if (m.parent?.parent?.userData?.type?.startsWith('node') || m.parent?.parent?.userData?.type?.startsWith('partner')) {
    const m2 = m.parent?.children.find((m) => m.material?.name === 'personMeshBase');
    if (m2) {
      m2.material.color = m2.material.map ? new Color('#ffcccc') : new Color(highlight);
      m2.material.needsUpdate = true;
    }
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
  if (m.parent?.parent?.userData?.type?.startsWith('node')) {
    const m2 = m.parent?.children.find((m) => m.material?.name === 'personMeshBase');
    if (m2) {
      m2.material.color = m2.material.map ? new Color('#ffffff') : new Color(foreground);
      m2.material.needsUpdate = true;
    }
  }

  if (m.parent?.parent?.userData?.type?.startsWith('partner')) {
    const m2 = m.parent?.children.find((m) => m.material?.name === 'personMeshBase');
    if (m2) {
      m2.material.color = m2.material.map ? new Color('#ffffff') : new Color(foreground).multiplyScalar(0.75);
      m2.material.needsUpdate = true;
    }
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
