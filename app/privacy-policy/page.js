import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: marc@shipfa.st

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
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
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: December 19, 2024

Thank you for visiting ShareSkippy ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our website located at https://shareskippy.com (the "Website").

By accessing or using the Website, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use the Website.

1. Information We Collect

1.1 Personal Data

We collect the following personal information from you:

Name: We collect your name to personalize your experience and facilitate community connections.
Email: We collect your email address to send you important updates, notifications about meetups, and community communications.
Location: We collect your general location to help you connect with nearby dog owners and find local meetup opportunities.
Phone Number: We may collect your phone number for emergency contact purposes during meetups.
Profile Photos: We collect photos of you and your dogs to help community members recognize each other and build trust.

1.2 Dog Information

We collect information about your dogs including:
- Breed, age, and size
- Temperament and behavior characteristics
- Vaccination status and health information
- Photos and descriptions

1.3 Non-Personal Data

We may use web cookies, analytics, and similar technologies to collect non-personal information such as your IP address, browser type, device information, browsing patterns, and app usage statistics. This information helps us to enhance your experience, analyze trends, and improve our services.

2. Purpose of Data Collection

We collect and use your personal data for the following purposes:
- Facilitating connections between dog owners and dog lovers
- Organizing and managing community meetups and events
- Providing a safe and trusted community platform
- Sending important updates and notifications
- Improving our services and user experience
- Ensuring community safety and compliance with our terms

3. Data Sharing

3.1 Community Sharing: Your profile information (name, dog photos, general location) is shared with other community members to facilitate connections and meetups.

3.2 Limited Third-Party Sharing: We do not sell, trade, or rent your personal information to third parties. We may share information only as required for:
- Legal compliance and law enforcement
- Service providers who assist in operating our platform (with strict confidentiality agreements)
- Emergency situations where safety is at risk

4. Data Security

We implement appropriate security measures to protect your personal information, including:
- Encryption of sensitive data
- Secure authentication systems
- Regular security audits and updates
- Limited access to personal information by our team

5. Children's Privacy

ShareSkippy is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately.

6. Data Retention

We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time.

7. Your Rights

You have the right to:
- Access and review your personal information
- Update or correct your information
- Request deletion of your account and data
- Opt out of certain communications
- Export your data

8. Updates to the Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any updates will be posted on this page, and we may notify you via email about significant changes.

9. Contact Information

If you have any questions, concerns, or requests related to this Privacy Policy, you can contact us at:

Email: kcolban@gmail.com

For all other inquiries, please visit our Contact Us page on the Website.

By using ShareSkippy, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
