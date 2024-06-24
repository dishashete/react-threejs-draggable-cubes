// CanvasArea.js
import React, { useState, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "./CubeMesh";

const gridSize = 1;

const snapToGrid = (position, size) => {
  return Math.round(position / size) * size;
};

const Highlight = ({ position }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[gridSize, gridSize, gridSize]} />
      <meshBasicMaterial color="white" transparent opacity={0.1} />
    </mesh>
  );
};

const DraggableCubeMesh = ({ id, position, colorIndex, updateCubePosition }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const { camera, gl } = useThree();
  const cubeRef = useRef();
  const dragStartPos = useRef(new THREE.Vector3());
  const rotationStartPos = useRef(new THREE.Vector2());

  useFrame(() => {
    if (isDragging || isRotating) {
      gl.domElement.style.cursor = 'grabbing';
    } else {
      gl.domElement.style.cursor = 'grab';
    }
  });

  const getMousePosition = (event) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  };

  const dragStart = (event) => {
    if (event.button === 0) {
      setIsDragging(true);
      dragStartPos.current.copy(cubeRef.current.position);
    } else if (event.button === 2) {
      setIsRotating(true);
      rotationStartPos.current.copy(getMousePosition(event));
    }
  };

  const dragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      const currentPosition = cubeRef.current.position.toArray();
      const snappedPosition = [
        snapToGrid(currentPosition[0], gridSize),
        currentPosition[1], // Keep y-coordinate unchanged
        snapToGrid(currentPosition[2], gridSize)
      ];
      updateCubePosition(id, snappedPosition);
    }
    if (isRotating) {
      setIsRotating(false);
    }
  };

  const drag = (event) => {
    if (isDragging) {
      const plane = new THREE.Plane();
      const raycaster = new THREE.Raycaster();
      const mouse = getMousePosition(event);

      raycaster.setFromCamera(mouse, camera);
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), dragStartPos.current);

      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      cubeRef.current.position.copy(intersectionPoint);
    } else if (isRotating) {
      const currentPos = getMousePosition(event);
      const deltaRotation = currentPos.sub(rotationStartPos.current);
      
      cubeRef.current.rotation.y += deltaRotation.x * 2;
      cubeRef.current.rotation.x += deltaRotation.y * 2;

      rotationStartPos.current.copy(currentPos);
    }
  };

  return (
    <group 
      ref={cubeRef}
      position={position}
      onPointerDown={dragStart}
      onPointerUp={dragEnd}
      onPointerMove={drag}
      onPointerOut={dragEnd}
    >
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors[colorIndex]} />
      </mesh>
    </group>
  );
};

const CanvasArea = () => {
  const [cubes, setCubes] = useState([]);
  const [highlightPositions, setHighlightPositions] = useState([]);
  const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));

  const [, drop] = useDrop({
    accept: "CUBE",
    hover: (item, monitor) => {
      const delta = monitor.getClientOffset();
      if (delta) {
        updateHighlightPositions(cubes, delta);
      }
    },
    drop: (item, monitor) => {
      const delta = monitor.getClientOffset();
      if (delta) {
        addCube(delta);
      }
    },
  });

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    updateHighlightPositions(cubes);
  }, [cubes]);

  const addCube = (delta) => {
    const newPosition = calculateNewPosition(delta);
    setCubes([...cubes, { id: Date.now(), position: newPosition, colorIndex: cubes.length % colors.length }]);
  };

  const calculateNewPosition = (delta) => {
    const x = (delta.x / window.innerWidth) * 2 - 1;
    const y = -(delta.y / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(cameraRef.current);
    const dir = vector.sub(cameraRef.current.position).normalize();
    const distance = -cameraRef.current.position.z / dir.z;
    const pos = new THREE.Vector3().copy(cameraRef.current.position).add(dir.multiplyScalar(distance));

    return [snapToGrid(pos.x, gridSize), snapToGrid(pos.y, gridSize), snapToGrid(pos.z, gridSize)];
  };

  const updateCubePosition = (id, newPosition) => {
    setCubes(cubes.map(cube => 
      cube.id === id ? { ...cube, position: newPosition } : cube
    ));
  };

  const updateHighlightPositions = (currentCubes) => {
    const positions = [];
    currentCubes.forEach((cube) => {
      const adjacentPositions = [
        [cube.position[0] + gridSize, cube.position[1], cube.position[2]],
        [cube.position[0] - gridSize, cube.position[1], cube.position[2]],
        [cube.position[0], cube.position[1], cube.position[2] + gridSize],
        [cube.position[0], cube.position[1], cube.position[2] - gridSize],
        // [cube.position[0], cube.position[1] + gridSize, cube.position[2]],
        // [cube.position[0], cube.position[1] - gridSize, cube.position[2]],
      ];

      adjacentPositions.forEach((pos) => {
        const isOccupied = currentCubes.some(
          (existingCube) =>
            existingCube.position[0] === pos[0] &&
            existingCube.position[1] === pos[1] &&
            existingCube.position[2] === pos[2]
        );
        if (!isOccupied && !positions.some(p => p[0] === pos[0] && p[1] === pos[1] && p[2] === pos[2])) {
          positions.push(pos);
        }
      });
    });
    setHighlightPositions(positions);
  };

  return (
    <div ref={drop} style={{ width: '100vw', height: '100vh', backgroundColor: '#2a2a2a' }}>
      <button onClick={() => addCube({ x: window.innerWidth / 2, y: window.innerHeight / 2 })} style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
        Add Cube
      </button>
      <Canvas camera={{ position: [5, 5, 5] }} style={{ background: '#2a2a2a' }}>
        {/* Lighting setup */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <directionalLight position={[0, 10, 10]} intensity={0.5} />
        <spotLight position={[0, 0, 10]} angle={Math.PI / 6} penumbra={0.5} intensity={1} />
        <hemisphereLight skyColor="#ffffff" groundColor="#404040" intensity={0.5} />
        {/* Removed the gridHelper line */}
        <OrbitControls />
        {cubes.map((cube) => (
          <DraggableCubeMesh
            key={cube.id}
            id={cube.id}
            position={cube.position}
            colorIndex={cube.colorIndex}
            updateCubePosition={updateCubePosition}
          />
        ))}
        {highlightPositions.map((pos, index) => (
          <Highlight key={index} position={pos} />
        ))}
      </Canvas>
    </div>
  );
};
export default CanvasArea;