import fs from 'fs';
import path from 'path';
import { sendEmail } from './resend.js';
import config from '@/config';

// Email template paths
const TEMPLATE_PATHS = {
  welcome: path.join(process.cwd(), 'email-templates', 'welcome-email.html'),
  newMessage: path.join(process.cwd(), 'email-templates', 'new-message-notification.html'),
  meetingScheduled: path.join(process.cwd(), 'email-templates', 'meeting-scheduled-confirmation.html'),
  meetingReminder: path.join(process.cwd(), 'email-templates', 'meeting-reminder-1day.html'),
  followUp: path.join(process.cwd(), 'email-templates', 'follow-up-1week.html'),
  followUp3Days: path.join(process.cwd(), 'email-templates', 'follow-up-3days.html'),
  reviewRequest: path.join(process.cwd(), 'email-templates', 'review-request.html'),
};

/**
 * Load and process email template with variables
 * @param {string} templatePath - Path to the HTML template
 * @param {Object} variables - Variables to replace in the template
 * @returns {string} Processed HTML content
 */
function loadTemplate(templatePath, variables = {}) {
  try {
    let html = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value || '');
    });
    
    return html;
  } catch (error) {
    console.error(`Error loading template ${templatePath}:`, error);
    throw new Error(`Failed to load email template: ${templatePath}`);
  }
}

/**
 * Send welcome email to new users
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's name
 * @param {string} params.appUrl - App URL
 */
export async function sendWelcomeEmail({ to, userName, appUrl = config.domainName }) {
  const html = loadTemplate(TEMPLATE_PATHS.welcome, {
    userName,
    appUrl: `https://www.${appUrl}/community`,
  });

  const text = `Welcome to ShareSkippy, ${userName}!

We're thrilled to have you join our community of dog lovers! ShareSkippy is all about connecting dog owners and dog enthusiasts to create amazing experiences together.

Here's what you can do on ShareSkippy:
- Schedule Playdates: Connect with other dog owners for fun meetups
- Chat & Connect: Message fellow dog lovers in your area
- Share Reviews: Rate experiences and help others find great connections
- Discover Places: Find dog-friendly spots and share your favorites
- Share Availability: Let others know when you're available for dog activities

Start exploring: https://www.${appUrl}/community

Happy tails and wagging adventures,
The ShareSkippy Team 🐕`;

  return await sendEmail({
    to,
    subject: `Welcome to ShareSkippy, ${userName}! 🐕`,
    html,
    text,
  });
}

/**
 * Send new message notification email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.recipientName - Recipient's name
 * @param {string} params.senderName - Sender's name
 * @param {string} params.senderInitial - Sender's initial for avatar
 * @param {string} params.messagePreview - Preview of the message
 * @param {string} params.messageTime - When the message was sent
 * @param {string} params.messageUrl - URL to view the message
 * @param {string} params.appUrl - App URL
 */
export async function sendNewMessageNotification({
  to,
  recipientName,
  senderName,
  senderInitial,
  messagePreview,
  messageTime,
  messageUrl,
  appUrl = config.domainName,
}) {
  const html = loadTemplate(TEMPLATE_PATHS.newMessage, {
    recipientName,
    senderName,
    senderInitial,
    messagePreview,
    messageTime,
    messageUrl,
    appUrl: `https://${appUrl}`,
  });

  const text = `New message from ${senderName} on ShareSkippy!

Hi ${recipientName},

You've received a new message on ShareSkippy:

"${messagePreview}"

View and reply: ${messageUrl}

Happy chatting,
The ShareSkippy Team 🐕`;

  return await sendEmail({
    to,
    subject: `New message from ${senderName} on ShareSkippy 💬`,
    html,
    text,
  });
}

/**
 * Send meeting scheduled confirmation email
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's name
 * @param {string} params.userDogName - User's dog name
 * @param {string} params.otherUserName - Other user's name
 * @param {string} params.otherUserDogName - Other user's dog name
 * @param {string} params.meetingDate - Meeting date
 * @param {string} params.meetingTime - Meeting time
 * @param {string} params.meetingLocation - Meeting location
 * @param {string} params.meetingNotes - Optional meeting notes
 * @param {string} params.meetingUrl - URL to view meeting details
 * @param {string} params.messageUrl - URL to message the other user
 * @param {string} params.appUrl - App URL
 */
export async function sendMeetingScheduledConfirmation({
  to,
  userName,
  userDogName,
  otherUserName,
  otherUserDogName,
  meetingDate,
  meetingTime,
  meetingLocation,
  meetingNotes = '',
  meetingUrl,
  messageUrl,
  appUrl = config.domainName,
}) {
  const html = loadTemplate(TEMPLATE_PATHS.meetingScheduled, {
    userName,
    userDogName,
    otherUserName,
    otherUserDogName,
    meetingDate,
    meetingTime,
    meetingLocation,
    meetingNotes,
    meetingUrl,
    messageUrl,
    appUrl: `https://${appUrl}`,
  });

  const text = `Meeting Confirmed! Your dog playdate is scheduled.

Hi ${userName},

Great news! Your meeting with ${otherUserName} has been successfully scheduled.

Meeting Details:
- Date: ${meetingDate}
- Time: ${meetingTime}
- Location: ${meetingLocation}
- With: ${otherUserName} & ${otherUserDogName}
${meetingNotes ? `- Notes: ${meetingNotes}` : ''}

View meeting details: ${meetingUrl}
Message ${otherUserName}: ${messageUrl}

Happy tails and wagging adventures,
The ShareSkippy Team 🐕`;

  return await sendEmail({
    to,
    subject: `Meeting Confirmed! Playdate with ${otherUserName} 🎉`,
    html,
    text,
  });
}

/**
 * Send meeting reminder email (1 day before)
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's name
 * @param {string} params.userDogName - User's dog name
 * @param {string} params.otherUserName - Other user's name
 * @param {string} params.otherUserDogName - Other user's dog name
 * @param {string} params.meetingDate - Meeting date
 * @param {string} params.meetingTime - Meeting time
 * @param {string} params.meetingLocation - Meeting location
 * @param {string} params.meetingNotes - Optional meeting notes
 * @param {string} params.meetingUrl - URL to view meeting details
 * @param {string} params.messageUrl - URL to message the other user
 * @param {string} params.appUrl - App URL
 * @param {string} params.unsubscribeUrl - URL for unsubscribe link
 */
export async function sendMeetingReminder({
  to,
  userName,
  userDogName,
  otherUserName,
  otherUserDogName,
  meetingDate,
  meetingTime,
  meetingLocation,
  meetingNotes = '',
  meetingUrl,
  messageUrl,
  appUrl = config.domainName,
  unsubscribeUrl,
}) {
  const html = loadTemplate(TEMPLATE_PATHS.meetingReminder, {
    userName,
    userDogName,
    otherUserName,
    otherUserDogName,
    meetingDate,
    meetingTime,
    meetingLocation,
    meetingNotes,
    meetingUrl,
    messageUrl,
    appUrl: `https://${appUrl}`,
    unsubscribeUrl: unsubscribeUrl || `${appUrl}/profile`,
  });

  const text = `Reminder: Your dog playdate is tomorrow!

Hi ${userName},

Just a friendly reminder that your meeting with ${otherUserName} is scheduled for tomorrow.

Meeting Details:
- Date: ${meetingDate} (Tomorrow!)
- Time: ${meetingTime}
- Location: ${meetingLocation}
- With: ${otherUserName} & ${otherUserDogName}
${meetingNotes ? `- Notes: ${meetingNotes}` : ''}

View meeting details: ${meetingUrl}
Message ${otherUserName}: ${messageUrl}

Excited for tomorrow's adventure,
The ShareSkippy Team 🐕`;

  return await sendEmail({
    to,
    subject: `Reminder: Playdate with ${otherUserName} tomorrow! ⏰`,
    html,
    text,
  });
}

/**
 * Send 3-day follow-up email to encourage users to share availability
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's name
 * @param {string} params.appUrl - App URL
 */
export async function sendFollowUp3DaysEmail({
  to,
  userName,
  appUrl = config.domainName,
}) {
  const html = loadTemplate(TEMPLATE_PATHS.followUp3Days, {
    userName,
    appUrl: `https://${appUrl}`,
  });

  const text = `Ready to connect with your neighbors? - ShareSkippy

Hi ${userName},

It's been a couple weeks since you joined ShareSkippy — welcome again! 🎉

Right now, neighbors (and their dogs) are waiting to connect. To get started, all you need to do is share your availability:

- Borrow a dog for a walk or playdate 🐾
- Find a petpal for your pup 🐕
- Meet new neighbors who love dogs as much as you do 🌟

Share your availability: https://${appUrl}/share-availability

It only takes a minute, and it's the easiest way to start getting belly rubs, tail wags, and new connections.

See you (and your future dog buddies) soon,
— The ShareSkippy Team 🐶✨`;

  return await sendEmail({
    to,
    subject: `Ready to connect with your neighbors? 🐕`,
    html,
    text,
  });
}

/**
 * Send follow-up email (1 week after signup)
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's name
 * @param {string} params.userDogName - User's dog name
 * @param {number} params.profileViews - Number of profile views
 * @param {number} params.messagesReceived - Number of messages received
 * @param {number} params.meetingsScheduled - Number of meetings scheduled
 * @param {number} params.connectionsMade - Number of connections made
 * @param {string} params.appUrl - App URL
 */
export async function sendFollowUpEmail({
  to,
  userName,
  userDogName,
  profileViews = 0,
  messagesReceived = 0,
  meetingsScheduled = 0,
  connectionsMade = 0,
  appUrl = config.domainName,
}) {
  const html = loadTemplate(TEMPLATE_PATHS.followUp, {
    userName,
    userDogName,
    profileViews,
    messagesReceived,
    meetingsScheduled,
    connectionsMade,
    appUrl: `https://${appUrl}`,
  });

  const text = `How's ShareSkippy going? - 1 Week Check-in

Hey ${userName},

It's been a week since you joined our community! Here's how you're doing:

- Profile Views: ${profileViews}
- Messages: ${messagesReceived}
- Meetings: ${meetingsScheduled}
- Connections: ${connectionsMade}

Continue exploring: https://${appUrl}
Update your profile: https://${appUrl}/profile/edit

We'd love to hear from you! Reply to this email and let us know how your first week has been.

Wagging tails and happy adventures,
The ShareSkippy Team 🐕`;

  return await sendEmail({
    to,
    subject: `How's ShareSkippy going? - 1 Week Check-in 📅`,
    html,
    text,
    replyTo: 'support@shareskippy.com',
  });
}

/**
 * Send review request email after a playdate
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - User's name
 * @param {string} params.userDogName - User's dog name
 * @param {string} params.otherUserName - Other user's name
 * @param {string} params.otherUserDogName - Other user's dog name
 * @param {string} params.meetingDate - Meeting date
 * @param {string} params.meetingLocation - Meeting location
 * @param {string} params.reviewUrl - URL to leave a review
 * @param {string} params.messageUrl - URL to message the other user
 * @param {string} params.appUrl - App URL
 */
export async function sendReviewEmail({
  to,
  userName,
  userDogName,
  otherUserName,
  otherUserDogName,
  meetingDate,
  meetingLocation,
  reviewUrl,
  messageUrl,
  appUrl = config.domainName,
}) {
  const html = loadTemplate(TEMPLATE_PATHS.reviewRequest, {
    userName,
    userDogName,
    otherUserName,
    otherUserDogName,
    meetingDate,
    meetingLocation,
    reviewUrl,
    messageUrl,
    appUrl: `https://${appUrl}`,
  });

  const text = `How was your playdate? - ShareSkippy

Hey ${userName}!

We hope you had a great time meeting ${otherUserName} at your recent pup playdate. Please take some time to review ${otherUserName}.

Playdate Details:
- With: ${otherUserName} & ${otherUserDogName}
- Date: ${meetingDate}
- Location: ${meetingLocation}

Leave a review: ${reviewUrl}
Message ${otherUserName}: ${messageUrl}

Your feedback helps our community grow! Reviews help other dog owners make informed decisions about potential playmates and build a safer, more connected community.

Happy tails and wagging adventures,
The ShareSkippy Team 🐕`;

  return await sendEmail({
    to,
    subject: `How was your playdate with ${otherUserName}? 🐕`,
    html,
    text,
  });
}

// Export all email functions
export const emailTemplates = {
  sendWelcomeEmail,
  sendNewMessageNotification,
  sendMeetingScheduledConfirmation,
  sendMeetingReminder,
  sendFollowUp3DaysEmail,
  sendFollowUpEmail,
  sendReviewEmail,
};
