import { Vector2 ,Vector3, Color, Frustum, Scene, WebGLRenderer, OrthographicCamera,
  PerspectiveCamera,
  Raycaster,
  Clock,
  LoadingManager,
  TextureLoader,
  ObjectLoader,
  AmbientLight,
  Matrix4,
  BufferGeometry,
  ShaderMaterial,
  BufferAttribute,
  LineSegments,
  GridHelper,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import ThreeText3D from './three/Text3D';
export class Renderer {
  constructor(config = {}) {
    this.stats = null;
    this.running = false;
    this.paused = false;
    this.three = {
      szene : null,
      renderer : null,
      camera : null,
      control : null,
      raycaster : null,
      clock : null
    };

    this.geometry = {
      objects : {},
      intersect : []
    };

    // stuff for intersection detection
    this.mouse = new Vector2();
    this.frustum = new Frustum();
    this.INTERSECTED = [];
    this.callbacks = {
      "render": [],
      "move": [],
      "keydown": [],
      "click": [],
      "mousemove": []
    };
    this._lastEvent = null; // cache last mouse move event for transition end updates
    // stuff for resource handling
    this.res = "/obj/";

    // setup the three szene
    this.parent = document.querySelector( config.parentSelector ? config.parentSelector : "#threejs-container" );
    if (!this.parent) {
      console.log('could not find parent, exit here');
      return;
    }
    this.three.scene = new Scene();
    this._calcDimensions();

    // setup the used three renderer
    this.three.renderer = new WebGLRenderer({antialias: true});
    this.three.renderer.setSize( this.width, this.height );


    if (config.cameraType === 'orhtogonal') {
      this.three.camera = new OrthographicCamera(
        this.width / -2, this.width / 2,
        this.height / 2, this.height / -2,
        config.cameraNear ? config.cameraNear : 0.1,
        config.cameraFar ? config.cameraFar : 2000
      );
      this.three.camera.position.z = 5;
    } else {
      this.three.renderer.shadowMap.enabled = true;

      this.three.camera = new PerspectiveCamera( config.fov ? config.fov: 75, this.width / this.height, config.cameraNear ? config.cameraNear : 0.1, config.cameraFar ? config.cameraFar : 2000 );
      if (config.position) {
        this.three.camera.position.set(config.position.x, config.position.y, config.position.z);
      } else {
        this.three.camera.position.set(0, 15, 40);
      }

      if (config.target) {
        this.three.camera.lookAt(config.target.x, config.target.y, config.target.z);
      } else {
        this.three.camera.lookAt(0, 0, 0);
      }

      if (config.control) {
        this.three.control = new OrbitControls(this.three.camera, this.three.renderer.domElement);
        this.three.control.userPanSpeed = 0.2;
      }
    }

    // initialize object to perform world/screen
    // calculations

    this.three.raycaster = new Raycaster()
    this.three.raycaster.params.Points.threshold = 1;

    this.three.clock = new Clock();
    this.three.loadingmanager = new LoadingManager();
    this.three.textureLoader = new TextureLoader( this.three.loadingmanager );
    this.three.objloader = new ObjectLoader( this.three.loadingmanager );

    this.parent.append( this.three.renderer.domElement );

    this.three.renderer.domElement.addEventListener("click", function(event) {
      this.onContainerClick(event);
    }.bind(this));
    this.three.renderer.domElement.addEventListener("mousemove", function(event) {
      this.onContainerMousemove(event);
    }.bind(this));

    window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
    window.addEventListener( 'keydown', this.onKeydown.bind(this), false );
  }

  _calcDimensions() {
    const rect = this.parent.getBoundingClientRect();

    this.width = rect.width;
    this.height = rect.height;
    this.left = rect.left;
    this.top = rect.top;
  }

  onWindowResize() {
    this._calcDimensions();
    this.three.renderer.setSize( this.width, this.height );
    this.three.camera.aspect = this.width / this.height;
    this.three.camera.updateProjectionMatrix();
  }

  onKeydown(event) {
    // disable trigger on user interaction due to data input
    if (event.target !== 'body') {
      return;
    }
    if (event.keyCode === 80) { // pP
      this.paused ? this.continu() : this.pause();
    }
    this.callbacks["keydown"].forEach(listener => {
      listener(event, this.INTERSECTED);
    });
  }

  onContainerClick(event) {
    event.preventDefault();
    this._setIntersection(event);

    this.callbacks["click"].forEach(listener => {
      if (listener.handleEvent) {
        listener.handleEvent(event);
      } else {
        listener(event, this.INTERSECTED);
      }
    });
  }

  onContainerMousemove(event) {
    this._lastEvent = event;
    event.preventDefault();
    this._setIntersection(event);

    this.callbacks["mousemove"].forEach(listener => {
      listener.handleEvent(event);
    });

    this.callbacks["move"].forEach(listener => {
      listener(event, this.INTERSECTED);
    });
  }

  frame() {
    this._setupLights(); 
    this.three.renderer.render(this.three.scene, this.three.camera);
  }

  start() {
    if (this.stats) {
      this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+:
      // custom
      this.parent.appendChild( this.stats.dom );
    }
    this._setupLights();
    this.paused = false;
    this.running = true;
    this._render();
  }
  // continue is a reserved word in javascript
  continu() {
    this.paused = false;
    this.three.clock.start();
    this._render();
  }

  pause() {
    this.paused = true;
    this.three.clock.stop();
  }
  stop() {
    this.running = false;
    this.three.clock.stop();
  }

  get intersections() {
    return this.INTERSECTED;
  }

  _setIntersection(event){
    this._calcDimensions();

    this.mouse.x = ( (event.clientX - this.left) / this.width ) * 2 - 1;
    this.mouse.y = - ( (event.clientY - this.top) / this.height ) * 2 + 1;
    // console.log(event.clientX, event.clientY, scrollLeft, scrollTop, this.mouse.x, this.mouse.y);

    this.three.raycaster.setFromCamera( this.mouse, this.three.camera );

    // calculate objects intersecting the picking ray
    this.INTERSECTED = this.three.raycaster.intersectObjects( this.geometry.intersect );
  }

  getTexture(path) {
    return this.three.textureLoader.load( path );
  }

  showObject(ids, visible) {
    if (!Object.prototype.toString.call( ids ) === '[object Array]'){
      ids = [ids];
    }
    for (var i = 0; i < ids.length; i++){
      var id = ids[i];
      if (this.geometry.objects[id]) {
        this.geometry.objects[id].visible = !!visible;
      } else {
        console.log("showObject: Object with id " + id + " not found.");
      }
    }
  }

  getObject(id) {
    if (this.geometry.objects[id]) {
      return this.geometry.objects[id];
    } else {
      console.log("getObject: Object with id " + id + " not found.");
      return null;
    }
  }

  hasObject(id) {
    return !!this.geometry.objects[id];
  }

  addObject(id, obj, intersect, parent) {
    if (this.geometry.objects[id]) {
      console.warn("Found object id '" + id +"' , not adding data.");
      return false;
    }

    this.geometry.objects[id] = {
      obj: obj,
      parent: parent ? parent : this.three.scene,
      intersect: !!intersect
    }

    this.geometry.objects[id].parent.add( obj );
    if (intersect) {
      this.geometry.intersect.push(obj);
    }
    return true;
  }

  removeObject(id) {
    if (!this.geometry.objects[id]) {
      console.warn("Can not find object id '" + id +"' , not removing data.");
      return false;
    }

    const data = this.geometry.objects[id];
    data.parent.remove(data.obj);
    delete this.geometry.objects[id];

    const idx = this.geometry.intersect.findIndex((o) => o.uuid === data.obj.uuid);
    if (idx > -1) {
      this.geometry.intersect.splice(idx, 1);
    }
    return true;
  }

  _setupLights() {
    if (!this.setupLightsDone) {
      const ambientLight = new AmbientLight( 0x333333 ); // soft white
      // light
      this.three.scene.add( ambientLight );
      this.setupLightsDone = true;
    }
  }

  _updateIntersection(){
    this.INTERSECTED = [];
  }

  _updateObjects(){
  }

  _render(){
    if (this.running && !this.paused) {
      requestAnimationFrame(this._render.bind(this));
      this.three.renderer.render(this.three.scene, this.three.camera);
      this.update();
    }
  }

  transition(v, time, p) {
    if (this.transitioning) return;
    this.transitionVector = v.clone();
    this.transitionPosition = p ? p.clone() : null;
    this.transitionTime = Math.max(time, 0.1);
    this.transitionStart = this.three.clock.getElapsedTime();
    this.transitioning = true;
  }

  _transitionUpdate(){
    if (!this.transitioning) return;
    var alpha = Math.min((this.three.clock.getElapsedTime() - this.transitionStart)/this.transitionTime, 1.0);
    if (alpha >= 1.0) {
      this.transitioning = false;
      if (this.three.control) this.three.control.target.copy(this.transitionVector);
      if (this.transitionPosition) this.three.camera.position.copy(this.transitionPosition);
      if (this._lastEvent) this.three.renderer.domElement.dispatchEvent(this._lastEvent);
    } else if (this.three.control) {
      if (this.transitionPosition) this.three.camera.position.lerp(this.transitionPosition,alpha);
      this.three.control.target.lerp(this.transitionVector, alpha);
    }
  }

  update() {
    if (this.stats) this.stats.begin();
    if (this.three.control) this.three.control.update();

    this.frustum.setFromProjectionMatrix(
      new Matrix4().multiplyMatrices(
        this.three.camera.projectionMatrix,
        this.three.camera.matrixWorldInverse
      )
    );

    const data = {
      type: 'render',
      canvasWidth: this.three.renderer.getContext().canvas.width,
      canvasHeight: this.three.renderer.getContext().canvas.height,
      deltaTime: this.three.clock.getDelta(),
      elapsedTime: this.three.clock.getElapsedTime(),
    };

    this.callbacks["render"].forEach(listener => {
      listener.handleEvent ? listener.handleEvent(data) : listener(data);
      
    });
    this._updateObjects();
    this._transitionUpdate();
    if (this.stats) this.stats.end();
  }

  registerEventCallback(type, listener) {
    if (!this.callbacks[type]) {
      return;
    }
    this.callbacks[type].push(listener);
  }

  unregisterEventCallback(type, listener) {
    if (!this.callbacks[type]) {
      return;
    }
    const index = this.callbacks[type].findIndex(registered => registered === listener);
    if (index > -1) {
      this.callbacks[type].splice(index, 1);
    }
  }

  addAxes(size = 1) {
    var a_geometry = new BufferGeometry();
    var a_material = new ShaderMaterial({
      vertexColors: true,
      vertexShader : 'varying vec4 axColor;void main() {\n\taxColor = vec4( color, 1.0 );gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}',
      fragmentShader : 'varying vec4 axColor;void main() {\n\tgl_FragColor = axColor;\n}'
    });

    const positions = [];
    const colors = [];

    const vrts = [
      new Vector3(0,0,0), new Vector3(size,0,0),
      new Vector3(0,0,0), new Vector3(0,size,0),
      new Vector3(0,0,0), new Vector3(0,0,size),
    ];
 
    const clrs = [
      new Color( 1, 0, 0), new Color( 1, 0, 0),
      new Color( 0, 1, 0),new Color( 0, 1, 0),
      new Color( 0, 0, 1), new Color( 0, 0, 1),

    ];
    
    const labels = ['x', 'y', 'z'];

    for (let i = 0; i < vrts.length; i++) {
      positions.push(vrts[i].x); positions.push(vrts[i].y); positions.push(vrts[i].z);
      colors.push(clrs[i].r); colors.push(clrs[i].g); colors.push(clrs[i].b);
    }
    a_geometry.setAttribute( 'position', new BufferAttribute( new Float32Array( positions ), 3 ) );
    a_geometry.setAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 3 ) );

    const axes = new LineSegments( a_geometry, a_material);
    this.addObject("axes", axes);

    for (let i = 0; i < labels.length; i++) {
      const p = vrts[i*2 + 1].clone().multiplyScalar(1.1);

      new ThreeText3D({
        text: labels[i],
        position: p,
        color: clrs[i*2 + 1],
        id: `axesLabel${labels[i]}`,
        scale: 2,
      }).attach(null, axes);;
    }
  }

  /* add base grid */
  addGrid(size = 1, dimension) {
    var gridHelper = new GridHelper( size, dimension, new Color( 0x111122 ), new Color( 0x222244 ) );

    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;

    this.addObject("grid", gridHelper);
    return gridHelper;
  }

  projectVisible(point) {
    var vector = new Vector3(point[0],point[1],point[2]);
    if(this.frustum.containsPoint( vector )){
      return vector.project(this.three.camera);
    }
    return null;
  }

  createBufferedGeometry() {
    return new BufferGeometry();
  }

  createOneDimGraphicArray(length) {
    return new Float32Array( length );
  }

  createThreeDimGraphicArray(length) {
    return new Float32Array( 3* length );
  }
};
