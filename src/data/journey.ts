export type EntryKind = "learned" | "built" | "reflection";

export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: EntryKind;
  tags: string[];
  featured?: boolean;
};

const monthLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function formatEntryDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day || month < 1 || month > 12) {
    return value;
  }

  return `${String(day).padStart(2, "0")} ${monthLabels[month - 1]}`;
}

export function formatMonthLabel(value: string) {
  const [year, month] = toMonthInputValue(value).split("-").map(Number);

  if (year && month && month >= 1 && month <= 12) {
    return `${monthLabels[month - 1]} ${year}`;
  }

  return value;
}

export function toMonthInputValue(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  const legacyLabel = value.match(/^([A-Za-z]{3})\s+(\d{4})$/);
  if (legacyLabel) {
    const month = monthLabels.findIndex((label) => label === legacyLabel[1].toUpperCase()) + 1;
    if (month > 0) {
      return `${legacyLabel[2]}-${String(month).padStart(2, "0")}`;
    }
  }

  const numericLabel = value.match(/^(\d{1,2})\/(\d{4})$/);
  if (numericLabel) {
    const month = Number(numericLabel[1]);
    if (month >= 1 && month <= 12) {
      return `${numericLabel[2]}-${String(month).padStart(2, "0")}`;
    }
  }

  return "";
}

function compareDescendingDate(a: number | null, b: number | null) {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

function monthSortValue(value: string) {
  const [year, month] = toMonthInputValue(value).split("-").map(Number);
  return year && month >= 1 && month <= 12 ? year * 100 + month : null;
}

function entrySortValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month >= 1 && month <= 12 && day >= 1 && day <= 31
    ? year * 10000 + month * 100 + day
    : null;
}

export function sortTimelineNodes(nodes: JourneyNode[]) {
  return nodes
    .map((node, index) => ({ node, index }))
    .sort((a, b) => compareDescendingDate(monthSortValue(a.node.dateLabel), monthSortValue(b.node.dateLabel)) || b.index - a.index)
    .map(({ node }) => node);
}

export function sortEntriesByDate(entries: TimelineEntry[]) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => compareDescendingDate(entrySortValue(a.entry.date), entrySortValue(b.entry.date)) || b.index - a.index)
    .map(({ entry }) => entry);
}

export type MonthNode = {
  kind: "month";
  id: string;
  dateLabel: string;
  title: string;
  summary: string;
  focus: string;
  entries: TimelineEntry[];
};

export type MajorNode = {
  kind: "major";
  id: string;
  dateLabel: string;
  title: string;
  summary: string;
  detail: string;
  tags: string[];
};

export type JourneyNode = MonthNode | MajorNode;

export type JourneyData = {
  profile: {
    name: string;
    role: string;
    timezone: string;
  };
  nodes: JourneyNode[];
};

export const initialJourney: JourneyData = {
  profile: {
    name: "Son Viet",
    role: "Software engineer in progress",
    timezone: "Asia/Singapore",
  },
  nodes: [
    {
      kind: "month",
      id: "2026-04-systems-thinking",
      dateLabel: "2026-04",
      title: "Deepening systems thinking",
      summary:
        "Moving from isolated features to the forces that shape reliable systems.",
      focus: "distributed systems · observability · trade-offs",
      entries: [
        {
          id: "entry-queue-backpressure",
          date: "2026-04-28",
          title: "Queue backpressure, without the hand-waving",
          detail:
            "Mapped the moment a healthy queue becomes a system-wide feedback loop. The useful shift was to reason from load, capacity, and failure mode together.",
          kind: "learned",
          tags: ["distributed systems", "queues"],
        },
        {
          id: "entry-tracing-contract",
          date: "2026-04-22",
          title: "A tracing contract for future me",
          detail:
            "Defined the smallest set of spans and attributes that would let me follow a request across service boundaries six months from now.",
          kind: "built",
          tags: ["observability", "instrumentation"],
        },
        {
          id: "entry-latency-budget",
          date: "2026-04-14",
          title: "Latency is a product decision",
          detail:
            "Turned a vague performance goal into a budget per dependency. It made a surprising number of technical debates much more concrete.",
          kind: "reflection",
          tags: ["performance", "trade-offs"],
        },
      ],
    },
    {
      kind: "major",
      id: "major-first-design-note",
      dateLabel: "2026-03",
      title: "First systems design note",
      summary: "A deliberate pause to make the invisible decisions visible.",
      detail:
        "I wrote the first end-to-end design note for a service instead of jumping straight into implementation. The artifact became a way to reason with other people, not just a record of what I already knew.",
      tags: ["systems design", "communication", "milestone"],
    },
    {
      kind: "month",
      id: "2026-02-runtime-fundamentals",
      dateLabel: "2026-02",
      title: "Runtime fundamentals",
      summary:
        "Making the machine underneath the application feel less mysterious.",
      focus: "processes · memory · concurrency",
      entries: [
        {
          id: "entry-process-memory",
          date: "2026-02-26",
          title: "Following a process from fork to exit",
          detail:
            "Revisited process creation and memory layout until the lifecycle felt visual instead of purely symbolic.",
          kind: "learned",
          tags: ["operating systems", "processes"],
        },
        {
          id: "entry-race-condition",
          date: "2026-02-18",
          title: "The smallest race condition I could make",
          detail:
            "Built a tiny reproducible race, then made it disappear with synchronization. The experiment was intentionally small enough to keep in my head.",
          kind: "built",
          tags: ["concurrency", "debugging"],
        },
        {
          id: "entry-memory-model",
          date: "2026-02-07",
          title: "Notes on memory ordering",
          detail:
            "Collected the few memory-model ideas I keep reaching for and wrote them in language I would actually use during a code review.",
          kind: "reflection",
          tags: ["memory", "c++"],
        },
      ],
    },
    {
      kind: "month",
      id: "2026-01-shipping-loop",
      dateLabel: "2026-01",
      title: "Building a tighter shipping loop",
      summary:
        "Less ceremony, more feedback, and smaller steps that actually reach users.",
      focus: "testing · tooling · feedback loops",
      entries: [
        {
          id: "entry-fixture-tests",
          date: "2026-01-29",
          title: "Fixture-backed tests that explain themselves",
          detail:
            "Reworked a handful of tests so their data tells the story of the behavior under test, rather than making the reader reconstruct it.",
          kind: "built",
          tags: ["testing", "developer experience"],
        },
        {
          id: "entry-feedback-loop",
          date: "2026-01-16",
          title: "Shortening the feedback loop",
          detail:
            "Removed one unnecessary handoff from my local workflow and measured the effect in minutes saved per iteration.",
          kind: "reflection",
          tags: ["workflow", "tooling"],
        },
      ],
    },
  ],
};
