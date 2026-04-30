"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  ApiEnvelope,
  QuietSummary,
  ScanRunWithCandidates,
  SenderCandidate,
} from "@/lib/domain";
import { trackQuietPreviewViewed, trackQuietActionStarted, trackQuietActionCompleted } from "@/lib/analytics/events";
function bucketTitle(candidate: SenderCandidate) {
  if (candidate.protectedReason || candidate.proposedAction === "SKIP") {
    return "Skipped for safety";
  }
  if (candidate.selectedByDefault) {
    return "High-confidence quiet";
  }
  return "Needs review";
}

export function PreviewClient({
  scanId,
  initialScan,
}: {
  scanId: string;
  initialScan?: ScanRunWithCandidates;
}) {
  const [scan, setScan] = useState<ScanRunWithCandidates | null>(initialScan || null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialScan?.candidates.filter((c) => c.selectedByDefault).map((c) => c.id)),
  );
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<QuietSummary | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (initialScan) return;
    void (async () => {
      const response = await fetch(`/api/gmail/scan/${scanId}`);
      const payload = (await response.json()) as ApiEnvelope<ScanRunWithCandidates>;
      if (!payload.ok) {
        setError(`${payload.message} (${payload.code})`);
        return;
      }
      setScan(payload.data);
      setSelected(
        new Set(payload.data.candidates.filter((c) => c.selectedByDefault).map((c) => c.id)),
      );
    })();
  }, [initialScan, scanId]);

  useEffect(() => {
    if (scan) {
      trackQuietPreviewViewed();
    }
  }, [scan]);

  useEffect(() => {
    if (scan) {
      trackQuietPreviewViewed();
    }
  }, [scan]);

  const counts = useMemo(() => {
    const candidates = scan?.candidates || [];
    return {
      high: candidates.filter((candidate) => candidate.selectedByDefault).length,
      review: candidates.filter(
        (candidate) =>
          !candidate.selectedByDefault &&
          !candidate.protectedReason &&
          candidate.proposedAction !== "SKIP",
      ).length,
      skipped: candidates.filter(
        (candidate) => candidate.protectedReason || candidate.proposedAction === "SKIP",
      ).length,
      messages: candidates.reduce((total, candidate) => total + candidate.messageCount, 0),
    };
  }, [scan]);

  async function quietSelected() {
    if (!scan) return;
    setWorking(true);
    setError(null);
    trackQuietActionStarted();
    const response = await fetch("/api/gmail/actions/quiet", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scanId: scan.id,
        candidateIds: [...selected],
        allowHttpsUnsubscribe: true,
        allowMailtoUnsubscribe: false,
      }),
    });
    const payload = (await response.json()) as ApiEnvelope<QuietSummary>;
    setWorking(false);
    if (!payload.ok) {
      setError(`${payload.message} (${payload.code})`);
      return;
    }
    setSummary(payload.data);
    trackQuietActionCompleted({
      quietedSenders: payload.data.quietedSenders,
      filtersCreated: payload.data.filtersCreated,
      skippedForSafety: payload.data.skippedForSafety,
    });
    trackQuietActionCompleted({
      quietedSenders: payload.data.quietedSenders,
      filtersCreated: payload.data.filtersCreated,
      skippedForSafety: payload.data.skippedForSafety,
    });
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-10 sm:px-8">
        <a href="/scan" className="text-sm font-semibold text-[#7b3f00]">
          Back to scan
        </a>
        <div className="mt-8 rounded-lg border border-[#b94a48]/30 bg-[#fff6f3] p-5 text-[#7d251f]">
          {error}
        </div>
      </main>
    );
  }

  if (!scan) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-5 py-10 sm:px-8">
        <div className="rounded-lg border border-[#d8d1bd] bg-white p-5">
          Loading scan preview.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-[#d8d1bd] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <a href="/scan" className="text-sm font-semibold text-[#7b3f00]">
            Scan
          </a>
          <h1 className="mt-3 text-4xl font-semibold">Preview the exorcism.</h1>
          <p className="mt-2 text-[#4d473b]">
            Nothing changes until you press the button.
          </p>
        </div>
        <button
          type="button"
          onClick={quietSelected}
          disabled={working || selected.size === 0 || scan.id === "mock"}
          className="h-11 rounded-md bg-[#17150f] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          title={scan.id === "mock" ? "Mock preview does not call Gmail" : undefined}
        >
          {working ? "Quieting" : "Quiet selected senders"}
        </button>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Noisy senders", String(counts.high)],
          ["Estimated messages", String(counts.messages)],
          ["Needs review", String(counts.review)],
          ["Protected skipped", String(counts.skipped)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#d8d1bd] bg-white p-4">
            <div className="font-mono text-3xl font-semibold">{value}</div>
            <div className="mt-1 text-sm text-[#6b6252]">{label}</div>
          </div>
        ))}
      </section>

      {summary && (
        <section className="mt-6 rounded-lg border border-[#b8d868] bg-[#f4ffd8] p-5">
          <h2 className="text-2xl font-semibold">Your inbox is quieter.</h2>
          <p className="mt-2 text-[#4d473b]">
            Quieted {summary.quietedSenders} senders, archived/labeled{" "}
            {summary.messagesArchivedOrLabeled} messages, created{" "}
            {summary.filtersCreated} filters, attempted{" "}
            {summary.unsubscribeAttemptsSent} unsubscribe requests, skipped{" "}
            {summary.skippedForSafety} protected senders.
          </p>
          <a
            href={`/success/${scan.id}`}
            className="mt-4 inline-flex h-10 items-center rounded-md bg-[#17150f] px-4 font-semibold text-white"
          >
            See action log
          </a>
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-[#d8d1bd] bg-white">
        {scan.candidates.map((candidate) => (
          <label
            key={candidate.id}
            className="grid gap-4 border-b border-[#eee6d3] p-4 last:border-b-0 sm:grid-cols-[32px_1fr_170px_110px]"
          >
            <input
              type="checkbox"
              className="mt-1 h-5 w-5"
              checked={selected.has(candidate.id)}
              disabled={!candidate.selectedByDefault}
              onChange={(event) => {
                const next = new Set(selected);
                if (event.target.checked) next.add(candidate.id);
                else next.delete(candidate.id);
                setSelected(next);
              }}
            />
            <div>
              <div className="font-semibold">
                {candidate.senderDisplayName || candidate.senderDomain}
              </div>
              <div className="text-sm text-[#6b6252]">{candidate.senderDomain}</div>
              <div className="mt-2 text-sm text-[#4d473b]">
                {candidate.reasons.join(", ")}
              </div>
            </div>
            <div className="text-sm font-medium">{bucketTitle(candidate)}</div>
            <div className="font-mono text-sm">{candidate.score}/100</div>
          </label>
        ))}
      </section>
    </main>
  );
}
