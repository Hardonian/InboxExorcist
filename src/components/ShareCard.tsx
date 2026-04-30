"use client";

import { useState } from "react";

type ShareCardProps = {
  senderCount: number;
  messageCount?: number;
};

export default function ShareCard({ senderCount, messageCount }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I exorcised ${senderCount} junk senders from my inbox with InboxExorcist. Get the junk out. ${typeof window !== "undefined" ? window.location.origin : ""}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="rounded-lg border border-[#d8d1bd] bg-white p-6">
      <h3 className="text-lg font-semibold">Share your exorcism</h3>
      <div className="mt-4 rounded-md bg-[#f8faf7] p-4">
        <p className="text-2xl font-semibold">
          I exorcised <span className="text-[#7b3f00]">{senderCount}</span> junk senders
        </p>
        {messageCount && (
          <p className="mt-1 text-sm text-[#4d473b]">
            {messageCount.toLocaleString()} messages quieted
          </p>
        )}
        <p className="mt-2 text-xs text-[#7b3f00]">
          No emails deleted. Undo anytime.
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#17150f] px-4 text-sm font-medium text-white transition hover:bg-[#2c271d]"
        >
          {copied ? "Copied!" : "Copy text"}
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "InboxExorcist", text: shareText, url: window.location.href });
            }
          }}
          className="inline-flex h-10 items-center justify-center rounded-md border border-[#17150f]/20 bg-white px-4 text-sm font-medium text-[#17150f] transition hover:border-[#17150f]/40"
        >
          Share
        </button>
      </div>
    </div>
  );
}
