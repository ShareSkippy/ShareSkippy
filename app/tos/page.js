import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: December 19, 2024

Welcome to ShareSkippy!

These Terms of Service ("Terms") govern your use of the ShareSkippy website at https://shareskippy.com ("Website") and the services provided by ShareSkippy. By using our Website and services, you agree to these Terms.

1. Description of ShareSkippy

ShareSkippy is a community platform that connects dog owners and dog lovers for playdates, walks, and shared care. Our service facilitates safe and responsible dog interactions within local communities.

2. User Responsibilities and Safety

2.1 Dog Safety: Users are responsible for the safety and behavior of their dogs. All dogs must be properly vaccinated, licensed, and under control at all times.

2.2 Meetup Safety: Users agree to meet in safe, public locations and to exercise reasonable caution when meeting other users and their dogs.

2.3 Liability: ShareSkippy is not responsible for any injuries, damages, or incidents that occur during meetups or interactions arranged through our platform.

3. User Conduct and Community Guidelines

3.1 Respectful Behavior: Users must treat all community members with respect and kindness. Harassment, discrimination, or inappropriate behavior will not be tolerated.

3.2 Accurate Information: Users must provide accurate information about themselves and their dogs, including photos, descriptions, and behavioral characteristics.

3.3 No Commercial Use: The platform is for personal, non-commercial use only. Professional dog walking or boarding services are not permitted.

4. User Data and Privacy

We collect and store user data, including name, email, location, and dog information, as necessary to provide our services. For details on how we handle your data, please refer to our Privacy Policy at https://shareskippy.com/privacy-policy.

5. Non-Personal Data Collection

We use web cookies and analytics to collect non-personal data for the purpose of improving our services and user experience.

6. Prohibited Activities

Users may not:
- Use the platform for any illegal activities
- Share inappropriate or offensive content
- Attempt to access other users' accounts
- Use automated systems to interact with the platform
- Violate any applicable laws or regulations

7. Account Termination

We reserve the right to suspend or terminate accounts that violate these Terms or engage in inappropriate behavior.

8. Governing Law

These Terms are governed by the laws of the United States.

9. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email.

10. Contact Information

For any questions or concerns regarding these Terms of Service, please contact us at kcolban@gmail.com.

Thank you for being part of the ShareSkippy community!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
