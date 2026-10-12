import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const body = await request.json();
  const { feedback } = body;

  if (!feedback) {
    return Response.json({ error: 'Feedback is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('marketplace_merchant_profiles')
    .update({
      profile_status: 'resubmit_requested',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      review_feedback: feedback,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('marketplace_activity_log').insert({
    actor_id: user.id,
    actor_type: 'team_member',
    action_type: 'resubmit_requested',
    action_details: { merchant_id: params.id, feedback },
    target_type: 'merchant_profile',
    target_id: params.id,
  });

  // Create notification for merchant
  const { data: profile } = await supabase
    .from('marketplace_merchant_profiles')
    .select('id')
    .eq('id', params.id)
    .single();

  if (profile) {
    await supabase.from('marketplace_notifications').insert({
      merchant_id: profile.id,
      notification_type: 'resubmit_requested',
      title: 'Update needed for your Merchant Bridge profile',
      message: `Thanks for your interest in Merchant Bridge! We've reviewed your profile and have a few suggestions before we can approve it:\n\n${feedback}\n\nPlease update your profile and resubmit. We'll review it within 48 hours.`,
      action_url: '/merchant/profile',
    });
  }

  revalidatePath('/admin/review-queue');
  revalidatePath('/admin/merchants');
  revalidatePath('/admin/marketplace-dashboard');

  return Response.json({ success: true });
}
