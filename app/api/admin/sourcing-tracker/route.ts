import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

  // Get weekly opportunities
  const [{ count: weeklyOpportunities }] = await Promise.all([
    supabase.from('marketplace_opportunities').select('*', { count: 'exact', head: true })
      .gte('added_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Get historical data (last 8 weeks)
  const historicalData = [];
  for (let i = 0; i < 8; i++) {
    const startDate = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    
    const [{ count: count }] = await Promise.all([
      supabase.from('marketplace_opportunities').select('*', { count: 'exact', head: true })
        .gte('added_at', startDate.toISOString())
        .lt('added_at', endDate.toISOString()),
    ]);

    historicalData.push({
      week: i + 1,
      count: count || 0,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
    });
  }

  // Get breakdown by type
  const { data: typeBreakdown } = await supabase
    .from('marketplace_opportunities')
    .select('opportunity_type')
    .gte('added_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const typeCounts = typeBreakdown?.reduce((acc: any, opp: any) => {
    acc[opp.opportunity_type] = (acc[opp.opportunity_type] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get breakdown by source
  const { data: sourceBreakdown } = await supabase
    .from('marketplace_opportunities')
    .select('source_type')
    .gte('added_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const sourceCounts = sourceBreakdown?.reduce((acc: any, opp: any) => {
    acc[opp.source_type] = (acc[opp.source_type] || 0) + 1;
    return acc;
  }, {}) || {};

  return Response.json({
    weeklyOpportunities: weeklyOpportunities || 0,
    historicalData,
    typeBreakdown: typeCounts,
    sourceBreakdown: sourceCounts,
  });
}
