import React from 'react';

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-8 text-zinc-900 dark:text-white">Security Architecture</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-12">
        How we protect your inbox and your trust.
      </p>
      
      <div className="grid gap-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">No-Delete Invariant</h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            InboxExorcist is architected to be incapable of deleting your emails. We use filters to archive or label messages, but the "delete" permission is never requested from Google, and no code exists in our codebase to trigger a deletion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Token Encryption</h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Your Gmail access tokens are encrypted at rest using AES-256-GCM. The encryption keys are managed in a secure environment and are never accessible to our application logic except for the specific purpose of communicating with the Gmail API on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">Data Minimization</h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            We store the absolute minimum amount of data required to function. We do not store your email bodies, and sender addresses are hashed where possible to protect your social graph.
          </p>
        </section>
      </div>
    </div>
  );
}
