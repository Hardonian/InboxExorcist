import type { IssueTimelineEntry } from "./types.ts";

export function createTimeline(): IssueTimelineEntry[] {
  return [];
}

export function addTimelineEntry(
  timeline: IssueTimelineEntry[],
  entry: Omit<IssueTimelineEntry, "resolved">,
): IssueTimelineEntry[] {
  return [...timeline, { ...entry, resolved: false }];
}

export function resolveTimelineEntry(
  timeline: IssueTimelineEntry[],
  index: number,
): IssueTimelineEntry[] {
  if (index < 0 || index >= timeline.length) return timeline;
  const updated = [...timeline];
  updated[index] = { ...updated[index], resolved: true };
  return updated;
}

export function getUnresolvedEntries(timeline: IssueTimelineEntry[]): IssueTimelineEntry[] {
  return timeline.filter((e) => !e.resolved);
}

export function summarizeTimeline(timeline: IssueTimelineEntry[]): string {
  const total = timeline.length;
  const resolved = timeline.filter((e) => e.resolved).length;
  return `${resolved}/${total} issues resolved`;
}
