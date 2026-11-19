import * as THREE from 'three';
export type MaterialName = 'clay' | 'chrome' | 'normals' | 'wire' | 'toon';

const steps = new Uint8Array([35, 110, 195, 255]);
const gradient = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
gradient.minFilter = THREE.NearestFilter;
gradient.magFilter = THREE.NearestFilter;
gradient.needsUpdate = true;

export function createMaterial(name: MaterialName, envMap: THREE.Texture): THREE.Material {
  switch (name) {
    case 'clay': return new THREE.MeshPhysicalMaterial({color: '#d17d60', roughness: .43, metalness: .05, clearcoat: .2, clearcoatRoughness: .6, envMap, envMapIntensity: .36});
    case 'chrome': return new THREE.MeshPhysicalMaterial({color: '#e2d6c0', metalness: 0.85, roughness: .13, envMap, envMapIntensity: 0.8});
    case 'normals': return new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    case 'wire': return new THREE.MeshBasicMaterial({color: '#344f4d', wireframe: true});
    case 'toon': return new THREE.MeshToonMaterial({color: '#a5b99b', gradientMap: gradient});
  }
}
