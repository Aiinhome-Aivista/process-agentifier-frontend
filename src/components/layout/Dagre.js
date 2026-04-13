import dagre from 'dagre';

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  
  // Custom node dimensions based on type
  const nodeDimensions = {
    processNode: { width: 280, height: 80 },
    agentNode: { width: 320, height: 220 },
    decisionNode: { width: 140, height: 140 },
    agentGroupNode: { width: 500, height: 200 } // Minimums for groups
  };

  dagreGraph.setGraph({ 
    rankdir: direction,
    ranksep: 120, // Vertical distance between ranks
    nodesep: 80,  // Horizontal distance between nodes in the same rank
    marginx: 40,
    marginy: 40
  });

  nodes.forEach((node) => {
    const dim = nodeDimensions[node.type] || { width: 250, height: 100 };
    dagreGraph.setNode(node.id, { width: dim.width, height: dim.height });
    if (node.parentNode) {
      dagreGraph.setParent(node.id, node.parentNode);
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeData = dagreGraph.node(node.id);
    const parent = node.parentNode ? dagreGraph.node(node.parentNode) : null;

    const res = {
      ...node,
      position: {
        x: nodeData.x - nodeData.width / 2 - (parent ? parent.x - parent.width / 2 : 0),
        y: nodeData.y - nodeData.height / 2 - (parent ? parent.y - parent.height / 2 : 0),
      },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    };

    // If it's a parent node, its width/height is calculated by Dagre
    if (dagreGraph.children(node.id).length > 0) {
      // Add padding for group headers/spacing
      res.style = { 
        ...node.style, 
        width: nodeData.width + 40, 
        height: nodeData.height + 60 // More height for the header
      };
    }

    return res;
  });

  return { nodes: layoutedNodes, edges };
};
