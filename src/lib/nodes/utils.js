import { TextureLoader, Mesh, Group, SphereGeometry, MeshBasicMaterial, Vector3, Color, MathUtils } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import ThreeText from '../../lib/three/Text';
import Transition from '../../lib/Transition';
import avatarImage from './../../assets/images/avatar.png';
import { getBaseUrl } from '../../mylib/Connect';

const textureLoader = new TextureLoader();
const gltfLoader = new GLTFLoader();

let personMesh;

function getGLTFPerson() {
  gltfLoader.load(`${getBaseUrl()}public/models/personMesh.gltf`, (gltf) => {
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
  if (o?.userData?.type === 'metaimage') {
    return false;
  };
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
  /* if (name === 'relations') {
    const markerNode = getMesh({ foreground: '#ff0000'});
    g.add(markerNode);
  }
  if (name === 'assets') {
    const markerNode = getMesh({ foreground: '#0000ff'});
    markerNode.position.x -= 0.5;
    g.add(markerNode);
  } */
  m.add(g);
  return g;
}

export function getAssetsGroup(m) {
  let g = findNamedGroup(m, 'assets');
  if (!g) {
    g = createNamedGroup(m, 'assets');
  }
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

  const r = 0.25;
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

  let texture;
  if (person.portraitUrl) {
    texture = textureLoader.load(person.portraitUrl);
  } else {
    texture = textureLoader.load(avatarImage);
  }
  texture.flipY = false;
  portraitMesh.material = portraitMesh.material.clone();
  portraitMesh.material.setValues({ map: texture });

  newPersonMesh.rotateY(Math.PI * 0.5);
  newPersonMesh.rotateX(Math.PI * 0.5);
  newPersonMesh.name = 'symbols';

  return newPersonMesh;
}

export function addLabelText(p, label, color = null) {
  const text = new ThreeText({
    text: label,
    position: new Vector3(0.75, -1, 0),
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
    opacity = 1,
    renderer,
  } = config;

  if (m.type !== 'Mesh') {
    return;
  }

  if (scale !== 1) {
    const startScale = m.scale.clone();
    const endScale = new Vector3(scale, scale, scale);
    const startOpacity = m.material.opacity;
    const focusTransition = new Transition({
      duration: 0.15,
      curve: 'easeOutQuad',
      callback: (current) => {
        m.scale.lerpVectors(startScale, endScale, current);
        m.material.opacity = MathUtils.lerp(startOpacity, opacity, current);
      },
      onFinish: () => {
        renderer.unregisterEventCallback('render', focusTransition.update);
      },
    });
    renderer.registerEventCallback('render', focusTransition.update);
    focusTransition.forward();
  } else if (isPersonNode(m)) {
    const root = getRootNode(m);
    const m2 = getPersonBaseMesh(root);

    if (m2 && renderer) {
      const startColor = m2.material.color.clone();
      const endColor = m2.material.map ? new Color('#ffcccc') : new Color(highlight);
      const focusTransition = new Transition({
        duration: 0.25,
        callback: (current) => {
          m2.material.color.lerpColors(startColor, endColor, current);
        },
        onFinish: () => {
          renderer.unregisterEventCallback('render', focusTransition.update);
        },
      });
      renderer.registerEventCallback('render', focusTransition.update);
      focusTransition.forward();

      // m2.material.color = m2.material.map ? new Color('#ffcccc') : new Color(highlight);
      // m2.material.needsUpdate = true;
    }
  }
}

export function defocusNode(m, config = {}) {
  const {
    foreground = '#ffffff',
    scale = 1,
    opacity = 1,
    renderer,
  } = config;

  if (isPersonNode(m)) {
    const root = getRootNode(m);
    const m2 = getPersonBaseMesh(root);

    if (m2 && renderer) {
      const startColor = m2.material.color.clone();
      let endColor = new Color(foreground);

      if (root?.name !== 'person') {
        endColor = new Color(foreground).multiplyScalar(0.75);
      }
      const focusTransition = new Transition({
        duration: 0.25,
        callback: (current) => {
          m2.material.color.lerpColors(startColor, endColor, current);
        },
        onFinish: () => {
          renderer.unregisterEventCallback('render', focusTransition.update);
        },
      });
      renderer.registerEventCallback('render', focusTransition.update);
      focusTransition.forward();
      // m2.material.needsUpdate = true;
    }
  }

  if (isMetaResourceNode(m)) {
    const startScale = m.scale.clone();
    const endScale = new Vector3(scale, scale, scale);
    const startOpacity = m.material.opacity;

    const focusTransition = new Transition({
      duration: 0.15,
      curve: 'easeOutQuad',
      callback: (current) => {
        m.scale.lerpVectors(startScale, endScale, current);
        m.material.opacity = MathUtils.lerp(startOpacity, opacity, current);
      },
      onFinish: () => {
        renderer.unregisterEventCallback('render', focusTransition.update);
      },
    });
    renderer.registerEventCallback('render', focusTransition.update);
    focusTransition.forward();
    // m.scale.set(1, 1, 1);
  }
}

export function selectNode(m, config = {}) {
  const {
    color = '#ffffff',
    renderer,
    scale = 1,
  } = config;

  if (m.type !== 'Mesh' && m.type !== 'Group') {
    return;
  }

  if (scale !== 1) {
    m.scale.set(scale, scale, scale);
  } else if (isPersonNode(m)) {
    const root = getRootNode(m);
    const m2 = getPersonBaseMesh(root);
    
    if (m2 && renderer) {
      const startColor = m2.material.color.clone();
      const endColor = m2.material.map ? new Color('#ccffcc') : new Color(color);
      const focusTransition = new Transition({
        duration: 0.25,
        callback: (current) => {
          m2.material.color.lerpColors(startColor, endColor, current);
        },
        onFinish: () => {
          renderer.unregisterEventCallback('render', focusTransition.update);
        },
      });
      renderer.registerEventCallback('render', focusTransition.update);
      focusTransition.forward();

      // m2.material.color = new Color(color);
      // m2.material.needsUpdate = true;
    }

    if (renderer) {
      const targetPosition = new Vector3();
      root.getWorldPosition(targetPosition);
      const cameraPosition = targetPosition.clone();
      cameraPosition.add(new Vector3(10, 0, 0));
      renderer.transition(targetPosition, 1, cameraPosition);
    }

  }
}

export function deselectNode(m, config = {}) {
  defocusNode(m, config);
}
