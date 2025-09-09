import { 
  sendWelcomeEmail,
  sendNewMessageNotification,
  sendMeetingScheduledConfirmation,
  sendMeetingReminder,
  sendFollowUpEmail
} from '@/libs/emailTemplates';

export async function GET() {
  // DISABLED: This endpoint was sending unwanted test emails
  return Response.json({
    success: false,
    message: 'Test email endpoint has been disabled to prevent unwanted emails'
  }, { status: 403 });

  try {
    const testEmail = 'kaia@kaia.dev'; // Replace with your email
    const appUrl = 'shareskippy.com';

    console.log('🧪 Testing ShareSkippy Email System...');

    // Test 1: Welcome Email
    console.log('1️⃣ Testing Welcome Email...');
    await sendWelcomeEmail({
      to: testEmail,
      userName: 'Test User',
      appUrl: appUrl
    });
    console.log('✅ Welcome email sent successfully!');

    // Test 2: New Message Notification
    console.log('2️⃣ Testing New Message Notification...');
    await sendNewMessageNotification({
      to: testEmail,
      recipientName: 'Test User',
      senderName: 'John Doe',
      senderInitial: 'J',
      messagePreview: 'Hey! Would you like to schedule a playdate with our dogs?',
      messageTime: new Date().toLocaleString(),
      messageUrl: `https://${appUrl}/messages/123`,
    });
    console.log('✅ New message notification sent successfully!');

    // Test 3: Meeting Scheduled Confirmation
    console.log('3️⃣ Testing Meeting Scheduled Confirmation...');
    await sendMeetingScheduledConfirmation({
      to: testEmail,
      userName: 'Test User',
      userDogName: 'Buddy',
      otherUserName: 'Jane Smith',
      otherUserDogName: 'Luna',
      meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
      meetingTime: '2:00 PM',
      meetingLocation: 'Central Park',
      meetingNotes: 'Bring water and treats for both dogs!',
      meetingUrl: `https://${appUrl}/meetings/456`,
      messageUrl: `https://${appUrl}/messages`,
    });
    console.log('✅ Meeting scheduled confirmation sent successfully!');

    // Test 4: Meeting Reminder
    console.log('4️⃣ Testing Meeting Reminder...');
    await sendMeetingReminder({
      to: testEmail,
      userName: 'Test User',
      userDogName: 'Buddy',
      otherUserName: 'Jane Smith',
      otherUserDogName: 'Luna',
      meetingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
      meetingTime: '2:00 PM',
      meetingLocation: 'Central Park',
      meetingNotes: 'Bring water and treats for both dogs!',
      meetingUrl: `https://${appUrl}/meetings/456`,
      messageUrl: `https://${appUrl}/messages`,
    });
    console.log('✅ Meeting reminder sent successfully!');

    // Test 5: Follow-up Email
    console.log('5️⃣ Testing Follow-up Email...');
    await sendFollowUpEmail({
      to: testEmail,
      userName: 'Test User',
      userDogName: 'Buddy',
      profileViews: 12,
      messagesReceived: 5,
      meetingsScheduled: 2,
      connectionsMade: 3,
    });
    console.log('✅ Follow-up email sent successfully!');

    return Response.json({
      success: true,
      message: 'All email tests completed successfully!',
      emailsSent: 5,
      testEmail: testEmail
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Email test failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
