import {
  Group,
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
} from 'three';

const personMesh = new Group();
const portraitMaterial = new MeshBasicMaterial({ name: 'personMeshPortrait' });
const portraitMesh = new Mesh(new BoxGeometry(), portraitMaterial);
const baseMaterial = new MeshBasicMaterial({ name: 'personMeshBase' });
const baseMesh = new Mesh(new BoxGeometry(), baseMaterial);
personMesh.add(portraitMesh);
personMesh.add(baseMesh);
personMesh.userData.refId = '1';

export default {
  getPerson: () => personMesh,
};
