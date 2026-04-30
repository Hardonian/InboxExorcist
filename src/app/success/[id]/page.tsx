import { ActionHistoryClient } from "@/components/ActionHistoryClient";
import ShareCard from "@/components/ShareCard";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <a href="/scan" className="text-sm font-semibold text-[#7b3f00]">
        Scan {id}
      </a>
      <h1 className="mt-4 text-4xl font-semibold">Your inbox is quieter.</h1>
      <p className="mt-3 max-w-2xl text-[#4d473b]">
        I exorcised junk senders from Gmail. Filters and labels are reversible
        from the action log.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <ActionHistoryClient />
        </div>
        <div>
          <ShareCard senderCount={0} />
        </div>
      </div>
    </main>
  );
}
