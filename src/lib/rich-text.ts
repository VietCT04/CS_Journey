export type RichTextSegment =
  | { type: "text"; value: string }
  | { type: "image"; src: string; alt: string };

export type RichTextListItem = {
  content: RichTextSegment[];
  children: RichTextListItem[];
};

export type RichTextBlock =
  | { type: "paragraph"; content: RichTextSegment[] }
  | { type: "list"; items: RichTextListItem[] };

const imageTokenPattern = /\[\[image:([^|\]\r\n]+)(?:\|([^\]\r\n]*))?\]\]/g;
const dataImagePattern = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,[A-Za-z0-9+/=\s]+$/i;
const uploadImagePattern = /^\/uploads\/[A-Za-z0-9._/-]+$/;

export function parseRichTextDetail(detail: string) {
  const segments: RichTextSegment[] = [];
  let cursor = 0;

  for (const match of detail.matchAll(imageTokenPattern)) {
    const source = match[1];
    if (!isAllowedImageSource(source)) continue;

    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ type: "text", value: detail.slice(cursor, index) });
    }
    segments.push({ type: "image", src: source, alt: match[2]?.trim() || "Pasted image" });
    cursor = index + match[0].length;
  }

  if (cursor < detail.length || segments.length === 0) {
    segments.push({ type: "text", value: detail.slice(cursor) });
  }

  return segments;
}

/**
 * Splits note detail into display blocks. A dash at the beginning of a line is
 * an unordered-list item; leading whitespace makes that item a child of the
 * most recent less-indented item.
 */
export function parseRichTextBlocks(detail: string): RichTextBlock[] {
  const lines = splitRichTextLines(parseRichTextDetail(detail));
  const blocks: RichTextBlock[] = [];
  let paragraphLines: RichTextSegment[][] = [];

  const addParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({ type: "paragraph", content: joinRichTextLines(paragraphLines) });
    paragraphLines = [];
  };

  for (let index = 0; index < lines.length;) {
    const listItem = toListLine(lines[index]);
    if (!listItem) {
      paragraphLines.push(lines[index]);
      index += 1;
      continue;
    }

    addParagraph();
    const listLines: Array<{ indent: number; content: RichTextSegment[] }> = [];
    while (index < lines.length) {
      const nextListItem = toListLine(lines[index]);
      if (!nextListItem) break;
      listLines.push(nextListItem);
      index += 1;
    }
    blocks.push({ type: "list", items: buildListTree(listLines) });
  }

  addParagraph();
  return blocks;
}

export function detailToEditorHtml(detail: string) {
  return parseRichTextDetail(detail)
    .map((segment) => {
      if (segment.type === "image") {
        return `<img src="${escapeHtmlAttribute(segment.src)}" alt="${escapeHtmlAttribute(segment.alt)}" />`;
      }
      return escapeHtml(segment.value).replace(/\r?\n/g, "<br />");
    })
    .join("");
}

export function editorHtmlToDetail(root: HTMLElement) {
  const serializeNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as HTMLElement;
    if (element.tagName === "IMG") {
      const source = element.getAttribute("src") ?? "";
      if (!isAllowedImageSource(source)) return "";
      const alt = element.getAttribute("alt")?.replace(/[\r\n\]|]/g, " ").trim() || "Pasted image";
      return `[[image:${source}|${alt}]]`;
    }
    if (element.tagName === "BR") {
      return "\n";
    }

    const content = Array.from(element.childNodes).map(serializeNode).join("");
    return ["DIV", "P", "LI", "PRE", "BLOCKQUOTE"].includes(element.tagName) ? `${content}\n` : content;
  };

  return Array.from(root.childNodes).map(serializeNode).join("");
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error ?? new Error("Could not read pasted image")));
    reader.readAsDataURL(file);
  });
}

function isAllowedImageSource(source: string) {
  return dataImagePattern.test(source) || uploadImagePattern.test(source);
}

function splitRichTextLines(segments: RichTextSegment[]) {
  const lines: RichTextSegment[][] = [[]];

  for (const segment of segments) {
    if (segment.type === "image") {
      lines.at(-1)?.push(segment);
      continue;
    }

    const textLines = segment.value.split(/\r?\n/);
    textLines.forEach((text, index) => {
      if (text) lines.at(-1)?.push({ type: "text", value: text });
      if (index < textLines.length - 1) lines.push([]);
    });
  }

  return lines;
}

function joinRichTextLines(lines: RichTextSegment[][]) {
  const content: RichTextSegment[] = [];
  lines.forEach((line, index) => {
    if (index > 0) content.push({ type: "text", value: "\n" });
    content.push(...line);
  });
  return content;
}

function toListLine(line: RichTextSegment[]) {
  const firstTextSegment = line[0];
  if (!firstTextSegment || firstTextSegment.type !== "text") return null;

  const match = firstTextSegment.value.match(/^([ \t]*)-(?:\s+(.*)|\s*)$/);
  if (!match) return null;

  const indent = match[1].replace(/\t/g, " ").length;
  const content: RichTextSegment[] = [];
  if (match[2]) content.push({ type: "text", value: match[2] });
  content.push(...line.slice(1));
  return { indent, content };
}

function buildListTree(lines: Array<{ indent: number; content: RichTextSegment[] }>) {
  const items: RichTextListItem[] = [];
  const ancestors: Array<{ indent: number; item: RichTextListItem }> = [];

  for (const line of lines) {
    const item: RichTextListItem = { content: line.content, children: [] };
    while (ancestors.length > 0 && ancestors.at(-1)!.indent >= line.indent) {
      ancestors.pop();
    }

    const parent = ancestors.at(-1)?.item;
    if (parent) {
      parent.children.push(item);
    } else {
      items.push(item);
    }
    ancestors.push({ indent: line.indent, item });
  }

  return items;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value);
}
