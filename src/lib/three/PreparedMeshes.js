import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getBaseUrl } from '../Connect';

const gltfLoader = new GLTFLoader();
let marriage = null;
let personMesh = null;
let navigationArrow = null;

const navigationMeshPromise = new Promise((resolve, reject) => {
  if (navigationArrow) {
    resolve(navigationArrow);
    return;
  }
  gltfLoader.load(`${getBaseUrl()}public/models/navigationArrow.gltf`, (gltf) => {
    navigationArrow = gltf.scene.children[0];
    resolve(navigationArrow);
  });
});

const personMeshPromise = new Promise((resolve, reject) => {
  if (personMesh) {
    resolve(personMesh);
    return;
  }
  gltfLoader.load(`${getBaseUrl()}public/models/personMesh.gltf`, (gltf) => {
    personMesh = gltf.scene.children[0];
    resolve(personMesh);
  });
});

const marriageMeshPromise = new Promise((resolve, reject) => {
  if (marriage) {
    resolve(marriage);
    return;
  }
  gltfLoader.load(`${getBaseUrl()}public/models/marriage.gltf`, (gltf) => {
    marriage = gltf.scene.children[0];
    resolve(marriage);
  });  
});

export default {
  getPerson: () => personMeshPromise,
  getPlaceholder: () => personMeshPromise,
  getNavigationArrow: () => navigationMeshPromise,
  getMarriageSymbol: () => marriageMeshPromise,
};
