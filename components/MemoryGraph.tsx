
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { MemoryNode, MemoryLink, GraphNode, GraphLink } from '../types';
import { ZoomIn, ZoomOut, Maximize, X, AlertCircle } from 'lucide-react';

interface MemoryGraphProps {
  nodes: MemoryNode[];
  links: MemoryLink[];
}

const MemoryGraph: React.FC<MemoryGraphProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  
  // State to track if dragging is active (to prevent hover effects)
  const isDraggingRef = useRef(false);
  
  // D3 Selection references to trigger manual updates from React controls if needed
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    // Reset visibility to trigger fade-in on mount
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous render
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 1. Sort nodes by timestamp to determine chronological order
    const sortedNodes = [...nodes].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Helper scale for positioning
    const timeScale = d3.scaleLinear()
      .domain([0, sortedNodes.length - 1])
      .range([width * 0.1, width * 0.9]);

    // Map data to graph format
    const graphNodes: GraphNode[] = nodes.map(n => {
      const rank = sortedNodes.findIndex(sn => sn.id === n.id);
      
      return {
        id: n.id,
        label: n.label,
        group: n.type === 'CORE' ? 1 : n.type === 'TRAUMA' ? 2 : 3,
        type: n.type,
        integrity: n.integrity,
        description: n.description,
        timestamp: n.timestamp,
        // Initial positions - start from center for explosion effect
        x: width / 2 + (Math.random() - 0.5) * 10, 
        y: height / 2 + (Math.random() - 0.5) * 10
      };
    });

    const graphLinks: GraphLink[] = links.map(l => ({
      source: l.source,
      target: l.target,
      value: l.strength
    }));

    // Define colors
    const getColor = (type: string) => {
      switch(type) {
        case 'CORE': return '#fcee0a'; // Yellow
        case 'TRAUMA': return '#ef4444'; // Red
        case 'FRAGMENT': return '#22d3ee'; // Cyan
        default: return '#ffffff';
      }
    };

    // --- DEFS (Filters & Gradients) ---
    const defs = svg.append("defs");

    // Glow Filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Intense Glow Filter for Hover
    const hoverFilter = defs.append("filter")
      .attr("id", "glow-hover")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    hoverFilter.append("feGaussianBlur")
      .attr("stdDeviation", "8") // Stronger blur
      .attr("result", "coloredBlur");
    
    const hoverMerge = hoverFilter.append("feMerge");
    hoverMerge.append("feMergeNode").attr("in", "coloredBlur");
    hoverMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Glitch Filter
    const glitchFilter = defs.append("filter")
      .attr("id", "glitch-filter")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    
    glitchFilter.append("feTurbulence")
      .attr("type", "fractalNoise")
      .attr("baseFrequency", "0.02 0.005")
      .attr("numOctaves", "2")
      .attr("result", "noise");
    
    glitchFilter.append("feDisplacementMap")
      .attr("in", "SourceGraphic")
      .attr("in2", "noise")
      .attr("scale", "3")
      .attr("xChannelSelector", "R")
      .attr("yChannelSelector", "G");

    // Link Gradient
    const linkGradient = defs.append("linearGradient")
      .attr("id", "linkGrad")
      .attr("gradientUnits", "userSpaceOnUse");
    linkGradient.append("stop").attr("offset", "0%").attr("stop-color", "#fcee0a").attr("stop-opacity", 0.1);
    linkGradient.append("stop").attr("offset", "50%").attr("stop-color", "#fcee0a").attr("stop-opacity", 0.8);
    linkGradient.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.1);

    // Zoom setup
    const g = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on("start", () => {
         // Apply grabbing class to SVG container for custom cursor detection
         d3.select(svgRef.current).classed("grabbing", true);
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      })
      .on("end", () => {
         d3.select(svgRef.current).classed("grabbing", false);
      });
    
    svg.call(zoom)
       .on("dblclick.zoom", null);

    zoomBehavior.current = zoom;

    // Simulation Setup
    const simulation = d3.forceSimulation(graphNodes)
      .force("link", d3.forceLink(graphLinks).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-800)) 
      .force("collide", d3.forceCollide().radius(60).strength(0.8))
      // Custom force to create the chronological backbone
      .force("x", d3.forceX((d: GraphNode) => {
        const rank = sortedNodes.findIndex(sn => sn.id === d.id);
        return timeScale(rank);
      }).strength(0.8))
      .force("y", d3.forceY(height / 2).strength(0.05)); // Allow vertical drift (Chaos)

    // --- RENDER LINKS ---
    const linkGroup = g.append("g").attr("class", "links").style("pointer-events", "none");
    
    const linkBase = linkGroup.selectAll(".link-base")
      .data(graphLinks)
      .join("line")
      .attr("class", "link-base")
      .attr("stroke", "#111")
      .attr("stroke-width", 2);

    const linkFlow = linkGroup.selectAll(".link-flow")
      .data(graphLinks)
      .join("line")
      .attr("class", "link-flow")
      .attr("stroke", "url(#linkGrad)")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .style("opacity", 0.6)
      .style("filter", "url(#glow)");

    // --- RENDER NODES ---
    const nodeGroup = g.append("g").attr("class", "nodes");
    
    const node = nodeGroup.selectAll(".node")
      .data(graphNodes)
      .join("g")
      .attr("class", "node")
      .attr("cursor", "none") // Ensure default cursor is none so CustomCursor takes over
      .style("will-change", "transform") // Optimization for smoother movement
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Draw Shapes based on Type
    node.each(function(d) {
      const el = d3.select(this);
      const color = getColor(d.type);

      if (d.type === 'CORE') {
        // Complex Hexagon Core
        const hexSize = 20;
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          hexPoints.push([hexSize * Math.cos(Math.PI/3 * i), hexSize * Math.sin(Math.PI/3 * i)]);
        }
        
        // Rotating Data Ring 1
        el.append("circle")
          .attr("r", 32)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "10, 20")
          .style("opacity", 0.3)
          .classed("animate-spin-slow", true);

        // Rotating Data Ring 2 (Counter)
        el.append("circle")
          .attr("r", 36)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", "2, 10")
          .style("opacity", 0.2)
          .classed("animate-spin-reverse", true);

        // Hexagon Body
        el.append("path")
          .attr("d", "M" + hexPoints.map(p => p.join(",")).join("L") + "Z")
          .attr("fill", "rgba(0,0,0,0.8)")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .style("filter", "url(#glow)");
        
        // Inner Hex
        const innerHexPoints = hexPoints.map(p => [p[0]*0.5, p[1]*0.5]);
        el.append("path")
          .attr("d", "M" + innerHexPoints.map(p => p.join(",")).join("L") + "Z")
          .attr("fill", color)
          .style("opacity", 0.8);

      } else if (d.type === 'TRAUMA') {
        // Unstable Diamond
        const size = 18;
        
        // Glitch Aura
        el.append("rect")
          .attr("x", -size * 1.8).attr("y", -size * 1.8)
          .attr("width", size * 3.6).attr("height", size * 3.6)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 0.5)
          .style("opacity", 0.3)
          .classed("animate-pulse-fast", true)
          .style("filter", "url(#glitch-filter)");

        // Main Diamond
        el.append("rect")
          .attr("x", -size).attr("y", -size)
          .attr("width", size * 2).attr("height", size * 2)
          .attr("transform", "rotate(45)")
          .attr("fill", "#1a0000")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .style("filter", "url(#glow)");
        
        // Inner Cross
        el.append("line").attr("x1", -5).attr("y1", -5).attr("x2", 5).attr("y2", 5).attr("stroke", color).attr("stroke-width", 2);
        el.append("line").attr("x1", 5).attr("y1", -5).attr("x2", -5).attr("y2", 5).attr("stroke", color).attr("stroke-width", 2);

      } else {
        // Fragment - Technical Circle
        el.append("circle")
          .attr("r", 14)
          .attr("fill", "#000510")
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .style("filter", "url(#glow)");
        
        // Dashed ring
        el.append("circle")
          .attr("r", 18)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", "4,4")
          .classed("animate-spin-slow", true);
        
        el.append("circle")
          .attr("r", 4)
          .attr("fill", color);
      }
    });

    // Labels
    const labels = node.append("g")
      .attr("transform", "translate(0, 45)");

    labels.append("path")
      .attr("d", d => {
        const w = d.label.length * 4 + 10;
        return `M -${w} 0 L -${w-5} -12 L ${w-5} -12 L ${w} 0 L ${w-5} 12 L -${w-5} 12 Z`;
      })
      .attr("fill", "rgba(0,0,0,0.8)")
      .attr("stroke", d => getColor(d.type))
      .attr("stroke-width", 0.5)
      .style("opacity", 0.7);

    labels.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .attr("fill", d => getColor(d.type))
      .style("font-family", "Share Tech Mono")
      .style("font-size", "11px")
      .style("letter-spacing", "1px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .style("text-shadow", "0 0 10px currentColor");


    // --- INTERACTION ---
    
    function isConnected(a: GraphNode, b: GraphNode) {
      // Accessing string props directly from graphLinks which D3 might have mutated or not. 
      // D3 mutates source/target to be objects, but we check IDs safely.
      return graphLinks.some(l => {
          // Cast source/target to GraphNode to access properties, checking if they are objects
          const s = l.source as unknown as GraphNode;
          const t = l.target as unknown as GraphNode;
          const sId = s.id ? s.id : (l.source as string);
          const tId = t.id ? t.id : (l.target as string);
          return (sId === a.id && tId === b.id) || (sId === b.id && tId === a.id);
      });
    }

    node.on("mouseover", function(event, d) {
      if (isDraggingRef.current) return; // Prevent hover effects while dragging

      setHoveredNode(d); // Track hovered node for tooltip

      const el = d3.select(this);
      
      // Apply visual hover state class for scale/glow animation
      el.classed("node-hovered", true);

      el.select("path").attr("fill", "#222"); // Highlight background
      
      // Dim other nodes
      node.style("opacity", (n) => (n.id === d.id || isConnected(d, n)) ? 1 : 0.05);
      
      linkBase.style("opacity", 0);
      linkFlow
        .style("opacity", (l) => {
           const s = l.source as unknown as GraphNode;
           const t = l.target as unknown as GraphNode;
           const sId = s.id || l.source as string;
           const tId = t.id || l.target as string;
           return (sId === d.id || tId === d.id) ? 1 : 0;
        })
        .attr("stroke-width", (l) => {
           const s = l.source as unknown as GraphNode;
           const t = l.target as unknown as GraphNode;
           const sId = s.id || l.source as string;
           const tId = t.id || l.target as string;
           return (sId === d.id || tId === d.id) ? 4 : 0;
        })
        .style("filter", "url(#glow)");
    })
    .on("mouseout", function() {
      if (isDraggingRef.current) return; // Prevent opacity reset while dragging
      
      setHoveredNode(null); // Clear tooltip

      const el = d3.select(this);
      
      // Remove visual hover state
      el.classed("node-hovered", false);

      el.select("path").attr("fill", "rgba(0,0,0,0.8)");
      node.style("opacity", 1);
      linkBase.style("opacity", 1);
      linkFlow
        .style("opacity", 0.6)
        .attr("stroke-width", 3);
    });

    node.on("click", (event, d) => {
      if (isDraggingRef.current) return; // Prevent selection on drag release if needed, though click usually fires.
      event.stopPropagation();
      setSelectedNode(d);
    });

    svg.on("click", () => {
      setSelectedNode(null);
    });

    // Tick
    simulation.on("tick", () => {
      linkBase
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      linkFlow
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: GraphNode) {
      isDraggingRef.current = true; // Lock interaction state
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      
      // Add grabbing class for Custom Cursor detection
      const target = event.sourceEvent.target as Element;
      d3.select(target).classed("grabbing", true);
      
      const nodeEl = target.closest(".node");
      if (nodeEl) {
        d3.select(nodeEl).classed("grabbing", true);
      }
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      isDraggingRef.current = false; // Unlock interaction state
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      
      // Remove grabbing class
      const target = event.sourceEvent.target as Element;
      d3.select(target).classed("grabbing", false);
      
      const nodeEl = target.closest(".node");
      if (nodeEl) {
        d3.select(nodeEl).classed("grabbing", false);
        d3.select(nodeEl).classed("node-hovered", false);
      }

      // Reset visuals manually to ensure clean state after drag
      node.style("opacity", 1);
      linkBase.style("opacity", 1);
      linkFlow.style("opacity", 0.6).attr("stroke-width", 3);
    }

  }, [nodes, links]);

  // Zoom Controls
  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, 1.3);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, 0.7);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (svgRef.current && zoomBehavior.current) {
       d3.select(svgRef.current).transition().duration(750).call(
          zoomBehavior.current.transform, 
          d3.zoomIdentity
       );
    }
  }, []);

  // Helper to get connected details for tooltip
  const getConnectedDetails = (node: GraphNode) => {
    return links.filter(l => l.source === node.id || l.target === node.id).map(l => {
      const isSource = l.source === node.id;
      const otherId = isSource ? l.target : l.source;
      const otherNode = nodes.find(n => n.id === otherId);
      return {
        label: otherNode?.label || 'UNKNOWN',
        strength: l.strength
      };
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#020202] group select-none">
      
      {/* Styles for Animations and Backgrounds */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.3; stroke-width: 0.5; }
          50% { opacity: 0.9; stroke-width: 2.5; }
        }
        @keyframes grid-move {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
        }
        @keyframes radar-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes panel-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(252,238,10,0.2); border-color: rgba(250, 204, 21, 0.8); }
          50% { box-shadow: 0 0 50px rgba(252,238,10,0.5); border-color: rgba(250, 204, 21, 1); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .animate-spin-reverse {
          animation: spin-reverse 25s linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.8s ease-in-out infinite;
          transform-box: fill-box;
        }
        .animate-panel-pulse {
          animation: panel-pulse 3s infinite ease-in-out;
        }
        .perspective-grid {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background-image: 
            linear-gradient(rgba(252, 238, 10, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(252, 238, 10, 0.1) 1px, transparent 1px);
          background-size: 80px 80px;
          animation: grid-move 5s linear infinite;
          opacity: 0.2;
          pointer-events: none;
        }
        
        /* Node Hover Effects */
        .node-hovered path, 
        .node-hovered circle:not(.animate-spin-slow):not(.animate-spin-reverse), 
        .node-hovered rect {
          stroke-width: 3px !important;
          filter: url(#glow-hover) !important;
          transition: all 0.2s ease-out;
        }
      `}</style>

      {/* 3D Grid Floor */}
      <div className="perspective-grid"></div>

      {/* Radar Sweep Effect */}
      <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(252,238,10,0.1)_360deg)] animate-[radar-spin_10s_linear_infinite] pointer-events-none rounded-full blur-xl opacity-50"></div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-0"></div>

      {/* Main SVG */}
      <svg 
        ref={svgRef} 
        className={`w-full h-full relative z-10 transition-opacity duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      />

       {/* Link Details Tooltip */}
       {hoveredNode && hoveredNode.x && hoveredNode.y && (
        <div 
          className="absolute z-30 pointer-events-none bg-black/90 border border-yellow-400/50 p-2 text-[10px] font-mono text-yellow-100 shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-sm flex flex-col gap-1 min-w-[150px]"
          style={{ 
            left: hoveredNode.x + 20, 
            top: hoveredNode.y - 20,
            transform: 'translate(0, -50%)' 
          }}
        >
          <div className="border-b border-yellow-400/30 pb-1 mb-1 text-yellow-400 font-bold uppercase tracking-wider">
            CONNECTIONS [{getConnectedDetails(hoveredNode).length}]
          </div>
          {getConnectedDetails(hoveredNode).map((detail, i) => (
             <div key={i} className="flex justify-between items-center">
                <span className="text-neutral-400">{detail.label}</span>
                <span className={`font-bold ${detail.strength > 8 ? 'text-green-400' : 'text-cyan-400'}`}>
                   {detail.strength * 10}%
                </span>
             </div>
          ))}
        </div>
      )}

      {/* Selected Node Details Panel */}
      {selectedNode && (
        <div className="absolute bottom-0 left-0 w-full h-[50vh] md:h-auto md:top-4 md:right-4 md:left-auto md:bottom-auto md:w-96 bg-black/95 border-t-2 md:border-t-0 md:border-r-2 md:border-b-2 border-yellow-400 text-yellow-400 z-40 shadow-[0_0_50px_rgba(252,238,10,0.15)] animate-in slide-in-from-bottom md:slide-in-from-right duration-300 flex flex-col md:max-h-[90%] animate-panel-pulse">
           {/* Header Decoration */}
           <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 animate-pulse"></div>
           
           <div className="p-6 overflow-hidden flex flex-col h-full relative">
             <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-yellow-400 opacity-50 hidden md:block pointer-events-none"></div>
             
             <div className="flex justify-between items-start mb-6 relative z-50">
                <h3 className="text-2xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-white drop-shadow-[0_0_5px_rgba(252,238,10,0.8)]">
                  {selectedNode.label}
                </h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(null);
                  }}
                  className="text-neutral-500 hover:text-red-500 transition-colors z-50 p-2"
                >
                  <X size={24} />
                </button>
             </div>
             
             <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 pb-16 md:pb-0">
               <div className="flex gap-4 text-xs font-mono border-b border-yellow-900 pb-4">
                 <div className="flex-1 bg-yellow-900/20 p-2 border border-yellow-900">
                    <span className="block text-neutral-500 mb-1">ТИП</span>
                    <span className="font-bold text-yellow-100">{selectedNode.type}</span>
                 </div>
                 <div className="flex-1 bg-yellow-900/20 p-2 border border-yellow-900">
                    <span className="block text-neutral-500 mb-1">ГОД</span>
                    <span className="font-bold text-yellow-100">{selectedNode.timestamp.split('-')[0]}</span>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-neutral-500">СИНХРОНИЗАЦИЯ</span>
                   <span className={selectedNode.integrity < 50 ? "text-red-500" : "text-green-400"}>
                     {selectedNode.integrity}%
                   </span>
                 </div>
                 <div className="h-1 w-full bg-neutral-900">
                   <div 
                     className={`h-full ${selectedNode.integrity < 50 ? "bg-red-500" : "bg-gradient-to-r from-yellow-600 to-yellow-300"}`} 
                     style={{ width: `${selectedNode.integrity}%` }}
                   />
                 </div>
               </div>

               <div className="relative p-4 bg-neutral-900/50 border-l-2 border-yellow-500 font-mono text-sm leading-relaxed text-yellow-100/90 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                 <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-transparent"></div>
                 {selectedNode.description}
               </div>

               {selectedNode.type === 'TRAUMA' && (
                 <div className="bg-red-950/30 border border-red-500 text-red-500 p-3 text-xs flex items-center gap-3 animate-pulse">
                   <AlertCircle size={20} />
                   <span>ОБНАРУЖЕНО ПОВРЕЖДЕНИЕ МНЕМОНИЧЕСКИХ ЦЕПЕЙ.</span>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      {/* Zoom Controls - Repositioned on Mobile */}
      <div className="absolute top-4 right-4 md:top-auto md:bottom-6 md:right-6 flex flex-col gap-2 z-20">
        <button onClick={handleZoomIn} className="w-10 h-10 flex items-center justify-center bg-black/60 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all backdrop-blur" title="Zoom In">
          <ZoomIn size={18} />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 flex items-center justify-center bg-black/60 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all backdrop-blur" title="Zoom Out">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleResetZoom} className="w-10 h-10 flex items-center justify-center bg-black/60 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all backdrop-blur" title="Reset">
          <Maximize size={18} />
        </button>
      </div>

      <div className="absolute top-4 left-6 pointer-events-none z-20">
        <div className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 opacity-80 tracking-tighter">CONSTRUCT</div>
        <div className="text-[8px] md:text-[10px] text-yellow-600 uppercase tracking-[0.5em] pl-1">Neural Network Visualization</div>
      </div>
    </div>
  );
};

export default MemoryGraph;
