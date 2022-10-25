import React from 'react';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Vector3 } from 'three';

// import { interactor as interactorActions } from './interactor/actions';

import RenderContext from './RenderContext.js';

class FirstPersonControl extends React.Component {
  static interactionLayer = 1;
  static contextType = RenderContext; // assign the correct context 

  componentDidMount() {
    const { renderer } = this.context;
    const camera = renderer.three.camera;
    const domElement = renderer.parent;

    this.controls = new PointerLockControls( camera, domElement );

    this.controls.addEventListener( 'lock', () => {
      console.log('locked');
    });

    this.controls.addEventListener( 'unlock', () => {
      console.log('unlocked');
    });

    window.addEventListener( 'keydown', this.onKeydown.bind(this));
    window.addEventListener( 'keyup', this.onKeyup.bind(this));

    window.addEventListener( 'click', (event) => {
      if (event.srcElement.nodeName.toLowerCase() !== 'canvas') {
        return;
      }

      // please see usage hint https://discourse.threejs.org/t/unable-to-use-pointer-lock-api/11092
      // please see bug report https://discourse.threejs.org/t/three-pointerlockcontrols-unable-to-use-pointer-lock-api/18321/8
      if (!this.controls.isLocked) {
        this.controls.lock();
      }

      this.setState({
        isMoving: true,
        isInteracting: false,
      });
    });

    document.addEventListener( 'mousedown', (event) => {
      if (!this.controls.isLocked) {
        return;
      }

      if (event.button === 2) { // right mouse button
        // for cursor mode get up direction and view direction
        const upDirection = new Vector3(0, 1.0, 0);
        const viewDirection = this.controls.getDirection(new Vector3());

        // shift cursor to position in front of camera
        this.cursor.position.copy(camera.position);
        this.cursor.position.addScaledVector(viewDirection, 0.5);

        // get x axis and y axis realtive to current camera viewport
        this.cursorXDir.crossVectors(viewDirection, upDirection).normalize(); 
        this.cursorYDir.crossVectors(viewDirection, this.cursorXDir).normalize();

        /* const xAxis = new Vector3();
        const yAxis = new Vector3();
        xAxis.addVectors(this.cursor.position, this.cursorXDir);
        yAxis.addVectors(this.cursor.position, this.cursorYDir);
        this.addAxes(this.cursor.position, xAxis, yAxis); */
        this.setState({
          isMoving: false,
          isInteracting: true,
        });
      }
    });

    document.addEventListener('mouseup', (event) => {
      if (!this.controls.isLocked) {
        return;
      }

      if (event.button === 2) { // right mouse button
        this.setState({
          isMoving: true,
          isInteracting: false,
        });
      }
    });
  }

  constructor(config) {
    super(config);

    this.forward= 0;
    this.backward = 0;
    this.left = 0;
    this.right = 0;

    this.cursorXDir = new Vector3();
    this.cursorYDir = new Vector3();

    this.state = {
      isMoving: false,
      isInteracting: false,
    };
  }

  onKeydown(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if event already handled
    }

    switch(event.code) {
      case "ShiftLeft":
      case "ShiftRight":
        if (this.forward) {
          this.forward = 10;
        }
        if (this.backward) {
          this.backward = 10;
        }
        break;
      case "KeyS":
      case "ArrowDown":
        // Handle "back"
        this.backward = 1;
        break;
      case "KeyW":
      case "ArrowUp":
        // Handle "forward"
        this.forward = event.shiftKey ? 10 : 1;
        break;
      case "KeyA":
      case "ArrowLeft":
        // Handle "turn left"
        this.left = 1;
        break;
      case "KeyD":
      case "ArrowRight":
        // Handle "turn right"
        this.right = 1;
        break;
      default:;
    }
  }

  onKeyup(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if event already handled
    }
  
    switch(event.code) {
      case "KeyS":
      case "ArrowDown":
        // Handle "back"
        this.backward = 0;
        break;
      case "KeyW":
      case "ArrowUp":
        // Handle "forward"
        this.forward = 0;
        break;
      case "KeyA":
      case "ArrowLeft":
        // Handle "turn left"
        this.left = 0;
        break;
      case "KeyD":
      case "ArrowRight":
        // Handle "turn right"
        this.right = 0;
        break;
      default:;
    }
  }

  render() {
    return null;
  }
}

export default FirstPersonControl;
