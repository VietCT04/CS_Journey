export type RichTextSegment =
  | { type: "text"; value: string }
  | { type: "image"; src: string; alt: string };

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
