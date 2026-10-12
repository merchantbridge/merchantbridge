-- Core Marketplace Tables for Merchant Bridge Platform

-- Merchant Profiles Table (enhances existing merchant_profiles)
CREATE TABLE IF NOT EXISTS marketplace_merchant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  product_category TEXT NOT NULL CHECK (product_category IN ('Skincare', 'Apparel', 'Jewelry', 'Candles', 'Home goods', 'Food and beverage', 'Pet products', 'Other')),
  business_description TEXT CHECK (LENGTH(business_description) <= 1500),
  target_market TEXT,
  
  -- Capacity
  average_order_value TEXT,
  monthly_order_volume TEXT,
  can_custom_branding BOOLEAN DEFAULT false,
  
  -- Shipping
  shipping_markets TEXT[] DEFAULT '{}',
  
  -- Revenue
  monthly_revenue_range TEXT CHECK (monthly_revenue_range IN ('Under $1k', '1k-5k', '5k-10k', '10k-50k', '$50k+')),
  
  -- Sales Channels
  sales_channels TEXT[] DEFAULT '{}',
  
  -- Store Connection
  store_type TEXT CHECK (store_type IN ('shopify', 'manual', 'etsy', 'woocommerce', 'other')),
  store_url TEXT,
  shopify_store_id TEXT,
  shopify_shop_domain TEXT,
  
  -- Status
  profile_status TEXT DEFAULT 'pending' CHECK (profile_status IN ('pending', 'approved', 'resubmit_requested', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_feedback TEXT,
  
  -- Profile Completion
  profile_completion_percentage INTEGER DEFAULT 0,
  
  -- Supplier Document
  supplier_document_id UUID,
  supplier_document_status TEXT DEFAULT 'not_uploaded' CHECK (supplier_document_status IN ('not_uploaded', 'under_preparation', 'uploaded', 'approved')),
  
  -- Specialist
  specialist_status TEXT DEFAULT 'not_contacted' CHECK (specialist_status IN ('not_contacted', 'in_conversation', 'service_agreed', 'completed')),
  specialist_assigned_to UUID REFERENCES auth.users(id),
  
  -- Metrics
  opportunities_matched INTEGER DEFAULT 0,
  applications_submitted INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Opportunities Table
CREATE TABLE IF NOT EXISTS marketplace_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Corporate Gifting', 'Wholesale', 'Brand Partnership', 'UGC Campaign', 'Retail Listing', 'Product Sourcing')),
  short_description TEXT NOT NULL,
  key_requirements TEXT[] DEFAULT '{}',
  
  -- Source
  source_url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('LinkedIn', 'Industry publication', 'Platform outreach', 'Direct brand contact', 'Other')),
  
  -- Matching Criteria
  matching_categories TEXT[] DEFAULT '{}',
  matching_capacity_ranges TEXT[] DEFAULT '{}',
  matching_shipping_markets TEXT[] DEFAULT '{}',
  require_custom_branding BOOLEAN DEFAULT false,
  
  -- Timing
  expiry_date TIMESTAMP WITH TIME ZONE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'expiring_soon', 'archived')),
  priority_level TEXT DEFAULT 'standard' CHECK (priority_level IN ('standard', 'featured')),
  
  -- Metrics
  merchants_shown INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES marketplace_merchant_profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES marketplace_opportunities(id) ON DELETE CASCADE,
  
  -- Status
  application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'in_conversation', 'deal_closed', 'not_successful')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  
  -- Testimonial
  testimonial_submitted BOOLEAN DEFAULT false,
  testimonial_text TEXT,
  testimonial_status TEXT DEFAULT 'pending' CHECK (testimonial_status IN ('pending', 'approved', 'rejected')),
  
  UNIQUE(merchant_id, opportunity_id)
);

-- Saved Opportunities Table
CREATE TABLE IF NOT EXISTS marketplace_saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES marketplace_merchant_profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES marketplace_opportunities(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(merchant_id, opportunity_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS marketplace_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES marketplace_merchant_profiles(id) ON DELETE CASCADE,
  
  -- Content
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_opportunity', 'profile_status_update', 'message_from_specialist', 'opportunity_expiring', 'application_reminder', 'profile_approved', 'resubmit_requested', 'deal_closed', 'weekly_digest')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Link
  action_url TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Email
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internal Notes Table
CREATE TABLE IF NOT EXISTS marketplace_internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES marketplace_merchant_profiles(id) ON DELETE CASCADE,
  
  -- Content
  note TEXT NOT NULL,
  
  -- Author
  created_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS marketplace_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT CHECK (actor_type IN ('merchant', 'team_member', 'system')),
  
  -- Action
  action_type TEXT NOT NULL,
  action_details JSONB,
  
  -- Target
  target_type TEXT,
  target_id UUID,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case Studies & Testimonials Table
CREATE TABLE IF NOT EXISTS marketplace_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES marketplace_merchant_profiles(id) ON DELETE CASCADE,
  
  -- Content
  merchant_display_name TEXT NOT NULL,
  service_or_opportunity TEXT NOT NULL,
  testimonial_text TEXT NOT NULL,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  
  -- Case Study Extension
  is_case_study BOOLEAN DEFAULT false,
  situation_before TEXT,
  opportunities_found TEXT,
  services_used TEXT,
  specific_result TEXT,
  before_after_visuals TEXT[],
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'featured', 'archived')),
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  featured_at TIMESTAMP WITH TIME ZONE
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS marketplace_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Role
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'specialist')),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Platform Settings Table
CREATE TABLE IF NOT EXISTS marketplace_platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Setting
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  
  -- Metadata
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS marketplace_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template
  template_key TEXT NOT NULL UNIQUE,
  trigger_condition TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  updated_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upsell Pipeline Table
CREATE TABLE IF NOT EXISTS marketplace_upsell_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES marketplace_merchant_profiles(id) ON DELETE CASCADE,
  
  -- Pipeline Info
  stage TEXT NOT NULL CHECK (stage IN ('identified', 'contacted', 'in_conversation', 'proposal_sent', 'service_agreed', 'completed', 'lost')),
  service_type TEXT,
  potential_value TEXT,
  
  -- Specialist
  specialist_id UUID REFERENCES auth.users(id),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_status ON marketplace_merchant_profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_category ON marketplace_merchant_profiles(product_category);
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_specialist ON marketplace_merchant_profiles(specialist_assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON marketplace_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON marketplace_opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_expiry ON marketplace_opportunities(expiry_date);
CREATE INDEX IF NOT EXISTS idx_applications_merchant ON marketplace_applications(merchant_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON marketplace_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON marketplace_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_notifications_merchant ON marketplace_notifications(merchant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON marketplace_notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_log_target ON marketplace_activity_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON marketplace_activity_log(created_at);

-- RLS Policies
ALTER TABLE marketplace_merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_upsell_pipeline ENABLE ROW LEVEL SECURITY;

-- RLS for merchant_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON marketplace_merchant_profiles;
DROP POLICY IF EXISTS "Team can view all profiles" ON marketplace_merchant_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON marketplace_merchant_profiles;
DROP POLICY IF EXISTS "Team can update all profiles" ON marketplace_merchant_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON marketplace_merchant_profiles;
DROP POLICY IF EXISTS "Team can manage opportunities" ON marketplace_opportunities;
DROP POLICY IF EXISTS "Merchants can view live opportunities" ON marketplace_opportunities;
DROP POLICY IF EXISTS "Users can view own applications" ON marketplace_applications;
DROP POLICY IF EXISTS "Team can view all applications" ON marketplace_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON marketplace_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON marketplace_applications;
DROP POLICY IF EXISTS "Users can view own notifications" ON marketplace_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON marketplace_notifications;
DROP POLICY IF EXISTS "Team can manage internal notes" ON marketplace_internal_notes;
DROP POLICY IF EXISTS "Users can view approved testimonials" ON marketplace_testimonials;
DROP POLICY IF EXISTS "Team can manage testimonials" ON marketplace_testimonials;
DROP POLICY IF EXISTS "Admins can manage team members" ON marketplace_team_members;
DROP POLICY IF EXISTS "Team can view team members" ON marketplace_team_members;
DROP POLICY IF EXISTS "Team can manage upsell pipeline" ON marketplace_upsell_pipeline;

CREATE POLICY "Users can view own profile" ON marketplace_merchant_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team can view all profiles" ON marketplace_merchant_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update own profile" ON marketplace_merchant_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Team can update all profiles" ON marketplace_merchant_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own profile" ON marketplace_merchant_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for opportunities
CREATE POLICY "Team can manage opportunities" ON marketplace_opportunities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Merchants can view live opportunities" ON marketplace_opportunities
  FOR SELECT USING (
    status = 'live' AND
    EXISTS (
      SELECT 1 FROM marketplace_merchant_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- RLS for applications
CREATE POLICY "Users can view own applications" ON marketplace_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_merchant_profiles 
      WHERE id = merchant_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team can view all applications" ON marketplace_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can insert own applications" ON marketplace_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_merchant_profiles 
      WHERE id = merchant_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own applications" ON marketplace_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM marketplace_merchant_profiles 
      WHERE id = merchant_id AND user_id = auth.uid()
    )
  );

-- RLS for notifications
CREATE POLICY "Users can view own notifications" ON marketplace_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_merchant_profiles 
      WHERE id = merchant_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications" ON marketplace_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM marketplace_merchant_profiles 
      WHERE id = merchant_id AND user_id = auth.uid()
    )
  );

-- RLS for internal notes
CREATE POLICY "Team can manage internal notes" ON marketplace_internal_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS for testimonials
CREATE POLICY "Users can view approved testimonials" ON marketplace_testimonials
  FOR SELECT USING (status IN ('approved', 'featured'));

CREATE POLICY "Team can manage testimonials" ON marketplace_testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS for team members
CREATE POLICY "Admins can manage team members" ON marketplace_team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

CREATE POLICY "Team can view team members" ON marketplace_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- RLS for upsell pipeline
CREATE POLICY "Team can manage upsell pipeline" ON marketplace_upsell_pipeline
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM marketplace_team_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insert default platform settings
INSERT INTO marketplace_platform_settings (setting_key, setting_value, description) VALUES
  ('weekly_opportunity_target', '"50"'::jsonb, 'Target number of opportunities to add per week'),
  ('weekly_digest_day', '"1"'::jsonb, 'Day of week for weekly digest (0=Sunday, 1=Monday)'),
  ('weekly_digest_time', '"09:00"'::jsonb, 'Time for weekly digest (24h format)'),
  ('opportunity_archive_days', '"30"'::jsonb, 'Days before opportunities are auto-archived'),
  ('application_reminder_days', '"14"'::jsonb, 'Days before application status reminder')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default email templates
INSERT INTO marketplace_email_templates (template_key, trigger_condition, subject, body) VALUES
  ('profile_approved', 'merchant profile status changed to approved', 'Welcome to Merchant Bridge', 'Hi {{merchant_name}},

Great news! Your profile has been approved and you now have access to the Merchant Bridge marketplace.

Here''s what you can do next:
- Browse opportunities matched to your profile
- Start applying for opportunities
- Update your profile as needed

If you have any questions, just reply to this email.

Welcome aboard!
The Merchant Bridge Team'),
  ('resubmit_requested', 'merchant profile status changed to resubmit_requested', 'Update needed for your Merchant Bridge profile', 'Hi {{merchant_name}},

Thanks for your interest in Merchant Bridge! We''ve reviewed your profile and have a few suggestions before we can approve it:

{{feedback}}

Please update your profile and resubmit. We''ll review it within 48 hours.

Best,
The Merchant Bridge Team'),
  ('profile_rejected', 'merchant profile status changed to rejected', 'Regarding your Merchant Bridge application', 'Hi {{merchant_name}},

Thank you for your interest in Merchant Bridge. After reviewing your profile, we''ve decided not to move forward at this time.

{{reason}}

We appreciate your interest and wish you the best.
The Merchant Bridge Team'),
  ('new_opportunity', 'new opportunity matched to merchant profile', 'New opportunity on Merchant Bridge', 'Hi {{merchant_name}},

A new opportunity matching your profile is now available on Merchant Bridge:

{{opportunity_title}}
{{opportunity_description}}

Log in to view and apply.

The Merchant Bridge Team'),
  ('opportunity_expiring', 'opportunity expiring in 48 hours', 'Opportunity expiring soon', 'Hi {{merchant_name}},

Just a heads up: {{opportunity_title}} is expiring in 48 hours. If you''re interested, make sure to apply soon!

The Merchant Bridge Team'),
  ('deal_closed', 'merchant marked application as deal_closed', 'Congratulations on your deal!', 'Hi {{merchant_name}},

Congratulations on closing a deal through Merchant Bridge! We''re thrilled to see you succeed.

Would you be willing to share a brief testimonial about your experience? It helps other merchants understand the value of the platform.

Reply to this email with your testimonial if you''d like to share.

Congratulations again!
The Merchant Bridge Team'),
  ('weekly_digest', 'scheduled weekly digest', 'This week''s opportunities on Merchant Bridge', 'Hi {{merchant_name}},

Here are the new opportunities matching your profile this week:

{{opportunities}}

Log in to view and apply.

The Merchant Bridge Team')
ON CONFLICT (template_key) DO NOTHING;
