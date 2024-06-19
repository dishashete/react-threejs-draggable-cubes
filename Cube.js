import React from "react";
import { useDrag } from "react-dnd";
import { colors } from "./CubeMesh"; // Assuming colors are defined in CubeMesh

const Cube = ({ id, name }) => {
  const [{isDragging}, drag] = useDrag(() => ({
    type: "CUBE",
    item: { id, name }, // Include name in the item being dragged
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const colorIndex = id % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      ref={drag}
      style={{
        width: "100px",
        height: "100px",
        backgroundColor: color,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "move",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {name} {/* Display name instead of just "Cube {id}" */}
    </div>
  );
};

export default Cube;
