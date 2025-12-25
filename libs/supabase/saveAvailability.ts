'use server';

import { createClient } from '@/libs/supabase/server';

export async function saveAvailability(
  slots: { day: string; start_time: string; end_time: string }[]
) {
  const supabase = await createClient('anon');
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated!!');

  const { error: delete_error } = await supabase
    .from('availability')
    .delete()
    .eq('owner_id', user.id);

  if (delete_error) throw delete_error;

  const update_data = slots.map((slot) => ({
    owner_id: user.id,
    start_time: slot.start_time,
    end_time: slot.end_time,
    flexibility: 'moderate',
  }));

  const { error: update_error } = await supabase.from('availability').insert(update_data);

  if (update_error) throw update_error;
}
