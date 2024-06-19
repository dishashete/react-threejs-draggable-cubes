import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CubeMesh, { colors } from "./CubeMesh";
import Grid from "./grid"; // Import the Grid component

const gridSize = 1; // Define the grid size

const snapToGrid = (position, size) => {
  return Math.round(position / size) * size;
};

const CanvasArea = () => {
  const [droppedCubes, setDroppedCubes] = useState([]);
  const camera = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));

  const [, drop] = useDrop(() => ({
    accept: "CUBE",
    drop: (item, monitor) => {
      const delta = monitor.getClientOffset();
      if (delta) {
        updateCubePosition(item.id, delta);
      }
    },
  }));

  const updateCubePosition = (id, delta) => {
    const x = (delta.x / window.innerWidth) * 2 - 1;
    const y = -(delta.y / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera.current);
    const dir = vector.sub(camera.current.position).normalize();
    const distance = -camera.current.position.z / dir.z;
    const pos = new THREE.Vector3().copy(camera.current.position).add(dir.multiplyScalar(distance));

    // Snap position to grid
    const snappedPos = {
      x: snapToGrid(pos.x, gridSize),
      y: snapToGrid(pos.y, gridSize),
      z: snapToGrid(pos.z, gridSize),
    };

    setDroppedCubes((cubes) => [
      ...cubes,
      {
        id,
        position: [snappedPos.x, snappedPos.y, snappedPos.z],
        colorIndex: id % colors.length,
      },
    ]);
  };

  return (
    <div ref={drop} style={{ flex: 1, backgroundColor: "#2a2a2a", width: '100vw', height: '100vh' }}>
      <Canvas
        style={{ background: "#2a2a2a" }}
        gl={{ antialias: true }}
        camera={{ position: [0, 0, 10] }}
      >
        {/* Grid Helper */}
        <Grid size={1000} divisions={1000} />

        {/* Ambient light for overall scene illumination */}
        <ambientLight intensity={0.2} color="#ffffff" />

        {/* Directional light to simulate sunlight */}
        <directionalLight
          position={[0, 10, 10]}
          intensity={0.5}
          color="#ffffff"
        />

        {/* Spot light to create focused beams of light */}
        <spotLight
          position={[0, 0, 10]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={1}
          color="#ffffff"
        />

        {/* Hemisphere light to provide soft ambient lighting */}
        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#404040"
          intensity={0.5}
        />

        <OrbitControls />
        {droppedCubes.map((cube, index) => (
          <CubeMesh
            key={index}
            id={cube.id}
            position={cube.position}
            colorIndex={cube.colorIndex}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default CanvasArea;



// import React, { useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { useDrop } from "react-dnd";
// import { OrbitControls } from "@react-three/drei";
// import * as THREE from "three";
// import CubeMesh, { colors } from "./CubeMesh"; 
// const CanvasArea = () => {
//   const [droppedCubes, setDroppedCubes] = useState([]);

//   const [, drop] = useDrop(() => ({
//     accept: "CUBE",
//     drop: (item, monitor) => {
//       const delta = monitor.getClientOffset();
//       const x = (delta.x / window.innerWidth) * 2 - 1;
//       const y = -(delta.y / window.innerHeight) * 2 + 1;

//       const vector = new THREE.Vector3(x, y, 0.5);
//       vector.unproject(
//         new THREE.PerspectiveCamera(
//           75,
//           window.innerWidth / window.innerHeight,
//           0.1,
//           1000
//         )
//       );
//       const dir = vector.sub(new THREE.Vector3(0, 0, 0)).normalize();
//       const distance = -new THREE.Vector3(0, 0, 0).z / dir.z;
//       const pos = new THREE.Vector3()
//         .copy(new THREE.Vector3(0, 0, 0))
//         .add(dir.multiplyScalar(distance));

//       setDroppedCubes((cubes) => [
//         ...cubes,
//         {
//           id: item.id,
//           position: [pos.x, pos.y, pos.z],
//           colorIndex: item.id % 6,
//         },
//       ]);
//     },
//   }));

//   return (
//     <div ref={drop} style={{ flex: 1, backgroundColor: "#2a2a2a" }}>
//       <Canvas
//         style={{ background: "#2a2a2a" }}
//         gl={{ antialias: true }}
//         camera={{ position: [0, 0, 10] }}
//       >
//         {/* Ambient light for overall scene illumination */}
//         <ambientLight intensity={0.2} color="#ffffff" />

//         {/* Directional light to simulate sunlight */}
//         <directionalLight
//           position={[0, 10, 10]}
//           intensity={0.5}
//           color="#ffffff"
//         />

//         {/* Spot light to create focused beams of light */}
//         <spotLight
//           position={[0, 0, 10]}
//           angle={Math.PI / 6}
//           penumbra={0.5}
//           intensity={1}
//           color="#ffffff"
//         />

//         {/* Hemisphere light to provide soft ambient lighting */}
//         <hemisphereLight
//           skyColor="#ffffff"
//           groundColor="#404040"
//           intensity={0.5}
//         />

//         <OrbitControls />
//         {droppedCubes.map((cube, index) => (
//           <CubeMesh
//             key={index}
//             position={cube.position}
//             colorIndex={cube.colorIndex}
//           />
//         ))}
//       </Canvas>
//     </div>
//   );
// };

// export default CanvasArea;
