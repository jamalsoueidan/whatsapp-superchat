// component as child of ReactFlowProvider so we have access to state
import dagre from "dagre";
import { useEffect, useState } from "react";
import { Edge, Node, Position, useReactFlow } from "reactflow";

type RankDir = "TB" | "BT" | "LR" | "RL";
const options: { rankdir: RankDir } = { rankdir: "LR" };
const positionMap: Record<
  RankDir,
  { targetPosition: Position; sourcePosition: Position }
> = {
  TB: { targetPosition: Position.Top, sourcePosition: Position.Bottom },
  BT: { targetPosition: Position.Bottom, sourcePosition: Position.Top },
  LR: { targetPosition: Position.Left, sourcePosition: Position.Right },
  RL: { targetPosition: Position.Right, sourcePosition: Position.Left },
};
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Array<Edge>) => {
  dagreGraph.setGraph(options);

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, node);
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const positions = positionMap[options.rankdir] || {
    targetPosition: Position.Top,
    sourcePosition: Position.Bottom,
  };

  const newNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: x - node.width! / 2,
        y: y - node.height! / 2,
      },
      targetPosition: positions.targetPosition,
      sourcePosition: positions.sourcePosition,
    };
  });

  return { nodes: newNodes, edges };
};

export const useTriggerPosition = () => {
  const [opened, setOpened] = useState(true);
  const { setNodes, getNodes, setEdges, getEdges, fitView } = useReactFlow();
  const nodes = getNodes();
  const edges = getEdges();

  useEffect(() => {
    if (opened && nodes[0]?.width) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setOpened(false);

      window.requestAnimationFrame(() => {
        fitView();
      });
    }
  }, [nodes, edges, setNodes, setEdges, opened, fitView]);
};
