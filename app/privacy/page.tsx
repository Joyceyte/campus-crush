import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Campus Crush",
  description: "How Campus Crush collects, uses, and protects your personal information.",
};

const PRIVACY_MARKDOWN = `
## 1. What is "personal information"?

(a) The Privacy Act 1988 (Cth) currently defines "personal information" as meaning information or an opinion about an identified individual or an individual who is reasonably identifiable: (i) whether the information or opinion is true or not; and (ii) whether the information or opinion is recorded in a material form or not.

(b) Some of the information we collect, such as your dating preferences and sexual orientation, is classified as "sensitive information" under the Privacy Act, which attracts a higher standard of protection. We only collect sensitive information with your explicit consent, which you provide during signup.

(c) If information does not disclose your identity or enable your identity to be ascertained, it will in most cases not be classified as "personal information" and will not be subject to this privacy policy.

## 2. What information do we collect?

The kind of personal information that we collect from you will depend on how you use the platform. The personal information we collect and hold about you may include:

(a) **Account information**: your name, university email address, date of birth (to verify you are 18 or over), gender, and any profile photos you upload;

(b) **Quiz and matching information**: your responses to our conversational quiz, the personality profile generated from those responses, and your dating preferences, including the gender(s) of people you wish to be matched with;

(c) **Match and activity information**: your match history and outcomes, the "why you matched" explanations generated for you, and messages you send through the platform;

(d) **Technical information**: device type, app version, IP address, and usage analytics.

Please note that if you choose not to share certain personal information with us, we may not be able to provide certain parts of the services. In particular, matching cannot be provided without your quiz responses and dating preferences.

## 3. Information you provide

(a) Users of Campus Crush voluntarily give us information when onboarding, completing the quiz, updating their profile and interacting with matches.

(b) **AI processing of quiz responses.** Our matching is powered by large language models (LLMs). When you complete the quiz, your responses are transmitted to third-party AI providers (currently Anthropic PBC, the maker of Claude) to be analysed and converted into a personality profile. That profile, not your raw responses, is what drives matching. We do not permit our AI providers to use your information to train their models, and we do not transmit your name or contact details alongside your quiz responses.

(c) **University verification.** We use your university email address to verify that you are a current student. We do not contact your university or disclose your use of the platform to them.

(d) If you contact us through forms on the website, by email or through social media channels, you may voluntarily give us information such as your name, email address and the contents of your enquiry.

(e) We may also receive certain personal information as you interact with Campus Crush through surveys, feedback initiatives or customer support requests.

## 4. How we collect your personal information

(a) We collect personal information from you whenever you input such information into the website or application.

(b) We also use cookies and similar technologies which enable us to recognise when you use the platform and to help customise your experience. As a general rule, it is not possible to identify you personally from our use of cookies.

## 5. Purpose of collection

(a) The purpose for which we collect personal information is to provide you with the matching service and the best experience possible on the platform.

(b) We customarily disclose personal information only to our service providers who assist us in operating the platform, being: (i) hosting and infrastructure providers ([Vercel / Supabase / Cloudflare]); (ii) AI processing providers (currently Anthropic PBC), as described in clause 3(b); (iii) email delivery providers ([Resend / Brevo]).

(c) We disclose limited profile information to other users only when you are matched with them, in order to provide the service. Your profile is never publicly visible or browsable.

(d) Your personal information may also be accessed from time to time to prevent fraud, identify security risks, investigate safety reports, and by maintenance and support personnel acting in the normal course of their duties.

(e) We may send you service and administrative communications, including match notifications and account messages. These messages are considered part of the services and you may not opt out of them.

(f) **Promotional communication.** Subject to your opt-out preferences, we may send you direct marketing material. We will only use your personal information for this purpose if we have collected it directly from you, and if it is material of a type you would reasonably expect to receive from us. You may opt out at any time via the unsubscribe link in any marketing email.

(g) We do not transfer or disclose your information to third parties for purposes other than the ones provided in this policy.

(h) We use your data to provide or improve user-facing features, and do not use or allow it to be used for any of the following purposes: targeted advertising; selling to data brokers; providing to information resellers; determining credit-worthiness; lending purposes; training external AI models.

(i) **Venue partners.** Where we operate date offers with partner venues, we share only aggregated, de-identified information (for example, the number of matched pairs who redeemed an offer). We never disclose your identity to venue partners.

## 6. Access and correction

Australian Privacy Principle 12 permits you to obtain access to the personal information we hold about you in certain circumstances, and Australian Privacy Principle 13 allows you to correct inaccurate personal information subject to certain exceptions. Most of your information can be viewed and edited directly in the app. If you would like to obtain access beyond that, please contact us as set out below.

## 7. Deletion

You may delete your account at any time via the app settings or by contacting us. Upon deletion, we will delete your personal information within 30 days, except where we are required by law to retain it (for example, records relating to a safety investigation) or where it persists in encrypted backups, which cycle out within [90] days.

## 8. Complaint procedure

If you have a complaint concerning the manner in which we maintain the privacy of your personal information, please contact us as set out below. All complaints will be considered by a founder and we may seek further information from you to clarify your concerns. If we agree that your complaint is well founded, we will, in consultation with you, take appropriate steps to rectify the problem. If you remain dissatisfied with the outcome, you may refer the matter to the Office of the Australian Information Commissioner (www.oaic.gov.au).

## 9. Storage of information

(a) You should always take steps to protect against unauthorised access to your device and account by, among other things, choosing a unique and complex password that nobody else knows or can easily guess, and keeping your login details private.

(b) We retain the personal information we collect for so long as is reasonably necessary to fulfil the purposes for which it was collected and to perform our contractual and legal obligations.

(c) **Overseas disclosure.** Your personal information is hosted and stored in Australia. However, quiz responses are transmitted to our AI processing provider, Anthropic PBC, located in the United States, as described in clause 3(b). We take reasonable steps to ensure this recipient handles your personal information in a manner consistent with the Australian Privacy Principles, including through contractual protections.

(d) Our database is encrypted using industry-standard AES-256 encryption. All data in transit and at rest is encrypted.

(e) **Data breach notifications.** Where there has been unauthorised access to your personal information that is likely to result in serious harm, we will notify you and the Office of the Australian Information Commissioner in accordance with the Notifiable Data Breaches scheme, and where possible give you information about what has happened and what you can do.

## 10. Age requirement

Campus Crush is strictly for individuals aged 18 years and over. We verify age at signup and will delete the account of any person found to be under 18.

## 11. Changes to this policy

This Privacy Policy is current as of the effective date set out above. This Privacy Policy may change if there is a material change to the way information is handled at Campus Crush, or to clarify our policy or adjust clerical errors. If any changes are made, we will post them on this page and, where the changes are significant, notify you in the app or by email. If you continue to use Campus Crush after those changes are in effect, you agree to the revised Privacy Policy.

## 12. How to contact us about privacy

If you have any queries, if you seek access to your personal information, or if you have a complaint about our privacy practices, you can contact us at:

support@campus-crush.org
`;

function renderInline(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function PrivacyBody() {
  const blocks = PRIVACY_MARKDOWN.trim().split(/\n\n+/);
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} style={{ fontSize: "1.15rem", marginTop: "2.25rem", marginBottom: "0.75rem", color: "#fff" }}>
              {renderInline(block.replace(/^##\s*/, ""))}
            </h2>
          );
        }
        return (
          <p key={i} style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.75)" }}>
            {renderInline(block)}
          </p>
        );
      })}
    </>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" style={{ background: "var(--navy-dark)", paddingTop: "8rem", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1.5rem", lineHeight: 1.65, fontSize: "0.95rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#fff" }}>Campus Crush Privacy Policy</h1>
          <p style={{ marginBottom: "2rem", color: "rgba(255,255,255,0.55)", fontSize: "0.85rem" }}>
            Effective date: 07/07/2026
          </p>
          <p style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.75)" }}>
            Campus Crush&apos;s ambition is to help university students find genuine connections through one thoughtful, curated match each week. To do that, there is certain personal information we need to collect about you, including some information that is deeply personal. We recognise the importance of your privacy and we want you to feel confident using our platform. We don&apos;t take this responsibility lightly. If you do not agree with this policy, please do not proceed with signing up to the platform.
          </p>
          <p style={{ marginBottom: "1rem", color: "rgba(255,255,255,0.75)" }}>
            This Privacy Policy applies to all personal information collected by Yue Hu and Alexandra Zhang (Campus Crush, we or us) via the website and application located at www.campus-crush.org.
          </p>
          <PrivacyBody />
        </div>
      </main>
      <Footer />
    </>
  );
}
