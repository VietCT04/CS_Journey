export type EntryKind = "learned" | "built" | "reflection";

export type TimelineEntry = {
  id: string;
  date: string;
  title: string;
  detail: string;
  kind: EntryKind;
  tags: string[];
};

const monthLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function formatEntryDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day || month < 1 || month > 12) {
    return value;
  }

  return `${String(day).padStart(2, "0")} ${monthLabels[month - 1]}`;
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
      dateLabel: "APR 2026",
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
      dateLabel: "MAR 2026",
      title: "First systems design note",
      summary: "A deliberate pause to make the invisible decisions visible.",
      detail:
        "I wrote the first end-to-end design note for a service instead of jumping straight into implementation. The artifact became a way to reason with other people, not just a record of what I already knew.",
      tags: ["systems design", "communication", "milestone"],
    },
    {
      kind: "month",
      id: "2026-02-runtime-fundamentals",
      dateLabel: "FEB 2026",
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
      dateLabel: "JAN 2026",
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
