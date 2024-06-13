import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import NavBar from "./components/NavBar";
import Toolkit from "./components/Toolkit";
import CanvasArea from "./components/CanvasArea";
import "./App.css";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <NavBar />
        <div
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        >
          <Toolkit />
          <CanvasArea />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
