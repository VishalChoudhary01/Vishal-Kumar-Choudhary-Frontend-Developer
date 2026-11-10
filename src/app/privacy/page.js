import Link from "next/link";

import LegalDocumentPage from "@/app/components/legal/LegalDocumentPage";
import PortfolioAnalyticsPrivacyPreference from "@/app/components/portfolio-analytics/PortfolioAnalyticsPrivacyPreference";
import { PRIVACY_VERSION } from "@/app/lib/legal/policies";
import { buildSiteUrl } from "@/app/lib/seo/urls";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Understand the information used to operate this portfolio and Portfolio Labs, the optional site statistics, and the privacy choices available to you.",
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
  ["operator", "1. About this notice"],
  ["information", "2. Information used by the site"],
  ["purposes", "3. How information is used"],
  ["cookies", "4. Cookies and browser storage"],
  ["sharing", "5. Service providers"],
  ["retention", "6. How long information is kept"],
  ["choices", "7. Your choices and requests"],
  ["security", "8. Security"],
  ["children", "9. Children"],
  ["transfers", "10. International processing"],
  ["changes", "11. Updates and contact"],
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      eyebrow="LEGAL / 02"
      title="Privacy Policy"
      description="This notice explains the information needed to operate the portfolio and Portfolio Labs, including accounts, contact messages, experiment features, and optional site usage statistics."
      version={PRIVACY_VERSION}
      effectiveDate="11 November 2026"
    >
      <nav
        aria-label="Privacy Policy contents"
        className="rounded-sm border border-border bg-surface-1 p-5 sm:p-6"
      >
        <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-tertiary">
          ON THIS PAGE
        </p>
        <div className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {contents.map(([id, label]) => (
            <a
              key={id}
              href={"#" + id}
              className="text-text-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <Section id="operator" title="1. About this notice">
        <p>
          This portfolio and Portfolio Labs are operated by Vishal Kumar Choudhary
          (“I”, “me”, or “the operator”). This policy covers the public website,
          the Contact form, Labs accounts, authentication, likes, and access to
          protected experiment source.
        </p>
        <p>
          Websites linked from this portfolio are operated by other parties and
          have their own privacy practices.
        </p>
      </Section>

      <Section id="information" title="2. Information used by the site">
        <div className="space-y-5">
          <DataItem title="Account and sign-in details">
            When you create a Labs account, the service uses your email address,
            account name, account identifier, verification status, and account
            timestamps. Passwords are handled by the authentication system and
            are not stored as readable plain text. If you choose Google or
            GitHub sign-in, that provider shares the identity and profile details
            needed to sign you in, such as your verified email address.
          </DataItem>

          <DataItem title="Sessions and service security">
            Sign-in uses session records and necessary cookies to keep your
            account secure and remember that you are signed in. Security and
            hosting systems may also process technical details such as an IP
            address, request time, browser or device information, and error
            details to protect the service and diagnose problems.
          </DataItem>

          <DataItem title="Contact messages">
            When you submit the Contact form, I receive the name, email address,
            project type, and message that you provide. The message is delivered
            to the configured email inbox and may remain in that mailbox and its
            provider systems until it is deleted.
          </DataItem>

          <DataItem title="Use of protected experiment source">
            Published source files are available to signed-in accounts with a
            verified email address. When a verified account opens or copies a
            source file, the service records the experiment, source version,
            file path, action, time, and an account reference. This supports
            source access integrity and aggregate experiment statistics.
            Clipboard contents are not collected.
          </DataItem>

          <DataItem title="Experiment likes">
            If you like an experiment while signed in, the like is associated
            with your account and that experiment so it can be remembered and
            removed later. You can also like an experiment without signing in.
            In that case, a necessary browser cookie remembers the anonymous
            like state for that browser. A protected, pseudonymous value is
            stored with the experiment; it is not a verified name or email
            address. Anonymous like state expires after 180 days without
            activity that refreshes it.
          </DataItem>

          <DataItem title="Optional site usage statistics">
            When the site usage feature is enabled, the website can collect
            limited information about visits to public pages: the page viewed,
            visit time, approximate active viewing time, broad device category,
            approximate country, region and city, the referring website
            hostname, and selected campaign labels such as source or medium.
            Only the homepage, project pages, Labs collection, and public
            experiment detail pages are included.
            <br />
            A temporary tab value is used to group activity during a visit and
            is converted into a protected value before it is saved. The page
            usage record does not contain your name, email address, full IP
            address, full referring URL, or raw browser user-agent string.
            Hosting and security providers may separately process technical
            information, including IP addresses, in their own infrastructure
            logs.
          </DataItem>

          <DataItem title="Display preferences">
            Browser storage may remember interface preferences such as your
            selected theme or whether an introductory animation has already
            been shown.
          </DataItem>
        </div>
      </Section>

      <Section id="purposes" title="3. How information is used">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>To display the portfolio and operate interactive Labs features.</li>
          <li>To create accounts, verify email addresses, sign users in, maintain sessions, and deliver account emails.</li>
          <li>To protect access to published source and remember experiment likes.</li>
          <li>To understand which public pages and experiments are useful, when optional site usage statistics are enabled.</li>
          <li>To prevent abuse, maintain reliability, diagnose service errors, and protect accounts.</li>
          <li>To respond to messages and privacy requests.</li>
        </ul>
        <p>
          I do not sell personal information. The information described in this
          policy is not used to build advertising profiles or to send marketing
          newsletters.
        </p>
      </Section>

      <Section id="cookies" title="4. Cookies and browser storage">
        <p>
          Necessary cookies support sign-in, account security, and anonymous
          experiment likes. Browser storage also remembers display preferences.
          Optional site usage statistics use a temporary tab value during a
          visit; the choice to turn those statistics off is saved in this
          browser&apos;s local storage.
        </p>
        <p>
          You can manage cookies and browser storage through your browser
          settings. Removing necessary cookies may sign you out or reset an
          anonymous like. The preference below controls optional page usage
          statistics only; it does not affect sign-in, protected source access,
          or experiment likes.
        </p>
        <PortfolioAnalyticsPrivacyPreference />
      </Section>

      <Section id="sharing" title="5. Service providers">
        <p>
          Information is shared with providers only where needed to operate,
          secure, or support the website, or where disclosure is required by
          law. The current service uses:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>
            <strong className="font-semibold text-text-primary">Vercel:</strong>{" "}
            website hosting, deployments, server execution, and platform
            security logs.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">MongoDB Atlas / MongoDB:</strong>{" "}
            storage for account, session, verification, experiment, like, and
            service records.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Better Auth:</strong>{" "}
            account authentication and session management.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Email providers:</strong>{" "}
            delivery of account verification, password reset, and Contact form
            messages through the configured email services.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Google and GitHub:</strong>{" "}
            only when you choose the relevant sign-in option. The GitHub sign-in
            flow requests identity information; it does not request access to
            your repositories.
          </li>
        </ul>
        <p>
          Each provider has its own privacy notice and retention practices.
          Information may also be disclosed when required by law or when
          necessary to protect the rights, safety, and security of the service.
        </p>
      </Section>

      <Section id="retention" title="6. How long information is kept">
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>
            Account and session information is kept while needed to provide and
            secure the account. Sessions can expire or be revoked.
          </li>
          <li>
            Email verification records expire after seven days. Short-lived
            registration abuse-prevention records are configured to expire
            after approximately 24 hours.
          </li>
          <li>
            When enabled, public page usage records are configured for automatic
            deletion 65 days after the visit starts. Database cleanup may take
            additional time after that period.
          </li>
          <li>
            Anonymous like state expires after 180 days without activity that
            refreshes it. Signed-in likes remain until you remove the like or
            the account is deleted.
          </li>
          <li>
            Experiment source activity records do not currently have a fixed
            automatic expiry period. They are retained for source access
            integrity and service reporting.
          </li>
          <li>
            Contact messages remain in the receiving email system until
            deleted. Hosting and provider logs follow the providers&apos; own
            retention settings.
          </li>
        </ul>
        <p>
          You can contact me about account closure or deletion. Requests are
          reviewed individually, taking into account legal, security, backup,
          and dispute-resolution requirements.
        </p>
      </Section>

      <Section id="choices" title="7. Your choices and privacy requests">
        <p>
          You can browse the public portfolio without creating a Labs account.
          Account creation is needed only for account features such as protected
          source access. You can choose not to submit the Contact form and can
          manage cookies and browser storage in your browser.
        </p>
        <p>
          You can turn off optional site usage statistics for this browser using
          the control above. This stops future page usage records from this
          browser while the preference remains saved. It does not delete
          records already stored and does not turn off the separate records
          needed for account security, protected source activity, or likes.
        </p>
        <p>
          You may contact me to ask about the personal information associated
          with your account, request correction or deletion, withdraw consent
          where applicable, close an account, or raise a privacy concern. Use
          the <Link className="text-brand underline-offset-4 hover:underline" href="/#contact">Contact form</Link>{" "}
          and include the email address associated with the request. I may ask
          you to verify that you control the account before acting.
        </p>
      </Section>

      <Section id="security" title="8. Security">
        <p>
          The service uses HTTPS, server-side secret configuration, password
          hashing through the authentication system, database-backed sessions,
          email verification, rate limits, and server-side checks for protected
          source access. No website or storage system can be guaranteed
          completely secure.
        </p>
        <p>
          Please use a unique password and keep verification emails, sign-in
          links, and password-reset links private. Contact me if you suspect
          unauthorised access to your account.
        </p>
      </Section>

      <Section id="children" title="9. Children">
        <p>
          Labs accounts are intended for adults aged 18 or older. I do not
          knowingly invite or intentionally collect account information from
          anyone under 18. Contact me if you believe a person under 18 has
          submitted personal information so I can review the matter.
        </p>
      </Section>

      <Section id="transfers" title="10. International processing">
        <p>
          Hosting, database, authentication, email, and identity providers may
          process information in countries other than your own. Their
          infrastructure locations and safeguards may change; consult their
          current privacy documentation for details.
        </p>
      </Section>

      <Section id="changes" title="11. Updates and contact">
        <p>
          This policy may change when the website, its features, service
          providers, or applicable requirements change. The effective date and
          version above identify the current notice. Material changes to the
          information used or the purposes for which it is used will be
          reflected here, together with any notice or consent step required by
          applicable law.
        </p>
        <p>
          This notice is prepared with reference to India&apos;s Digital
          Personal Data Protection Act, 2023 and Digital Personal Data
          Protection Rules, 2025. Those instruments have phased commencement.
          Applicability depends on the relevant provision and its notified
          commencement date. This notice is not a certification that the
          service has completed every compliance requirement.
        </p>
        <div className="rounded-sm border border-border bg-surface-1 p-5">
          <p className="text-sm font-semibold text-text-primary">
            Official Indian privacy-law resources
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-4 hover:underline"
              >
                Digital Personal Data Protection Act, 2023
              </a>
            </li>
            <li>
              <a
                href="https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-4 hover:underline"
              >
                Digital Personal Data Protection Rules, 2025
              </a>
            </li>
            <li>
              <a
                href="https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline-offset-4 hover:underline"
              >
                DPDP Act commencement notification
              </a>
            </li>
          </ul>
        </div>
        <p>
          For privacy questions, requests, or complaints, use the website&apos;s{" "}
          <Link className="text-brand underline-offset-4 hover:underline" href="/#contact">
            Contact section
          </Link>
          . Do not send passwords, one-time codes, session cookies, or
          password-reset links.
        </p>
      </Section>
    </LegalDocumentPage>
  );
}
