import React, { useState } from "react";
import json5 from "json5";

const FileInputNodesButton = ({ updateNodesState }) => {
  const [initialNodes, setInitialNodes] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const fileContents = await readFile(file);
        const jsonContent = json5.parse(fileContents);
        setInitialNodes(jsonContent);
        updateNodesState(jsonContent);
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result);
      };

      reader.onerror = (e) => {
        reject(new Error("Error reading file."));
      };

      reader.readAsText(file);
    });
  };

  return (
    <div>
      <label>Nodes</label>
      <input type="file" onChange={handleFileChange} />
      {/* <div>
        <strong>Initial Nodes:</strong> {JSON.stringify(initialNodes, null, 2)}
      </div> */}
    </div>
  );
};

export default FileInputNodesButton;
