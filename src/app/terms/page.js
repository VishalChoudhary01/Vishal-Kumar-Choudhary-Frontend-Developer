import Link from "next/link";

import LegalDocumentPage from "@/app/components/legal/LegalDocumentPage";
import { TERMS_VERSION } from "@/app/lib/legal/policies";
import { buildSiteUrl } from "@/app/lib/seo/urls";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms governing access to Vishal Kumar Choudhary's portfolio website and Portfolio Labs experiments.",
  alternates: { canonical: new URL("/terms", buildSiteUrl()).toString() },
  robots: { index: true, follow: true },
};

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="font-display text-2xl font-medium tracking-[-0.035em] text-text-primary sm:text-[1.7rem]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-text-secondary sm:text-[0.95rem] sm:leading-8">
        {children}
      </div>
    </section>
  );
}

const contents = [
  ["service", "1. The service"],
  ["eligibility", "2. Eligibility and accounts"],
  ["acceptable-use", "3. Acceptable use"],
  ["labs", "4. Labs and source access"],
  ["ownership", "5. Intellectual property"],
  ["third-parties", "6. Third-party services"],
  ["changes", "7. Availability and changes"],
  ["disclaimers", "8. Disclaimers and liability"],
  ["termination", "9. Suspension and account closure"],
  ["law", "10. Governing law"],
  ["contact", "11. Contact"],
];

export default function TermsPage() {
  return (
    <LegalDocumentPage
      eyebrow="LEGAL / 01"
      title="Terms of Service"
      description="These terms explain the rules for using this portfolio website and its Labs experiments. Please read them before creating a Labs account or requesting access to protected experiment source."
      version={TERMS_VERSION}
    >
      <nav aria-label="Terms of Service contents" className="rounded-sm border border-border bg-surface-1 p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-tertiary">ON THIS PAGE</p>
        <div className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {contents.map(([id, label]) => (
            <a key={id} href={"#" + id} className="text-text-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <Section id="service" title="1. The service">
        <p>
          This website is the personal portfolio of Vishal Kumar Choudhary (“I”, “me”, or “the operator”). It presents information about projects and experience, provides a contact form, and hosts Portfolio Labs, a collection of interactive software demonstrations and educational experiments.
        </p>
        <p>
          The website and Labs are provided for general information, learning, demonstration, and evaluation. Features may change as the portfolio is developed. Unless a feature expressly says otherwise, the service is provided without a fee and does not create a paid subscription or service-level commitment.
        </p>
      </Section>

      <Section id="eligibility" title="2. Eligibility and accounts">
        <p>
          Labs accounts are intended for people aged 18 or older who can legally enter into an agreement where they live. Do not create an account if you are under 18. During registration you are asked to confirm that you meet this age requirement.
        </p>
        <p>
          You must provide an email address you control, keep your sign-in credentials and verification links secure, and use your account yourself. Email verification is required before protected-source access. Creating an account does not automatically grant access to every experiment.
        </p>
        <p>
          You are responsible for activity carried out through your account unless it results from a security incident outside your reasonable control. Contact me promptly through the <Link className="text-brand underline-offset-4 hover:underline" href="/#contact">Contact section</Link> if you believe your account has been accessed without permission.
        </p>
      </Section>

      <Section id="acceptable-use" title="3. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>Use the website or Labs for unlawful, fraudulent, abusive, or harmful activity.</li>
          <li>Attempt to access accounts, source snapshots, databases, systems, or features you have not been authorised to use.</li>
          <li>Bypass authentication, access grants, rate limits, or other technical controls.</li>
          <li>Interfere with the availability, security, or normal operation of the website or its providers.</li>
          <li>Probe, scan, or test systems in a way that could damage them or affect other users without prior written permission.</li>
          <li>Misrepresent your identity or use another person's account without permission.</li>
        </ul>
      </Section>

      <Section id="labs" title="4. Labs experiments and source access">
        <p>
          Labs experiments are demonstrations. They may contain simplified models, incomplete features, simulated data, or implementation choices made for teaching and visualisation. They are not production software, security assessments, or professional advice.
        </p>
        <p>
          Certain experiment source snapshots are protected. Every signed-in account with a verified email address can read and copy any source snapshot that the owner has published. No individual access grant or approval is required. Visitors who are not signed in and signed-in accounts with unverified email addresses cannot view protected source. The owner may publish or unpublish source for an experiment, which controls whether it is available to verified accounts.
        </p>
        <p>
          Do not share protected-source content or account access with others unless a separate written permission or licence allows it. A public interactive demo may send its client-side code to your browser; a protected source viewer does not make code already present in a public repository or browser bundle confidential.
        </p>
      </Section>

      <Section id="ownership" title="5. Intellectual property">
        <p>
          Unless a page, repository, or separate licence says otherwise, the portfolio's original design, text, branding, visual assets, and Labs materials belong to their respective owner or licensors. These terms do not transfer ownership to you.
        </p>
        <p>
          You may access and use the website for personal, lawful viewing and learning. You may not reproduce, redistribute, commercially exploit, or publish protected materials as your own without permission, except where a separate open-source or third-party licence expressly permits it.
        </p>
        <p>
          Names, logos, libraries, and assets belonging to third parties remain the property of their respective owners and may be subject to separate terms.
        </p>
      </Section>

      <Section id="third-parties" title="6. Third-party services">
        <p>
          The website may rely on third-party services for hosting, database storage, authentication, email delivery, identity sign-in, and media delivery. External websites and providers operate under their own terms and privacy notices. I do not control their independent services or policies.
        </p>
        <p>
          Links to external websites are provided for convenience or attribution. A link does not mean that I endorse the linked service or accept responsibility for its content.
        </p>
      </Section>

      <Section id="changes" title="7. Availability and changes">
        <p>
          I may update, suspend, restrict, or discontinue any part of the website or Labs to maintain, improve, or protect the service. Access to a particular experiment or source snapshot is not guaranteed to remain available.
        </p>
        <p>
          I may update these terms when the service, its providers, or applicable requirements change. The effective date and version at the top identify the current text. Material changes will be highlighted on the website or presented during a relevant account flow where appropriate.
        </p>
      </Section>

      <Section id="disclaimers" title="8. Disclaimers and liability">
        <p>
          The website and Labs are provided on an “as is” and “as available” basis to the maximum extent permitted by applicable law. I do not promise that every page, experiment, result, or feature will be uninterrupted, error-free, complete, or suitable for a particular purpose.
        </p>
        <p>
          You are responsible for evaluating code and information before relying on it. Do not use an experiment as the sole basis for a production, security, financial, legal, medical, or other consequential decision.
        </p>
        <p>
          To the maximum extent permitted by law, I will not be liable for indirect, incidental, special, consequential, or punitive loss arising from ordinary use of the website. Nothing in these terms excludes liability or consumer rights that cannot lawfully be excluded or limited.
        </p>
      </Section>

      <Section id="termination" title="9. Suspension and account closure">
        <p>
          I may suspend or restrict an account, access grant, or feature where there is a security concern, suspected misuse, breach of these terms, legal requirement, or operational reason. Where reasonably practical, I will provide an explanation or notice.
        </p>
        <p>
          You may stop using the website at any time. To request closure of a Labs account and deletion of associated personal data, use the Contact section and identify the account email address. Some records may need to be retained for security, legal, or dispute-resolution purposes.
        </p>
      </Section>

      <Section id="law" title="10. Governing law">
        <p>
          These terms are governed by the laws of India, subject to any mandatory protections that apply where you live. Disputes will be handled by a court or forum with proper jurisdiction under applicable law.
        </p>
      </Section>

      <Section id="contact" title="11. Contact">
        <p>
          Questions about these terms, permissions, account access, or a concern about the service can be sent through the website's <Link className="text-brand underline-offset-4 hover:underline" href="/#contact">Contact form</Link>. Do not include passwords, verification links, or other secrets in your message.
        </p>
      </Section>
    </LegalDocumentPage>
  );
}
