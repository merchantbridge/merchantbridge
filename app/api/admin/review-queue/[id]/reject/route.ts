import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
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

  const contentType = request.headers.get('content-type');
  let reason = '';

  if (contentType?.includes('application/json')) {
    const body = await request.json();
    reason = body.reason;
  } else if (contentType?.includes('multipart/form-data') || contentType?.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    reason = formData.get('reason') as string;
  }

  if (!reason) {
    return Response.json({ error: 'Reason is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('marketplace_merchant_profiles')
    .update({
      profile_status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      review_feedback: reason,
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
    action_type: 'profile_rejected',
    action_details: { merchant_id: params.id, reason },
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
      notification_type: 'profile_rejected',
      title: 'Regarding your Merchant Bridge application',
      message: `Thank you for your interest in Merchant Bridge. After reviewing your profile, we've decided not to move forward at this time.\n\n${reason}`,
    });
  }

  revalidatePath('/admin/review-queue');
  revalidatePath('/admin/merchants');
  revalidatePath('/admin/marketplace-dashboard');

  return Response.json({ success: true });
}
