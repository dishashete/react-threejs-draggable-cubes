// CanvasArea.js
import React, { useState, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { colors } from "./CubeMesh";

function useOrbitControls() {
  const { camera, gl } = useThree();
  const controls = useRef();

  useEffect(() => {
    controls.current = new OrbitControls(camera, gl.domElement);
    return () => controls.current.dispose();
  }, [camera, gl]);

  useFrame(() => controls.current.update());

  return controls;
}

const ControlledOrbitControls = React.forwardRef((props, ref) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  React.useImperativeHandle(ref, () => ({
    enabled: true,
    setEnabled(value) {
      this.enabled = value;
      if (controlsRef.current) {
        controlsRef.current.enabled = value;
      }
    }
  }));

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      };
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.25;
      controlsRef.current.screenSpacePanning = false;
      controlsRef.current.maxPolarAngle = Math.PI / 2;
    }
  }, []);

  return <OrbitControls 
    ref={controlsRef} 
    args={[camera, gl.domElement]} 
    {...props}
    zoomToCursor={true}
  />;
});

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

const DraggableCubeMesh = ({
  id,
  position,
  colorIndex,
  updateCubePosition,
  orbitControlsRef,
  checkCollision,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const { camera, gl } = useThree();
  const cubeRef = useRef();
  const dragStartPos = useRef(new THREE.Vector3());
  const rotationStartPos = useRef(new THREE.Vector2());

  useFrame(() => {
    if (isDragging || isRotating) {
      gl.domElement.style.cursor = "grabbing";
    } else {
      gl.domElement.style.cursor = "grab";
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
      if (orbitControlsRef.current) {
        orbitControlsRef.current.setEnabled(false);
      }
    } else if (event.button === 2) {
      setIsRotating(true);
      rotationStartPos.current.copy(getMousePosition(event));
      if (orbitControlsRef.current) {
        orbitControlsRef.current.setEnabled(false);
      }
    }
  };

  const dragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      const currentPosition = cubeRef.current.position.toArray();
      const snappedPosition = [
        snapToGrid(currentPosition[0], gridSize),
        currentPosition[1], // Keep y-coordinate unchanged
        snapToGrid(currentPosition[2], gridSize),
      ];
      updateCubePosition(id, snappedPosition);
    }
    if (isRotating) {
      setIsRotating(false);
    }
    if (orbitControlsRef.current) {
      orbitControlsRef.current.setEnabled(true);
    }
  };

  const drag = (event) => {
    if (isDragging) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ plane
      const raycaster = new THREE.Raycaster();
      const mouse = getMousePosition(event);

      raycaster.setFromCamera(mouse, camera);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      const newPosition = [
        snapToGrid(intersectionPoint.x, gridSize),
        cubeRef.current.position.y,
        snapToGrid(intersectionPoint.z, gridSize),
      ];

      if (!checkCollision(id, newPosition)) {
        cubeRef.current.position.set(
          newPosition[0],
          newPosition[1],
          newPosition[2]
        );
      }
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
  const orbitControlsRef = useRef();

  const checkCollision = (id, newPosition) => {
    const [x, y, z] = newPosition;
    return cubes.some(
      (cube) =>
        cube.id !== id &&
        Math.abs(cube.position[0] - x) < gridSize &&
        Math.abs(cube.position[1] - y) < gridSize &&
        Math.abs(cube.position[2] - z) < gridSize
    );
  };

  const updateCubePosition = (id, newPosition) => {
    if (!checkCollision(id, newPosition)) {
      setCubes(
        cubes.map((cube) =>
          cube.id === id ? { ...cube, position: newPosition } : cube
        )
      );
    }
  };

  const cameraRef = useRef(
    new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );

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
        addCube(delta, item); // Pass the item parameter here
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

  const addCube = (delta, item) => {
    if (!item) return; // Add a safeguard against undefined item

    const initialPosition = calculateNewPosition(delta);
    let newPosition = [...initialPosition];

    const generateOffsets = () => {
      const offsets = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            if (x !== 0 || y !== 0 || z !== 0) {
              offsets.push([x, y, z]);
            }
          }
        }
      }
      return offsets.sort(() => Math.random() - 0.5);
    };

    const offsets = generateOffsets();

    let i = 0;
    while (checkCollision(null, newPosition) && i < offsets.length) {
      newPosition = [
        initialPosition[0] + offsets[i][0] * gridSize,
        initialPosition[1], // Keep Y coordinate fixed
        initialPosition[2] + offsets[i][2] * gridSize,
      ];
      i++;
    }

    if (!checkCollision(null, newPosition)) {
      setCubes([
        ...cubes,
        {
          id: Date.now(),
          position: newPosition,
          colorIndex: item.id % colors.length,
        },
      ]);
    } else {
      console.log("No available nearby positions to add a cube");
    }
  };

  const calculateNewPosition = (delta) => {
    const x = (delta.x / window.innerWidth) * 2 - 1;
    const y = -(delta.y / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(cameraRef.current);
    const dir = vector.sub(cameraRef.current.position).normalize();
    const distance = -cameraRef.current.position.z / dir.z;
    const pos = new THREE.Vector3()
      .copy(cameraRef.current.position)
      .add(dir.multiplyScalar(distance));

    return [
      snapToGrid(pos.x, gridSize),
      0, // Fix Y coordinate to 0
      snapToGrid(pos.z, gridSize),
    ];
  };

  const updateHighlightPositions = (currentCubes) => {
    const positions = [];
    currentCubes.forEach((cube) => {
      const adjacentPositions = [
        [cube.position[0] + gridSize, 0, cube.position[2]], // Fix Y coordinate to 0
        [cube.position[0] - gridSize, 0, cube.position[2]], // Fix Y coordinate to 0
        [cube.position[0], 0, cube.position[2] + gridSize], // Fix Y coordinate to 0
        [cube.position[0], 0, cube.position[2] - gridSize], // Fix Y coordinate to 0
      ];

      adjacentPositions.forEach((pos) => {
        const isOccupied = currentCubes.some(
          (existingCube) =>
            existingCube.position[0] === pos[0] &&
            existingCube.position[1] === pos[1] &&
            existingCube.position[2] === pos[2]
        );
        if (
          !isOccupied &&
          !positions.some(
            (p) => p[0] === pos[0] && p[1] === pos[1] && p[2] === pos[2]
          )
        ) {
          positions.push(pos);
        }
      });
    });
    setHighlightPositions(positions);
  };

  return (
    <div
      ref={drop}
      style={{
        width: "calc(100% - 250px)",
        height: "100%",
        backgroundColor: "#2a2a2a",
        position: "relative",
      }}
    >
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} style={{ background: "#2a2a2a" }}>
        <ControlledOrbitControls ref={orbitControlsRef} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <directionalLight position={[0, 10, 10]} intensity={0.5} />
        <spotLight
          position={[0, 0, 10]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={1}
        />
        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#404040"
          intensity={0.5}
        />
        {cubes.map((cube) => (
          <DraggableCubeMesh
            key={cube.id}
            id={cube.id}
            position={cube.position}
            colorIndex={cube.colorIndex}
            updateCubePosition={updateCubePosition}
            orbitControlsRef={orbitControlsRef}
            checkCollision={checkCollision}
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
