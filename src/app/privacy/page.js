import Link from "next/link";

import LegalDocumentPage from "@/app/components/legal/LegalDocumentPage";
import { PRIVACY_VERSION } from "@/app/lib/legal/policies";
import { buildSiteUrl } from "@/app/lib/seo/urls";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How the portfolio website and Portfolio Labs collect, use, store, and protect personal information.",
  alternates: { canonical: new URL("/privacy", buildSiteUrl()).toString() },
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

function DataItem({ title, children }) {
  return (
    <div className="border-l-2 border-brand/50 pl-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <div className="mt-1 text-sm leading-7 text-text-secondary">{children}</div>
    </div>
  );
}

const contents = [
  ["operator", "1. Who operates this site"],
  ["information", "2. Information handled"],
  ["purposes", "3. Why it is used"],
  ["sharing", "4. Providers and disclosures"],
  ["cookies", "5. Cookies and browser storage"],
  ["retention", "6. Retention"],
  ["security", "7. Security"],
  ["rights", "8. Your choices and requests"],
  ["children", "9. Children"],
  ["transfers", "10. International processing"],
  ["changes", "11. Changes and contact"],
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      eyebrow="LEGAL / 02"
      title="Privacy Policy"
      description="This notice explains what personal information is handled when you browse this portfolio, contact me, create a Labs account, or use an authorised experiment source viewer."
      version={PRIVACY_VERSION}
    >
      <nav aria-label="Privacy Policy contents" className="rounded-sm border border-border bg-surface-1 p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-tertiary">ON THIS PAGE</p>
        <div className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {contents.map(([id, label]) => (
            <a key={id} href={"#" + id} className="text-text-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <Section id="operator" title="1. Who operates this site">
        <p>
          This portfolio and Portfolio Labs are operated by Vishal Kumar Choudhary (“I”, “me”, or “the operator”). The Contact section of this website is the communication channel for privacy questions and requests.
        </p>
        <p>
          This policy covers the public portfolio, its contact form, Labs accounts, authentication emails, and protected experiment source access. It does not govern third-party websites that may be linked from the portfolio.
        </p>
      </Section>

      <Section id="information" title="2. Information handled">
        <div className="space-y-5">
          <DataItem title="Account and sign-in information">
            When you create a Labs account, the service handles your email address, a default account name, account identifiers, password authentication data (passwords are handled by Better Auth and are not stored as readable plain text), verification state, and timestamps. If you choose Google or GitHub sign-in, the selected provider may provide identity and profile information, including the verified email address used to authenticate or link your Labs account.
          </DataItem>
          <DataItem title="Sessions and account security">
            The service creates session records and authentication cookies to keep you signed in, protect account routes, and manage sign-out, verification, and password resets. Authentication and security systems may also process request details needed to detect abuse and protect the service.
          </DataItem>
          <DataItem title="Email verification records">
            Email/password registration creates a short-lived verification flow with a random identifier, a keyed digest of the email address, creation and expiry timestamps, and a verification status. The flow is used to confirm email verification and expires automatically after seven days. The service does not create a Terms/Conditions acceptance receipt during registration.
          </DataItem>
          <DataItem title="Abuse-prevention records and technical logs">
            Registration rate limiting stores a keyed digest derived from the trusted proxy IP address, a request count, and an update time. The rate-limit record is configured to expire after approximately 24 hours. Hosting, proxy, database, and security providers may separately create technical logs such as IP address, request time, browser/device information, and error metadata under their own retention settings.
          </DataItem>
          <DataItem title="Contact form messages">
            If you use the Contact form, I receive the name, email address, project type, and message you submit. The form sends that information by email to the configured receiving inbox. Contact messages may remain in that email mailbox and provider systems until deleted under their retention practices.
          </DataItem>
          <DataItem title="Protected source access and engagement">
            Published experiment source is available only to signed-in accounts with a verified email address. When a verified account opens protected source or copies a file, the service records the experiment, source version, event type, timestamp, and account identifier. Copy events are recorded after the browser reports that the clipboard write succeeded; the clipboard contents are not collected. Verified likes are linked to the account and experiment so the like can be retained and later removed.
          </DataItem>
          <DataItem title="Anonymous likes">
            You can like a Labs experiment without signing in. When you first use the anonymous like control, the service creates a random browser identifier in a signed, HTTP-only cookie and stores a keyed digest of that identifier with the experiment&apos;s like state. It is used to remember your like in that browser; it is not a verified identity and is not used to claim a count of unique people. Clearing cookies, using another browser, or switching devices may create another anonymous like identity. Anonymous like state expires after 180 days without a visit that refreshes the identity.
          </DataItem>
          <DataItem title="Engagement analytics">
            The owner dashboard displays aggregate source opens, copy actions, and current likes separately for anonymous browser identities and verified accounts. It does not provide a list of individual visitors&apos; source activity or expose their email addresses. Engagement records do not contain source text, clipboard contents, passwords, authentication tokens, or raw IP addresses.
          </DataItem>
          <DataItem title="Preferences stored in your browser">
            The website may store local preferences such as theme selection and whether an introductory animation has already been shown. These preferences are kept in browser storage and are used to remember your interface settings.
          </DataItem>
        </div>
      </Section>

      <Section id="purposes" title="3. Why the information is used">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>To display the portfolio, operate interactive Labs experiments, and respond to contact messages.</li>
          <li>To create and maintain accounts, verify email addresses, authenticate sign-ins, and deliver password-reset messages.</li>
          <li>To verify email addresses, maintain secure account sessions, and recover accounts when a password reset is requested.</li>
          <li>To provide verified-account access to published source, remember likes, and measure aggregate experiment engagement.</li>
          <li>To detect abusive registration activity, protect the service, diagnose errors, and maintain reliability.</li>
          <li>To remember interface preferences and provide a consistent experience.</li>
          <li>To meet legal obligations, handle disputes, and enforce the published service terms where necessary.</li>
        </ul>
        <p>I do not sell personal information. I do not use Labs account or contact-form information to build advertising profiles or send marketing newsletters through the flows described here.</p>
      </Section>

      <Section id="sharing" title="4. Providers and disclosures">
        <p>
          Personal information is shared only as needed to operate, secure, or support the website, or where disclosure is required by law. Providers used by the current implementation include:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li><strong className="font-semibold text-text-primary">Vercel:</strong> website hosting, deployment, server execution, and associated platform logs.</li>
          <li><strong className="font-semibold text-text-primary">MongoDB Atlas / MongoDB:</strong> database storage for account, session, verification, rate-limit, protected source, like-state, audit, and engagement-event records.</li>
          <li><strong className="font-semibold text-text-primary">Better Auth:</strong> authentication libraries and, when configured, the Better Auth Dash infrastructure integration.</li>
          <li><strong className="font-semibold text-text-primary">Email providers:</strong> the configured SMTP provider for authentication messages; the portfolio contact endpoint uses Gmail SMTP.</li>
          <li><strong className="font-semibold text-text-primary">Google:</strong> only if Google sign-in is configured and you choose that sign-in method.</li>
          <li><strong className="font-semibold text-text-primary">GitHub:</strong> only if GitHub sign-in is configured and you choose that sign-in method. Labs requests identity and email information only; it does not request access to your repositories.</li>
        </ul>
        <p>
          These providers process information under their own terms and privacy notices. I do not author their independent policies. Information may also be disclosed to professional advisers, authorities, or other parties where required by law or necessary to protect rights, safety, and the service.
        </p>
      </Section>

      <Section id="cookies" title="5. Cookies and browser storage">
        <p>
          Authentication uses server-managed session cookies so the website can recognise a signed-in account and protect account-only requests. If you choose to like an experiment anonymously, a separate signed, HTTP-only cookie remembers the anonymous like identity in that browser. The anonymous like cookie is created when you use the like control, rather than simply because you visit an experiment page. The site also uses browser storage for interface preferences such as the selected theme and introductory-animation state.
        </p>
        <p>
          These storage mechanisms support core functionality. Blocking or deleting them may sign you out, reset preferences, or affect account and Labs features. You can manage cookies and site storage through your browser settings.
        </p>
      </Section>

      <Section id="retention" title="6. How long information is kept">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>Account and session records are kept while needed to operate the account, protect the service, and meet applicable obligations. Sessions may expire or be revoked by sign-out or password reset.</li>
          <li>Verification-flow records have a seven-day expiry. Registration rate-limit records are configured for approximately 24-hour expiry.</li>

          <li>Verified likes remain active until you unlike the experiment or the account is deleted. Anonymous like identities and their active like state expire after 180 days without a visit that refreshes the identity. Engagement event records are retained for service measurement and integrity; a fixed automatic expiry period is not currently configured.</li>
          <li>Contact messages remain in the receiving email mailbox and associated provider systems until deleted under mailbox retention practices or no longer needed for a legitimate purpose.</li>
          <li>Hosting and provider logs follow the relevant provider&apos;s retention controls and may remain in backups for a limited period.</li>
        </ul>
        <p>
          Where you request account deletion, I will review the request and delete or de-identify information that no longer needs to be retained, subject to legal, security, backup, and dispute-resolution requirements.
        </p>
      </Section>

      <Section id="security" title="7. Security">
        <p>
          The implementation uses HTTPS for deployed access, server-side secret configuration, authentication controls, password hashing through the authentication provider, database-backed sessions, email verification, rate limiting, signed anonymous-like cookies, and server-side source authorization. Every protected source request checks the current verified session and publication state.
        </p>
        <p>
          No website, transmission, or storage system can be guaranteed completely secure. Please use a unique password, keep verification and reset links private, and contact me promptly if you suspect unauthorised account activity.
        </p>
      </Section>

      <Section id="rights" title="8. Your choices and privacy requests">
        <p>
          You can choose not to submit the Contact form or create a Labs account. You can change browser storage preferences through your browser settings and sign out of Labs when finished.
        </p>
        <p>
          You may contact me to request access to, correction of, or deletion of account information; ask about a consent record; withdraw consent where applicable; close an account; or raise a privacy concern. Use the <Link className="text-brand underline-offset-4 hover:underline" href="/#contact">Contact form</Link> and include the email address associated with the request. I may need to verify that you control the account before acting.
        </p>
        <p>
          Requests are handled under the law applicable to the request. Some information may be retained where a legal obligation, security need, or legitimate dispute requires it.
        </p>
      </Section>

      <Section id="children" title="9. Children">
        <p>
          Labs accounts are intended for adults aged 18 or older. I do not knowingly invite or intentionally collect account information from anyone under 18. If you believe a person under 18 has created an account or submitted personal information, contact me so I can review the matter and take appropriate steps.
        </p>
      </Section>

      <Section id="transfers" title="10. International processing">
        <p>
          Some hosting, database, authentication, email, or identity providers may process information in countries other than your own. Provider infrastructure and transfer locations can change. Consult their current privacy documentation for details of their locations and safeguards.
        </p>
      </Section>

      <Section id="changes" title="11. Changes and contact">
        <p>
          This policy may be updated when the service, data practices, providers, or applicable law changes. The effective date and version at the top identify the current text. For material changes to the information collected or the purposes for which it is used, this notice will be updated and any legally required notice or consent step will be provided.
        </p>
        <p>
          This notice is prepared with reference to India&apos;s Digital Personal Data Protection Act, 2023 and Digital Personal Data Protection Rules, 2025. Those instruments have phased commencement. Applicability depends on the relevant provision and its notified commencement date; publication of this policy is not a certification that the service has completed every compliance requirement.
        </p>
        <div className="rounded-sm border border-border bg-surface-1 p-5">
          <p className="text-sm font-semibold text-text-primary">Official Indian privacy-law resources</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf" target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-4 hover:underline">
                Digital Personal Data Protection Act, 2023
              </a>
            </li>
            <li>
              <a href="https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf" target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-4 hover:underline">
                Digital Personal Data Protection Rules, 2025
              </a>
            </li>
            <li>
              <a href="https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf" target="_blank" rel="noopener noreferrer" className="text-brand underline-offset-4 hover:underline">
                DPDP Act commencement notification
              </a>
            </li>
          </ul>
        </div>
        <p>
          For privacy questions, requests, or complaints, use the website&apos;s <Link className="text-brand underline-offset-4 hover:underline" href="/#contact">Contact section</Link>. Do not send passwords, one-time codes, session cookies, or password-reset links.
        </p>
      </Section>
    </LegalDocumentPage>
  );
}
