import { PreviewClient } from "@/components/PreviewClient";
import { getDemoScan } from "@/lib/demo-data";

export default function DemoPage() {
  const demoScan = getDemoScan();
  
  return (
    <div className="flex min-h-screen flex-col bg-[#f8faf7]">
      <div className="bg-[#17150f] py-3 text-center text-sm font-medium text-[#d7ff7a]">
        Interactive Demo: This is simulated data. No real Gmail actions will be taken.
      </div>
      <PreviewClient scanId="mock" initialScan={demoScan} />
      <div className="mx-auto mt-auto flex w-full max-w-6xl flex-col items-center border-t border-[#d8d1bd] px-5 py-10 text-center sm:px-8">
        <h2 className="text-2xl font-semibold">Ready to exorcise your real inbox?</h2>
        <p className="mt-2 text-[#4d473b]">
          Connect your Gmail and see which demons are lurking in your promotions tab.
        </p>
        <a
          href="/api/auth/google/start"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-[#17150f] px-8 text-base font-semibold text-white shadow-sm transition hover:bg-[#2c271d]"
        >
          Connect Gmail safely
        </a>
      </div>
    </div>
  );
}
