"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/src/components/common/icon";

interface Point {
  x: number;
  y: number;
}

interface ConnectionPoint {
  id: string;
  componentId: string;
  position: "left" | "right" | "top" | "bottom";
  x: number;
  y: number;
}

interface CircuitComponent {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  value: number;
  unit: string;
  color: string;
  borderColor: string;
  connections: string[];
}

interface Wire {
  id: string;
  from: { componentId: string; point: string };
  to: { componentId: string; point: string };
  path: string;
}

type CanvasTool = "select" | "wire" | "pan";

interface ComponentTemplate {
  type: string;
  icon: string;
  label: string;
  color: string;
  borderColor: string;
  defaultValue: number;
  unit: string;
  canHaveMultiple: boolean;
}

const componentTemplates: ComponentTemplate[] = [
  {
    type: "resistor",
    icon: "rebase_edit",
    label: "Resistor",
    color: "text-primary",
    borderColor: "primary",
    defaultValue: 10000,
    unit: "Ω",
    canHaveMultiple: true,
  },
  {
    type: "capacitor",
    icon: "battery_full",
    label: "Capacitor",
    color: "text-tertiary-fixed-dim",
    borderColor: "tertiary",
    defaultValue: 100,
    unit: "μF",
    canHaveMultiple: true,
  },
  {
    type: "inductor",
    icon: "loop",
    label: "Inductor",
    color: "text-secondary-fixed-dim",
    borderColor: "secondary",
    defaultValue: 10,
    unit: "mH",
    canHaveMultiple: true,
  },
  {
    type: "power",
    icon: "electric_bolt",
    label: "Power Source",
    color: "text-secondary",
    borderColor: "secondary",
    defaultValue: 5,
    unit: "V",
    canHaveMultiple: true,
  },
  {
    type: "ground",
    icon: "grounding",
    label: "Ground",
    color: "text-text-secondary",
    borderColor: "outline",
    defaultValue: 0,
    unit: "GND",
    canHaveMultiple: true,
  },
  {
    type: "led",
    icon: "lightbulb",
    label: "LED",
    color: "text-error",
    borderColor: "error",
    defaultValue: 2,
    unit: "V",
    canHaveMultiple: true,
  },
];

const toolCategories = [
  {
    id: "passive",
    label: "Passive",
    components: ["resistor", "capacitor", "inductor"],
  },
  {
    id: "sources",
    label: "Sources",
    components: ["power", "ground"],
  },
  {
    id: "output",
    label: "Output",
    components: ["led"],
  },
];

function formatValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

export default function CircuitSimulatorPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [tool, setTool] = useState<CanvasTool>("select");
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("passive");
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [wireStart, setWireStart] = useState<{
    componentId: string;
    point: string;
    x: number;
    y: number;
  } | null>(null);
  const [wireEnd, setWireEnd] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const selectedComp = components.find((c) => c.id === selectedComponent);

  const getComponentTemplates = useCallback(() => {
    const category = toolCategories.find((c) => c.id === selectedCategory);
    if (!category) return [];
    return category.components
      .map((type) => componentTemplates.find((t) => t.type === type))
      .filter(Boolean) as ComponentTemplate[];
  }, [selectedCategory]);

  const addComponent = useCallback(
    (template: ComponentTemplate) => {
      const id = `${template.type}-${Date.now()}`;
      const existingOfType = components.filter((c) => c.type === template.type).length;
      const name =
        existingOfType > 0
          ? `${template.type.toUpperCase()}${existingOfType + 1}`
          : template.type.toUpperCase();

      const component: CircuitComponent = {
        id,
        type: template.type,
        name,
        x: 200 + Math.random() * 200,
        y: 200 + Math.random() * 200,
        value: template.defaultValue,
        unit: template.unit,
        color: template.color,
        borderColor: template.borderColor,
        connections: [],
      };

      setComponents((prev) => [...prev, component]);
      setSelectedComponent(id);
      setTool("select");
    },
    [components],
  );

  const getConnectionPoints = useCallback((component: CircuitComponent): ConnectionPoint[] => {
    const points: ConnectionPoint[] = [];
    const size = 60;

    points.push({
      id: `${component.id}-left`,
      componentId: component.id,
      position: "left",
      x: component.x,
      y: component.y + size / 2,
    });
    points.push({
      id: `${component.id}-right`,
      componentId: component.id,
      position: "right",
      x: component.x + size,
      y: component.y + size / 2,
    });

    return points;
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (tool === "pan" || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }

      if (tool === "wire" && wireStart) {
        setWireStart(null);
        setWireEnd(null);
      } else {
        setSelectedComponent(null);
      }
    },
    [tool, wireStart, pan],
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }

      if (draggingComponent) {
        const scale = zoom / 100;
        setComponents((prev) =>
          prev.map((c) =>
            c.id === draggingComponent
              ? {
                  ...c,
                  x: (e.clientX - dragOffset.x) / scale,
                  y: (e.clientY - dragOffset.y) / scale,
                }
              : c,
          ),
        );
        return;
      }

      if (tool === "wire" && wireStart && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        setWireEnd({
          x: (e.clientX - rect.left - pan.x) / scale,
          y: (e.clientY - rect.top - pan.y) / scale,
        });
      }
    },
    [isPanning, panStart, draggingComponent, dragOffset, tool, wireStart, zoom, pan],
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingComponent(null);
  }, []);

  const handleComponentMouseDown = useCallback(
    (e: React.MouseEvent, componentId: string) => {
      e.stopPropagation();

      if (tool === "wire") {
        const component = components.find((c) => c.id === componentId);
        if (!component) return;

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const scale = zoom / 100;
        const x = (rect.left + rect.width / 2 - pan.x) / scale;
        const y = (rect.top + rect.height / 2 - pan.y) / scale;

        if (!wireStart) {
          setWireStart({ componentId, point: "left", x, y });
        } else if (wireStart.componentId !== componentId) {
          const newWire: Wire = {
            id: `wire-${Date.now()}`,
            from: { componentId: wireStart.componentId, point: wireStart.point },
            to: { componentId, point: "right" },
            path: "",
          };
          setWires((prev) => [...prev, newWire]);
          setWireStart(null);
          setWireEnd(null);
        }
        return;
      }

      setSelectedComponent(componentId);
      setDraggingComponent(componentId);

      const component = components.find((c) => c.id === componentId);
      if (component && canvasRef.current) {
        const scale = zoom / 100;
        setDragOffset({
          x: e.clientX - component.x * scale - pan.x,
          y: e.clientY - component.y * scale - pan.y,
        });
      }
    },
    [tool, wireStart, components, zoom, pan],
  );

  const handleConnectionClick = useCallback(
    (componentId: string, point: string) => {
      if (tool !== "wire") return;

      const component = components.find((c) => c.id === componentId);
      if (!component) return;

      const points = getConnectionPoints(component);
      const connPoint = points.find((p) => p.id === `${componentId}-${point}`);

      if (!wireStart) {
        setWireStart({ componentId, point, x: connPoint?.x ?? 0, y: connPoint?.y ?? 0 });
      } else if (wireStart.componentId !== componentId) {
        const newWire: Wire = {
          id: `wire-${Date.now()}`,
          from: { componentId: wireStart.componentId, point: wireStart.point },
          to: { componentId, point },
          path: "",
        };
        setWires((prev) => [...prev, newWire]);
        setWireStart(null);
        setWireEnd(null);
      }
    },
    [tool, wireStart, components, getConnectionPoints],
  );

  const updateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) => prev.filter((w) => w.from.componentId !== id && w.to.componentId !== id));
    setSelectedComponent(null);
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedComponent) {
      deleteComponent(selectedComponent);
    }
  }, [selectedComponent, deleteComponent]);

  const clearCanvas = useCallback(() => {
    setComponents([]);
    setWires([]);
    setSelectedComponent(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      }
      if (e.key === "Escape") {
        setSelectedComponent(null);
        setWireStart(null);
        setWireEnd(null);
        setTool("select");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected]);

  const renderWire = (wire: Wire) => {
    const fromComp = components.find((c) => c.id === wire.from.componentId);
    const toComp = components.find((c) => c.id === wire.to.componentId);
    if (!fromComp || !toComp) return null;

    const fromPoints = getConnectionPoints(fromComp);
    const toPoints = getConnectionPoints(toComp);
    const from = fromPoints.find((p) => p.position === wire.from.point);
    const to = toPoints.find((p) => p.position === wire.to.point);
    if (!from || !to) return null;

    const midX = (from.x + to.x) / 2;
    const path = `M ${from.x + 30} ${from.y + 30} C ${midX} ${from.y + 30}, ${midX} ${to.y + 30}, ${to.x + 30} ${to.y + 30}`;

    return (
      <path
        key={wire.id}
        d={path}
        fill="none"
        stroke="#5ffbd6"
        strokeWidth="3"
        className="drop-shadow-[0_0_4px_rgba(95,251,214,0.5)]"
      />
    );
  };

  const renderWirePreview = () => {
    if (!wireStart || !wireEnd) return null;

    const midX = (wireStart.x + wireEnd.x) / 2;
    const path = `M ${wireStart.x + 30} ${wireStart.y + 30} C ${midX} ${wireStart.y + 30}, ${midX} ${wireEnd.y + 30}, ${wireEnd.x + 30} ${wireEnd.y + 30}`;

    return (
      <path
        d={path}
        fill="none"
        stroke="#aca3ff"
        strokeWidth="2"
        strokeDasharray="8,4"
        className="animate-dash"
      />
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background overflow-hidden select-none">
      <header className="flex items-center justify-between px-6 h-14 bg-surface/90 backdrop-blur-xl border-b border-border-soft z-50 shrink-0">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <Icon name="arrow_back" className="text-lg" />
            <span className="text-xs font-medium">Back</span>
          </Link>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
            CircuitArchitect
          </span>
          <div className="flex items-center gap-1 bg-surface-lowest/50 px-2 py-1 rounded-lg border border-border-soft">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-1.5 rounded-md transition-all ${
                isSimulating
                  ? "bg-secondary/20 text-secondary"
                  : "text-text-secondary hover:text-secondary"
              }`}
              title={isSimulating ? "Running" : "Run Simulation"}
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            </button>
            <button
              className="p-1.5 hover:bg-surface-high rounded-md transition-all text-text-secondary hover:text-primary"
              title="Pause"
            >
              <span className="material-symbols-outlined text-[18px]">pause</span>
            </button>
            <button
              onClick={() => setIsSimulating(false)}
              className="p-1.5 hover:bg-surface-high rounded-md transition-all text-text-secondary hover:text-error"
              title="Stop"
            >
              <span className="material-symbols-outlined text-[18px]">stop</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-error hover:bg-surface-low rounded-lg transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="px-4 py-1.5 bg-gradient-to-r from-primary to-tertiary text-white rounded-lg font-semibold shadow-lg active:scale-95 transition-all text-xs"
          >
            {isSimulating ? "Stop" : "Run Simulation"}
          </button>
          <button className="p-2 text-text-secondary hover:bg-surface-high rounded-lg transition-all">
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full bg-surface-low border-r border-border-soft flex flex-col z-40 shrink-0">
          <div className="p-4 border-b border-border-soft">
            <h2 className="text-sm font-bold text-text-primary">Components</h2>
          </div>

          <div className="flex gap-1 p-2 border-b border-border-soft">
            {toolCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary/20 text-primary"
                    : "text-text-secondary hover:bg-surface-high"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {getComponentTemplates().map((template) => (
              <button
                key={template.type}
                onClick={() => addComponent(template)}
                className="w-full flex items-center gap-3 p-3 bg-surface-high hover:bg-surface-highest rounded-xl transition-all group border border-transparent hover:border-secondary/30"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center ${template.color}`}
                >
                  <span className="material-symbols-outlined text-xl">{template.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">{template.label}</p>
                  <p className="text-[10px] text-text-secondary">
                    {template.defaultValue} {template.unit}
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary text-sm ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  add
                </span>
              </button>
            ))}
          </div>

          {selectedComp && (
            <div className="p-4 border-t border-border-soft bg-surface-lowest/50">
              <h3 className="text-xs font-bold text-text-primary mb-3">Properties</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wide block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedComp.name}
                    onChange={(e) => updateComponent(selectedComp.id, { name: e.target.value })}
                    className="w-full bg-surface-low border border-border-soft rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-text-secondary uppercase tracking-wide block mb-1">
                    Value
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={selectedComp.value}
                      onChange={(e) =>
                        updateComponent(selectedComp.id, { value: parseFloat(e.target.value) || 0 })
                      }
                      className="flex-1 bg-surface-low border border-border-soft rounded-lg px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                    <span className="px-2 py-1.5 bg-surface-low text-text-secondary text-xs font-medium rounded-lg border border-border-soft">
                      {selectedComp.unit}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteComponent(selectedComp.id)}
                  className="w-full py-2 bg-error/10 hover:bg-error/20 text-error text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </button>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="absolute inset-0 overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(109, 117, 140, 0.2) 1px, transparent 1px)",
              backgroundSize: `${(32 * zoom) / 100}px ${(32 * zoom) / 100}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            <div
              className="relative"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                transformOrigin: "0 0",
              }}
            >
              <svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none -translate-x-1/2 -translate-y-1/2">
                {wires.map(renderWire)}
                {renderWirePreview()}
              </svg>

              {components.map((comp) => {
                const isSelected = selectedComponent === comp.id;
                const borderColors: Record<string, string> = {
                  primary: "border-primary",
                  secondary: "border-secondary",
                  tertiary: "border-tertiary-fixed-dim",
                  error: "border-error",
                  outline: "border-outline",
                };
                const glowColors: Record<string, string> = {
                  primary: "shadow-[0_0_20px_rgba(172,163,255,0.3)]",
                  secondary: "shadow-[0_0_20px_rgba(95,251,214,0.3)]",
                  tertiary: "shadow-[0_0_20px_rgba(205,127,236,0.3)]",
                  error: "shadow-[0_0_20px_rgba(255,110,132,0.3)]",
                  outline: "",
                };

                return (
                  <div
                    key={comp.id}
                    className={`absolute cursor-pointer transition-shadow ${
                      isSelected ? "z-10" : "z-0"
                    }`}
                    style={{ left: comp.x, top: comp.y }}
                    onMouseDown={(e) => handleComponentMouseDown(e, comp.id)}
                  >
                    <div
                      className={`relative w-[60px] h-[60px] bg-surface-high rounded-xl border-2 ${borderColors[comp.borderColor]} ${glowColors[comp.borderColor]} ${
                        isSelected
                          ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                          : ""
                      }`}
                    >
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-crosshair ${borderColors[comp.borderColor].replace("border-", "bg-")} ring-2 ring-background transition-transform hover:scale-150 ${
                          tool === "wire" ? "hover:scale-150" : ""
                        }`}
                        style={{ left: -6 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectionClick(comp.id, "left");
                        }}
                      />
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-crosshair ${borderColors[comp.borderColor].replace("border-", "bg-")} ring-2 ring-background transition-transform hover:scale-150`}
                        style={{ right: -6 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectionClick(comp.id, "right");
                        }}
                      />

                      <div className="w-full h-full flex items-center justify-center">
                        <span
                          className={`material-symbols-outlined text-2xl ${comp.color}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {componentTemplates.find((t) => t.type === comp.type)?.icon}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 text-center">
                      <span className="text-[9px] font-bold text-text-secondary tracking-wide bg-surface-low px-1.5 py-0.5 rounded">
                        {comp.name}: {formatValue(comp.value)}
                        {comp.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-full border border-border-soft flex items-center gap-3 shadow-2xl z-30">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-1.5 hover:bg-surface-high rounded-lg transition-all text-text-secondary"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>
              <span className="px-2 min-w-[40px] text-center text-xs font-bold text-text-primary">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-1.5 hover:bg-surface-high rounded-lg transition-all text-text-secondary"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>

            <div className="w-px h-5 bg-border-soft" />

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTool("pan")}
                className={`p-1.5 rounded-lg transition-all ${tool === "pan" ? "bg-primary/20 text-primary" : "text-text-secondary hover:bg-surface-high"}`}
                title="Pan (Middle Mouse)"
              >
                <span className="material-symbols-outlined text-base">pan_tool</span>
              </button>
              <button
                onClick={() => setTool("select")}
                className={`p-1.5 rounded-lg transition-all ${tool === "select" ? "bg-primary/20 text-primary" : "text-text-secondary hover:bg-surface-high"}`}
                title="Select"
              >
                <span className="material-symbols-outlined text-base">near_me</span>
              </button>
              <button
                onClick={() => setTool("wire")}
                className={`p-1.5 rounded-lg transition-all ${tool === "wire" ? "bg-primary/20 text-primary" : "text-text-secondary hover:bg-surface-high"}`}
                title="Wire Tool"
              >
                <span className="material-symbols-outlined text-base">timeline</span>
              </button>
            </div>

            <div className="w-px h-5 bg-border-soft" />

            <button
              onClick={() => {
                setZoom(100);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:bg-surface-high rounded-lg transition-all text-text-secondary"
              title="Reset View"
            >
              <span className="material-symbols-outlined text-base">center_focus_strong</span>
            </button>
          </div>

          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-text-muted mb-2">
                  add_circle
                </span>
                <p className="text-text-secondary text-sm">
                  Click a component to add it to the canvas
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -24;
          }
        }
        .animate-dash {
          animation: dash 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
