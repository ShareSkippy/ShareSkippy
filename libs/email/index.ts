// Centralized email system exports
export {
  sendEmail,
  scheduleEmail,
  recordUserActivity,
  getUserLastActivity,
  shouldSendReengageEmail,
} from './sendEmail';
export {
  processScheduledEmails,
  scheduleMeetingReminder,
  scheduleNurtureEmail,
  getUserScheduledEmails,
  cancelUserScheduledEmails,
} from './scheduler';
export { processReengageEmails, getReengageCandidates, scheduleReengageEmails } from './reengage';
export { loadEmailTemplate, getAvailableEmailTypes, isValidEmailType } from './templates';

// Re-export types
export type { EmailPayload, SendEmailParams, EmailEvent } from './sendEmail';
export type { ScheduledEmail } from './scheduler';
export type { ReengageResult } from './reengage';
export type { EmailTemplate, TemplateVariables } from './templates';
