import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DeformableShape, type ShapeName } from './geometry';
import { createMaterial, type MaterialName } from './materials';
import {
  rippleParameters,
  rippleSurface
} from './parametric';
import './style.css';

const viewport = document.querySelector<HTMLDivElement>('#viewport')!;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
camera.position.set(0, 1.1, 6.7);
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
viewport.appendChild(renderer.domElement);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = .06;
orbit.minDistance = 3.2;
orbit.maxDistance = 11;
orbit.enablePan = false;

const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
const environment = pmrem.fromScene(room, .04).texture;
room.dispose();
pmrem.dispose();

const keyLight = new THREE.DirectionalLight('#fff4dd', 3.5);
keyLight.position.set(2.5, 5, 5);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight('#b3dcdb', 2.0);
fillLight.position.set(-4, -1, 2);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight('#ffc5ad', 3.0);
rimLight.position.set(1, 2, -4);
scene.add(rimLight);
scene.add(new THREE.AmbientLight('#ffffff', .25));

const state = {shape: 'knot' as ShapeName, material: 'clay' as MaterialName, twist: .45, wobble: .14, speed: .18, light: 1.25, animate: true};
let model = new DeformableShape(state.shape);
let material = createMaterial(state.material, environment);
const mesh = new THREE.Mesh(model.geometry, material);

function updateMaterialSide(): void {
  const isOpenSurface =
    state.shape === 'mobius' ||
    state.shape === 'ripple';

  material.side = isOpenSurface
    ? THREE.DoubleSide
    : THREE.FrontSide;

  material.needsUpdate = true;
}

material.side = THREE.DoubleSide;
scene.add(mesh);

const amplitudeSlider =
  document.querySelector<HTMLInputElement>(
    '#ripple-amplitude'
  );

amplitudeSlider?.addEventListener('input', () => {
  rippleParameters.amplitude = Number(amplitudeSlider.value);

  if (state.shape === 'ripple') {
    model.updateParametricSurface(rippleSurface);
  }
});

const frequencySlider =
  document.querySelector<HTMLInputElement>(
    '#ripple-frequency'
  );

frequencySlider?.addEventListener('input', () => {
  rippleParameters.frequency = Number(frequencySlider.value);

  if (state.shape === 'ripple') {
    model.updateParametricSurface(rippleSurface);
  }
});

const shapeLabels: Record<ShapeName, string> = {
  knot: 'TORUS KNOT',
  sphere: 'SPHERE',
  icosahedron: 'ICOSAHEDRON',
  cube: 'CUBE',
  ripple: 'RIPPLE SURFACE', 
  mobius: 'MÖBIUS STRIP'
};
const vertexLabel = document.querySelector('#vertex-label')!;
function updateLabels() {
  document.querySelector('#object-name')!.textContent = shapeLabels[state.shape];
  vertexLabel.textContent = `${model.vertexCount.toLocaleString()} VERTICES`;
}
updateLabels();

function activate(group: string, attr: string, selected: string) {
  document.querySelectorAll<HTMLButtonElement>(`#${group} button`).forEach(button => {
    const active = button.dataset[attr] === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

document.querySelectorAll<HTMLButtonElement>('[data-shape]').forEach(button => button.addEventListener('click', () => {
  const shape = button.dataset.shape as ShapeName;
  if (shape === state.shape) return;
  state.shape = shape;
  updateMaterialSide();
  const next = new DeformableShape(shape);
  mesh.geometry = next.geometry;
  model.dispose();
  model = next;
  activate('shape-options', 'shape', shape);
  updateLabels();
}));

document.querySelectorAll<HTMLButtonElement>('[data-material]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.material as MaterialName;
  if (name === state.material) return;
  state.material = name;
  const next = createMaterial(name, environment);
  mesh.material = next;
  material.dispose();
  material = next;
  updateMaterialSide();
  activate('material-options', 'material', name);
}));

const ids = ['twist', 'wobble', 'speed', 'light'] as const;
ids.forEach(id => {
  const input = document.querySelector<HTMLInputElement>(`#${id}`)!;
  const output = document.querySelector<HTMLOutputElement>(`#${id}-value`)!;
  input.addEventListener('input', () => {
    state[id] = Number(input.value);
    output.textContent = state[id].toFixed(2);
  });
});

document.querySelector<HTMLInputElement>('#animate')!.addEventListener('change', event => {
  state.animate = (event.target as HTMLInputElement).checked;
});
function setSlider(id: typeof ids[number], value: number) {
  state[id] = value;
  document.querySelector<HTMLInputElement>(`#${id}`)!.value = String(value);
  document.querySelector<HTMLOutputElement>(`#${id}-value`)!.textContent = value.toFixed(2);
}
function setAnimated(animated: boolean) {
  state.animate = animated;
  document.querySelector<HTMLInputElement>('#animate')!.checked = animated;
}
document.querySelector('#reset-settings')!.addEventListener('click', () => {
  setSlider('twist', .45); setSlider('wobble', .14); setSlider('speed', .18); setSlider('light', 1.25); setAnimated(true);
});
document.querySelector('#randomise')!.addEventListener('click', () => {
  setSlider('twist', +(Math.random() * 4 - 2).toFixed(2));
  setSlider('wobble', +(Math.random() * .45).toFixed(2));
  setSlider('speed', +(Math.random() * .55).toFixed(2));
  setSlider('light', +(.65 + Math.random() * 1.8).toFixed(2));
});
document.querySelector('#reset-camera')!.addEventListener('click', () => {
  camera.position.set(0, 1.1, 6.7);
  orbit.target.set(0, 0, 0);
  orbit.update();
});

document.querySelector('#save-image')!.addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = `atlas-${state.shape}-${state.material}.png`;
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
});

function resize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
new ResizeObserver(resize).observe(viewport);
resize();

const clock = new THREE.Clock();
let lastElapsed = 0;
renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), .05);
  if (state.animate) lastElapsed += delta;
  model.update(state.twist, state.wobble, lastElapsed);
  if (state.animate) mesh.rotation.y += delta * state.speed;
  keyLight.intensity = 2 * state.light;
  fillLight.intensity = 0.7 * state.light;
  rimLight.intensity = 1.4 * state.light;
  orbit.update();
  renderer.render(scene, camera);
});
