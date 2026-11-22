import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ArchitectureConfig, ArchitectureEdge, ArchitectureNode, ArchitectureSide } from "./types";

interface NodeBounds { left: number; right: number; top: number; bottom: number; centerX: number; centerY: number }

function anchor(box: NodeBounds, side: ArchitectureSide, offset = 0) {
  if (side === "left") return { x: box.left, y: box.centerY + offset * (box.bottom - box.top) / 2 };
  if (side === "right") return { x: box.right, y: box.centerY + offset * (box.bottom - box.top) / 2 };
  if (side === "top") return { x: box.centerX + offset * (box.right - box.left) / 2, y: box.top };
  return { x: box.centerX + offset * (box.right - box.left) / 2, y: box.bottom };
}

function edgePath(edge: ArchitectureEdge, boxes: Map<string, NodeBounds>) {
  const from = boxes.get(edge.from);
  const to = boxes.get(edge.to);
  if (!from || !to) return "";
  const start = anchor(from, edge.fromSide, edge.fromOffset);
  const end = anchor(to, edge.toSide, edge.toOffset);
  if (edge.laneY !== undefined) {
    const lane = edge.laneY * 5;
    return `M ${start.x} ${start.y} V ${lane} H ${end.x} V ${end.y}`;
  }
  return Math.abs(start.x - end.x) < 1
    ? `M ${start.x} ${start.y} V ${end.y}`
    : `M ${start.x} ${start.y} H ${end.x} V ${end.y}`;
}

export function ArchitectureViewer({ config }: { config: ArchitectureConfig }) {
  const markerId = useId().replace(/:/g, "_");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [boxes, setBoxes] = useState<Map<string, NodeBounds>>(() => new Map());
  const nodes = useMemo(() => new Map(config.nodes.map((node) => [node.id, node])), [config]);
  const primaryNodes = config.nodes.filter((node) => node.group !== "dependency");
  const step = config.steps[stepIndex];
  const inspectedNode = hoveredNode ?? selectedNode;
  const selected = inspectedNode ? nodes.get(inspectedNode) : null;
  const focusedStep = config.steps[hoveredStep ?? stepIndex];
  const activeEdges = inspectedNode
    ? config.edges.filter((edge) => edge.from === inspectedNode || edge.to === inspectedNode).map((edge) => edge.id)
    : focusedStep.edges;
  const activeNodes = inspectedNode
    ? [inspectedNode, ...config.edges.filter((edge) => activeEdges.includes(edge.id)).flatMap((edge) => [edge.from, edge.to])]
    : focusedStep.nodes;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      const area = canvas.getBoundingClientRect();
      if (!area.width || !area.height) return;
      const next = new Map<string, NodeBounds>();
      canvas.querySelectorAll<HTMLElement>("[data-architecture-node]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const left = (rect.left - area.left) * 1000 / area.width;
        const right = (rect.right - area.left) * 1000 / area.width;
        const top = (rect.top - area.top) * 500 / area.height;
        const bottom = (rect.bottom - area.top) * 500 / area.height;
        next.set(element.dataset.architectureNode!, { left, right, top, bottom, centerX: (left + right) / 2, centerY: (top + bottom) / 2 });
      });
      setBoxes(next);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (observer) {
      observer.observe(canvas);
      canvas.querySelectorAll<HTMLElement>("[data-architecture-node]").forEach((element) => observer.observe(element));
    }
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, [config]);

  function selectNode(id: string) {
    setSelectedNode((current) => current === id ? null : id);
  }
  function goToStep(index: number) {
    setSelectedNode(null);
    setStepIndex(Math.max(0, Math.min(index, config.steps.length - 1)));
  }

  return <section className="case-architecture" aria-labelledby="architecture-title">
    <div className="case-architecture-heading">
      <div><span className="eyebrow"><span className="eyebrow-line" /> INTERACTIVE ARCHITECTURE</span><h2 id="architecture-title">{config.title}</h2><p>{config.description}</p></div>
      <span className="architecture-hint">SELECT A NUMBER OR COMPONENT</span>
    </div>
    <div className="architecture-workspace">
      <div className="architecture-canvas" role="group" aria-label={`${config.title} system architecture diagram`} ref={canvasRef}>
        <div className="canvas-topline"><span>{config.canvasLabels?.[0] ?? "01 / REQUEST + STORAGE"}</span><span>{config.canvasLabels?.[1] ?? "02 / QUEUED DELIVERY"}</span></div>
        <svg className="architecture-edges" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id={`${markerId}-idle`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="var(--muted)" strokeWidth="2" /></marker>
            <marker id={`${markerId}-active`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="var(--accent)" strokeWidth="2" /></marker>
          </defs>
          {config.edges.map((edge, index) => {
            const d = edgePath(edge, boxes);
            const active = activeEdges.includes(edge.id);
            if (!d) return null;
            return <g key={edge.id} className={active ? "edge-active" : "edge-idle"}>
              <path d={d} markerEnd={active ? `url(#${markerId}-active)` : `url(#${markerId}-idle)`} />
              <circle className="job-packet" r="3.5"><animateMotion dur={`${2.5 + index * .13}s`} begin={`${index * .24}s`} repeatCount="indefinite" path={d} /></circle>
            </g>;
          })}
        </svg>
        {config.edges.map((edge) => edge.label && edge.labelAt && <span key={edge.id} className={`architecture-edge-label ${activeEdges.includes(edge.id) ? "is-active" : ""}`} style={{ left: `${edge.labelAt.x}%`, top: `${edge.labelAt.y}%` }}>{edge.label}</span>)}
        {config.steps.map((item, index) => item.pin && <button type="button" key={item.title}
          className={`architecture-step-pin ${stepIndex === index && !selectedNode ? "is-current" : ""}`}
          style={{ left: `${item.pin.x}%`, top: `${item.pin.y}%` }}
          onClick={() => goToStep(index)} onMouseEnter={() => setHoveredStep(index)} onMouseLeave={() => setHoveredStep(null)} onFocus={() => setHoveredStep(index)} onBlur={() => setHoveredStep(null)} aria-label={`Step ${index + 1}: ${item.title}`} aria-current={stepIndex === index && !selectedNode ? "step" : undefined}
          title={item.title}>{String(index + 1).padStart(2, "0")}</button>)}
        {config.nodes.map((node) => <button type="button" key={node.id}
          className={`architecture-node ${activeNodes.includes(node.id) ? "is-active" : ""} ${selectedNode === node.id && (!hoveredNode || hoveredNode === node.id) ? "is-selected" : ""} ${node.group === "dependency" ? "is-dependency" : ""}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          data-architecture-node={node.id} onClick={() => selectNode(node.id)} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} onFocus={() => setHoveredNode(node.id)} onBlur={() => setHoveredNode(null)} aria-pressed={selectedNode === node.id}
          aria-label={`${node.label}: ${node.role}. Select for details`}>
          <span className="architecture-node-dot" /><span className="architecture-node-copy"><strong>{node.label}</strong><small>{node.role}</small></span>
        </button>)}
        <div className="canvas-key"><span className="key-dot" /> Selected stage <span className="key-line" /> Directional data flow</div>
      </div>
      <div className="architecture-mobile-list" role="group" aria-label="System components">
        <span className="mobile-flow-heading">PRIMARY FLOW</span>
        {primaryNodes.map((node, index) => <div className="mobile-flow-stage" key={node.id}><button type="button" className={`mobile-architecture-node ${selectedNode === node.id ? "is-selected" : ""} ${activeNodes.includes(node.id) ? "is-active" : ""}`} onClick={() => selectNode(node.id)} aria-pressed={selectedNode === node.id}><strong>{node.label}</strong><span>{node.role}</span></button>{config.mobileHandoff?.afterNode === node.id && <p className="mobile-handoff-note">{config.mobileHandoff.text}</p>}{index < primaryNodes.length - 1 && <span className="mobile-flow-arrow" aria-hidden="true">↓</span>}</div>)}
        <div className="mobile-flow-dependencies"><span className="mobile-flow-heading">SECONDARY PATHS</span>{config.edges.filter((edge) => edge.label).map((edge) => <p key={edge.id}>{edge.label}: {nodes.get(edge.from)?.label} → {nodes.get(edge.to)?.label}</p>)}{config.nodes.filter((node) => node.group === "dependency").map((node) => <button type="button" key={node.id} className={`mobile-architecture-node ${selectedNode === node.id ? "is-selected" : ""} ${activeNodes.includes(node.id) ? "is-active" : ""}`} onClick={() => selectNode(node.id)} aria-pressed={selectedNode === node.id}><strong>{node.label}</strong><span>{node.role}</span></button>)}</div>
      </div>
      <div className="architecture-explainer" aria-live="polite">
        <div className="explainer-kicker">{selected ? "COMPONENT DETAIL" : `STEP ${String(stepIndex + 1).padStart(2, "0")} / ${String(config.steps.length).padStart(2, "0")}`}</div>
        <h3>{selected?.label ?? step.title}</h3>
        <p>{selected?.detail ?? step.plain}</p>
        {selected ? <div className="tag-row">{selected.tech.map((tech) => <span key={tech}>{tech}</span>)}</div> : <details className="technical-detail"><summary>Technical detail</summary><p>{step.technical}</p></details>}
      </div>
    </div>
    <div className="architecture-toolbar" role="group" aria-label="Walkthrough steps">
      {config.steps.map((item, index) => <button type="button" key={item.title} className={`architecture-stage-button ${index === stepIndex && !selectedNode ? "current" : ""}`} onClick={() => goToStep(index)} onMouseEnter={() => setHoveredStep(index)} onMouseLeave={() => setHoveredStep(null)} onFocus={() => setHoveredStep(index)} onBlur={() => setHoveredStep(null)} aria-current={index === stepIndex && !selectedNode ? "step" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}
    </div>
    <p className="architecture-access-note">Directional signals run continuously. Select a stage or component to read its details. Reduced-motion settings hide the moving signals.</p>
  </section>;
}
