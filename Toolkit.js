import React from "react";
import Cube from "./Cube";
import "./Toolkit.css";

const Toolkit = () => {
  const cubes = [
    { id: 1, name: "Power" },
    { id: 2, name: "Battery" },
    { id: 3, name: "LED" },
    { id: 4, name: "IR" },
    { id: 5, name: "Switch" },
    { id: 6, name: "LDR" },
    { id: 7, name: "Speaker" },
    { id: 8, name: "AND" },
    { id: 9, name: "OR" },
    { id: 10, name: "NOT" },
    { id: 11, name: "Input" },
    { id: 12, name: "Wires" },
    { id: 13, name: "Touch" },
    { id: 14, name: "Potentiometer" },
    { id: 15, name: "IC" },
    { id: 16, name: "DC" },
    { id: 17, name: "Servo" },
  ];

  return (
    <div className="toolkit-container">
      {cubes.map((cube) => (
        <Cube key={cube.id} id={cube.id} name={cube.name} />
      ))}
    </div>
  );
};

export default Toolkit;
