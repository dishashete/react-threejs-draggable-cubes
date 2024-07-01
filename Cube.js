import React from "react";
import { useDrag } from "react-dnd";
import { colors } from "./CubeMesh";

const Cube = ({ id, name }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CUBE",
    item: { id, name },
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
        width: "65px",
        height: "50px",
        backgroundColor: color,
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "move",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        opacity: isDragging ? 0.5 : 1,
        textAlign: "center",
        fontSize: "12px",
        padding: "5px",
        borderRadius: "5px"
      }}
    >
      {name}
    </div>
  );
};

export default Cube;
