import { useState } from "react";
import { Flame } from "lucide-react";
import { EntryCard } from "@/components/KnowledgeTimeline";
import { formatMonthLabel, getFeaturedEntries, type JourneyNode, type TimelineEntry } from "@/data/journey";

type HighlightsWorkspaceProps = {
  nodes: JourneyNode[];
  editable?: boolean;
  onUpdateEntry: (nodeId: string, entry: TimelineEntry) => void;
  onDeleteEntry: (nodeId: string, entryId: string) => void;
};

export function HighlightsWorkspace({ nodes, editable = false, onUpdateEntry, onDeleteEntry }: HighlightsWorkspaceProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const highlights = getFeaturedEntries(nodes);

  return (
    <section className="highlights-workspace" aria-label="Featured highlights">
      {highlights.length > 0 ? (
        <div className="highlights-list">
          {highlights.map(({ entry, source }) => (
            <article className="highlight-item" key={entry.id}>
              <div className="highlight-source">
                <span><Flame size={12} /> From {formatMonthLabel(source.dateLabel)}</span>
                <span>{source.title}</span>
              </div>
              <EntryCard
                entry={entry}
                editable={editable}
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
        <div className="highlights-empty">
          <span className="highlights-empty-icon"><Flame size={17} /></span>
          <strong>No highlights yet</strong>
          <p>Mark an entry as featured from the local editor and it will appear here.</p>
        </div>
      )}
    </section>
  );
}
