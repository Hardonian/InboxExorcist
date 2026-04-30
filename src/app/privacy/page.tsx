import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-lg text-zinc-600 mb-6">
        Last updated: April 29, 2026
      </p>
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">1. Our Commitment to Your Privacy</h2>
        <p>
           InboxExorcist is built with a &apos;Privacy First&apos; architecture. We do not sell your data, we do not store your email bodies, and we never delete your emails.
        </p>
        
        <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Metadata:</strong> We analyze sender addresses, subjects, and headers to classify your mail.</li>
          <li><strong>Authentication:</strong> We use secure OAuth tokens to access your Gmail account. These tokens are encrypted at rest.</li>
          <li><strong>Identity:</strong> We store a salted hash of your email address to manage your account.</li>
        </ul>

        <h2 className="text-2xl font-semibold">3. Data Retention</h2>
        <p>
          You can disconnect your account and delete all associated metadata at any time through the app settings.
        </p>

        <h2 className="text-2xl font-semibold">4. Gmail API Scopes</h2>
        <p>
          We only request the minimum permissions necessary to identify newsletters and create labels/filters. We do not request full read/write access to your messages.
        </p>
      </section>
    </div>
  );
}
