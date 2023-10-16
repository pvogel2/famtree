import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getBaseUrl } from '../Connect';


const gltfLoader = new GLTFLoader();

const navigationMeshPromise = new Promise((resolve, reject) => {
  gltfLoader.load(`${getBaseUrl()}public/models/navigationArrow.gltf`, (gltf) => {
    resolve(gltf.scene.children[0]);
  });
});

const personMeshPromise = new Promise((resolve, reject) => {
  gltfLoader.load(`${getBaseUrl()}public/models/personMesh.gltf`, (gltf) => {
    resolve(gltf.scene.children[0]);
  });  
});

export default {
  getPerson: () => personMeshPromise,
  getPlaceholder: () => personMeshPromise,
  getNavigationArrow: () => navigationMeshPromise,
};
