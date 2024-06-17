import React from "react";
import { useDrag } from "react-dnd";
import { colors } from "./CubeMesh"; 
const Cube = ({ id }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CUBE",
    item: { id },
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
        width: "50px",
        height: "50px",
        backgroundColor: color, 
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "move",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      Cube {id}
    </div>
  );
};

export default Cube;
