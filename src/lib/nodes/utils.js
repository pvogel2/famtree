import { TextureLoader, Mesh, Group, SphereGeometry, MeshBasicMaterial, Vector3, Color, MathUtils, SRGBColorSpace, Cylindrical } from 'three';
import { __ } from '@wordpress/i18n';
import ThreeText3D from '../../lib/three/Text3D';
import ThreePreparedMeshes from '../../lib/three/PreparedMeshes';
import Transition from '../../lib/Transition';
import avatarImage from '../../assets/images/avatar.png';
import Person from '../../../public/js/Person';

/*
node setup:
- group person|partner
 - group relations
 - group assets
 - group local
   - group data
   - group navigation
   - group symbols
*/
const textureLoader = new TextureLoader();

const ARROW_OFFSET = 0.2;
const NAVI_OFFSET = 0.9;

export function isValidId(id) {
  return !isNaN(parseInt(id));
}

export function getRootNode(m) {
  if (isValidNode(m) && !m?.name.match(/^(person|partner)$/)) {
    return m?.parent?.parent?.parent;
  }
  return m;
}

function findNamedGroup(m, name) {
  return m?.children?.find(c => c.name === name);
}

function getPersonBaseMesh(root) {
  const lg = findNamedGroup(root, 'local');
  const symbols = findNamedGroup(lg, 'symbols');
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
  const type = o?.userData?.type || '';
  return !!type.match(/^meta/);
}

export function isNavigationNode(o = {}) {
  const parent = o?.parent || null;
  const name = parent?.name || '';
  return (name === 'navigation' && !isNaN(o.userData.refId));
}

export function createNamedGroup(m, name) {
  const g = new Group();
  g.name = name;

  m.add(g);
  return g;
}

// direct under root node
export function getAssetsGroup(m) {
  return getNamedGroup(m, 'assets');
}

export function getDataGroup(m) {
  const lg = findNamedGroup(m, 'local');
  return getNamedGroup(lg, 'data');
}

export function getNavigationGroup(m, layout = { pos: [ARROW_OFFSET, NAVI_OFFSET, -NAVI_OFFSET], visible: false }) {
  const lg = getNamedGroup(m, 'local');
  const ng = getNamedGroup(lg, 'navigation');
  ng.position.fromArray(layout.pos);
  ng.visible = layout.visible;

  return ng;
}

export function getRelationsGroup(m) {
  return getNamedGroup(m, 'relations');
}

function getNamedGroup(m, name) {
  let g = findNamedGroup(m, name);
  if (!g) {
    g = createNamedGroup(m, name);
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

async function getNaviArrowMesh(layout = {}) {
  const { rot = 0, color = '#888888', opacity } =  layout;
  const options = { color };
  const newArrowMesh = (await ThreePreparedMeshes.getNavigationArrow()).clone();

  if (typeof opacity === 'number') {
    options.opacity = opacity;
    options.transparent = true;
  };

  newArrowMesh.material = new MeshBasicMaterial(options);
  newArrowMesh.scale.set(0.75, 0.75, 0.75);
  newArrowMesh.rotateX(rot);
  newArrowMesh.rotateZ(Math.PI * 0.5);
  newArrowMesh.name = 'naviArrow';

  return newArrowMesh;
}


export function getPersonGroup(person = {}) {
  const p = new Group();
  p.name = 'person';
  p.userData.refId = person.id;
  createNamedGroup(p, 'local');
  return p;
}

export function getPlaceholderGroup() {
  const p = new Group();
  p.name = 'placeholder';
  p.userData.refId = -1;
  createNamedGroup(p, 'local');
  return p;
}

export function getPartnerGroup(person = {}) {
  const p = new Group();
  p.name = 'partner';
  p.userData.refId = person.id;
  createNamedGroup(p, 'local');
  return p;
}

export async function getSymbolGroup(person, layout = {}) {
  const id = person ? person.id : 'Generic';
  const newPersonMesh = (await ThreePreparedMeshes.getPerson()).clone();

  const portraitMesh = newPersonMesh.children.find((m) => m.material.name === 'personMeshPortrait');
  portraitMesh.userData.refId = id;

  const baseMesh = newPersonMesh.children.find((m) => m.material.name === 'personMeshBase');
  baseMesh.userData.refId = id;

  baseMesh.material = baseMesh.material.clone();
  if (layout.foreground) {
    baseMesh.material.setValues({ color: layout.foreground });
  }

  let texture;
  if (person?.portraitUrl) {
    texture = textureLoader.load(person.portraitUrl);
  } else {
    texture = textureLoader.load(avatarImage);
  }
  texture.flipY = false;
  texture.colorSpace = SRGBColorSpace;

  portraitMesh.material = portraitMesh.material.clone();
  portraitMesh.material.setValues({ color: '#FFFFFF', map: texture });

  newPersonMesh.rotateY(Math.PI * 0.5);
  newPersonMesh.rotateX(Math.PI * 0.5);
  newPersonMesh.name = 'symbols';

  return newPersonMesh;
}

export function addLabelText3D(p, label, color = null) {
  const text = new ThreeText3D({
    text: label,
    position: new Vector3(0.25, -1.25, 0),
    rotation: new Vector3(0, Math.PI * 0.5, 0),
    color,
  });

  text.attach(null, p);
  return text;
}

export function findLabelText(m) {
  const lg = findNamedGroup(root, 'local');
  const dg = findNamedGroup(lg, 'data');

  if (dg && dg.children.length) {
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

  renderer.parent.style.cursor = 'pointer';

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
      renderer.parent.style.cursor = 'default';

      const startColor = m2.material.color.clone();
      let endColor = new Color(foreground);

      hideNavigationGroup(m);

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
    }
  }

  if (isMetaResourceNode(m)) {
    const startScale = m.scale.clone();
    const endScale = new Vector3(scale, scale, scale);
    const startOpacity = m.material.opacity;

    renderer.parent.style.cursor = 'default';

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

let currentTransition = null;

function showNavigationGroup(m) {
  const lg = findNamedGroup(m, 'local');
  const ng = findNamedGroup(lg, 'navigation');
  if (ng) {
    ng.visible = true;
  }
}

function hideNavigationGroup(m) {
  const lg = findNamedGroup(m, 'local');
  const ng = findNamedGroup(lg, 'navigation');
  if (ng) {
    ng.visible = false;
  }
}

export function selectNode(m, config = {}) {
  const {
    color = '#ffffff',
    renderer,
    layout,
    scale = 1,
  } = config;

  if (!m || m.type !== 'Mesh' && m.type !== 'Group') {
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

      if (currentTransition) {
        currentTransition.teardown();
        renderer.transitioning = false;
      }

      const selectTransition = new Transition({
        duration: 0.25,
        callback: (current) => {
          m2.material.color.lerpColors(startColor, endColor, current);
        },
        onFinish: () => {
          if (!currentTransition.torndown) {
            setTimeout(() => showNavigationGroup(m), 300);
          }
          renderer.unregisterEventCallback('render', selectTransition.update);
        },
      });
      currentTransition = selectTransition;
      renderer.registerEventCallback('render', selectTransition.update);
      selectTransition.forward();
    }

    if (renderer && layout) {
      const targetPosition = new Vector3();
      root.getWorldPosition(targetPosition);
      renderer.transition(targetPosition, 1, layout.getCameraPosition(targetPosition));
    }
  }
}

export function deselectNode(m, config = {}) {
  defocusNode(m, config);
}

export function createTreeNode(person, config) {
  const { renderer, parent, type = 'person', offset, colors, layout } = config;

  const p = person ? new Person(person) : null;
  const id = person ? p.id : 'Generic';

  let rg;

  switch(type) {
    case 'partner': {
      rg = getPartnerGroup(p);
      break;
    }
    case 'person': {
      rg = getPersonGroup(p);
      break;
    }
    default:
      rg = getPlaceholderGroup();
  }

  const lg = rg.children[0];

  const rId = `person${id}`;
  const sId = `symbol${id}`;

  renderer.addObject(rId, rg, false, parent);

  layout.setOffset(rg, offset);

  getSymbolGroup(p, { foreground: colors.foreground }).then((sg) => {
    renderer.addObject(sId, sg, true, lg);
  });

  // renderer.addObject(rId, rg, false, parent);

  const dg = getDataGroup(rg);
  const lt = addLabelText3D(dg, `${p ? p.name : __('no information', 'famtree')}`, colors.text);

  getAssetsGroup(lg);

  return {
    root: rg,
    clean: () => {
      rg.clear();
      renderer.removeObject(rId);
      renderer.removeObject(sId);
      lt.remove(null, dg);
    },
  };
}

export function createNavigationNode(person, meta) {
  const { root, renderer, navi, color } = meta;
  const ng = getNavigationGroup(root);

  const arrowLayout = {
    parent: { pos: [0, -ARROW_OFFSET, 0], rot: Math.PI * -0.5 },
    child: { pos: [0, ARROW_OFFSET, 0], rot: Math.PI * 0.5 },
    left: { pos: [0, 0, ARROW_OFFSET], rot: Math.PI },
    right: { pos: [0, 0, -ARROW_OFFSET] },
  };

  Object.entries(navi).forEach(([target, props]) => {
    const { refId } = props;
    const { pos, rot } = arrowLayout[target];

    if (isValidId(refId)) {
      const nId = `${target}Navi${person.id}`;
     getNaviArrowMesh({ rot, color }).then((m) => {
        renderer.addObject(nId, m, true, ng);
        m.position.fromArray(pos);
        m.userData.refId = refId;
      });
    }
  });

  const clean = () => {
    Object.entries(navi).forEach(([target, props]) => {
      const { refId } = props;

      if (isValidId(refId)) {
        const nId = `${target}Navi${person.id}`;
        renderer.removeObject(nId);
      }
    });
  };

  return { naviGroup: ng, clean };
};
