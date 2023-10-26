import React, { useState, useCallback, useRef, useLayoutEffect } from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import ReactFlow, {
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  updateEdge,
  MiniMap,
  Controls,
  Background,
  Panel,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";

import Sidebar from "./Sidebar";
import FloatingEdge from "./FloatingEdge.js";
import FloatingConnectionLine from "./FloatingConnectionLine.js";
import { createNodesAndEdges } from "./utils.js";

const flowKey = "example-flow";
const elk = new ELK();
const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.["elk.direction"] === "RIGHT";
  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",

      // Hardcode a width and height for elk to use when layouting.
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

const nodeColor = (nodeEntity) => {
  switch (nodeEntity.type) {
    case "input":
      return "red";
      break;
    case "output":
      return "blue";
      break;
    case "default":
      return "green";
      break;
    case "group":
      return "none";
      break;
  }
};
const position = { x: 0, y: 0 };
const initialNodes = [
  {
    id: "1",
    data: { label: "1sdfsdfsw wefwfwf wfwcsdcwecccsdc" },
    style: {
      backgroundColor: "red",
      color: "white",
    },
    type: "input",
    position,
  },
  {
    id: "2",
    data: { label: "2" },
    type: "default",
    position,
  },
  {
    id: "3",
    data: { label: "3" },
    type: "output",
    position,
  },
];
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    label: "1 to 2",
    type: "floating",
    animated: true,
    style: {
      strokeWidth: 2,
      stroke: "#FF0072",
    },
    markerEnd: {
      type: MarkerType.Arrow,
    },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    label: "2 to 3",
    type: "floating",
    markerEnd: {
      type: MarkerType.Arrow,
    },
  },
];

const edgeTypes = {
  floating: FloatingEdge,
};

function Flow(props) {
  // you can access the internal state here
  const reactFlowInstance = useReactFlow();
  // const { fitView } = reactFlowInstance;
  return <ReactFlow {...props} />;
}

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function App() {
  const reactFlowWrapper = useRef(null);
  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [variant, setVariant] = useState("cross");

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const getNodeId = () => `randomnode_${+new Date()}`;

  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { "elk.direction": direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          window.requestAnimationFrame(() => reactFlowInstance);
        }
      );
    },
    [nodes, edges]
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: "DOWN", useInitialNodes: true });
  }, []);

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setReactFlowInstance({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setReactFlowInstance]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      console.log("onNodeChanges log", changes);
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      console.log("onEdgeChanges log", changes);
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
      console.log("onConnect log".connection);
    },
    [setEdges]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) =>
      setEdges((els) => updateEdge(oldEdge, newConnection, els)),
    []
  );

  const onEdgeUpdateEnd = useCallback((_, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  return (
    <div className="dndflow" style={{ width: "100vw", height: "100vh" }}>
      <ReactFlowProvider>
        {/* <Background color="#ccc" variant={variant} /> */}
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <Flow
            nodes={nodes}
            edges={edges}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            edgeTypes={edgeTypes}
            connectionLineComponent={FloatingConnectionLine}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
          <MiniMap nodeColor={nodeColor} />
          <Controls />
          <Panel position="top-right">
            <button onClick={onSave}>save</button>
            <button onClick={onRestore}>restore</button>
            <button onClick={() => onLayout({ direction: "DOWN" })}>
              vertical layout
            </button>
            <button onClick={() => onLayout({ direction: "RIGHT" })}>
              horizontal layout
            </button>
            {/* <div>
              variant:
              <button onClick={() => setVariant("dots")}>dots</button>
              <button onClick={() => setVariant("lines")}>lines</button>
              <button onClick={() => setVariant("cross")}>cross</button>
            </div> */}
          </Panel>
        </div>
        <Sidebar setNodes={setNodes} setEdges={setEdges} />
      </ReactFlowProvider>
    </div>
  );
}
