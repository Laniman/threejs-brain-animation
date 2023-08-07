import React from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Tubes } from './BrainTubes';
import { data } from './data';

const PATHS = data.economics[0].paths;

const randomRange = (min, max) => Math.random() * (max - min) + min;

const curves = [];
for (let i = 0; i < 100; i++) {
  const points = [];
  let length = randomRange(0.5, 1);
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

const brainCurves = [];
PATHS.forEach(path => {
  const points = [];
  for (let i = 0; i < path.length; i += 3) {
    points.push(new THREE.Vector3(path[i], path[i + 1], path[i + 2]));
  }
  const tempCurve = new THREE.CatmullRomCurve3(points);
  brainCurves.push(tempCurve);
});

function BrainParticles(props) {
  const { curves } = props;
  const density = 10;
  const numberOfPoints = density * curves.length;
  const myPoints = React.useRef([]);
  const brainGeo = React.useRef();

  const positions = React.useMemo(() => {
    const positions = [];

    for (let i = 0; i < numberOfPoints; i++) {
      positions.push(
        randomRange(-1, 1),
        randomRange(-1, 1),
        randomRange(-1, 1),
      );
    }

    return new Float32Array(positions);
  }, []);

  const randoms = React.useMemo(() => {
    const randoms = [];

    for (let i = 0; i < numberOfPoints; i++) {
      randoms.push(randomRange(0.3, 1));
    }

    return new Float32Array(randoms);
  }, []);

  React.useEffect(() => {
    for (let i = 0; i < curves.length; i++) {
      for (let j = 0; j < density; j++) {
        myPoints.current.push({
          currentOffset: Math.random(),
          speed: Math.random() * 0.01,
          curve: curves[i],
          curPosition: Math.random(),
        });
      }
    }
  });

  useFrame(() => {
    const curpositions = brainGeo.current.attributes.position.array;

    for (let i = 0; i < myPoints.current.length; i++) {
      myPoints.current[i].curPosition += myPoints.current[i].speed;
      myPoints.current[i].curPosition = myPoints.current[i].curPosition % 1;

      const curPosition = myPoints.current[i].curve.getPointAt(
        myPoints.current[i].curPosition,
      );
      curpositions[i * 3] = curPosition.x;
      curpositions[i * 3 + 1] = curPosition.y;
      curpositions[i * 3 + 2] = curPosition.z;
    }

    brainGeo.current.attributes.position.needsUpdate = true;
  });

  const BrainParticleMaterial = shaderMaterial(
    { time: 0, color: new THREE.Color(0.1, 0.3, 0.6) },
    // vertex shader
    /*glsl*/ `
    varying vec2 vUv;
    uniform float time;
    varying float vProgress;
    attribute float randoms;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = randoms * 2. * (1. / -mvPosition.z);
    }
  `,
    // fragment shader
    /*glsl*/ `
    uniform float time;
    void main() {
      float disc = length(gl_PointCoord.xy - vec2(0.5));
      float opacity = 0.3 * smoothstep(0.5, 0.4, disc);
      gl_FragColor = vec4(vec3(opacity), 1.);
    }
  `,
  );

  extend({ BrainParticleMaterial });

  return (
    <>
      <points>
        <bufferGeometry attach="geometry" ref={brainGeo}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-randoms"
            count={randoms.length}
            array={randoms}
            itemSize={1}
          />
        </bufferGeometry>
        <brainParticleMaterial
          attach="material"
          depthTest={false}
          depthWrite={false}
          transparent={true}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

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
