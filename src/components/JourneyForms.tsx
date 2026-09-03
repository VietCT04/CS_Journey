import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { JourneyNode, TimelineEntry } from "@/data/journey";

type NodeEditorProps = {
  node: JourneyNode;
  onSave: (patch: Partial<JourneyNode>) => void;
  onCancel: () => void;
};

export function NodeEditor({ node, onSave, onCancel }: NodeEditorProps) {
  const [title, setTitle] = useState(node.title);
  const [dateLabel, setDateLabel] = useState(node.dateLabel);
  const [summary, setSummary] = useState(node.summary);
  const [secondary, setSecondary] = useState(node.kind === "month" ? node.focus : node.detail);
  const [tags, setTags] = useState(node.kind === "major" ? node.tags.join(", ") : "");

  useEffect(() => {
    setTitle(node.title);
    setDateLabel(node.dateLabel);
    setSummary(node.summary);
    setSecondary(node.kind === "month" ? node.focus : node.detail);
    setTags(node.kind === "major" ? node.tags.join(", ") : "");
  }, [node]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const base = { title, dateLabel, summary };
    if (node.kind === "month") {
      onSave({ ...base, focus: secondary });
    } else {
      onSave({ ...base, detail: secondary, tags: splitTags(tags) });
    }
  }

  return (
    <form className="inline-editor" onSubmit={handleSubmit}>
      <div className="editor-form-grid">
        <label>
          <span>Display date</span>
          <Input value={dateLabel} onChange={(event) => setDateLabel(event.target.value)} />
        </label>
        <label>
          <span>Title</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
      </div>
      <label>
        <span>Summary</span>
        <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} required />
      </label>
      <label>
        <span>{node.kind === "month" ? "Focus line" : "Milestone detail"}</span>
        <Textarea value={secondary} onChange={(event) => setSecondary(event.target.value)} required />
      </label>
      {node.kind === "major" && (
        <label>
          <span>Tags, separated by commas</span>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} />
        </label>
      )}
      <div className="editor-actions">
        <Button size="sm" variant="primary" type="submit">
          <Check size={14} /> Save changes
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Button>
      </div>
    </form>
  );
}

type EntryEditorProps = {
  entry?: TimelineEntry;
  onSave: (entry: TimelineEntry) => void;
  onCancel: () => void;
};

export function EntryEditor({ entry, onSave, onCancel }: EntryEditorProps) {
  const [date, setDate] = useState(entry?.date ?? "NEW NOTE");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [detail, setDetail] = useState(entry?.detail ?? "");
  const [kind, setKind] = useState<TimelineEntry["kind"]>(entry?.kind ?? "learned");
  const [tags, setTags] = useState(entry?.tags.join(", ") ?? "");
  const [duration, setDuration] = useState(entry?.duration ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      id: entry?.id ?? `entry-${Date.now()}`,
      date,
      title,
      detail,
      kind,
      tags: splitTags(tags),
      duration: duration || undefined,
    });
  }

  return (
    <form className="entry-editor" onSubmit={handleSubmit}>
      <div className="editor-form-grid editor-form-grid--entry">
        <label>
          <span>Date</span>
          <Input value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label>
          <span>Type</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as TimelineEntry["kind"])}>
            <option value="learned">Learned</option>
            <option value="built">Built</option>
            <option value="reflection">Reflection</option>
          </select>
        </label>
      </div>
      <label>
        <span>Note title</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        <span>What happened</span>
        <Textarea value={detail} onChange={(event) => setDetail(event.target.value)} required />
      </label>
      <div className="editor-form-grid editor-form-grid--entry">
        <label>
          <span>Tags</span>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="systems, notes" />
        </label>
        <label>
          <span>Time spent</span>
          <Input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="45 min" />
        </label>
      </div>
      <div className="editor-actions">
        <Button size="sm" variant="primary" type="submit">
          {entry ? <Check size={14} /> : <Plus size={14} />} {entry ? "Save note" : "Add note"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Button>
      </div>
    </form>
  );
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
