import React from 'react';
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

function Tube(props) {
  const { curve } = props;
  const brainMat = React.useRef();

  useFrame(({ clock }) => {
    brainMat.current.uniforms.time.value = clock.getElapsedTime();
  });

  const BrainMaterial = shaderMaterial(
    { time: 0, color: new THREE.Color(0.1, 0.3, 0.6) },
    // vertex shader
    /*glsl*/ `
    varying vec2 vUv;
    uniform float time;
    varying float vProgress;
    void main() {
      vUv = uv;
      vProgress = smoothstep(-1., 1., sin(vUv.x*8. + time * 3.));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // fragment shader
    /*glsl*/ `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying float vProgress;
    void main() {
      float hideCorners1 = smoothstep(1., 0.9, vUv.x);
      float hideCorners2 = smoothstep(0., 0.1, vUv.x);
      vec3 finalColor = mix(color, color*0.25, vProgress);
      gl_FragColor.rgba = vec4(vec3(finalColor), 1.);
      gl_FragColor.rgba = vec4(finalColor, hideCorners1 * hideCorners2);
    }
  `,
  );

  extend({ BrainMaterial });
  return (
    <>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.001, 2, false]} />
        <brainMaterial
          ref={brainMat}
          side={THREE.DoubleSide}
          transparent={true}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

export function Tubes(props) {
  const { curves } = props;
  return (
    <>
      {curves.map((curve, index) => {
        return <Tube key={index} curve={curve} />;
      })}
    </>
  );
}
