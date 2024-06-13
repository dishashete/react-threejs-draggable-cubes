import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { Box, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const CubeMesh = ({ position }) => {
  const mesh = useRef();
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"orange"} />
    </mesh>
  );
};

const CanvasArea = () => {
  const [droppedCubes, setDroppedCubes] = useState([]);

  const [, drop] = useDrop(() => ({
    accept: "CUBE",
    drop: (item, monitor) => {
      const delta = monitor.getClientOffset();
      const x = (delta.x / window.innerWidth) * 2 - 1;
      const y = -(delta.y / window.innerHeight) * 2 + 1;

      const vector = new THREE.Vector3(x, y, 0.5);
      vector.unproject(
        new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        )
      );
      const dir = vector.sub(new THREE.Vector3(0, 0, 0)).normalize();
      const distance = -new THREE.Vector3(0, 0, 0).z / dir.z;
      const pos = new THREE.Vector3()
        .copy(new THREE.Vector3(0, 0, 0))
        .add(dir.multiplyScalar(distance));

      setDroppedCubes((cubes) => [
        ...cubes,
        { id: item.id, position: [pos.x, pos.y, pos.z] },
      ]);
    },
  }));

  return (
    <div ref={drop} style={{ flex: 1, backgroundColor: "#e0e0e0" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        {droppedCubes.map((cube, index) => (
          <CubeMesh key={index} position={cube.position} />
        ))}
      </Canvas>
    </div>
  );
};

export default CanvasArea;
