import React from "react";
import Cube from "./Cube";

const Toolkit = () => {
  const cubes = [1, 2, 3, 4, 5, 6]; 
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#1e1e1e",
        minHeight: "100px",
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        color: "white",
      }}
    >
      {cubes.map((id) => (
        <Cube key={id} id={id} />
      ))}
    </div>
  );
};

export default Toolkit;
