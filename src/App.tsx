import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileJson, Menu, PanelLeftClose, Plus, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { KnowledgeSidebar } from "@/components/KnowledgeSidebar";
import { KnowledgeTimeline } from "@/components/KnowledgeTimeline";
import { createId } from "@/lib/utils";
import { initialJourney, type JourneyData, type JourneyNode, type TimelineEntry } from "@/data/journey";

const STORAGE_KEY = "cs-journey-data-v1";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [journey, setJourney] = useState<JourneyData>(() => readStoredJourney());
  const isAdmin = path.startsWith("/admin");

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  }, [journey]);

  const entryCount = useMemo(() => journey.nodes.reduce((total, node) => total + (node.kind === "month" ? node.entries.length : 0), 0), [journey.nodes]);

  function navigate(to: string) {
    window.history.pushState({}, "", to);
    setPath(to);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateNode(id: string, patch: Partial<JourneyNode>) {
    setJourney((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === id ? ({ ...node, ...patch } as JourneyNode) : node) }));
  }

  function deleteNode(node: JourneyNode) {
    if (!window.confirm(`Delete “${node.title}” from the journey?`)) return;
    setJourney((current) => ({ ...current, nodes: current.nodes.filter((item) => item.id !== node.id) }));
  }

  function addNode(kind: "month" | "major") {
    const node: JourneyNode = kind === "month"
      ? { kind, id: createId("month"), dateLabel: "NEW MONTH", title: "A new chapter", summary: "Describe what this month was really about.", focus: "focus · theme · direction", entries: [] }
      : { kind, id: createId("major"), dateLabel: "NEW MILESTONE", title: "A meaningful turning point", summary: "Name the moment that changed the shape of the journey.", detail: "Add the story behind this milestone.", tags: ["milestone"] };
    setJourney((current) => ({ ...current, nodes: [node, ...current.nodes] }));
  }

  function addEntry(nodeId: string, entry: TimelineEntry) {
    setJourney((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === nodeId && node.kind === "month" ? { ...node, entries: [...node.entries, entry] } : node) }));
  }

  function updateEntry(nodeId: string, entry: TimelineEntry) {
    setJourney((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === nodeId && node.kind === "month" ? { ...node, entries: node.entries.map((item) => item.id === entry.id ? entry : item) } : node) }));
  }

  function deleteEntry(nodeId: string, entryId: string) {
    if (!window.confirm("Delete this note from the journey?")) return;
    setJourney((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === nodeId && node.kind === "month" ? { ...node, entries: node.entries.filter((entry) => entry.id !== entryId) } : node) }));
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(journey, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "public-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SidebarProvider open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <div className="site-shell">
        <KnowledgeSidebar path={path} nodeCount={journey.nodes.length} entryCount={entryCount} />
        {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
        <main className="main-pane">
          <header className="topbar">
            <div className="topbar-left">
              <Button size="icon" variant="ghost" className="mobile-menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={18} /></Button>
              <span className="topbar-route">/ {isAdmin ? "admin" : "knowledge"}</span><span className="topbar-separator">/</span><span className="topbar-muted">timeline</span>
            </div>
            <div className="topbar-right"><span className="sync-state"><Radio size={13} /> {isAdmin ? "local changes on" : "read-only"}</span><span className="topbar-date">03 SEP 2026</span></div>
          </header>

          <div className="page-wrap">
            <section className="hero-section">
              <div className="hero-eyebrow"><span className="eyebrow-line" /><span>Personal engineering knowledge journey</span></div>
              <div className="hero-heading-row">
                <div>
                  <h1>Learning in public,<br /><em>one layer at a time.</em></h1>
                  <p className="hero-copy">A quiet record of the concepts, systems, and questions shaping how I build.</p>
                </div>
                <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring orbit-ring--outer" /><div className="orbit-ring orbit-ring--inner" /><div className="orbit-core" /><span className="orbit-label">IN<br />PROGRESS</span></div>
              </div>
              <div className="hero-footer">
                <div className="hero-metrics"><div className="metric"><strong>{String(journey.nodes.length).padStart(2, "0")}</strong><span>chapters</span></div><div className="metric"><strong>{String(entryCount).padStart(2, "0")}</strong><span>field notes</span></div><div className="metric"><strong>∞</strong><span>curiosity</span></div></div>
                <Badge className="version-badge">Updated / 03.09.26</Badge>
              </div>
            </section>

            <section className="journey-intro-bar"><div><span className="section-kicker">01 / The journey</span><h2>Small notes. Bigger patterns.</h2></div><p>Scroll through the chapters. Open a month to see what made it into the notebook.</p></section>

            {isAdmin && <section className="admin-toolbar" aria-label="Timeline editor controls"><div className="admin-toolbar-copy"><span className="admin-icon"><FileJson size={16} /></span><div><strong>Local editor</strong><span>Changes are saved locally and stay in this browser until exported.</span></div></div><div className="admin-toolbar-actions"><Button size="sm" variant="secondary" onClick={() => addNode("month")}><Plus size={14} /> Month</Button><Button size="sm" variant="secondary" onClick={() => addNode("major")}><Plus size={14} /> Major milestone</Button><Button size="sm" variant="primary" onClick={exportData}><Download size={14} /> Export public data</Button></div></section>}

            <KnowledgeTimeline nodes={journey.nodes} editable={isAdmin} onUpdateNode={updateNode} onDeleteNode={deleteNode} onAddEntry={addEntry} onUpdateEntry={updateEntry} onDeleteEntry={deleteEntry} />

            <footer className="page-footer"><div><span className="footer-prompt">keep going</span><span className="footer-slash"> / </span><span>the map is allowed to change</span></div>{isAdmin ? <button className="footer-link" onClick={() => navigate("/knowledge")}><Eye size={14} /> Preview public view</button> : <button className="footer-link" onClick={() => navigate("/admin")}><PanelLeftClose size={14} /> Open local admin</button>}</footer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function readStoredJourney(): JourneyData {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialJourney;
    const parsed = JSON.parse(stored) as JourneyData;
    if (!parsed?.profile || !Array.isArray(parsed.nodes)) return initialJourney;
    return parsed;
  } catch {
    return initialJourney;
  }
}
