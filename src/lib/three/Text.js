import * as THREE from 'three';
import FONT_PNG from './images/font.png';

class ThreeText {
  constructor(config = {rows: 1, columns: 1, position: null}) {
    this.random = !config.text;
    this.rows = config.rows;
    this.columns = config.columns;
    this.text = config.text || '';
    this.objId = config.id || 'theText';
    this.debug = !!config.debug;
    this.position = config.position || new THREE.Vector3(0, 0, 0);
    this.rotation = config.rotation || new THREE.Vector3(0, 0, 0);
    this.color = new THREE.Color(config.color || 0xffffff);
    this.scale = config.scale || 1.0;
    this.alpha = config.alpha || 1.0;
  }

  updateScale(scale) {
    if (scale === this.scale) {
      return;
    }
    this.scale = scale;
    this.textMesh.material.uniforms.scale.value = scale;
    this.textMesh.material.needsUpdate = true;
  }

  updateAlpha(alpha) {
    if (alpha === this.alpha) {
      return;
    }
    this.alpha = alpha;
    this.textMesh.material.uniforms.alpha.value = alpha;
    this.textMesh.material.needsUpdate = true;
  }

  getRandomMap() {
    const length = this.rows * this.columns;
    const arr = [];
    for (let i = 0; i < length; i++) {
      const code = Math.floor(Math.random() * ThreeText.CHAR_MAP.length);
      arr.push(ThreeText.CHAR_MAP[code]);
    }
    return arr;
  }

  getCharMap() {
    const text = this.text.toString();
    const arr = [];
    if (!text) {
      return arr;
    }
  
    const l = text.length;
    for (let i = 0; i < l; i++) {
      let code = text.charCodeAt(i);
      if (code >= ThreeText.CHAR_MAP.length) {
        code = 0;
      }
      arr.push(ThreeText.CHAR_MAP[code]);
    }
    return arr;
  }

  getRectPosition(x = 0.0, y = 0.0, z = 0.0, wOff= 0.0, w = 1.0, h = 1.0) {
    return [
      x, y,  z,
      x+w, y,  z,
      x+w,  y+h, z,
      x, y+h, z
    ];
  }

  getRectIndizes(n = 0) {
    return [
      n, n+1, n+2,
      n+2, n+3, n
    ];
  }

  getRectUVs(u0 = 0, v0 = 0, u1 = 1, v1 = 1) {
    return [
      u0, v0,
      u1, v0,
      u1, v1,
      u0, v1,
    ];
  };

  getGeometry() {
    let position = [];
    let uv = [];
    let char = [];
    let index = [];

    const map = this.random
      ? this.getRandomMap()
      : this.getCharMap();

    let row = 0;
    let posInWord = 0.0;
    map.forEach((c, idx) => {
      const {i, j, w} = c;
      char = char.concat([i, j, i, j, i, j, i, j,]);

      const clmn = this.random ? idx % this.columns : posInWord;
      const rw = this.random ? row % this.rows : 0;
      position = position.concat(this.getRectPosition(clmn, rw, 0.0, 0.0, c.w));//x = 0.0, y = 0.0, z = 0.0, wOff= 0.0, w = 1.0, h = 1.0
      index = index.concat(this.getRectIndizes(position.length / 3 - 4));
      const u0 = 0.5 - w / 2, v0 =  0.0, u1 =  0.5 + w / 2, v1 = 1.0;
      uv = uv.concat(this.getRectUVs(u0, v0, u1, v1));
       if (this.random && clmn === 0 ) {
        row++;
      }
      posInWord += w;
    });
  

    const g = new THREE.BufferGeometry();
    g.setIndex( index );
    g.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );
    g.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
    g.setAttribute( 'char', new THREE.Float32BufferAttribute( char, 2 ) );

    return g;
  }

  
  setShader(o) {
    o.vertexShader = ThreeText.VERTEX_SHADER;
    o.fragmentShader = ThreeText.FRAGMENT_SHADER;
    return o;
  }

  extendUniforms(u = {}) {
    Object.assign(u, {
      rows:{type: "f", value: 10.0},
      cols:{type: "f", value: 10.0},
      scale: {type: "f", value: this.scale},
      alpha: {type: "f", value: this.alpha},
      color: {type: "vec3", value: this.color.toArray()},
      fontTexture:   { type: "t", value: ThreeText.TEXTURE },
    });
    u.fontTexture.value.wrapS = u.fontTexture.value.wrapT = THREE.RepeatWrapping;

    return u;
  }

  getMaterial() {
    const uniforms = this.extendUniforms();

    const o = {
      uniforms,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true,
    };
    const m = new THREE.ShaderMaterial( this.setShader(o) );
    m.side = THREE.DoubleSide;
    m.color = this.color;
    return m;
  }


  addWireframe() {
    const g = new THREE.WireframeGeometry( this.textMesh.geometry );
    //g.scale(this.scale, this.scale, this.scale)
    const m = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 1 } );
    const wireframe = new THREE.LineSegments( g, m );
    wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
    this.textMesh.add( wireframe );
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

    this.textMesh = new THREE.Mesh( textGeometry, textMaterial );

    this.setPosition();
    this.setRotation();
    
    if (this.debug) {
      this.addWireframe();
    }
    renderer
      ? renderer.addObject(this.objId, this.textMesh, false, parent)
      : parent.add(this.textMesh);
  }

  remove(renderer, parent) {
    renderer
      ? renderer.removeObject(this.objId)
      : parent.remove(this.textMesh);
  }

  update() {
    if (!this.random) return;

    const char = this.textMesh.geometry.attributes.char.array;
    this.getRandomMap().forEach((c, idx) => {
      const i = c.i;
      const j = c.j;  
      char[8 * idx + 0] = i;
      char[8 * idx + 1] = j;
      char[8 * idx + 2] = i;
      char[8 * idx + 3] = j;
      char[8 * idx + 4] = i;
      char[8 * idx + 5] = j;
      char[8 * idx + 6] = i;
      char[8 * idx + 7] = j;
    });
    this.textMesh.geometry.attributes.char.needsUpdate = true;
  }

};

ThreeText.FRAGMENT_SHADER = `
uniform sampler2D fontTexture;
uniform vec3 color;
uniform float alpha;
varying vec2 vUV;
void main() {
  vec4 inputSample = texture2D( fontTexture, vUV );
  gl_FragColor = vec4( color.xyz, inputSample.x * alpha );
}
`;

ThreeText.VERTEX_SHADER = `
varying vec2 vUV;
attribute vec2 char;
uniform float cols;
uniform float rows;
uniform float scale;

void main() {
  vec4 mvPosition = modelViewMatrix * (vec4( position * scale, 1.0 ));
  gl_Position = projectionMatrix * mvPosition;
  float width = 0.95;
  float left = .5 * (1. - width);
  vec2 off = left - uv * 2. * left;
  vUV = vec2(off.x + (uv.x + char.x) / cols,off.y + (uv.y + char.y) / rows);
}
`;

ThreeText.CHAR_MAP = [
  /*  0:  */ {i:0, j:9, w: 1, o: 0},
  /*  1:  */ {i:0, j:9, w: 1, o: 0},
  /*  2:  */ {i:0, j:9, w: 1, o: 0},
  /*  3:  */ {i:0, j:9, w: 1, o: 0},
  /*  4:  */ {i:0, j:9, w: 1, o: 0},
  /*  5:  */ {i:0, j:9, w: 1, o: 0},
  /*  6:  */ {i:0, j:9, w: 1, o: 0},
  /*  7:  */ {i:0, j:9, w: 1, o: 0},
  /*  8:  */ {i:0, j:9, w: 1, o: 0},
  /*  9:  */ {i:0, j:9, w: 1, o: 0},
  /* 10:  */ {i:0, j:9, w: 1, o: 0},
  /* 11:  */ {i:0, j:9, w: 1, o: 0},
  /* 12:  */ {i:0, j:9, w: 1, o: 0},
  /* 13:  */ {i:0, j:9, w: 1, o: 0},
  /* 14:  */ {i:0, j:9, w: 1, o: 0},
  /* 15:  */ {i:0, j:9, w: 1, o: 0},
  /* 16:  */ {i:0, j:9, w: 1, o: 0},
  /* 17:  */ {i:0, j:9, w: 1, o: 0},
  /* 18:  */ {i:0, j:9, w: 1, o: 0},
  /* 19:  */ {i:0, j:9, w: 1, o: 0},
  /* 20:  */ {i:0, j:9, w: 1, o: 0},
  /* 21:  */ {i:0, j:9, w: 1, o: 0},
  /* 22:  */ {i:0, j:9, w: 1, o: 0},
  /* 23:  */ {i:0, j:9, w: 1, o: 0},
  /* 24:  */ {i:0, j:9, w: 1, o: 0},
  /* 25:  */ {i:0, j:9, w: 1, o: 0},
  /* 26:  */ {i:0, j:9, w: 1, o: 0},
  /* 27:  */ {i:0, j:9, w: 1, o: 0},
  /* 28:  */ {i:0, j:9, w: 1, o: 0},
  /* 29:  */ {i:0, j:9, w: 1, o: 0},
  /* 30:  */ {i:0, j:9, w: 1, o: 0},
  /* 31:  */ {i:0, j:9, w: 1, o: 0},
  /* 32:  */ {i:0, j:9, w: 0.5, o: 0},
  /* 33: ! */ {i:1, j:9, w:1, o: 0},
  /* 34: " */ {i:2, j:9, w:1, o: 0},
  /* 35: # */ {i:3, j:9, w:1, o: 0},
  /* 36: $ */ {i:4, j:9, w:1, o: 0},
  /* 37: & */ {i:5, j:9, w:1, o: 0},
  /* 38: % */ {i:6, j:9, w:1, o: 0},
  /* 39: ' */ {i:7, j:9, w:1, o: 0},
  /* 40: ( */ {i:8, j:9, w:1, o: 0},
  /* 41: ) */ {i:9, j:9, w:1, o: 0},
  /* 42: * */ {i:0, j:8, w:1, o: 0},
  /* 43: + */ {i:1, j:8, w:1, o: 0},
  /* 44: , */ {i:2, j:8, w:0.3, o: 0.3},
  /* 45: - */ {i:3, j:8, w:1, o: 0},
  /* 46: . */ {i:4, j:8, w:0.25, o: 0.3},
  /* 47: / */ {i:5, j:8, w:1, o: 0},
  /* 48: 0 */ {i:6, j:8, w:0.6, o: 0.2},
  /* 49: 1 */ {i:7, j:8, w:0.4, o: 0.2},
  /* 50: 2 */ {i:8, j:8, w:0.6, o: 0.2},
  /* 51: 3 */ {i:9, j:8, w:0.6, o: 0.2},
  /* 52: 4 */ {i:0, j:7, w:0.6, o: 0.2},
  /* 53: 5 */ {i:1, j:7, w:0.6, o: 0.2},
  /* 54: 6 */ {i:2, j:7, w:0.6, o: 0.2},
  /* 55: 7 */ {i:3, j:7, w:0.6, o: 0.2},
  /* 56: 8 */ {i:4, j:7, w:0.6, o: 0.2},
  /* 57: 9 */ {i:5, j:7, w:0.6, o: 0.2},
  /* 58: : */ {i:6, j:7, w:1, o: 0},
  /* 59: ; */ {i:7, j:7, w:1, o: 0},
  /* 60: < */ {i:8, j:7, w:1, o: 0},
  /* 61: = */ {i:9, j:7, w:1, o: 0},
  /* 62: > */ {i:0, j:6, w:1, o: 0},
  /* 63: ? */ {i:1, j:6, w:1, o: 0},
  /* 64: @ */ {i:2, j:6, w:1, o: 0},
  /* 65: A */ {i:3, j:6, w:1, o: 0},
  /* 66: B */ {i:4, j:6, w:1, o: 0},
  /* 67: C */ {i:5, j:6, w:1, o: 0},
  /* 68: D */ {i:6, j:6, w:1, o: 0},
  /* 69: E */ {i:7, j:6, w:1, o: 0},
  /* 70: F */ {i:8, j:6, w:1, o: 0},
  /* 71: G */ {i:9, j:6, w:1, o: 0},
  /* 72: H */ {i:0, j:5, w:1, o: 0},
  /* 73: I */ {i:1, j:5, w:1, o: 0},
  /* 74: J */ {i:2, j:5, w:1, o: 0},
  /* 75: K */ {i:3, j:5, w:1, o: 0},
  /* 76: L */ {i:4, j:5, w:1, o: 0},
  /* 77: M */ {i:5, j:5, w:1, o: 0},
  /* 78: N */ {i:6, j:5, w:1, o: 0},
  /* 79: O */ {i:7, j:5, w:1, o: 0},
  /* 80: P */ {i:8, j:5, w:1, o: 0},
  /* 81: Q */ {i:9, j:5, w:1, o: 0},
  /* 82: R */ {i:0, j:4, w:1, o: 0},
  /* 83: S */ {i:1, j:4, w:1, o: 0},
  /* 84: T */ {i:2, j:4, w:1, o: 0},
  /* 85: U */ {i:3, j:4, w:1, o: 0},
  /* 86: V */ {i:4, j:4, w:1, o: 0},
  /* 87: W */ {i:5, j:4, w:1, o: 0},
  /* 88: X */ {i:6, j:4, w:1, o: 0},
  /* 89: Y */ {i:7, j:4, w:1, o: 0},
  /* 90: Z */ {i:8, j:4, w:1, o: 0},
  /* 91: [ */ {i:9, j:4, w:1, o: 0},
  /* 92: \ */ {i:0, j:3, w:1, o: 0},
  /* 93: [ */ {i:1, j:3, w:1, o: 0},
  /* 94: ^ */ {i:2, j:3, w:1, o: 0},
  /* 95: _ */ {i:3, j:3, w:1, o: 0},
  /* 96: ` */ {i:4, j:3, w:1, o: 0},
  /* 97: a */ {i:5, j:3, w:0.7, o: 0},
  /* 98: b */ {i:6, j:3, w:0.7, o: 0},
  /* 99: c */ {i:7, j:3, w:0.7, o: 0},
  /*100: d */ {i:8, j:3, w:0.7, o: 0},
  /*101: e */ {i:9, j:3, w:0.7, o: 0},
  /*102: f */ {i:0, j:2, w:0.5, o: 0.2},
  /*103: g */ {i:1, j:2, w:0.7, o: 0},
  /*104: h */ {i:2, j:2, w:0.7, o: 0},
  /*105: i */ {i:3, j:2, w:0.3, o: 0.25},
  /*106: j */ {i:4, j:2, w:0.4, o: 0.2},
  /*107: k */ {i:5, j:2, w:0.7, o: 0},
  /*108: l */ {i:6, j:2, w:0.3, o: 0.3},
  /*109: m */ {i:7, j:2, w:0.8, o: 0},
  /*110: n */ {i:8, j:2, w:0.7, o: 0},
  /*111: o */ {i:9, j:2, w:0.7, o: 0},
  /*112: p */ {i:0, j:1, w:0.75, o: 0.1},
  /*113: q */ {i:1, j:1, w:0.7, o: 0},
  /*114: r */ {i:2, j:1, w:0.5, o: 0.2},
  /*115: s */ {i:3, j:1, w:0.7, o: 0},
  /*116: t */ {i:4, j:1, w:0.5, o: 0.2},
  /*117: u */ {i:5, j:1, w:0.7, o: 0},
  /*118: v */ {i:6, j:1, w:0.7, o: 0},
  /*119: w */ {i:7, j:1, w:0.8, o: 0},
  /*120: x */ {i:8, j:1, w:0.7, o: 0},
  /*121: y */ {i:9, j:1, w:0.7, o: 0},
  /*122: z */ {i:0, j:0, w:0.7, o: 0},
  /*123: { */ {i:1, j:0, w:1, o: 0},
  /*124: | */ {i:2, j:0, w:1, o: 0},
  /*125: } */ {i:3, j:0, w:1, o: 0},
  /*126: ~ */ {i:4, j:0, w:1, o: 0},
  /*127:   */ {i:5, j:9, w:1, o: 0},
];

ThreeText.TEXTURE = new THREE.TextureLoader().load( FONT_PNG );

ThreeText.TEXTURE_ROWS = 10;
ThreeText.TEXTURE_COLS = 10;

export default ThreeText;
