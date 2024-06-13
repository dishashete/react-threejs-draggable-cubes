import React from "react";
import Cube from "./Cube";

const Toolkit = () => {
  const cubes = [1, 2, 3, 4, 5, 6];
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f0f0f0",
        minHeight: "100px",
        display: "flex",
        gap: "10px",
        overflowX: "auto",
      }}
    >
      {cubes.map((id) => (
        <Cube key={id} id={id} />
      ))}
    </div>
  );
};

export default Toolkit;
