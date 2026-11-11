import Link from "next/link";

import LegalDocumentPage from "@/app/components/legal/LegalDocumentPage";
import PageInformationPreference from "@/app/components/portfolio-analytics/PortfolioAnalyticsPrivacyPreference";
import { PRIVACY_VERSION } from "@/app/lib/legal/policies";
import { buildSiteUrl } from "@/app/lib/seo/urls";

export const metadata = {
  title: "Privacy Policy",
  description:
    "A brief explanation of the information used to operate this website, protect accounts, and respond to messages.",
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

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      eyebrow="LEGAL / 02"
      title="Privacy Policy"
      description="This notice summarises what information this website uses, why it is needed, and the choices available to you."
      version={PRIVACY_VERSION}
      effectiveDate="11 November 2026"
    >
      <Section id="information" title="Information used">
        <p>Depending on how you use the website, this may include:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>
            <strong className="font-semibold text-text-primary">Account details:</strong>{" "}
            your email address, name, verification and session information when
            you create or use an account. Google or GitHub provides sign-in
            details only when you choose that option.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Messages:</strong>{" "}
            the contact details and message you submit through the Contact form.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Basic site information:</strong>{" "}
            pages accessed, visit timing, approximate viewing time, broad device
            category, approximate location, and referral or campaign source may
            be processed to help improve the website. When you are signed in
            with a verified account, a visit may also be linked to your account
            display name and a masked email label. Full email addresses, raw
            account IDs, full IP addresses, and full referring URLs are not
            stored in visit records. Hosting and security providers may
            separately process technical details such as IP addresses.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Protected files:</strong>{" "}
            when a verified account opens or copies a protected source file, the
            file action and time are recorded with an account reference.
            Clipboard contents are not collected.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">Likes and preferences:</strong>{" "}
            signed-in likes are linked to your account; anonymous likes use a
            browser cookie. Browser storage may also remember display
            preferences such as your selected theme.
          </li>
        </ul>
      </Section>

      <Section id="use" title="How information is used">
        <p>
          Information is used to operate the website and its account features,
          keep accounts and protected files secure, remember likes and display
          preferences, improve the website, and respond to messages or privacy
          requests. Personal information is not sold or used to build
          advertising profiles.
        </p>
      </Section>

      <Section id="cookies" title="Cookies and your choices">
        <p>
          Necessary cookies support sign-in, account security, and anonymous
          likes. Browser storage remembers display preferences and your choice
          about basic site information.
        </p>
        <PageInformationPreference />
        <p>
          This setting applies to this browser and stops future page-visit
          information, including any verified-account label, from being
          recorded while it is turned off. It does not delete information
          already stored or affect sign-in, protected file records, or likes. You can also manage cookies and browser storage in
          your browser settings.
        </p>
      </Section>

      <Section id="sharing" title="Service providers and storage">
        <p>
          The website uses Vercel for hosting and security, MongoDB for data
          storage, Better Auth for account sign-in, and email providers for
          account and Contact messages. Google and GitHub are involved only
          when you choose their sign-in options. These providers process
          information under their own privacy terms.
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-brand">
          <li>
            Account and session information is kept while needed to provide
            and protect the account. Verification records expire after seven
            days.
          </li>
          <li>
            Basic site information is set to be deleted after 65 days.
            Anonymous likes expire after 180 days without refreshed activity.
          </li>
          <li>
            Protected file activity does not currently have a fixed automatic
            expiry period. Contact messages remain in the receiving email
            system until deleted.
          </li>
        </ul>
      </Section>

      <Section id="contact" title="Questions or requests">
        <p>
          You can browse public pages without an account. You may ask about
          information associated with your account or request correction,
          deletion, or account closure. Requests may require identity
          verification and may be subject to legal or security requirements.
        </p>
        <p>
          For questions or requests, use the website&apos;s{" "}
          <Link
            className="text-brand underline-offset-4 hover:underline"
            href="/#contact"
          >
            Contact form
          </Link>
          . Do not send passwords, one-time codes, session cookies, or
          password-reset links.
        </p>
      </Section>
    </LegalDocumentPage>
  );
}
