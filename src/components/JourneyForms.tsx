import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toMonthInputValue, type JourneyNode, type TimelineEntry } from "@/data/journey";
import { detailToEditorHtml, editorHtmlToDetail, fileToDataUrl } from "@/lib/rich-text";

type NodeEditorProps = {
  node: JourneyNode;
  onSave: (patch: Partial<JourneyNode>) => void;
  onCancel: () => void;
};

export function NodeEditor({ node, onSave, onCancel }: NodeEditorProps) {
  const [title, setTitle] = useState(node.title);
  const [dateLabel, setDateLabel] = useState(toMonthInputValue(node.dateLabel));
  const [summary, setSummary] = useState(node.summary);
  const [secondary, setSecondary] = useState(node.kind === "month" ? node.focus : node.detail);
  const [tags, setTags] = useState(node.kind === "major" ? node.tags.join(", ") : "");

  useEffect(() => {
    setTitle(node.title);
    setDateLabel(toMonthInputValue(node.dateLabel));
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
          <span>Month</span>
          <Input type="month" value={dateLabel} onChange={(event) => setDateLabel(event.target.value)} required />
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

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = detailToEditorHtml(value);
  }, []);

  useEffect(() => {
    if (!editorRef.current || value === lastValue.current) return;
    editorRef.current.innerHTML = detailToEditorHtml(value);
    lastValue.current = value;
  }, [value]);

  function syncValue() {
    if (!editorRef.current) return;
    const nextValue = editorHtmlToDetail(editorRef.current);
    lastValue.current = nextValue;
    onChange(nextValue);
  }

  function getSelectionRange() {
    const root = editorRef.current;
    const selection = window.getSelection();
    if (!root) return null;
    if (selection && selection.rangeCount > 0 && root.contains(selection.anchorNode)) {
      return selection.getRangeAt(0);
    }

    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    return range;
  }

  function insertText(text: string) {
    const range = getSelectionRange();
    if (!range) return;
    range.deleteContents();
    const textNode = document.createTextNode(text.replace(/\r\n?/g, "\n"));
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function insertImage(source: string, range: Range | null) {
    const root = editorRef.current;
    if (!root || !range) return;
    root.focus();
    range.deleteContents();
    const image = document.createElement("img");
    image.src = source;
    image.alt = "Pasted image";
    range.insertNode(image);
    range.setStartAfter(image);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      event.preventDefault();
      const file = imageItem.getAsFile();
      const range = getSelectionRange();
      if (file) {
        insertImage(await fileToDataUrl(file), range);
        syncValue();
      }
      return;
    }

    const text = event.clipboardData.getData("text/plain");
    if (!text) return;
    event.preventDefault();
    insertText(text);
    syncValue();
  }

  return (
    <div
      ref={editorRef}
      className="rich-text-editor"
      contentEditable
      role="textbox"
      aria-label="What happened"
      aria-multiline="true"
      data-placeholder="Write what happened, then paste images between the lines..."
      onInput={syncValue}
      onPaste={handlePaste}
      suppressContentEditableWarning
    />
  );
}

type EntryEditorProps = {
  entry?: TimelineEntry;
  onSave: (entry: TimelineEntry) => void;
  onCancel: () => void;
};

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EntryEditor({ entry, onSave, onCancel }: EntryEditorProps) {
  const [date, setDate] = useState(entry?.date ?? getTodayDateInputValue());
  const [title, setTitle] = useState(entry?.title ?? "");
  const [detail, setDetail] = useState(entry?.detail ?? "");
  const [kind, setKind] = useState<TimelineEntry["kind"]>(entry?.kind ?? "learned");
  const [tags, setTags] = useState(entry?.tags.join(", ") ?? "");
  const [featured, setFeatured] = useState(entry?.featured ?? false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail.trim()) return;
    onSave({
      id: entry?.id ?? `entry-${Date.now()}`,
      date,
      title,
      detail,
      kind,
      tags: splitTags(tags),
      featured,
    });
  }

  return (
    <form className="entry-editor" onSubmit={handleSubmit}>
      <div className="editor-form-grid editor-form-grid--entry">
        <label>
          <span>Date</span>
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
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
        <RichTextEditor value={detail} onChange={setDetail} />
      </label>
      <label>
        <span>Tags</span>
        <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="systems, notes" />
      </label>
      <div className="entry-featured-field">
        <span className="entry-field-label">Presentation</span>
        <label className="entry-featured-toggle">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          <span className="entry-featured-checkbox" aria-hidden="true" />
          <span className="entry-featured-copy"><strong>Highlight this note</strong><small>Use the warm flame treatment for a featured entry.</small></span>
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
