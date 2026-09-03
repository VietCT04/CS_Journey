import { useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useScroll, useSpring } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Code2,
  GitBranch,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntryEditor, NodeEditor } from "@/components/JourneyForms";
import type { JourneyNode, MajorNode, MonthNode, TimelineEntry } from "@/data/journey";
import { cn } from "@/lib/utils";

type KnowledgeTimelineProps = {
  nodes: JourneyNode[];
  editable?: boolean;
  onUpdateNode: (id: string, patch: Partial<JourneyNode>) => void;
  onDeleteNode: (node: JourneyNode) => void;
  onAddEntry: (nodeId: string, entry: TimelineEntry) => void;
  onUpdateEntry: (nodeId: string, entry: TimelineEntry) => void;
  onDeleteEntry: (nodeId: string, entryId: string) => void;
};

export function KnowledgeTimeline({
  nodes,
  editable = false,
  onUpdateNode,
  onDeleteNode,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: KnowledgeTimelineProps) {
  const timelineRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.18", "end 0.85"],
  });
  const beamScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className="timeline-section" ref={timelineRef} aria-label="Knowledge journey timeline">
      <div className="timeline-line" aria-hidden="true">
        <motion.div className="timeline-beam" style={{ scaleY: beamScale }} />
      </div>
      <LayoutGroup id="knowledge-journey">
        <div className="timeline-list">
          {nodes.map((node, index) =>
            node.kind === "month" ? (
              <MonthNodeCard
                key={node.id}
                node={node}
                index={index}
                editable={editable}
                onUpdateNode={onUpdateNode}
                onDeleteNode={onDeleteNode}
                onAddEntry={onAddEntry}
                onUpdateEntry={onUpdateEntry}
                onDeleteEntry={onDeleteEntry}
              />
            ) : (
              <MajorNodeCard
                key={node.id}
                node={node}
                index={index}
                editable={editable}
                onUpdateNode={onUpdateNode}
                onDeleteNode={onDeleteNode}
              />
            ),
          )}
        </div>
      </LayoutGroup>
    </section>
  );
}

type BaseNodeProps = {
  index: number;
  editable: boolean;
  onUpdateNode: KnowledgeTimelineProps["onUpdateNode"];
  onDeleteNode: KnowledgeTimelineProps["onDeleteNode"];
};

function MonthNodeCard({
  node,
  index,
  editable,
  onUpdateNode,
  onDeleteNode,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: BaseNodeProps & {
  node: MonthNode;
  onAddEntry: KnowledgeTimelineProps["onAddEntry"];
  onUpdateEntry: KnowledgeTimelineProps["onUpdateEntry"];
  onDeleteEntry: KnowledgeTimelineProps["onDeleteEntry"];
}) {
  const [open, setOpen] = useState(index === 0);
  const [editing, setEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [addingEntry, setAddingEntry] = useState(false);

  return (
    <motion.article layout className="journey-node journey-node--month">
      <TimelineMarker type="month" active={open} />
      <div className="node-meta">
        <span className="node-index">{String(index + 1).padStart(2, "0")}</span>
        <span>{node.dateLabel}</span>
        <span className="node-meta-rule" />
      </div>
      <div className="node-content">
        <div className="node-heading">
          <button className="node-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <span className="node-kicker"><CalendarDays size={13} /> Monthly chapter</span>
            <span className="node-title-row">
              <h2>{node.title}</h2>
              <ChevronDown className={cn("node-chevron", open && "node-chevron--open")} size={18} />
            </span>
            <p>{node.summary}</p>
          </button>
          {editable && (
            <EditorActions
              onEdit={() => { setEditing(true); setOpen(true); }}
              onDelete={() => onDeleteNode(node)}
            />
          )}
        </div>

        <AnimatePresence initial={false} mode="wait">
          {editing && (
            <motion.div key="node-editor" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24 }} className="editor-wrap">
              <NodeEditor node={node} onSave={(patch) => { onUpdateNode(node.id, patch); setEditing(false); }} onCancel={() => setEditing(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="month-content" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="node-body">
              <div className="focus-line"><span className="focus-label">Focus</span><span>{node.focus}</span></div>
              <div className="entry-list">
                {node.entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    editable={editable}
                    editing={editingEntryId === entry.id}
                    onEdit={() => setEditingEntryId(entry.id)}
                    onDelete={() => onDeleteEntry(node.id, entry.id)}
                    onSave={(updatedEntry) => { onUpdateEntry(node.id, updatedEntry); setEditingEntryId(null); }}
                    onCancel={() => setEditingEntryId(null)}
                  />
                ))}
              </div>
              {editable && (addingEntry ? (
                <EntryEditor onSave={(entry) => { onAddEntry(node.id, entry); setAddingEntry(false); }} onCancel={() => setAddingEntry(false)} />
              ) : (
                <button className="add-entry-button" onClick={() => setAddingEntry(true)}><Plus size={15} /> Add a note to this chapter</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function MajorNodeCard({ node, index, editable, onUpdateNode, onDeleteNode }: BaseNodeProps & { node: MajorNode }) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);

  return (
    <motion.article layout className="journey-node journey-node--major">
      <TimelineMarker type="major" active={open} />
      <div className="node-meta node-meta--major"><span className="node-index">{String(index + 1).padStart(2, "0")}</span><span>{node.dateLabel}</span><span className="node-meta-rule" /></div>
      <div className="node-content major-content">
        <div className="major-card">
          <div className="major-orb major-orb--one" />
          <div className="major-orb major-orb--two" />
          <div className="major-card-inner">
            <div className="node-heading node-heading--major">
              <button className="node-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
                <span className="node-kicker node-kicker--special"><Sparkles size={13} /> Major milestone</span>
                <span className="node-title-row"><h2>{node.title}</h2><ChevronDown className={cn("node-chevron", open && "node-chevron--open")} size={18} /></span>
                <p>{node.summary}</p>
              </button>
              {editable && <EditorActions onEdit={() => { setEditing(true); setOpen(true); }} onDelete={() => onDeleteNode(node)} />}
            </div>
            <AnimatePresence initial={false}>
              {editing && (
                <motion.div key="major-editor" layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.24 }} className="editor-wrap">
                  <NodeEditor node={node} onSave={(patch) => { onUpdateNode(node.id, patch); setEditing(false); }} onCancel={() => setEditing(false)} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div key="major-detail" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }} className="major-detail">
                  <p>{node.detail}</p>
                  <div className="major-footer">
                    <div className="tag-row">{node.tags.map((tag) => <Badge key={tag} className="major-tag">{tag}</Badge>)}</div>
                    <span className="milestone-signal"><Check size={13} /> Marked in the journey</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function TimelineMarker({ type, active }: { type: "month" | "major"; active: boolean }) {
  return (
    <div className={cn("timeline-marker", type === "major" && "timeline-marker--major")}>
      <motion.div className="timeline-marker-halo" animate={{ opacity: active ? 1 : 0.45, scale: active ? 1 : 0.86 }} transition={{ duration: 0.28 }} />
      {type === "major" ? <Sparkles size={15} /> : <CircleDot size={15} />}
    </div>
  );
}

function EditorActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="editor-actions editor-actions--node" aria-label="Edit milestone">
      <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit milestone" title="Edit milestone"><Pencil size={14} /></Button>
      <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete milestone" title="Delete milestone"><Trash2 size={14} /></Button>
    </div>
  );
}

type EntryCardProps = {
  entry: TimelineEntry;
  editable: boolean;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (entry: TimelineEntry) => void;
  onCancel: () => void;
};

function EntryCard({ entry, editable, editing, onEdit, onDelete, onSave, onCancel }: EntryCardProps) {
  const Icon = entry.kind === "built" ? Code2 : entry.kind === "reflection" ? GitBranch : BookOpen;
  return (
    <motion.div layout className="entry-wrap">
      <div className="entry-card">
        <div className={cn("entry-icon", `entry-icon--${entry.kind}`)}><Icon size={15} /></div>
        <div className="entry-copy">
          <div className="entry-topline"><span className="entry-date">{entry.date}</span><span className="entry-kind">{entry.kind}</span>{entry.duration && <span className="entry-duration"><Clock3 size={12} /> {entry.duration}</span>}</div>
          <h3>{entry.title}</h3>
          <p>{entry.detail}</p>
          <div className="entry-bottomline">
            <div className="tag-row">{entry.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div>
            {editable && <div className="entry-actions"><Button size="sm" variant="ghost" onClick={onEdit}><Pencil size={13} /> Edit</Button><Button size="sm" variant="ghost" onClick={onDelete}><Trash2 size={13} /></Button></div>}
          </div>
        </div>
        <ArrowUpRight className="entry-arrow" size={16} />
      </div>
      <AnimatePresence initial={false}>
        {editing && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="editor-wrap editor-wrap--entry"><EntryEditor entry={entry} onSave={onSave} onCancel={onCancel} /></motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}
