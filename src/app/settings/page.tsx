import { ActionHistoryClient } from "@/components/ActionHistoryClient";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <a href="/scan" className="text-sm font-semibold text-[#7b3f00]">
        InboxExorcist
      </a>
      <h1 className="mt-4 text-4xl font-semibold">Account and reversibility</h1>
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <form action="/api/gmail/disconnect" method="post" className="rounded-lg border border-[#d8d1bd] bg-white p-5">
          <h2 className="font-semibold">Disconnect Gmail</h2>
          <p className="mt-2 text-sm text-[#6b6252]">
            Revokes the active Google token and stops future scans.
          </p>
          <button className="mt-4 h-10 rounded-md border border-[#17150f]/20 px-4 font-semibold">
            Disconnect
          </button>
        </form>
        <form action="/api/me/delete-data" method="post" className="rounded-lg border border-[#d8d1bd] bg-white p-5">
          <h2 className="font-semibold">Delete data</h2>
          <p className="mt-2 text-sm text-[#6b6252]">
            Removes connection, scans, candidates, actions, filters, and audit records.
          </p>
          <button className="mt-4 h-10 rounded-md border border-[#17150f]/20 px-4 font-semibold">
            Delete my data
          </button>
        </form>
        <div className="rounded-lg border border-[#d8d1bd] bg-white p-5">
          <h2 className="font-semibold">Payment gate</h2>
          <p className="mt-2 text-sm text-[#6b6252]">
            Free MVP is active. Stripe pricing is documented and feature-flagged.
          </p>
        </div>
      </section>
      <div className="mt-8">
        <ActionHistoryClient />
      </div>
    </main>
  );
}
