import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { getBaseUrl } from '../Connect';


const gltfLoader = new GLTFLoader();

let personMesh;

gltfLoader.load(`${getBaseUrl()}public/models/personMesh.gltf`, (gltf) => {
  personMesh = gltf.scene.children[0];
});

export default {
  getPerson: () => personMesh,
};
