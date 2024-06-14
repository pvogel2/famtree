import { Vector3, Color, Mesh, MeshPhongMaterial } from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import HELVETICER_REGULAR_FONT from 'three/examples/fonts/helvetiker_regular.typeface.json';
import OPTIMER_REGULAR_FONT from 'three/examples/fonts/optimer_regular.typeface.json';

const DEFAULT_FONT = new Font(OPTIMER_REGULAR_FONT);

class ThreeText3D {
  constructor(config = {rows: 1, columns: 1, position: null}) {
    this.random = !config.text;
    this.rows = config.rows;
    this.columns = config.columns;
    this.text = config.text || '';
    this.objId = config.id || 'theText';
    this.debug = !!config.debug;
    this.position = config.position || new Vector3(0, 0, 0);
    this.rotation = config.rotation || new Vector3(0, 0, 0);
    this.color = new Color(config.color || 0xff00ff);
    this.scale = config.scale || 1.0;
    this.alpha = config.alpha || 1.0;
    this.font = DEFAULT_FONT;
  }

  getMaterial() {
    const m = new MeshPhongMaterial({
      color: this.color,
      flatShading: true
    });
    return m;
  }

  getGeometry() {
    const geometry = new TextGeometry( this.text, {
      font: this.font,
      size: 0.25 *  this.scale,
      depth: 0,
      curveSegments: 2,
      bevelEnabled: false,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelOffset: 0,
      bevelSegments: 1,
    } );
    return geometry;
  }

  setPosition() {
    const { x, y, z } = this.position;
    this.textMesh.position.set(x, y, z);
  }

  setRotation() {
    const { x, y, z } = this.rotation;
    this.textMesh.rotation.set(x, y, z, 'YXZ');
  }

  attach(renderer, parent) {
    const textGeometry = this.getGeometry();
    const textMaterial = this.getMaterial();

    this.textMesh = new Mesh( textGeometry, textMaterial );
    this.textMesh.geometry.center();

    this.setPosition();
    this.setRotation();
    
    renderer
      ? renderer.addObject(this.objId, this.textMesh, false, parent)
      : parent.add(this.textMesh);
  }

  remove(renderer, parent) {
    renderer
      ? renderer.removeObject(this.objId)
      : parent.remove(this.textMesh);
  }
};

export default ThreeText3D;
