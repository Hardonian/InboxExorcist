import Link from "next/link";

const trustItems = [
  "No deleting by default",
  "No selling data",
  "Undo anytime",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8faf7] text-[#17150f]">
      <section className="relative overflow-hidden border-b border-[#d8d1bd]">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#17150f]/15 bg-white px-3 py-1 text-sm font-medium">
              One-click inbox quieting for Gmail
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal sm:text-7xl">
              Your inbox has demons. Exorcise them.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d473b] sm:text-xl">
              InboxExorcist finds noisy promo senders, safely quiets them, and
              keeps proof of every action. No deleting by default. Undo anytime.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/api/auth/google/start"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#17150f] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#2c271d]"
              >
                Exorcise my inbox
              </a>
              <Link
                href="/demo"
                className="inline-flex h-12 items-center justify-center rounded-md border border-[#17150f]/20 bg-white px-5 text-base font-semibold text-[#17150f] transition hover:border-[#17150f]/40"
              >
                Try the Demo
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#d8d1bd] bg-white px-3 py-1 text-sm text-[#4d473b]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-8 h-20 w-20 rounded-full border border-[#17150f]/10 bg-[#f4c542]" />
            <div className="relative overflow-hidden rounded-lg border border-[#17150f]/15 bg-[#17150f] p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 text-white">
                <span className="font-semibold">Scan &rarr; Preview &rarr; Quiet</span>
                <span className="rounded bg-[#d7ff7a] px-2 py-1 text-xs font-bold text-[#17150f]">
                  undoable
                </span>
              </div>
              <div className="space-y-3">
                {[
                  ["143", "promo senders found"],
                  ["8,014", "messages can be buried, not deleted"],
                  ["27", "protected senders skipped"],
                ].map(([count, label]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[96px_1fr] items-center rounded-md bg-white p-4"
                  >
                    <span className="font-mono text-3xl font-semibold text-[#17150f]">
                      {count}
                    </span>
                    <span className="text-sm font-medium text-[#4d473b]">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-md bg-[#d7ff7a] p-4 text-sm font-semibold text-[#17150f]">
                This deleted the noise without deleting my emails.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:px-10">
        {["Connect Gmail", "Preview noisy senders", "Quiet them in one click"].map(
          (step, index) => (
            <div key={step} className="border-t border-[#d8d1bd] pt-5">
              <span className="font-mono text-sm text-[#7b3f00]">
                0{index + 1}
              </span>
              <h2 className="mt-2 text-2xl font-semibold">{step}</h2>
              <p className="mt-3 leading-7 text-[#4d473b]">
                We use the minimum access needed to identify bulk senders and
                apply reversible Gmail labels/filters. We do not sell inbox data.
              </p>
            </div>
          ),
        )}
      </section>
    </main>
  );
}
