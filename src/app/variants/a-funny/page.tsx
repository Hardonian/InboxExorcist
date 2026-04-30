import Link from "next/link";

const trustItems = [
  "No deleting by default",
  "Undo anytime",
  "Minimal data",
  "No selling inbox data",
  "Disconnect anytime",
];

export default function VariantAFunny() {
  return (
    <main className="min-h-screen bg-[#f8faf7] text-[#17150f]">
      <section className="relative overflow-hidden border-b border-[#d8d1bd]">
        <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#17150f]/15 bg-white px-3 py-1 text-sm font-medium">
              The inbox exorcist your Gmail deserves
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal sm:text-7xl">
              Your inbox has demons. Exorcise them.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d473b] sm:text-xl">
              2,000 unread emails? Same. InboxExorcist finds the junk, buries it, and keeps your actual emails safe. No deleting. No drama. Just peace.
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
                <span className="font-semibold">Before vs After</span>
                <span className="rounded bg-[#d7ff7a] px-2 py-1 text-xs font-bold text-[#17150f]">
                  it works
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">Before: 2,847 unread</p>
                  <p className="text-xs text-red-600">Your inbox is a crime scene</p>
                </div>
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-800">After: 143 junk senders buried</p>
                  <p className="text-xs text-green-600">Emails safe. Sanity restored.</p>
                </div>
              </div>
              <div className="mt-4 rounded-md bg-[#d7ff7a] p-4 text-sm font-semibold text-[#17150f]">
                &ldquo;I didn&apos;t delete anything. I just buried the noise.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:px-10">
        {[
          { step: "01", title: "Connect Gmail", desc: "One click. We ask for the minimum access we need. You can disconnect anytime." },
          { step: "02", title: "See the junk", desc: "We scan headers (not bodies) and show you every promo sender. You pick what goes." },
          { step: "03", title: "Bury it", desc: "One click creates filters that skip inbox. Your emails stay. The noise doesn&apos;t show up." },
        ].map((item) => (
          <div key={item.step} className="border-t border-[#d8d1bd] pt-5">
            <span className="font-mono text-sm text-[#7b3f00]">{item.step}</span>
            <h2 className="mt-2 text-2xl font-semibold">{item.title}</h2>
            <p className="mt-3 leading-7 text-[#4d473b]">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-[#d8d1bd]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <h2 className="text-center text-3xl font-semibold sm:text-4xl">
            Your inbox. Your rules.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#4d473b]">
            InboxExorcist is built on trust. Here&apos;s what that means in practice.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "No deleting by default", desc: "We never delete your emails. Quieting applies labels and filters so noisy messages skip your inbox.", icon: "01" },
              { title: "Undo anytime", desc: "Every action is reversible. Remove any filter or label with one click.", icon: "02" },
              { title: "Minimal data", desc: "We read only email headers — never full message bodies, attachments, or snippets.", icon: "03" },
              { title: "No selling inbox data", desc: "We do not sell, rent, or share your inbox data with any third party.", icon: "04" },
              { title: "Disconnect anytime", desc: "Revoke our access in one click. Your OAuth token is revoked immediately.", icon: "05" },
              { title: "Protected senders skipped", desc: "Financial, security, healthcare, legal, government senders are never auto-selected.", icon: "06" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-[#d8d1bd] bg-white p-6">
                <span className="font-mono text-sm text-[#7b3f00]">{item.icon}</span>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 leading-7 text-[#4d473b]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
