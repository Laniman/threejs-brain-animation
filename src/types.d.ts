import { MaterialNode } from '@react-three/fiber';
import * as THREE from 'three';
import { BrainMaterial } from './brain-tubes.tsx';
import { BrainParticleMaterial } from './brain-particles.tsx';

declare module '@react-three/fiber' {
  interface ThreeElements {
    brainMaterial: MaterialNode<THREE.ShaderMaterial, typeof BrainMaterial>;
    brainParticleMaterial: MaterialNode<
      THREE.ShaderMaterial,
      typeof BrainParticleMaterial
    >;
  }
}
