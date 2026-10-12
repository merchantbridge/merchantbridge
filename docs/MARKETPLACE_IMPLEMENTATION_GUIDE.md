# Merchant Bridge Marketplace Platform - Implementation Guide

## ✅ Completed Features

### 1. Database Schema
**File:** `supabase/migrations/20261011120000_marketplace_core_tables.sql`

Tables created:
- `marketplace_merchant_profiles` - Merchant profiles with all required fields
- `marketplace_opportunities` - Opportunity listings with matching criteria
- `marketplace_applications` - Application tracking
- `marketplace_saved_opportunities` - Saved opportunities for later review
- `marketplace_notifications` - In-app and email notifications
- `marketplace_internal_notes` - Team-only notes on merchants
- `marketplace_activity_log` - Platform activity tracking
- `marketplace_testimonials` - Testimonials and case studies
- `marketplace_team_members` - Team access control
- `marketplace_platform_settings` - Configurable platform settings
- `marketplace_email_templates` - Editable email templates
- `marketplace_upsell_pipeline` - Specialist pipeline tracking

**To apply the schema:**
```bash
# You'll need to link your Supabase project first
npx supabase link
npx supabase db push
```

### 2. Merchant Onboarding Flow
**File:** `app/merchant/onboarding/page.tsx`

7-step manual onboarding form:
- Step 1: Basic info (name, business, category, description)
- Step 2: Capacity (AOV, order volume, custom branding)
- Step 3: Shipping markets (multi-select)
- Step 4: Revenue range
- Step 5: Sales channels (multi-select)
- Step 6: Store URL
- Step 7: Optional supplier document upload

**API Route:** `app/api/merchant/onboarding/route.ts`
- Validates user authentication
- Calculates profile completion percentage
- Inserts merchant profile
- Logs activity
- Notifies internal team

**Success Page:** `app/merchant/onboarding/success/page.tsx`
- Warm confirmation message
- 48-hour review timeline mentioned

### 3. Merchant Dashboard
**File:** `app/merchant/dashboard/page.tsx`

Four main areas:
1. **Opportunity Feed Preview** - Shows 3 most recent matched opportunities
2. **Profile Completion Indicator** - Progress bar with clickable incomplete sections
3. **Application Tracker** - List of recent applications with status
4. **Notifications** - Unread notifications preview

Status-specific screens:
- Pending profile: Holding screen with submission date
- Resubmit requested: Feedback display with update link
- Rejected: Reason display

### 4. Opportunity Feed
**File:** `app/merchant/opportunities/page.tsx`

Features:
- Displays all matched opportunities
- Save functionality (toggle)
- "I Applied" button (one-time)
- External link to opportunity source
- Key requirements display
- Empty state with friendly message

## 🔄 Remaining Features Implementation

### Priority 1: Core Merchant Features

#### 5. Merchant Profile Page
**File to create:** `app/merchant/profile/page.tsx`

Required functionality:
```typescript
// Display profile in readable format (not raw form)
// Every field editable
// Changes go live immediately
// Key field changes trigger team notification
// Supplier document section with upload/download
```

API route needed: `app/api/merchant/profile/route.ts`
- GET: Fetch current profile
- PUT: Update profile fields
- POST: Upload supplier document

#### 6. Application Tracker
**File to create:** `app/merchant/applications/page.tsx`

Required functionality:
```typescript
// Table/list view of all applications
// Columns: Opportunity name, type, date applied, status, notes
// Status dropdown: Applied, In conversation, Deal closed, Not successful
// Notes field for context
// "Deal closed" triggers testimonial modal
```

API route needed: `app/api/merchant/applications/[id]/route.ts`
- PUT: Update application status and notes
- POST: Submit testimonial

#### 7. Notifications Page
**File to create:** `app/merchant/notifications/page.tsx`

Required functionality:
```typescript
// List of all notifications
// Mark as read functionality
// Filter by type
// Delete/archived functionality
```

API route needed: `app/api/merchant/notifications/[id]/route.ts`
- PUT: Mark as read/unread
- DELETE: Remove notification

### Priority 2: Internal Team Features

#### 8. Team Dashboard
**File to create:** `app/admin/dashboard/page.tsx`

Five main areas:
1. **Platform Overview Stats**
   - Total merchants
   - New signups this week
   - Profiles pending review
   - Opportunities live
   - Applications submitted
   - Deals closed

2. **Action Items**
   - Profiles waiting for review (with wait time)
   - Merchants with resubmissions
   - Opportunities expiring in 48h
   - Merchants inactive for 14 days

3. **Recent Activity Feed**
   - New signups
   - Profile submissions
   - Applications
   - Deals closed
   - Testimonials

4. **Weekly Opportunity Target**
   - Progress toward 50/week target
   - Visual indicator if behind

5. **Upsell Pipeline**
   - Active conversations
   - Stage tracking
   - Potential value

#### 9. Merchant Management
**File to create:** `app/admin/merchants/page.tsx`

Table columns:
- Merchant name & store name
- Category
- Signup date
- Profile status
- Last login
- Opportunities matched
- Applications submitted
- Deals closed
- Specialist status
- Actions (View, Message, Change Status, Flag for Upsell)

Merchant detail view: `app/admin/merchants/[id]/page.tsx`
- Full profile display
- Shopify data if connected
- Supplier document
- Application history
- Notification history
- Internal notes
- Conversation history
- Actions: Approve, Request Resubmission, Reject, Add Note, Flag for Upsell, Manual Match, Send Message

API routes needed:
- `app/api/admin/merchants/route.ts` - List, search, filter
- `app/api/admin/merchants/[id]/route.ts` - Get, update, delete
- `app/api/admin/merchants/[id]/status/route.ts` - Change status with feedback
- `app/api/admin/merchants/[id]/notes/route.ts` - Internal notes

#### 10. Opportunity Management
**File to create:** `app/admin/opportunities/page.tsx`

Table columns:
- Title
- Type
- Date added
- Source
- Expiry date
- Status
- Merchants matched
- Applications
- Actions (Edit, Archive, Boost)

Add/Edit form fields:
- Title
- Type (dropdown)
- Short description
- Key requirements (array)
- Source URL
- Matching criteria (categories, capacity, shipping, custom branding)
- Expiry date
- Priority level (Standard/Featured)

API routes needed:
- `app/api/admin/opportunities/route.ts` - List, create
- `app/api/admin/opportunities/[id]/route.ts` - Get, update, delete
- `app/api/admin/opportunities/[id]/archive/route.ts` - Archive
- `app/api/admin/opportunities/[id]/boost/route.ts` - Push notification to matched merchants

#### 11. Profile Review Queue
**File to create:** `app/admin/review-queue/page.tsx`

Queue showing pending profiles (oldest first):
- Merchant name & store name
- Category
- Time waiting
- Quick profile preview
- Actions: Approve, Request Resubmission, Reject

API route needed: `app/api/admin/review-queue/[id]/route.ts`
- POST: Approve (triggers email)
- POST: Request resubmission (with feedback, triggers email)
- POST: Reject (with reason, triggers email)

#### 12. Upsell Pipeline
**File to create:** `app/admin/upsell-pipeline/page.tsx`

Pipeline view with stages:
- Identified
- Contacted
- In conversation
- Proposal sent
- Service agreed
- Completed
- Lost

Each entry shows:
- Merchant
- Stage
- Service type
- Potential value
- Specialist
- Notes

API route needed: `app/api/admin/upsell-pipeline/[id]/route.ts`
- PUT: Update stage, notes, specialist

#### 13. Opportunity Sourcing Tracker
**File to create:** `app/admin/sourcing-tracker/page.tsx`

Weekly tracker showing:
- Opportunities added this week vs 50 target
- Breakdown by type
- Source breakdown
- Historical view
- Optional leaderboard

API route needed: `app/api/admin/sourcing-tracker/route.ts`
- GET: Weekly stats
- GET: Historical data

#### 14. Case Study & Testimonial Library
**File to create:** `app/admin/testimonials/page.tsx`

Library showing:
- Merchant display name (first name + last initial)
- Store category
- Service/opportunity
- Testimonial text
- Star rating
- Status (Pending, Approved, Featured, Archived)
- Date submitted

Actions:
- Approve for use
- Feature
- Request expansion (case study)
- Archive

Case study extended fields:
- Situation before
- Opportunities found
- Services used
- Specific result
- Before/after visuals

API routes needed:
- `app/api/admin/testimonials/route.ts` - List
- `app/api/admin/testimonials/[id]/route.ts` - Update status, request expansion

#### 15. Team Settings & Access Control
**File to create:** `app/admin/settings/page.tsx`

Three sections:

**Team Members:**
- Name, email, role, last login
- Actions: Edit role, deactivate

**Email Templates:**
- Template key
- Trigger condition
- Subject
- Body (editable)
- Active toggle

**Platform Settings:**
- Matching rules (toggles)
- Notification settings
- Weekly digest settings

API routes needed:
- `app/api/admin/team-members/route.ts` - List, create
- `app/api/admin/team-members/[id]/route.ts` - Update, deactivate
- `app/api/admin/email-templates/[key]/route.ts` - Get, update
- `app/api/admin/settings/route.ts` - Get, update

### Priority 3: Shopify OAuth Integration

#### 16. Shopify OAuth
**Files to create:**
- `app/api/shopify/connect/route.ts` - Initiate OAuth
- `app/api/shopify/callback/route.ts` - Handle OAuth callback
- `app/merchant/onboarding/shopify/page.tsx` - Shopify onboarding flow

Required Shopify Partner API integration:
- Get store name, URL
- Pull product catalogue
- Get order history
- Get revenue data
- Automatically populate profile fields

### Priority 4: Email Notification System

#### 17. Email Triggers
**File to create:** `lib/email/marketplace-notifications.ts`

Email types to implement:
- Profile approved
- Resubmit requested (with feedback)
- Profile rejected (with reason)
- New opportunity matched
- Opportunity expiring (48h warning)
- Deal closed congratulations
- Weekly digest (Monday morning)

Use existing `lib/email/provider.ts` for sending emails.

### Priority 5: Automation

#### 18. Cron Jobs
**Files to create:**
- `app/api/cron/archive-opportunities/route.ts` - Daily auto-archive expired opportunities
- `app/api/cron/weekly-digest/route.ts` - Monday morning weekly digest
- `app/api/cron/application-reminders/route.ts` - 14-day application status reminders
- `app/api/cron/inactivity-reminders/route.ts` - 14-day inactivity warnings

## 📋 Implementation Checklist

### Phase 1: Core Merchant Experience (Current)
- [x] Database schema
- [x] Manual onboarding form
- [x] Onboarding API
- [x] Success page
- [x] Merchant dashboard
- [x] Opportunity feed
- [ ] Merchant profile page
- [ ] Application tracker
- [ ] Notifications page

### Phase 2: Internal Team Dashboard
- [ ] Team dashboard
- [ ] Merchant management
- [ ] Opportunity management
- [ ] Profile review queue
- [ ] Upsell pipeline

### Phase 3: Advanced Features
- [ ] Opportunity sourcing tracker
- [ ] Testimonial library
- [ ] Team settings
- [ ] Shopify OAuth
- [ ] Email notification system
- [ ] Cron jobs/automation

## 🔧 Next Steps

1. **Apply the database schema:**
   The database schema is in `supabase/migrations/20261011120000_marketplace_core_tables.sql`
   
   To apply it, you have two options:
   
   **Option A: Via Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of the migration file
   - Run the SQL to create all tables
   
   **Option B: Via Supabase CLI (if linked)**
   ```bash
   npx supabase link
   npx supabase db push
   ```

2. **Test the onboarding flow:**
   - Visit `/merchant/onboarding`
   - Complete all 7 steps
   - Verify profile creation in Supabase

3. **Build the merchant profile page** (Priority 1)
4. **Build the application tracker** (Priority 1)
5. **Build the team dashboard** (Priority 2)

## 🎯 Key Technical Decisions

### Database
- Using Supabase with PostgreSQL
- Row Level Security (RLS) enabled
- Comprehensive indexing for performance

### Frontend
- Next.js 16 with App Router
- Server components where possible
- Client components for interactivity
- Tailwind CSS for styling

### Authentication
- Supabase Auth
- Role-based access control (merchant, admin, manager, specialist)

### Matching Logic
- Category-based matching (primary)
- Shipping markets filtering
- Custom branding requirement
- Capacity range matching

## 📝 Notes

- All notifications use warm, conversational tone
- Profile status changes trigger automated emails
- Activity logging for audit trail
- Feature flags for optional features (leaderboard)
- Configurable matching rules without code changes
- Weekly digest automated every Monday

## 🚀 Deployment

When ready to deploy to Cloudflare:
1. Set environment variables via Wrangler
2. Run `npm run build:cloudflare`
3. Run `npm run deploy`

Cloudflare Pages will handle the deployment with automatic SSL and CDN.
