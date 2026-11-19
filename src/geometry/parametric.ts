import * as THREE from 'three';

type SurfaceFunction = (
  u: number,
  v: number
) => THREE.Vector3;

export const mobiusParameters = {
  radius: 1.0, 
  width: 0.6
}; 

export const mobiusSurface = (
  u: number,
  v: number
): THREE.Vector3 => {
  const angle = u * Math.PI * 2;
  const across = (v * 2 - 1) * mobiusParameters.width;

  const { radius } = mobiusParameters;

  const x =
    (radius + across * Math.cos(angle / 2)) *
    Math.cos(angle);

  const y =
    across * Math.sin(angle / 2);

  const z =
    (radius + across * Math.cos(angle / 2)) *
    Math.sin(angle);

  return new THREE.Vector3(x, y, z);
};

export function createParametricSurface(
  fn: SurfaceFunction,
  resolution = 60
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];

  // Sample the surface.
  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const u = i / resolution;
      const v = j / resolution;

      const point = fn(u, v);

      vertices.push(point.x, point.y, point.z);
    }
  }

  // Connect neighbouring vertices into triangles.
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j;
      const b = (i + 1) * (resolution + 1) + j;
      const c = b + 1;
      const d = a + 1;

      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export const rippleParameters = {
  amplitude: 0.3,
  frequency: 4
};

export const rippleSurface = (
  u: number,
  v: number
): THREE.Vector3 => {
  const { amplitude, frequency } = rippleParameters;

  const x = 2 * u - 1;
  const z = 2 * v - 1;

  const y =
    amplitude *
    Math.sin(frequency * Math.PI * u) *
    Math.cos(frequency * Math.PI * v);

  return new THREE.Vector3(x, y, z);
};

export function updateParametricSurface(
  geometry: THREE.BufferGeometry,
  fn: SurfaceFunction,
  resolution = 100
): void {
  const positions = geometry.getAttribute(
    'position'
  ) as THREE.BufferAttribute;

  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const u = i / resolution;
      const v = j / resolution;

      const point = fn(u, v);
      const index = i * (resolution + 1) + j;

      positions.setXYZ(index, point.x, point.y, point.z);
    }
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}