import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Tubes } from './BrainTubes';
import { BrainParticles } from './BrainParticles';
import { data } from './data';
import { randomRange } from './utils';

const PATHS = data.economics[0].paths;

const curves: THREE.CatmullRomCurve3[] = [];
for (let i = 0; i < 100; i++) {
  const points: THREE.Vector3[] = [];
  const length = randomRange(0.5, 1);
  for (let j = 0; j < 100; j++) {
    points.push(
      new THREE.Vector3().setFromSphericalCoords(
        1,
        Math.PI - (j / 100) * Math.PI * length,
        (i / 100) * Math.PI * 2,
      ),
    );
  }
  const tempCurve = new THREE.CatmullRomCurve3(points);
  curves.push(tempCurve);
}

const brainCurves: THREE.CatmullRomCurve3[] = [];
PATHS.forEach(path => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < path.length; i += 3) {
    points.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
  }
  const tempCurve = new THREE.CatmullRomCurve3(points);
  brainCurves.push(tempCurve);
});

function App() {
  return (
    <Canvas camera={{ position: [0, 0, 0.3], near: 0.001, far: 5 }}>
      <color attach="background" args={['black']} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Tubes curves={brainCurves} />
      <BrainParticles curves={brainCurves} />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
