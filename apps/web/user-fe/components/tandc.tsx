// app/terms/page.tsx (for Next.js App Router)
import React from "react";

export default function TermsAndConditions() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-m leading-relaxed text-foreground">
      <h1 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h1>
      <p className="mb-8">Last updated: 04/24/2025</p>

      <h2 className="text-xl font-semibold text-foreground mb-2">1. Introduction</h2>
      <p className="mb-6">
        These Terms of Service ("Terms") govern your access to and use of SwarajDesk, a platform operated by SwarajDesk
        Admins. By using our platform, you agree to these Terms. SwarajDesk is a complaint management system designed to
        help citizens report, track, and resolve grievances across various categories.
      </p>

      <h2 className="text-xl font-semibold text-foreground mb-2">2. Intellectual Property Rights</h2>
      <p className="mb-6">
        All content and features on SwarajDesk, including platform architecture, chatbot guidance, tracking UI,
        community features, and documentation, are the intellectual property of SwarajDesk and its contributors. You may
        not reuse or distribute any content without permission.
      </p>

      <h2 className="text-xl font-semibold text-foreground mb-2">3. Prohibited Activities</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>Scraping or automated data collection from SwarajDesk without written consent.</li>
        <li>
          Using SwarajDesk content or data to train AI or ML models without explicit permission.
        </li>
        <li>Redistributing or licensing platform content or metadata.</li>
        <li>
          Republishing complaint data, user submissions, or media without authorization.
        </li>
        <li>
          Sharing platform components externally without referencing SwarajDesk’s original source.
        </li>
        <li>Bypassing or tampering with system-level protections or moderation tools.</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mb-2">4. Enforcement</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li>We may suspend or restrict access for violations of these Terms.</li>
        <li>Legal action may be taken against abuse or misuse of the platform.</li>
        <li>We reserve the right to remove content that violates policies without prior notice.</li>
      </ul>

      <h2 className="text-xl font-semibold text-foreground mb-2">5. Changes to Terms</h2>
      <p className="mb-6">
        We may update these Terms from time to time. Changes will take effect upon being posted to SwarajDesk. Your
        continued use of the platform indicates acceptance of the new Terms.
      </p>

      <h2 className="text-xl font-semibold text-foreground mb-2">6. Contact Information</h2>
      <p>
        For any questions or concerns about these Terms, please contact:
        <br />
        SwarajDesk Admin Team
        <br />
        Email: support@swarajdesk.in
      </p>
    </main>
  );
}
