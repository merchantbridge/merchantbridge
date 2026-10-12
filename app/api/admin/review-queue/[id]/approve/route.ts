import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is a team member
  const { data: teamMember } = await supabase
    .from('marketplace_team_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!teamMember) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('marketplace_merchant_profiles')
    .update({
      profile_status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      review_feedback: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('marketplace_activity_log').insert({
    actor_id: user.id,
    actor_type: 'team_member',
    action_type: 'profile_approved',
    action_details: { merchant_id: id },
    target_type: 'merchant_profile',
    target_id: id,
  });

  // Create notification for merchant
  const { data: profile } = await supabase
    .from('marketplace_merchant_profiles')
    .select('id')
    .eq('id', id)
    .single();

  if (profile) {
    await supabase.from('marketplace_notifications').insert({
      merchant_id: profile.id,
      notification_type: 'profile_approved',
      title: 'Profile Approved',
      message: 'Great news! Your profile has been approved and you now have access to the Merchant Bridge marketplace.',
      action_url: '/merchant/opportunities',
    });
  }

  revalidatePath('/admin/review-queue');
  revalidatePath('/admin/merchants');
  revalidatePath('/admin/marketplace-dashboard');

  return Response.json({ success: true });
}
