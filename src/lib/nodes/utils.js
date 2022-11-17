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

export function getRootNode(m) {
  if (isValidNode(m) && !m?.name.match(/^(person|partner)$/)) {
    return m?.parent?.parent;
  }
  return m;
}

export function findNamedGroup(m, name) {
  return m.children.find(c => c.name === name);
}

function getPersonBaseMesh(root) {
  const symbols = findNamedGroup(root, 'symbols');
  return symbols?.children.find((m) => m.material?.name === 'personMeshBase');
}

export function isValidNode(o = {}) {
  return !!o?.userData?.refId;
}

export function isPersonNode(o = {}) {
  const root = getRootNode(o);
  const name = root?.name || '';
  return !!name.match(/^(person|partner)$/);
}

export function isMetaResourceNode(o = {}) {
  const type = o?.userData?.type ||'';
  return !!type.match(/^meta/);
}

export function createNamedGroup(m, name) {
  const g = new Group();
  g.name = name;
  m.add(g);
  return g;
}

export function getDataGroup(m) {
  let g = findNamedGroup(m, 'data');
  if (!g) {
    g = createNamedGroup(m, 'data');
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

export function getPersonGroup(person = {}) {
  const p = new Group();
  p.name = 'person';
  p.userData.refId = person.id;
  return p;
}

export function getPartnerGroup(person = {}) {
  const p = new Group();
  p.name = 'partner';
  p.userData.refId = person.id;
  return p;
}

export function getSymbolGroup(person = {}, layout = {}) {
  const newPersonMesh = personMesh.clone();

  const portraitMesh = newPersonMesh.children.find((m) => m.material.name === 'personMeshPortrait');
  portraitMesh.userData.refId = person.id;

  const baseMesh = newPersonMesh.children.find((m) => m.material.name === 'personMeshBase');
  baseMesh.userData.refId = person.id;

  baseMesh.material = baseMesh.material.clone();
  if (layout.foreground) {
    baseMesh.material.setValues({ color: layout.foreground });
  }

  if (person.portraitUrl) {
    portraitMesh.material = portraitMesh.material.clone();
    portraitMesh.material.setValues({ map: textureLoader.load(person.portraitUrl) });
  } else {
    portraitMesh.material.setValues({ map: textureLoader.load(avatarImage) });
  }

  newPersonMesh.rotateY(Math.PI * -0.5);
  newPersonMesh.rotateX(Math.PI * -0.5);
  newPersonMesh.name = 'symbols';

  return newPersonMesh;
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
  const dg = findNamedGroup(m, 'data');

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
  } else if (isPersonNode(m)) {
    const root = getRootNode(m);
    const m2 = getPersonBaseMesh(root);
    
    if (m2) {
      m2.material.color = m2.material.map ? new Color('#ffcccc') : new Color(highlight);
      m2.material.needsUpdate = true;
    }
  }
}

export function defocusNode(m, config = {}) {
  const {
    foreground = '#ffffff',
  } = config;

  if (isPersonNode(m)) {
    const root = getRootNode(m);
    const m2 = getPersonBaseMesh(root);

    if (m2) {
      if (root?.name === 'person') {
        m2.material.color = new Color(foreground);
      } else {
        m2.material.color = new Color(foreground).multiplyScalar(0.75);
      }
      m2.material.needsUpdate = true;
    }
  }

  if (isMetaResourceNode(m)) {
    m.scale.set(1, 1, 1);
  }
}

export function selectNode(m, config = {}) {
  const {
    highlight = '#ddffff',
    scale = 1,
  } = config;

  if (m.type !== 'Mesh') {
    return;
  }

  if (scale !== 1) {
    m.scale.set(scale, scale, scale);
  } else if (isPersonNode(m)) {
    const root = getRootNode(m);
    const m2 = getPersonBaseMesh(root);
    
    if (m2) {
      m2.material.color = m2.material.map ? new Color('#ffffcc') : new Color('#ffffff');
      m2.material.needsUpdate = true;
    }
  }
}

export function deselectNode(m, config = {}) {
  defocusNode(m, config);
}
