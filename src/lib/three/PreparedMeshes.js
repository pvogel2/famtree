import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getBaseUrl } from '../Connect';


const gltfLoader = new GLTFLoader();

let personMesh;
let navigationMesh;

gltfLoader.load(`${getBaseUrl()}public/models/personMesh.gltf`, (gltf) => {
  personMesh = gltf.scene.children[0];
});

gltfLoader.load(`${getBaseUrl()}public/models/navigationArrow.gltf`, (gltf) => {
  navigationMesh = gltf.scene.children[0];
});

export default {
  getPerson: () => personMesh,
  getNavigationArrow: () => navigationMesh,
};
