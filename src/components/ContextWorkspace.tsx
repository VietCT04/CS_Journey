import { useState } from "react";
import { BriefcaseBusiness, FolderKanban } from "lucide-react";
import { EntryCard } from "@/components/KnowledgeTimeline";
import { formatMonthLabel, formatWorkspaceKind, getWorkspaceEntries, type JourneyNode, type TimelineEntry, type WorkspaceKind, type WorkspaceOption } from "@/data/journey";

type ContextWorkspaceProps = {
  nodes: JourneyNode[];
  workspace: Pick<WorkspaceOption, "kind" | "name"> & { kind: WorkspaceKind };
  workspaceOptions: WorkspaceOption[];
  editable?: boolean;
  onUpdateEntry: (nodeId: string, entry: TimelineEntry) => void;
  onDeleteEntry: (nodeId: string, entryId: string) => void;
};

export function ContextWorkspace({ nodes, workspace, workspaceOptions, editable = false, onUpdateEntry, onDeleteEntry }: ContextWorkspaceProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const entries = getWorkspaceEntries(nodes, workspace);
  const Icon = workspace.kind === "project" ? FolderKanban : BriefcaseBusiness;
  const workspaceLabel = formatWorkspaceKind(workspace.kind);

  return (
    <section className="context-workspace" aria-label={`${workspaceLabel} workspace: ${workspace.name}`}>
      <div className={`context-workspace-header context-workspace-header--${workspace.kind}`}>
        <span className="context-workspace-icon"><Icon size={18} /></span>
        <div>
          <span className="context-workspace-kicker">{workspaceLabel} workspace</span>
          <h2>{workspace.name}</h2>
          <p>Only events connected to this {workspaceLabel.toLocaleLowerCase()} are shown here.</p>
        </div>
        <span className="context-workspace-count">{String(entries.length).padStart(2, "0")} {entries.length === 1 ? "event" : "events"}</span>
      </div>

      {entries.length > 0 ? (
        <div className="context-workspace-list">
          {entries.map(({ entry, source }) => (
            <article className="context-workspace-entry" key={entry.id}>
              <div className="context-workspace-source">
                <span>{formatMonthLabel(source.dateLabel)}</span>
                <span>{source.title}</span>
              </div>
              <EntryCard
                entry={entry}
                editable={editable}
                workspaceOptions={workspaceOptions}
                editing={editingId === entry.id}
                onEdit={() => setEditingId(entry.id)}
                onDelete={() => onDeleteEntry(source.id, entry.id)}
                onSave={(updatedEntry) => { onUpdateEntry(source.id, updatedEntry); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            </article>
          ))}
        </div>
      ) : (
        <div className="context-workspace-empty">
          <span className="context-workspace-empty-icon"><Icon size={17} /></span>
          <strong>No events in this workspace yet</strong>
          <p>{editable ? "Choose this workspace when adding a project or work event." : "Related events will appear here once they are published."}</p>
        </div>
      )}
    </section>
  );
}
