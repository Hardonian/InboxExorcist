import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-purple-100 dark:selection:bg-purple-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <span className="text-xl font-bold tracking-tight">InboxExorcist</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
          <Link href="/security" className="hover:text-black dark:hover:text-white transition-colors">Security</Link>
          <Link href="/faq" className="hover:text-black dark:hover:text-white transition-colors">FAQ</Link>
          <Link href="/app" className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-8 pt-16 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Beta Now Available
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] text-zinc-900 dark:text-white">
            Exorcise the <span className="text-purple-600">Noise</span> from your Inbox.
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
            A deterministic intelligence engine that identifies newsletters and promotional noise. Quiet your inbox without deleting a single message.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/demo" className="h-14 px-8 rounded-2xl bg-purple-600 text-white font-semibold text-lg flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]">
              Try Free Demo
            </Link>
            <Link href="/app" className="h-14 px-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold text-lg flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98]">
              Connect Gmail
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-y-4 pt-8 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <CheckIcon className="w-5 h-5 text-green-500" />
              No deleting by default
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <CheckIcon className="w-5 h-5 text-green-500" />
              Reversible filters
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <CheckIcon className="w-5 h-5 text-green-500" />
              No data selling
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <CheckIcon className="w-5 h-5 text-green-500" />
              Disconnect anytime
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 blur-3xl rounded-[3rem]"></div>
          <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <Image 
              src="/hero.png" 
              alt="InboxExorcist Interface Preview" 
              width={800} 
              height={600} 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-zinc-100 dark:border-zinc-900 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-sm text-zinc-500">
          © 2026 InboxExorcist. All rights reserved. Built for security and privacy.
        </p>
        <div className="flex gap-8 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy</Link>
          <Link href="/security" className="hover:text-black dark:hover:text-white transition-colors">Security</Link>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
