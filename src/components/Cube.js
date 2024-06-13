import React from "react";
import { useDrag } from "react-dnd";

const Cube = ({ id }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CUBE",
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        width: "50px",
        height: "50px",
        backgroundColor: isDragging ? "lightgreen" : "skyblue",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "move",
      }}
    >
      Cube {id}
    </div>
  );
};

export default Cube;
