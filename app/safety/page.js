import Link from 'next/link';
import { LEGAL } from '@/lib/legal';

export default function SafetyGuidelines() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Safety Guidelines</h1>
            <p className="text-gray-600">
              Your safety is our priority. Please follow these guidelines to ensure safe and
              positive experiences.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {/* First Meeting Safety */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-red-500 mr-3">⚠️</span>
                First Meeting Safety
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold mb-2">Always meet in public first!</p>
                <p className="text-red-700 text-sm">
                  Never go directly to someone&apos;s home or invite them to yours without meeting
                  in public first.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Choose public locations:</strong> Coffee shops, parks, pet stores, or busy
                  outdoor areas
                </li>
                <li>
                  <strong>Bring a friend or family member</strong> to your first meeting
                </li>
                <li>
                  <strong>Meet during daylight hours</strong> in well-lit, populated areas
                </li>
                <li>
                  <strong>Trust your instincts</strong> - if something feels off, don&apos;t proceed
                </li>
                <li>
                  <strong>Share your location</strong> with a trusted friend or family member
                </li>
                <li>
                  <strong>Have your phone charged</strong> and easily accessible
                </li>
              </ul>
            </section>

            {/* Dog Safety */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-blue-500 mr-3">🐕</span>
                Dog Safety Guidelines
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-semibold mb-2">
                  Dog owners: Be honest about your dog&apos;s behavior!
                </p>
                <p className="text-blue-700 text-sm">
                  Pet lovers: Always ask about the dog&apos;s temperament and any special needs.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Be honest about your dog&apos;s temperament</strong> - aggression,
                  anxiety, or special needs
                </li>
                <li>
                  <strong>Ensure your dog is properly trained</strong> and responds to basic
                  commands
                </li>
                <li>
                  <strong>Keep dogs on leash</strong> unless in a designated off-leash area
                </li>
                <li>
                  <strong>Bring necessary supplies:</strong> water, treats, waste bags, first aid
                  kit
                </li>
                <li>
                  <strong>Know your dog&apos;s limits</strong> - don&apos;t push them beyond their
                  comfort zone
                </li>
                <li>
                  <strong>Have emergency contact information</strong> readily available
                </li>
                <li>
                  <strong>Be aware of local leash laws</strong> and park regulations
                </li>
              </ul>
            </section>

            {/* Communication Safety */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-green-500 mr-3">💬</span>
                Communication Safety
              </h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Use the platform&apos;s messaging system</strong> - don&apos;t share
                  personal contact info initially
                </li>
                <li>
                  <strong>Be cautious of users who:</strong>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Ask for money or financial information</li>
                    <li>Pressure you to meet quickly or in private</li>
                    <li>Refuse to meet in public</li>
                    <li>Have incomplete or suspicious profiles</li>
                    <li>Ask for personal information beyond what&apos;s necessary</li>
                  </ul>
                </li>
                <li>
                  <strong>Take your time</strong> getting to know someone before arranging dog
                  interactions
                </li>
                <li>
                  <strong>Ask questions</strong> about experience with dogs, availability, and
                  expectations
                </li>
                <li>
                  <strong>Be clear about boundaries</strong> and what you&apos;re comfortable with
                </li>
              </ul>
            </section>

            {/* Red Flags */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-red-500 mr-3">🚩</span>
                Red Flags to Watch For
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">
                  If you encounter any of these, stop communication and report the user:
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Aggressive or threatening behavior</strong>
                </li>
                <li>
                  <strong>Requests for money or financial information</strong>
                </li>
                <li>
                  <strong>Refusal to meet in public or during daylight</strong>
                </li>
                <li>
                  <strong>Inconsistent or suspicious stories</strong>
                </li>
                <li>
                  <strong>Pressure to move communication off the platform</strong>
                </li>
                <li>
                  <strong>Inappropriate or sexual comments</strong>
                </li>
                <li>
                  <strong>Refusal to provide basic information</strong> about themselves or their
                  dogs
                </li>
                <li>
                  <strong>Dogs that show signs of aggression</strong> or are not properly controlled
                </li>
              </ul>
            </section>

            {/* Emergency Procedures */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-orange-500 mr-3">🚨</span>
                Emergency Procedures
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800 font-semibold">In case of emergency:</p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Call 911 immediately</strong> if you feel threatened or in danger
                </li>
                <li>
                  <strong>Contact local animal control</strong> if a dog is aggressive or out of
                  control
                </li>
                <li>
                  <strong>Seek medical attention</strong> for any injuries to people or animals
                </li>
                <li>
                  <strong>Document everything</strong> - take photos, save messages, note details
                </li>
                <li>
                  <strong>Report the incident</strong> to ShareSkippy support
                </li>
                <li>
                  <strong>Contact your veterinarian</strong> if your dog is injured
                </li>
              </ul>
            </section>

            {/* Best Practices */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                Best Practices for Success
              </h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Start with short interactions</strong> and gradually build trust
                </li>
                <li>
                  <strong>Be patient</strong> - good relationships take time to develop
                </li>
                <li>
                  <strong>Communicate clearly</strong> about expectations and boundaries
                </li>
                <li>
                  <strong>Be respectful</strong> of other people&apos;s time and schedules
                </li>
                <li>
                  <strong>Follow up after interactions</strong> to provide feedback
                </li>
                <li>
                  <strong>Leave honest ratings and reviews</strong> to help the community
                </li>
                <li>
                  <strong>Be understanding</strong> - plans can change, dogs can be unpredictable
                </li>
              </ul>
            </section>

            {/* Local Resources */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-purple-500 mr-3">📞</span>
                Important Contacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Emergency Services</h3>
                  <p className="text-sm text-gray-700">911 - Emergency</p>
                  <p className="text-sm text-gray-700">Local Police Non-Emergency</p>
                  <p className="text-sm text-gray-700">Animal Control</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">ShareSkippy Support</h3>
                  <p className="text-sm text-gray-700">Report Safety Issues</p>
                  <p className="text-sm text-gray-700">Block Users</p>
                  <p className="text-sm text-gray-700">General Support</p>
                </div>
              </div>
            </section>

            {/* Legal Disclosure */}
            <section className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">About ShareSkippy</h3>
                <p className="text-blue-700 text-sm mb-3">{LEGAL.getCurrentDisclosure()}</p>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Disclaimer</h3>
                <p className="text-yellow-700 text-sm">
                  ShareSkippy is a free marketplace platform that connects users. We do not verify
                  the identity, background, or trustworthiness of users. We do not screen or
                  evaluate dogs for behavior or health issues. Users are responsible for their own
                  safety and the safety of their dogs. Always use caution and follow these safety
                  guidelines.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 sm:mb-0">
                ← Back to Home
              </Link>
              <div className="flex space-x-4">
                <Link href="/tos" className="text-blue-600 hover:text-blue-800 font-medium">
                  Terms of Service
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
