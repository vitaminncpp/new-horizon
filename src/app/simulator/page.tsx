"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/src/components/common/icon";

interface Point {
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
}

interface Wire {
  id: string;
  from: { componentId: string; point: "left" | "right" };
  to: { componentId: string; point: "left" | "right" };
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
  },
  {
    type: "capacitor",
    icon: "battery_charging_full",
    label: "Capacitor",
    color: "text-tertiary",
    borderColor: "tertiary",
    defaultValue: 100,
    unit: "μF",
  },
  {
    type: "inductor",
    icon: "loop",
    label: "Inductor",
    color: "text-secondary-fixed-dim",
    borderColor: "secondary",
    defaultValue: 10,
    unit: "mH",
  },
  {
    type: "power",
    icon: "electric_bolt",
    label: "Power",
    color: "text-secondary",
    borderColor: "secondary",
    defaultValue: 5,
    unit: "V",
  },
  {
    type: "ground",
    icon: "grounding",
    label: "Ground",
    color: "text-text-secondary",
    borderColor: "outline",
    defaultValue: 0,
    unit: "GND",
  },
  {
    type: "led",
    icon: "lightbulb",
    label: "LED",
    color: "text-error",
    borderColor: "error",
    defaultValue: 2,
    unit: "V",
  },
];

const toolCategories = [
  { id: "passive", label: "Passive", components: ["resistor", "capacitor", "inductor"] },
  { id: "sources", label: "Sources", components: ["power", "ground"] },
  { id: "output", label: "Output", components: ["led"] },
];

function formatValue(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

const COMPONENT_SIZE = 64;

export default function CircuitSimulatorPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState<Point>({ x: 100, y: 100 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [tool, setTool] = useState<CanvasTool>("select");
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("passive");
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [wireStart, setWireStart] = useState<{
    componentId: string;
    point: "left" | "right";
  } | null>(null);
  const [wireEndPoint, setWireEndPoint] = useState<Point | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  const selectedComp = components.find((c) => c.id === selectedComponent);

  const getComponentTemplates = useCallback(() => {
    const category = toolCategories.find((c) => c.id === selectedCategory);
    if (!category) return [];
    return category.components
      .map((type) => componentTemplates.find((t) => t.type === type))
      .filter(Boolean) as ComponentTemplate[];
  }, [selectedCategory]);

  const getConnectorPosition = (comp: CircuitComponent, point: "left" | "right"): Point => {
    return {
      x: point === "left" ? comp.x : comp.x + COMPONENT_SIZE,
      y: comp.y + COMPONENT_SIZE / 2,
    };
  };

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): Point => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      return {
        x: (clientX - rect.left - pan.x) / scale,
        y: (clientY - rect.top - pan.y) / scale,
      };
    },
    [zoom, pan],
  );

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
        x: 150 + Math.random() * 300,
        y: 150 + Math.random() * 300,
        value: template.defaultValue,
        unit: template.unit,
        color: template.color,
        borderColor: template.borderColor,
      };

      setComponents((prev) => [...prev, component]);
      setSelectedComponent(id);
    },
    [components],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || tool === "pan") {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }

      if (tool === "wire" && wireStart) {
        setWireStart(null);
        setWireEndPoint(null);
        return;
      }

      if (tool === "select") {
        setSelectedComponent(null);
      }
    },
    [tool, wireStart, pan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const coords = getCanvasCoords(e.clientX, e.clientY);

      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }

      if (draggingComponent && dragStart) {
        setComponents((prev) =>
          prev.map((c) =>
            c.id === draggingComponent
              ? { ...c, x: coords.x - dragStart.x, y: coords.y - dragStart.y }
              : c,
          ),
        );
        return;
      }

      if (tool === "wire" && wireStart) {
        setWireEndPoint(coords);
      }
    },
    [isPanning, panStart, draggingComponent, dragStart, tool, wireStart, getCanvasCoords],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingComponent(null);
    setDragStart(null);
  }, []);

  const handleComponentClick = useCallback(
    (e: React.MouseEvent, componentId: string) => {
      e.stopPropagation();

      if (tool === "wire") return;

      setSelectedComponent(componentId);
      setDraggingComponent(componentId);
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const comp = components.find((c) => c.id === componentId);
      if (comp) {
        setDragStart({ x: coords.x - comp.x, y: coords.y - comp.y });
      }
    },
    [tool, components, getCanvasCoords],
  );

  const handleConnectorClick = useCallback(
    (e: React.MouseEvent, componentId: string, point: "left" | "right") => {
      e.stopPropagation();
      e.preventDefault();

      if (tool !== "wire") {
        setTool("wire");
      }

      if (!wireStart) {
        setWireStart({ componentId, point });
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setWireEndPoint(coords);
      } else if (wireStart.componentId !== componentId) {
        const newWire: Wire = {
          id: `wire-${Date.now()}`,
          from: wireStart,
          to: { componentId, point },
        };
        setWires((prev) => [...prev, newWire]);
        setWireStart(null);
        setWireEndPoint(null);
      } else {
        setWireStart(null);
        setWireEndPoint(null);
      }
    },
    [tool, wireStart, getCanvasCoords],
  );

  const updateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => prev.filter((c) => c.id !== id));
      setWires((prev) => prev.filter((w) => w.from.componentId !== id && w.to.componentId !== id));
      if (selectedComponent === id) setSelectedComponent(null);
    },
    [selectedComponent],
  );

  const deleteSelected = useCallback(() => {
    if (selectedComponent) deleteComponent(selectedComponent);
  }, [selectedComponent, deleteComponent]);

  const clearCanvas = useCallback(() => {
    setComponents([]);
    setWires([]);
    setSelectedComponent(null);
    setWireStart(null);
    setWireEndPoint(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement?.tagName !== "INPUT") {
          deleteSelected();
        }
      }
      if (e.key === "Escape") {
        setSelectedComponent(null);
        setWireStart(null);
        setWireEndPoint(null);
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

    const start = getConnectorPosition(fromComp, wire.from.point);
    const end = getConnectorPosition(toComp, wire.to.point);

    const dx = Math.abs(end.x - start.x);
    const cpOffset = Math.max(30, dx * 0.4);

    return (
      <g key={wire.id}>
        <path
          d={`M ${start.x} ${start.y} C ${start.x + cpOffset} ${start.y}, ${end.x - cpOffset} ${end.y}, ${end.x} ${end.y}`}
          fill="none"
          stroke={isSimulating ? "#5ffbd6" : "#5ffbd6"}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={isSimulating ? 1 : 0.7}
        />
        {isSimulating && (
          <circle
            cx={(start.x + end.x) / 2}
            cy={(start.y + end.y) / 2}
            r="4"
            fill="#5ffbd6"
            className="animate-pulse"
          />
        )}
      </g>
    );
  };

  const renderWirePreview = () => {
    if (!wireStart || !wireEndPoint) return null;

    const fromComp = components.find((c) => c.id === wireStart.componentId);
    if (!fromComp) return null;

    const start = getConnectorPosition(fromComp, wireStart.point);
    const dx = Math.abs(wireEndPoint.x - start.x);
    const cpOffset = Math.max(30, dx * 0.4);

    return (
      <path
        d={`M ${start.x} ${start.y} C ${start.x + cpOffset} ${start.y}, ${wireEndPoint.x - cpOffset} ${wireEndPoint.y}, ${wireEndPoint.x} ${wireEndPoint.y}`}
        fill="none"
        stroke="#aca3ff"
        strokeWidth="2"
        strokeDasharray="6,4"
        strokeLinecap="round"
      />
    );
  };

  const borderColors: Record<string, string> = {
    primary: "border-primary shadow-[0_0_15px_rgba(172,163,255,0.3)]",
    secondary: "border-secondary shadow-[0_0_15px_rgba(95,251,214,0.3)]",
    tertiary: "border-tertiary shadow-[0_0_15px_rgba(225,146,255,0.3)]",
    error: "border-error shadow-[0_0_15px_rgba(255,110,132,0.3)]",
    outline: "border-outline",
  };

  const connectorColors: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    tertiary: "bg-tertiary",
    error: "bg-error",
    outline: "bg-outline",
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
              onClick={() => setIsSimulating(true)}
              className={`p-1.5 rounded-md transition-all ${isSimulating ? "bg-secondary/20 text-secondary" : "text-text-secondary hover:text-secondary"}`}
              title={isSimulating ? "Running" : "Run"}
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
          {isSimulating && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-medium text-secondary">Simulating</span>
            </div>
          )}
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
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 h-full bg-surface-low border-r border-border-soft flex flex-col z-40 shrink-0">
          <div className="p-4 border-b border-border-soft">
            <h2 className="text-sm font-bold text-text-primary">Components</h2>
            <p className="text-[10px] text-text-secondary mt-1">Click to add to canvas</p>
          </div>

          <div className="flex gap-1 p-2 border-b border-border-soft">
            {toolCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-all ${selectedCategory === cat.id ? "bg-primary/20 text-primary" : "text-text-secondary hover:bg-surface-high"}`}
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="relative w-[3000px] h-[3000px]"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                transformOrigin: "0 0",
              }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <g className="overflow-visible">
                  {wires.map(renderWire)}
                  {renderWirePreview()}
                </g>
              </svg>

              {components.map((comp) => {
                const isSelected = selectedComponent === comp.id;
                const borderColor = borderColors[comp.borderColor] || borderColors.outline;
                const connColor = connectorColors[comp.borderColor] || connectorColors.outline;
                const isWireStartComp = wireStart?.componentId === comp.id;

                return (
                  <div
                    key={comp.id}
                    className={`absolute cursor-pointer ${isSelected ? "z-20" : "z-10"}`}
                    style={{ left: comp.x, top: comp.y }}
                    onMouseDown={(e) => handleComponentClick(e, comp.id)}
                  >
                    <div
                      className={`relative w-[64px] h-[64px] bg-surface-high rounded-xl border-2 ${borderColor} ${
                        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}
                    >
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full cursor-crosshair ${connColor} border-2 border-background transition-all hover:scale-125 hover:ring-2 hover:ring-white/30 z-10 ${
                          tool === "wire" ? "hover:scale-125" : ""
                        } ${isWireStartComp && wireStart?.point === "left" ? "ring-2 ring-white scale-125" : ""}`}
                        style={{ left: -8 }}
                        onClick={(e) => handleConnectorClick(e, comp.id, "left")}
                      />
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full cursor-crosshair ${connColor} border-2 border-background transition-all hover:scale-125 hover:ring-2 hover:ring-white/30 z-10 ${
                          tool === "wire" ? "hover:scale-125" : ""
                        } ${isWireStartComp && wireStart?.point === "right" ? "ring-2 ring-white scale-125" : ""}`}
                        style={{ right: -8 }}
                        onClick={(e) => handleConnectorClick(e, comp.id, "right")}
                      />

                      <div className="w-full h-full flex items-center justify-center">
                        <span
                          className={`material-symbols-outlined text-2xl ${comp.color}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {componentTemplates.find((t) => t.type === comp.type)?.icon}
                        </span>
                      </div>

                      {isSimulating && comp.type === "led" && (
                        <div className="absolute inset-0 bg-error/30 rounded-xl animate-pulse" />
                      )}
                    </div>

                    <div className="mt-1 text-center">
                      <span className="text-[9px] font-bold text-text-secondary tracking-wide bg-surface-low px-1.5 py-0.5 rounded whitespace-nowrap">
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
                title="Pan"
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
                setPan({ x: 100, y: 100 });
              }}
              className="p-1.5 hover:bg-surface-high rounded-lg transition-all text-text-secondary"
              title="Reset View"
            >
              <span className="material-symbols-outlined text-base">center_focus_strong</span>
            </button>
          </div>

          {tool === "wire" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-medium border border-primary/30">
              Click on connection dots to draw wires
            </div>
          )}

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
    </div>
  );
}
