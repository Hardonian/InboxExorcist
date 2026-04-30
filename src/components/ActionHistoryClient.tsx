"use client";

import { useEffect, useState } from "react";

import type { ApiEnvelope, SenderAction } from "@/lib/domain";

export function ActionHistoryClient() {
  const [actions, setActions] = useState<SenderAction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [undoing, setUndoing] = useState(false);

  async function load() {
    const response = await fetch("/api/me/actions");
    const payload = (await response.json()) as ApiEnvelope<{ actions: SenderAction[] }>;
    if (!payload.ok) {
      setError(`${payload.message} (${payload.code})`);
      return;
    }
    setActions(payload.data.actions);
  }

  async function undoLatest() {
    setUndoing(true);
    const response = await fetch("/api/gmail/actions/undo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const payload = (await response.json()) as ApiEnvelope<unknown>;
    setUndoing(false);
    if (!payload.ok) {
      setError(`${payload.message} (${payload.code})`);
      return;
    }
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="rounded-lg border border-[#d8d1bd] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Action history</h2>
        <button
          type="button"
          onClick={undoLatest}
          disabled={undoing || actions.every((action) => !action.reversible)}
          className="h-10 rounded-md border border-[#17150f]/20 px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {undoing ? "Undoing" : "Undo latest"}
        </button>
      </div>
      {error && (
        <div className="mt-4 rounded-md border border-[#b94a48]/30 bg-[#fff6f3] p-3 text-[#7d251f]">
          {error}
        </div>
      )}
      <div className="mt-5 divide-y divide-[#eee6d3]">
        {actions.length === 0 && (
          <p className="text-[#6b6252]">No actions recorded yet.</p>
        )}
        {actions.map((action) => (
          <div
            key={action.id}
            className="grid gap-2 py-3 text-sm sm:grid-cols-[1fr_170px_180px]"
          >
            <span className="font-semibold">{action.senderDomain}</span>
            <span>{action.result}</span>
            <span className="font-mono text-[#6b6252]">
              {new Date(action.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
