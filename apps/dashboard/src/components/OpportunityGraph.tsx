"use client";

import { useState, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  Node, 
  Edge,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css'; // Don't forget to import the CSS!

import { GraphData } from '@/services/graph-api';

interface OpportunityGraphProps {
  data: GraphData;
}

// This function converts your API data into the format React Flow needs
const transformDataForReactFlow = (graphData: GraphData) => {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  
  // Find the search node
  const searchNode = graphData.nodes.find(n => n.type === 'search');
  if (searchNode) {
    initialNodes.push({
      id: searchNode.id,
      position: { x: 50, y: 150 }, // Center the search node on the left
      data: { label: searchNode.label },
      type: 'input', // This gives it a specific style
      style: { backgroundColor: '#e0f2fe', borderColor: '#0284c7' }
    });
  }

  // Get all property nodes
  const propertyNodes = graphData.nodes.filter(n => n.type === 'property');

  propertyNodes.forEach((node, index) => {
    initialNodes.push({
      id: node.id,
      // Spread the nodes out
      position: { x: 400, y: (index * 120) - (propertyNodes.length > 1 ? (propertyNodes.length - 1) * 120 / 2 : 0) + 150 }, // Center vertically
      data: { label: node.label },
      // Style the best match differently
      style: { 
        backgroundColor: node.isBestMatch ? '#dbeafe' : '#ffffff',
        borderColor: node.isBestMatch ? '#2563eb' : '#cccccc',
        borderWidth: node.isBestMatch ? 2 : 1,
      }
    });
  });
  
  // Transform edges
  graphData.edges.forEach((edge, index) => {
    initialEdges.push({
      id: `e-${index}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      animated: true, // Make the edge animated
      type: 'smoothstep'
    });
  });

  return { initialNodes, initialEdges };
};


function OpportunityGraph({ data }: OpportunityGraphProps) {
  // We use useMemo to prevent re-calculating on every render
  const { initialNodes, initialEdges } = useMemo(() => transformDataForReactFlow(data), [data]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // These functions are needed for pan/zoom to work
  const onNodesChange = (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds));

  return (
    <div className="w-full h-full rounded-lg border bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView // This will zoom/pan to fit all nodes
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default OpportunityGraph;
