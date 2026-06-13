"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Boxes,
  Database,
  FileCode2,
  GitBranch,
  KeyRound,
  Loader2,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Route,
  Search,
  Server,
  ShieldCheck,
  Table2,
  UserRound,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

type CodeRoute = {
  id: string;
  operation_id: string;
  path: string;
  methods: string[];
  name?: string;
  group: string;
  tags?: string[];
  endpoint?: {
    name?: string;
    module?: string;
    source_file?: string;
    line_number?: number;
  };
  auth?: {
    required: boolean;
    permissions: string[];
    dependencies: string[];
  };
  params?: {
    path: any[];
    query: any[];
    body: any[];
    headers: any[];
    cookies: any[];
  };
  data?: {
    supabase_tables_detected: string[];
  };
};

type CodeMapResponse = {
  title: string;
  backend_root: string;
  routes: CodeRoute[];
  modules: any[];
  module_edges: any[];
  graph: {
    nodes: any[];
    edges: any[];
  };
  notes?: string[];
};

type NodeBox = {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "client" | "system" | "group" | "route" | "table";
  route?: CodeRoute;
};

const CANVAS_W = 2700;
const CANVAS_H = 1800;

const methodClass: Record<string, string> = {
  GET: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  POST: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  PUT: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  PATCH: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  DELETE: "border-red-500/40 bg-red-500/10 text-red-300",
};

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

export default function DeveloperCodeMapPage() {
  const [data, setData] = useState<CodeMapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [hoverRouteId, setHoverRouteId] = useState("");
  const [zoom, setZoom] = useState(0.82);
  const [viewMode, setViewMode] = useState<"map" | "table" | "flow">("map");
  const [fullscreen, setFullscreen] = useState(false);
  const [showInspector, setShowInspector] = useState(true);

  useEffect(() => {
    api
      .get("/dev/code-map")
      .then(setData)
      .catch((err) => setError(err?.message || "Failed to load developer code map."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    return ["all", ...unique((data?.routes || []).map((r) => r.group)).sort()];
  }, [data]);

  const filteredRoutes = useMemo(() => {
    const q = search.toLowerCase().trim();

    return (data?.routes || []).filter((route) => {
      const blob = [
        route.path,
        route.methods?.join(" "),
        route.group,
        route.endpoint?.name,
        route.endpoint?.module,
        route.endpoint?.source_file,
        route.auth?.permissions?.join(" "),
        route.auth?.dependencies?.join(" "),
        route.data?.supabase_tables_detected?.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || blob.includes(q);
      const matchesGroup = group === "all" || route.group === group;

      return matchesSearch && matchesGroup;
    });
  }, [data, search, group]);

  const activeRoute = useMemo(() => {
    const id = selectedRouteId || hoverRouteId;
    return filteredRoutes.find((route) => route.id === id) || filteredRoutes[0] || null;
  }, [selectedRouteId, hoverRouteId, filteredRoutes]);

  const tables = useMemo(() => {
    return unique(
      filteredRoutes.flatMap((route) => route.data?.supabase_tables_detected || [])
    ).sort();
  }, [filteredRoutes]);

  const groupedRoutes = useMemo(() => {
    const map: Record<string, CodeRoute[]> = {};

    for (const route of filteredRoutes) {
      if (!map[route.group]) map[route.group] = [];
      map[route.group].push(route);
    }

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRoutes]);

  const parseErrorModules = useMemo(() => {
    return (data?.modules || []).filter((m) => m.parse_error);
  }, [data]);

  const graph = useMemo(() => {
    const nodes: NodeBox[] = [];
    const edges: Array<{ from: string; to: string; active?: boolean; label?: string }> = [];

    nodes.push(
      {
        id: "client",
        title: "Browser / Tablet PWA",
        subtitle: "Next.js app sends bearer API requests",
        x: 80,
        y: 150,
        w: 260,
        h: 86,
        type: "client",
      },
      {
        id: "auth",
        title: "Supabase Auth",
        subtitle: "JWT / session token / current user",
        x: 80,
        y: 310,
        w: 260,
        h: 86,
        type: "system",
      },
      {
        id: "rbac",
        title: "RBAC Gate",
        subtitle: "get_current_user + permissions",
        x: 80,
        y: 470,
        w: 260,
        h: 86,
        type: "system",
      },
      {
        id: "fastapi",
        title: "FastAPI Backend",
        subtitle: "Routers, dependencies and endpoint handlers",
        x: 470,
        y: 300,
        w: 300,
        h: 96,
        type: "system",
      },
      {
        id: "supabase",
        title: "Supabase Database",
        subtitle: "Tables detected from backend source files",
        x: 2180,
        y: 300,
        w: 310,
        h: 96,
        type: "system",
      }
    );

    edges.push(
      { from: "client", to: "auth", label: "login/session" },
      { from: "auth", to: "fastapi", label: "Bearer token" },
      { from: "rbac", to: "fastapi", label: "permissions" },
      { from: "fastapi", to: "supabase", label: "CRUD" }
    );

    groupedRoutes.forEach(([groupName, routes], groupIndex) => {
      const groupX = 900 + (groupIndex % 3) * 390;
      const groupY = 90 + Math.floor(groupIndex / 3) * 520;

      const groupId = `group-${groupName}`;

      nodes.push({
        id: groupId,
        title: groupName,
        subtitle: `${routes.length} route${routes.length === 1 ? "" : "s"}`,
        x: groupX,
        y: groupY,
        w: 330,
        h: 82,
        type: "group",
      });

      edges.push({ from: "fastapi", to: groupId, label: "router" });

      routes.slice(0, 7).forEach((route, routeIndex) => {
        const routeId = `route-${route.id}`;
        const active = activeRoute?.id === route.id;

        nodes.push({
          id: routeId,
          title: route.path,
          subtitle: route.endpoint?.source_file
            ? `${route.endpoint.source_file}${route.endpoint.line_number ? `:${route.endpoint.line_number}` : ""}`
            : route.endpoint?.name || "Endpoint",
          x: groupX,
          y: groupY + 120 + routeIndex * 126,
          w: 330,
          h: 104,
          type: "route",
          route,
        });

        edges.push({ from: groupId, to: routeId, active });

        const routeTables = route.data?.supabase_tables_detected || [];

        routeTables.slice(0, 2).forEach((table) => {
          edges.push({
            from: routeId,
            to: `table-${table}`,
            active,
            label: "table",
          });
        });
      });

      if (routes.length > 7) {
        nodes.push({
          id: `more-${groupName}`,
          title: `+${routes.length - 7} more`,
          subtitle: "Use search or group filter to narrow this area",
          x: groupX,
          y: groupY + 120 + 7 * 126,
          w: 330,
          h: 76,
          type: "route",
        });
      }
    });

    tables.forEach((table, index) => {
      nodes.push({
        id: `table-${table}`,
        title: table,
        subtitle: "Supabase table",
        x: 2180,
        y: 470 + index * 92,
        w: 310,
        h: 72,
        type: "table",
      });
    });

    return { nodes, edges };
  }, [groupedRoutes, tables, activeRoute]);

  const nodeLookup = useMemo(() => {
    return Object.fromEntries(graph.nodes.map((node) => [node.id, node]));
  }, [graph.nodes]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
          <p className="text-sm font-medium">Reading backend code map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-500">
        {error}
      </div>
    );
  }

  const shellClass = fullscreen
    ? "fixed inset-0 z-[9999] h-screen overflow-hidden bg-[#07090d] text-white"
    : "-m-6 h-[calc(100vh-80px)] overflow-hidden bg-[#07090d] text-white";

  return (
    <div className={shellClass}>
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0f15]/95 px-5 py-3 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                <GitBranch size={18} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">LMG Developer Code Map</h1>
                <p className="text-xs text-zinc-400">
                  Live backend map generated from FastAPI routes, auth dependencies and Supabase table calls.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill icon={<Route size={13} />} label={`${data?.routes?.length || 0} routes`} />
            <Pill icon={<FileCode2 size={13} />} label={`${data?.modules?.length || 0} modules`} />
            <Pill icon={<Table2 size={13} />} label={`${tables.length} tables`} />

            <button
              onClick={() => setFullscreen((v) => !v)}
              className="ml-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-zinc-300 hover:border-emerald-500/50 hover:text-white"
              title={fullscreen ? "Exit full screen" : "Open full screen"}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {fullscreen ? "Exit full screen" : "Full screen"}
            </button>

            {fullscreen && (
              <button
                onClick={() => setFullscreen(false)}
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                title="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        {parseErrorModules.length > 0 && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={16} />
              Backend parse errors detected. Fix these files because the map may be incomplete.
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {parseErrorModules.map((module) => (
                <span key={module.file} className="rounded-full border border-red-500/30 bg-black/30 px-3 py-1 text-xs">
                  {module.file}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0b0f15] px-5 py-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoint, file, function, permission, dependency, Supabase table..."
              className="h-10 w-full rounded-xl border border-white/10 bg-black/50 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/60"
            />
          </div>

          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/50 px-3 text-sm text-white outline-none focus:border-emerald-500/60"
          >
            {groups.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All groups" : item}
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-xl border border-white/10 bg-black/50 p-1">
            <ModeButton active={viewMode === "map"} onClick={() => setViewMode("map")} icon={<GitBranch size={14} />} label="Map" />
            <ModeButton active={viewMode === "table"} onClick={() => setViewMode("table")} icon={<Table2 size={14} />} label="Table" />
            <ModeButton active={viewMode === "flow"} onClick={() => setViewMode("flow")} icon={<Route size={14} />} label="Flow" />
          </div>

          <button
            onClick={() => setShowInspector((v) => !v)}
            className="h-10 rounded-xl border border-white/10 bg-black/50 px-3 text-xs font-black text-zinc-300 hover:text-white"
          >
            {showInspector ? "Hide inspector" : "Show inspector"}
          </button>

          <div className="flex items-center rounded-xl border border-white/10 bg-black/50">
            <button
              onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.08).toFixed(2))))}
              className="p-2 text-zinc-400 hover:text-white"
              title="Zoom out"
              disabled={viewMode !== "map"}
            >
              <Minus size={16} />
            </button>
            <span className="w-14 text-center text-xs font-bold text-zinc-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.3, Number((z + 0.08).toFixed(2))))}
              className="p-2 text-zinc-400 hover:text-white"
              title="Zoom in"
              disabled={viewMode !== "map"}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setZoom(0.82)}
              className="border-l border-white/10 p-2 text-zinc-400 hover:text-white"
              title="Reset zoom"
              disabled={viewMode !== "map"}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <main className="relative flex-1 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {viewMode === "map" && (
            <div className="absolute inset-0 overflow-auto">
              <div
                className="relative"
                style={{
                  width: CANVAS_W,
                  height: CANVAS_H,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                }}
              >
                <svg
                  className="pointer-events-none absolute inset-0"
                  width={CANVAS_W}
                  height={CANVAS_H}
                >
                  <defs>
                    <marker
                      id="arrow"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="rgba(148,163,184,0.65)" />
                    </marker>
                    <marker
                      id="arrow-active"
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="rgba(16,185,129,0.9)" />
                    </marker>
                  </defs>

                  {graph.edges.map((edge, index) => {
                    const from = nodeLookup[edge.from];
                    const to = nodeLookup[edge.to];

                    if (!from || !to) return null;

                    const x1 = from.x + from.w;
                    const y1 = from.y + from.h / 2;
                    const x2 = to.x;
                    const y2 = to.y + to.h / 2;
                    const mid = Math.max(80, (x2 - x1) / 2);

                    return (
                      <path
                        key={`${edge.from}-${edge.to}-${index}`}
                        d={`M ${x1} ${y1} C ${x1 + mid} ${y1}, ${x2 - mid} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={edge.active ? "rgba(16,185,129,0.9)" : "rgba(148,163,184,0.23)"}
                        strokeWidth={edge.active ? 2.2 : 1.2}
                        markerEnd={edge.active ? "url(#arrow-active)" : "url(#arrow)"}
                      />
                    );
                  })}
                </svg>

                {graph.nodes.map((node) => (
                  <MapNode
                    key={node.id}
                    node={node}
                    active={node.route?.id === activeRoute?.id}
                    highlighted={
                      node.type === "table" &&
                      !!activeRoute?.data?.supabase_tables_detected?.includes(node.title)
                    }
                    onHover={() => {
                      if (node.route?.id) setHoverRouteId(node.route.id);
                    }}
                    onLeave={() => setHoverRouteId("")}
                    onClick={() => {
                      if (node.route?.id) setSelectedRouteId(node.route.id);
                    }}
                  />
                ))}
              </div>

              {/* <div className="fixed bottom-5 left-5 z-30 rounded-2xl border border-white/10 bg-[#0b0f15]/90 p-3 shadow-2xl backdrop-blur">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Mini map</p>
                <div className="relative h-28 w-44 overflow-hidden rounded-xl border border-white/10 bg-black">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }}
                  />
                  {graph.nodes.slice(0, 60).map((node) => (
                    <div
                      key={`mini-${node.id}`}
                      className={cx(
                        "absolute rounded-sm",
                        node.type === "route"
                          ? "bg-emerald-400/70"
                          : node.type === "table"
                            ? "bg-cyan-400/70"
                            : node.type === "group"
                              ? "bg-purple-400/70"
                              : "bg-zinc-400/70"
                      )}
                      style={{
                        left: `${(node.x / CANVAS_W) * 100}%`,
                        top: `${(node.y / CANVAS_H) * 100}%`,
                        width: 10,
                        height: 6,
                      }}
                    />
                  ))}
                </div>
              </div> */}
            </div>
          )}

          {viewMode === "table" && (
            <RoutesTable
              routes={filteredRoutes}
              selectedRouteId={activeRoute?.id || ""}
              onSelect={(route) => setSelectedRouteId(route.id)}
            />
          )}

          {viewMode === "flow" && (
            <RouteFlow route={activeRoute} />
          )}

          {showInspector && <RouteInspector route={activeRoute} backendRoot={data?.backend_root || ""} />}
        </main>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-black transition",
        active
          ? "bg-emerald-500/15 text-emerald-300"
          : "text-zinc-500 hover:bg-white/5 hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function RoutesTable({
  routes,
  selectedRouteId,
  onSelect,
}: {
  routes: CodeRoute[];
  selectedRouteId: string;
  onSelect: (route: CodeRoute) => void;
}) {
  return (
    <div className="absolute inset-0 overflow-auto p-5 pr-[470px]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f15]/90 shadow-2xl backdrop-blur">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-white/10 bg-black/80 text-xs uppercase tracking-wider text-zinc-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Auth</th>
              <th className="px-4 py-3">Permission</th>
              <th className="px-4 py-3">Source file</th>
              <th className="px-4 py-3">Tables</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {routes.map((route) => (
              <tr
                key={route.id}
                onClick={() => onSelect(route)}
                className={cx(
                  "cursor-pointer transition hover:bg-emerald-500/10",
                  selectedRouteId === route.id && "bg-emerald-500/15"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {route.methods?.map((method) => (
                      <span
                        key={method}
                        className={cx(
                          "rounded-full border px-2 py-0.5 text-[10px] font-black",
                          methodClass[method] || "border-white/10 bg-white/5 text-zinc-300"
                        )}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-white">{route.path}</td>
                <td className="px-4 py-3 text-zinc-300">{route.group}</td>
                <td className="px-4 py-3">
                  {route.auth?.required ? (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-300">
                      Required
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-zinc-400">
                      Public
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {route.auth?.permissions?.join(", ") || "-"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {route.endpoint?.source_file}
                  {route.endpoint?.line_number ? `:${route.endpoint.line_number}` : ""}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-sm flex-wrap gap-1">
                    {(route.data?.supabase_tables_detected || []).slice(0, 4).map((table) => (
                      <span key={table} className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-400">
                        {table}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {routes.length === 0 && (
          <div className="p-12 text-center text-zinc-500">No routes match your filters.</div>
        )}
      </div>
    </div>
  );
}

function RouteFlow({ route }: { route: CodeRoute | null }) {
  if (!route) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
        Select a route to view its request flow.
      </div>
    );
  }

  const steps = [
    {
      title: "1. Client request",
      subtitle: "Browser / tablet PWA calls the API route.",
      value: `${route.methods?.join(", ")} ${route.path}`,
      icon: <UserRound size={18} />,
    },
    {
      title: "2. FastAPI route handler",
      subtitle: "Backend endpoint function that receives the request.",
      value: `${route.endpoint?.name || "-"} · ${route.endpoint?.source_file || "-"}`,
      icon: <Server size={18} />,
    },
    {
      title: "3. Auth and RBAC",
      subtitle: route.auth?.required
        ? "Request must carry a valid session token and pass permission checks."
        : "No auth dependency detected for this route.",
      value: route.auth?.permissions?.join(", ") || "No permission detected",
      icon: <Lock size={18} />,
    },
    {
      title: "4. Inputs required",
      subtitle: "Path, query, body and header values detected from FastAPI params.",
      value: [
        ...(route.params?.path || []).map((p) => `path:${p.name || p.alias}`),
        ...(route.params?.query || []).map((p) => `query:${p.name || p.alias}`),
        ...(route.params?.body || []).map((p) => `body:${p.name || p.alias}`),
        ...(route.params?.headers || []).map((p) => `header:${p.name || p.alias}`),
      ].join(", ") || "No params detected",
      icon: <Route size={18} />,
    },
    {
      title: "5. Supabase data layer",
      subtitle: "Tables detected from backend source calls.",
      value: route.data?.supabase_tables_detected?.join(", ") || "No tables detected",
      icon: <Database size={18} />,
    },
  ];

  return (
    <div className="absolute inset-0 overflow-auto p-8 pr-[470px]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-[#0b0f15]/90 p-6 shadow-2xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">Route Flow</p>
          <h2 className="mt-3 break-all font-mono text-2xl font-black text-white">
            {route.path}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Developer walkthrough of how this endpoint moves from frontend request to backend function, RBAC and Supabase.
          </p>
        </div>

        <div className="relative space-y-5">
          <div className="absolute bottom-10 left-7 top-10 w-px bg-gradient-to-b from-emerald-500/70 via-white/20 to-cyan-500/70" />

          {steps.map((step) => (
            <div key={step.title} className="relative flex gap-5">
              <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-2xl">
                {step.icon}
              </div>
              <div className="flex-1 rounded-2xl border border-white/10 bg-black/60 p-5 shadow-2xl backdrop-blur">
                <h3 className="font-black text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{step.subtitle}</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-sm text-zinc-300">
                  {step.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapNode({
  node,
  active,
  highlighted,
  onHover,
  onLeave,
  onClick,
}: {
  node: NodeBox;
  active?: boolean;
  highlighted?: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const icon = {
    client: <UserRound size={16} />,
    system: node.title.includes("Auth") ? <KeyRound size={16} /> : node.title.includes("RBAC") ? <ShieldCheck size={16} /> : <Server size={16} />,
    group: <Boxes size={16} />,
    route: <Route size={16} />,
    table: <Database size={16} />,
  }[node.type];

  const tone =
    node.type === "client"
      ? "border-emerald-500/40 bg-emerald-500/10"
      : node.type === "system"
        ? "border-cyan-500/30 bg-cyan-500/10"
        : node.type === "group"
          ? "border-purple-500/40 bg-purple-500/15"
          : node.type === "table"
            ? highlighted
              ? "border-emerald-500/70 bg-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.16)]"
              : "border-white/10 bg-black/70"
            : active
              ? "border-emerald-500/80 bg-emerald-500/15 shadow-[0_0_35px_rgba(16,185,129,0.2)]"
              : "border-white/10 bg-black/70 hover:border-emerald-500/50 hover:bg-emerald-500/10";

  return (
    <button
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={cx(
        "absolute rounded-xl border p-4 text-left shadow-2xl backdrop-blur transition",
        node.route ? "cursor-pointer" : "cursor-default",
        tone
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.w,
        minHeight: node.h,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-emerald-400">{icon}</span>
          <p className="truncate text-sm font-black text-white">{node.title}</p>
        </div>

        {node.route?.auth?.required && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-300">
            <Lock size={10} />
            Auth
          </span>
        )}
      </div>

      {node.route?.methods?.length ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {node.route.methods.map((method) => (
            <span
              key={method}
              className={cx(
                "rounded-full border px-2 py-0.5 text-[10px] font-black",
                methodClass[method] || "border-white/10 bg-white/5 text-zinc-300"
              )}
            >
              {method}
            </span>
          ))}
        </div>
      ) : null}

      <p className="line-clamp-2 text-xs leading-5 text-zinc-400">{node.subtitle}</p>

      {node.route?.data?.supabase_tables_detected?.length ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {node.route.data.supabase_tables_detected.slice(0, 3).map((table) => (
            <span key={table} className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-400">
              {table}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

function RouteInspector({
  route,
  backendRoot,
}: {
  route: CodeRoute | null;
  backendRoot: string;
}) {
  if (!route) return null;

  const allParams = [
    ...(route.params?.path || []).map((p) => ({ ...p, kind: "Path" })),
    ...(route.params?.query || []).map((p) => ({ ...p, kind: "Query" })),
    ...(route.params?.body || []).map((p) => ({ ...p, kind: "Body" })),
    ...(route.params?.headers || []).map((p) => ({ ...p, kind: "Header" })),
  ];

  return (
    <aside className="absolute right-5 top-5 z-20 max-h-[calc(100%-40px)] w-[430px] overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0f15]/95 p-5 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">
        Route Inspector
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {route.methods?.map((method) => (
          <span
            key={method}
            className={cx(
              "rounded-full border px-2.5 py-1 text-xs font-black",
              methodClass[method] || "border-white/10 text-zinc-400"
            )}
          >
            {method}
          </span>
        ))}

        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-zinc-400">
          {route.group}
        </span>
      </div>

      <h2 className="mt-4 break-all font-mono text-lg font-black text-white">
        {route.path}
      </h2>

      <div className="mt-5 space-y-4">
        <InfoBlock
          icon={<FileCode2 size={16} />}
          title="Endpoint"
          rows={[
            ["Function", route.endpoint?.name || "-"],
            ["Module", route.endpoint?.module || "-"],
            [
              "File",
              `${route.endpoint?.source_file || "-"}${
                route.endpoint?.line_number ? `:${route.endpoint.line_number}` : ""
              }`,
            ],
          ]}
        />

        <InfoBlock
          icon={<Lock size={16} />}
          title="Auth / RBAC"
          rows={[
            ["Auth required", route.auth?.required ? "Yes" : "No"],
            [
              "Permissions",
              route.auth?.permissions?.length ? route.auth.permissions.join(", ") : "-",
            ],
            [
              "Dependencies",
              route.auth?.dependencies?.length ? route.auth.dependencies.join(", ") : "-",
            ],
          ]}
        />

        <Panel icon={<Route size={16} />} title="Inputs required">
          {allParams.length === 0 ? (
            <p className="text-sm text-zinc-500">No path/query/body/header params detected.</p>
          ) : (
            <div className="space-y-2">
              {allParams.map((param, index) => (
                <div
                  key={`${param.kind}-${param.name}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/40 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm font-bold text-white">
                      {param.name || param.alias || "-"}
                    </p>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black text-emerald-300">
                      {param.kind}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Required: {String(param.required)} · Type: {param.type || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel icon={<Database size={16} />} title="Supabase tables">
          {route.data?.supabase_tables_detected?.length ? (
            <div className="flex flex-wrap gap-2">
              {route.data.supabase_tables_detected.map((table) => (
                <span
                  key={table}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-zinc-300"
                >
                  {table}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No table calls detected in this endpoint.</p>
          )}
        </Panel>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-300">
          <strong>Backend root:</strong> {backendRoot}
        </div>
      </div>
    </aside>
  );
}

function InfoBlock({
  icon,
  title,
  rows,
}: {
  icon: ReactNode;
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <Panel icon={icon} title={title}>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
              {label}
            </p>
            <p className="mt-1 break-all text-sm text-zinc-300">{value}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Panel({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-emerald-400">
        {icon}
        <h3 className="font-black text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300">
      <span className="text-emerald-400">{icon}</span>
      {label}
    </span>
  );
}
