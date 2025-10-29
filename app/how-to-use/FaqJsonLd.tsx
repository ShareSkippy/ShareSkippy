export default function FaqJsonLd() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is ShareSkippy free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! ShareSkippy is completely free to use. We believe in building community connections without financial barriers. Users can arrange their own terms for any services provided.',
        },
      },
      {
        '@type': 'Question',
        name: "How do I post my dog's availability?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "To post your dog's availability, go to the Community page and click 'Share Availability'. Select 'Dog Available' as your post type, choose which dogs are available, set your schedule, add a description, and publish your post.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find dogs to walk in my area?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Visit the Community page and browse the 'Dog Availability' tab. You'll see posts from dog owners looking for help. Click 'Send Message' to start a conversation with the owner.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I schedule a meeting with someone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "After starting a conversation, click 'Schedule Meeting' in the messages page. Fill out the meeting details including date, time, location, and description. The other person can then accept or reject your meeting request.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I leave a review after a meeting?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "After a meeting is completed, go to your Meetings page and click 'Leave Review' next to the completed meeting. Rate the experience (1-5 stars) and write a comment (minimum 5 words) to help build trust in the community.",
        },
      },
      {
        '@type': 'Question',
        name: 'What is a PetPal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "A PetPal is someone who loves dogs but doesn't own one, or someone who wants to help other dog owners. PetPals can post their availability to help with dog walking, sitting, or other dog care activities.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I edit or hide my availability posts?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Go to the Community page and click on the 'My Availability' tab. Find the post you want to modify and click 'Edit' to update it, or 'Hide Post' to make it invisible to other users while preserving existing conversations.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
