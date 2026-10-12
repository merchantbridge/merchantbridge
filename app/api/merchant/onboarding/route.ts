import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendMerchantNotificationEmail } from '@/lib/email/merchant-notifications';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if merchant already has a trade deck
    const { data: existingMerchant } = await supabase
      .from('merchant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: existingDocs } = existingMerchant
      ? await supabase
          .from('documents')
          .select('id')
          .eq('merchant_id', existingMerchant.id)
          .eq('file_type', 'pdf')
          .eq('is_visible_to_merchant', true)
          .limit(1)
      : { data: null };

    const hasTradeDeck = Boolean(existingDocs && existingDocs.length > 0);

    // Calculate profile completion percentage — trade deck is required for 100%
    const requiredFields = [
      body.fullName,
      body.businessName,
      body.productCategory,
      body.businessDescription,
      body.storeUrl,
      hasTradeDeck,
    ];

    const completedFields = requiredFields.filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

    // Insert merchant profile
    const { data: profile, error: profileError } = await supabase
      .from('marketplace_merchant_profiles')
      .insert({
        user_id: user.id,
        full_name: body.fullName,
        business_name: body.businessName,
        product_category: body.productCategory,
        business_description: body.businessDescription,
        target_market: body.targetMarket,
        average_order_value: body.averageOrderValue,
        monthly_order_volume: body.monthlyOrderVolume,
        can_custom_branding: body.canCustomBranding,
        shipping_markets: body.shippingMarkets,
        monthly_revenue_range: body.monthlyRevenueRange,
        sales_channels: body.salesChannels,
        store_type: body.storeType,
        store_url: body.storeUrl,
        profile_status: 'pending',
        profile_completion_percentage: completionPercentage,
        has_trade_deck: hasTradeDeck,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Log activity
    await supabase.from('marketplace_activity_log').insert({
      actor_id: user.id,
      actor_type: 'merchant',
      action_type: 'profile_submitted',
      action_details: {
        merchant_id: profile.id,
        business_name: body.businessName,
        category: body.productCategory,
      },
      target_type: 'merchant_profile',
      target_id: profile.id,
    });

    await supabase.from('marketplace_notifications').insert({
      merchant_id: profile.id,
      notification_type: 'profile_status_update',
      title: 'New merchant profile submitted',
      message: `${body.businessName} has submitted a profile for review.`,
      action_url: `/admin/merchants/${profile.id}`,
    });

    try {
      await sendMerchantNotificationEmail(
        user.email || '',
        body.fullName,
        'profile_resubmit',
        { feedback: 'Your application has been received and is pending review. We\'ll notify you within 48 hours.' }
      );
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    return NextResponse.json({ success: true, profileId: profile.id });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
