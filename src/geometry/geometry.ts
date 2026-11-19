import * as THREE from 'three';
import {
  createParametricSurface,
  rippleSurface, 
  mobiusSurface
} from './parametric';

/** The fun place: invent shapes and edit their mathematical deformations here. */
export type ShapeName = 'knot' | 'sphere' | 'icosahedron' | 'cube' | 'ripple' | 'mobius';

export function createShape(shape: ShapeName): THREE.BufferGeometry {
  switch (shape) {
    case 'sphere': return new THREE.SphereGeometry(1.3, 72, 48);
    case 'icosahedron': return new THREE.IcosahedronGeometry(1.35, 3);
    case 'cube': return new THREE.BoxGeometry(1.85, 1.85, 1.85, 24, 24, 24);
    case 'knot': return new THREE.TorusKnotGeometry(0.94, 0.32, 240, 20, 2, 3);
    case 'ripple': return createParametricSurface(rippleSurface, 100);
    case 'mobius': return createParametricSurface(mobiusSurface, 100);
  }
}

export class DeformableShape {
  readonly geometry: THREE.BufferGeometry;
  private readonly originalPositions: Float32Array;
  private readonly originalNormals: Float32Array;
  private readonly useRadialDisplacement: boolean;
  private readonly shape: ShapeName;

  constructor(shape: ShapeName) {
    this.geometry = createShape(shape);
    this.shape = shape;
    // BoxGeometry has separate vertices/normals for each face. Using those
    // normals for displacement tears the shared edges apart.
    this.useRadialDisplacement = shape === 'cube' || shape === 'icosahedron' || shape === 'mobius';
    const position = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const normal = this.geometry.getAttribute('normal') as THREE.BufferAttribute;
    this.originalPositions = new Float32Array(position.array);
    this.originalNormals = new Float32Array(normal.array);
  }


  /**
   * Refresh the base geometry of a parametric surface.
   * Existing twist/wobble deformations will then operate
   * on the newly generated vertices.
   */
  updateParametricSurface(
    fn: (u: number, v: number) => THREE.Vector3,
    resolution = 100
  ): void {
    const size = resolution + 1;

    if (this.originalPositions.length !== size * size * 3) {
      throw new Error('Parametric resolution does not match geometry');
    }

    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const u = i / resolution;
        const v = j / resolution;

        const point = fn(u, v);
        const index = (i * size + j) * 3;

        this.originalPositions[index] = point.x;
        this.originalPositions[index + 1] = point.y;
        this.originalPositions[index + 2] = point.z;
      }
    }

    // Refresh normals on the undeformed surface.
    const position = this.geometry.getAttribute(
      'position'
    ) as THREE.BufferAttribute;

    (position.array as Float32Array).set(
      this.originalPositions
    );

    position.needsUpdate = true;
    this.geometry.computeVertexNormals();

    const normals = this.geometry.getAttribute(
      'normal'
    ) as THREE.BufferAttribute;

    this.originalNormals.set(normals.array);
    this.geometry.computeBoundingSphere();
  }


  /** Apply each frame to the original vertices so changes never accumulate. */
  update(twist: number, wobble: number, time: number): void {
    const attribute = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const dst = attribute.array as Float32Array;
    const src = this.originalPositions;
    const normals = this.originalNormals;
    for (let i = 0; i < src.length; i += 3) {
      const x = src[i], y = src[i + 1], z = src[i + 2];
      const angle = twist * y;
      const sin = Math.sin(angle), cos = Math.cos(angle);
      const wave = Math.sin(x * 3.4 + y * 2.1 + time * 1.6) *
                   Math.cos(z * 3.1 - y * 1.7 - time * 1.1);
      const displacement = wobble * wave;
      // Coincident vertices must receive identical displacements, even when
      // their face normals differ (e.g. across the seams of BoxGeometry).
      const length = Math.hypot(x, y, z) || 1;
      const nx = this.useRadialDisplacement ? x / length : normals[i];
      const ny = this.useRadialDisplacement ? y / length : normals[i + 1];
      const nz = this.useRadialDisplacement ? z / length : normals[i + 2];
      const xx = x + nx * displacement;
      const yy = y + ny * displacement;
      const zz = z + nz * displacement;
      dst[i] = xx * cos - zz * sin;
      dst[i + 1] = yy;
      dst[i + 2] = xx * sin + zz * cos;
    }
    if (this.shape === 'mobius') {
      const resolution = 100; 
      const rowSize = resolution + 1;

      for (let j = 0; j <= resolution; j++) {
        const first = j * 3; 
        const last = (resolution * rowSize + (resolution - j)) * 3; 

        dst[last] = dst[first];
        dst[last+1] = dst[first+1];
        dst[last+2] = dst[first+2]; 
      }
    }
    attribute.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();


    if (this.shape === 'mobius') {
      const resolution = 100;
      const rowSize = resolution + 1;

      const normals = this.geometry.getAttribute(
        'normal'
      ) as THREE.BufferAttribute;

      for (let j = 0; j <= resolution; j++) {
        const first = j;
        const last =
          resolution * rowSize + (resolution - j);

        const a = new THREE.Vector3(
          normals.getX(first),
          normals.getY(first),
          normals.getZ(first)
        );

        const b = new THREE.Vector3(
          normals.getX(last),
          normals.getY(last),
          normals.getZ(last)
        );

        // On a Möbius strip, the orientation reverses
        // when we cross the seam.
        b.negate();

        const average = a.add(b).normalize();

        normals.setXYZ(
          first,
          average.x,
          average.y,
          average.z
        );

        normals.setXYZ(
          last,
          -average.x,
          -average.y,
          -average.z
        );
      }

      normals.needsUpdate = true;
    }

  }

  get vertexCount(): number {
    return this.geometry.getAttribute('position').count;
  }

  dispose(): void { this.geometry.dispose(); }
}
