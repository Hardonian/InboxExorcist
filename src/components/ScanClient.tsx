"use client";

import { useEffect, useState } from "react";

import type { ApiEnvelope, ScanRunWithCandidates } from "@/lib/domain";

const stages = [
  "Connecting",
  "Reading headers only",
  "Grouping senders",
  "Classifying noise",
  "Building safe action plan",
];

export function ScanClient({ autoStart }: { autoStart: boolean }) {
  const [state, setState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [scan, setScan] = useState<ScanRunWithCandidates | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startScan() {
    setState("scanning");
    setError(null);
    const response = await fetch("/api/gmail/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ maxMessages: 250 }),
    });
    const payload = (await response.json()) as ApiEnvelope<ScanRunWithCandidates>;
    if (!payload.ok) {
      setState("error");
      setError(`${payload.message} (${payload.code})`);
      return;
    }
    setScan(payload.data);
    setState("done");
  }

  useEffect(() => {
    if (autoStart) {
      void startScan();
    }
  }, [autoStart]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-10 sm:px-8">
      <div className="mb-8">
        <a href="/" className="text-sm font-semibold text-[#7b3f00]">
          InboxExorcist
        </a>
        <h1 className="mt-5 text-4xl font-semibold">Purge promos, safely.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[#4d473b]">
          We scan recent Gmail headers only, group likely bulk senders, and build
          a reversible action plan before anything changes.
        </p>
      </div>

      <div className="rounded-lg border border-[#d8d1bd] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ready when Gmail is connected</h2>
            <p className="mt-1 text-sm text-[#6b6252]">
              If Gmail is disconnected, this returns a truthful disconnected state.
            </p>
          </div>
          <button
            type="button"
            onClick={startScan}
            disabled={state === "scanning"}
            className="h-11 rounded-md bg-[#17150f] px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "scanning" ? "Scanning" : "Scan my Gmail"}
          </button>
        </div>

        {state === "scanning" && (
          <ol className="mt-6 grid gap-2 sm:grid-cols-5">
            {stages.map((stage) => (
              <li
                key={stage}
                className="rounded-md border border-[#d8d1bd] bg-[#f8faf7] p-3 text-sm font-medium"
              >
                {stage}
              </li>
            ))}
          </ol>
        )}

        {state === "error" && (
          <div className="mt-6 rounded-md border border-[#b94a48]/30 bg-[#fff6f3] p-4 text-[#7d251f]">
            {error}
            <div className="mt-3">
              <a
                href="/api/auth/google/start"
                className="font-semibold underline"
              >
                Connect Gmail
              </a>
            </div>
          </div>
        )}

        {state === "done" && scan && (
          <div className="mt-6 rounded-md border border-[#d8d1bd] bg-[#f8faf7] p-4">
            <p className="font-semibold">
              Found {scan.selectedCount} high-confidence senders from{" "}
              {scan.messageCount} recent messages.
            </p>
            <a
              href={`/preview/${scan.id}`}
              className="mt-4 inline-flex h-10 items-center rounded-md bg-[#d7ff7a] px-4 font-semibold text-[#17150f]"
            >
              Preview action plan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
