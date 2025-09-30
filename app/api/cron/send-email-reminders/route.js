import { createServiceClient } from '@/libs/supabase/server';
import { sendMeetingReminder } from '@/libs/emailTemplates';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get meetings scheduled for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select(`
        *,
        requester:profiles!meetings_requester_id_fkey(first_name, last_name, email),
        requester_dog:dogs!meetings_requester_dog_id_fkey(name),
        recipient:profiles!meetings_recipient_id_fkey(first_name, last_name, email),
        recipient_dog:dogs!meetings_recipient_dog_id_fkey(name)
      `)
      .eq('status', 'confirmed')
      .gte('scheduled_date', tomorrow.toISOString())
      .lt('scheduled_date', dayAfter.toISOString());

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return Response.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }

    let emailsSent = 0;
    const errors = [];

    // Send reminder emails to both participants
    for (const meeting of meetings || []) {
      try {
        // Send to requester
        await sendMeetingReminder({
          to: meeting.requester.email,
          userName: meeting.requester.first_name || 'there',
          userDogName: meeting.requester_dog?.name || 'your dog',
          otherUserName: `${meeting.recipient.first_name} ${meeting.recipient.last_name}`.trim(),
          otherUserDogName: meeting.recipient_dog?.name || 'their dog',
          meetingDate: new Date(meeting.scheduled_date).toLocaleDateString(),
          meetingTime: new Date(meeting.scheduled_date).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          meetingLocation: meeting.location,
          meetingNotes: meeting.notes || '',
          meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/meetings/${meeting.id}`,
          messageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/messages`,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/profile`,
        });

        // Send to recipient
        await sendMeetingReminder({
          to: meeting.recipient.email,
          userName: meeting.recipient.first_name || 'there',
          userDogName: meeting.recipient_dog?.name || 'your dog',
          otherUserName: `${meeting.requester.first_name} ${meeting.requester.last_name}`.trim(),
          otherUserDogName: meeting.requester_dog?.name || 'their dog',
          meetingDate: new Date(meeting.scheduled_date).toLocaleDateString(),
          meetingTime: new Date(meeting.scheduled_date).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          meetingLocation: meeting.location,
          meetingNotes: meeting.notes || '',
          meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/meetings/${meeting.id}`,
          messageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/messages`,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/profile`,
        });

        emailsSent += 2;

        // Mark that reminder was sent
        await supabase
          .from('meetings')
          .update({ reminder_sent: true })
          .eq('id', meeting.id);

      } catch (error) {
        console.error(`Error sending reminder for meeting ${meeting.id}:`, error);
        errors.push({
          meetingId: meeting.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Meeting reminders processed`,
      emailsSent,
      meetingsProcessed: meetings?.length || 0,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in meeting reminders cron job:', error);
    return Response.json(
      { error: 'Failed to process meeting reminders' }, 
      { status: 500 }
    );
  }
}

