import React from "react";
import FileInputNodesButton from "./FileInputNodes";
import FileInputEdgesButton from "./FileInputEdges";

export default ({ setNodes = { setNodes }, setEdges = { setEdges } }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside>
      <div className="description">
        You can drag a node to the pane on the right to create.
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        New Node
      </div>
      <FileInputNodesButton updateNodesState={setNodes} />
      <FileInputEdgesButton updateEdgesState={setEdges} />
    </aside>
  );
};
