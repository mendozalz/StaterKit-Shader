import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Global variables
let currentRef = null;

// Scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
scene.add(camera);
camera.position.set(5, 5, 5);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// OrbitControls
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.25;

// Resize canvas
const resize = () => {
  if (currentRef) {
    renderer.setSize(currentRef.clientWidth, currentRef.clientHeight);
    camera.aspect = currentRef.clientWidth / currentRef.clientHeight;
    camera.updateProjectionMatrix();
  }
};
window.addEventListener("resize", resize);

// Shader
const planeMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,

  vertexShader: `
    void main() {
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `,
});

const planeGeometry = new THREE.PlaneGeometry(5, 2, 100, 100);

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI * 0.5
scene.add(plane)

// Animate the scene
const animate = () => {
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
animate();

// Axes Helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Grid Helper
const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// Init and mount the scene
export const initScene = (mountRef) => {
  currentRef = mountRef.current;
  resize();
  currentRef.appendChild(renderer.domElement);
};

// Dismount and clean up the buffer from the scene
export const cleanUpScene = () => {
  // Recorrer todos los objetos dentro del scene y limpiar recursos
  scene.traverse((object) => {
    if (object.isMesh) {
      // Eliminar la geometría
      if (object.geometry) {
        object.geometry.dispose();
      }
      // Eliminar el material
      if (object.material) {
        // Materiales pueden ser un array (en caso de materiales multi-material)
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  });

  // Limpiar texturas del renderer
  renderer.dispose();

  // Eliminar el canvas del DOM
  if (currentRef) {
    currentRef.removeChild(renderer.domElement);
  }
};
