import dagre from 'dagre';

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 200, // Increased for clarity
    nodesep: 150, // Increased to prevent clustering
    marginx: 80,
    marginy: 80
  });

  // 1. Initial sizing pass
  const nodeDimensions = {
    stepNode: { width: 500, height: 220 },
    groupNode: { width: 900, height: 700 }, // Scaled group fallback
  };

  // Add all nodes to graph
  nodes.forEach((node) => {
    const dim = nodeDimensions[node.type] || { width: 250, height: 100 };
    dagreGraph.setNode(node.id, { width: dim.width, height: dim.height });
    if (node.parentNode) {
      dagreGraph.setParent(node.id, node.parentNode);
    }
  });

  // Add all edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 2. Perform Layout
  dagre.layout(dagreGraph);

  // 3. Map back to React Flow
  const layoutedNodes = nodes.map((node) => {
    const nodeData = dagreGraph.node(node.id);
    const parentId = node.parentNode;
    const parentData = parentId ? dagreGraph.node(parentId) : null;

    // Calculate position
    // React Flow child positions are relative to parent top-left
    const x = nodeData.x - nodeData.width / 2;
    const y = nodeData.y - nodeData.height / 2;

    const res = {
      ...node,
      position: {
        x: parentData ? x - (parentData.x - parentData.width / 2) + 60 : x, // Offset into group padding
        y: parentData ? y - (parentData.y - parentData.height / 2) + 100 : y, // Offset below header
      },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    };

    // If this is a group node, ensure it has the dimensions Dagre calculated
    if (dagreGraph.children(node.id).length > 0) {
      // Add extra padding for the header (64px) and internal space
      res.style = {
        ...node.style,
        width: nodeData.width + 120, // 60px padding on each side
        height: nodeData.height + 180, // 100px top (header) + 80px bottom
      };
    }

    return res;
  });

  return { nodes: layoutedNodes, edges };
};
