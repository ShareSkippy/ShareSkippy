import { sendMeetingReminder } from '@/libs/emailTemplates';
import { createClient } from '@/libs/supabase/server';

export async function POST(request) {
  try {
    const { meetingId, userId } = await request.json();

    if (!meetingId || !userId) {
      return Response.json({ 
        error: 'Meeting ID and user ID are required' 
      }, { status: 400 });
    }

    const supabase = createClient();

    // Get meeting details with user and dog information
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        *,
        requester:profiles!meetings_requester_id_fkey(first_name, last_name, email),
        requester_dog:dogs!meetings_requester_dog_id_fkey(name),
        recipient:profiles!meetings_recipient_id_fkey(first_name, last_name, email),
        recipient_dog:dogs!meetings_recipient_dog_id_fkey(name)
      `)
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return Response.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Determine which user is receiving the email
    const isRequester = meeting.requester_id === userId;
    const user = isRequester ? meeting.requester : meeting.recipient;
    const otherUser = isRequester ? meeting.recipient : meeting.requester;
    const userDog = isRequester ? meeting.requester_dog : meeting.recipient_dog;
    const otherUserDog = isRequester ? meeting.recipient_dog : meeting.requester_dog;

    // Check if user has email notifications enabled
    const { data: settings } = await supabase
      .from('user_settings')
      .select('email_notifications')
      .eq('user_id', userId)
      .single();

    if (settings && !settings.email_notifications) {
      return Response.json({ 
        success: true, 
        message: 'Email notifications disabled for user' 
      });
    }

    // Send meeting reminder
    await sendMeetingReminder({
      to: user.email,
      userName: user.first_name || 'there',
      userDogName: userDog?.name || 'your dog',
      otherUserName: `${otherUser.first_name} ${otherUser.last_name}`.trim(),
      otherUserDogName: otherUserDog?.name || 'their dog',
      meetingDate: new Date(meeting.scheduled_date).toLocaleDateString(),
      meetingTime: new Date(meeting.scheduled_date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      meetingLocation: meeting.location,
      meetingNotes: meeting.notes || '',
      meetingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/meetings/${meetingId}`,
      messageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/messages`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://shareskippy.com'}/profile`,
    });

    return Response.json({ 
      success: true, 
      message: 'Meeting reminder sent successfully' 
    });

  } catch (error) {
    console.error('Error sending meeting reminder:', error);
    return Response.json(
      { error: 'Failed to send meeting reminder' }, 
      { status: 500 }
    );
  }
}

