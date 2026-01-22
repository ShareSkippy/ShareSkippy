import Link from 'next/link';
import { getSEOTags } from '@/libs/seo';
import config from '@/config';
import { LEGAL } from '@/lib/legal';

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: '/tos',
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
        <h1 className="text-3xl font-extrabold pb-6">Terms and Conditions for {config.appName}</h1>

        <pre className="leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'sans-serif' }}>
          {`Last Updated: January 16, 2026 (v2)

Welcome to ShareSkippy!

These Terms of Service ("Terms") govern your use of the ShareSkippy website at https://shareskippy.com ("Website") and the services provided by ShareSkippy. By using our Website and services, you agree to these Terms.

1. Definitions

${LEGAL.termsDefinitions}

2. Description of ShareSkippy

ShareSkippy is a community platform that connects dog owners and dog lovers for playdates, walks, and shared care. Our service facilitates safe and responsible dog interactions within local communities.

3. User Responsibilities and Safety

3.1 Dog Safety  
Users are responsible for the safety and behavior of their dogs. All dogs must be properly vaccinated, licensed, and under control at all times.

3.2 Meetup Safety  
Users agree to meet in safe, public locations and to exercise reasonable caution when meeting other users and their dogs.

3.3 Liability  
ShareSkippy is not responsible for any injuries, damages, or incidents that occur during meetups or interactions arranged through our platform.

4. User Conduct and Community Guidelines

4.1 Respectful Behavior  
Users must treat all community members with respect and kindness. Harassment, discrimination, or inappropriate behavior will not be tolerated.

4.2 Accurate Information  
Users must provide accurate information about themselves and their dogs, including photos, descriptions, and behavioral characteristics.

4.3 No Commercial Use  
The platform is for personal, non-commercial use only. Professional dog walking or boarding services are not permitted.

5. User Data and Privacy

We collect and store user data, including name, email, location, and dog information, as necessary to provide our services. For details on how we handle your data, please refer to our Privacy Policy at https://shareskippy.com/privacy-policy.

6. Non-Personal Data Collection

We use web cookies and analytics to collect non-personal data for the purpose of improving our services and user experience.

7. Prohibited Activities

Users may not:
- Use the platform for any illegal activities
- Share inappropriate or offensive content
- Attempt to access other users' accounts
- Use automated systems to interact with the platform
- Violate any applicable laws or regulations

8. User Content and Marketing Use

Users may upload photos, images, and other content ("User Content") to ShareSkippy.

Users retain full ownership of any User Content they upload. By uploading User Content to ShareSkippy, users grant ShareSkippy a non-exclusive, royalty-free, worldwide license to use, reproduce, display, resize, crop, or otherwise format such content solely for the purposes of operating, promoting, and marketing ShareSkippy, including on our website, social media, advertisements, and promotional materials.

This license does not grant ShareSkippy the right to sell User Content to third parties or use it for purposes unrelated to the promotion of ShareSkippy.

Users represent and warrant that they have the necessary rights to upload the User Content and that they have obtained all required permissions and consents from any individuals appearing in the User Content.

If a user wishes to have specific content removed from marketing materials, they may contact us at support@shareskippy.com, and we will make reasonable efforts to comply.

9. Account Termination

We reserve the right to suspend or terminate accounts that violate these Terms or engage in inappropriate behavior.

10. Governing Law

These Terms are governed by the laws of ${LEGAL.contact.jurisdiction}.

11. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email.

12. Contact Information

For any questions or concerns regarding these Terms of Service, please contact us at:

Legal/Contact:  
ShareVita (for ShareSkippy)  
Email: ${LEGAL.contact.legal}  
Support: ${LEGAL.contact.support}  
Jurisdiction: ${LEGAL.contact.jurisdiction}

Thank you for being part of the ShareSkippy community!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
