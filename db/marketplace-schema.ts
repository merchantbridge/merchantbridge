import { pgTable, uuid, text, boolean, integer, timestamp, jsonb, array } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Merchant Profiles Table
export const marketplaceMerchantProfiles = pgTable('marketplace_merchant_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => 'auth.users.id', { onDelete: 'cascade' }).notNull(),
  
  // Basic Info
  fullName: text('full_name').notNull(),
  businessName: text('business_name').notNull(),
  productCategory: text('product_category').notNull(),
  businessDescription: text('business_description'),
  targetMarket: text('target_market'),
  
  // Capacity
  averageOrderValue: text('average_order_value'),
  monthlyOrderVolume: text('monthly_order_volume'),
  canCustomBranding: boolean('can_custom_branding').default(false),
  
  // Shipping
  shippingMarkets: text('shipping_markets').array().default(sql`'{}'`),
  
  // Revenue
  monthlyRevenueRange: text('monthly_revenue_range'),
  
  // Sales Channels
  salesChannels: text('sales_channels').array().default(sql`'{}'`),
  
  // Store Connection
  storeType: text('store_type'),
  storeUrl: text('store_url'),
  shopifyStoreId: text('shopify_store_id'),
  shopifyShopDomain: text('shopify_shop_domain'),
  
  // Status
  profileStatus: text('profile_status').default('pending'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => 'auth.users.id'),
  reviewFeedback: text('review_feedback'),
  
  // Profile Completion
  profileCompletionPercentage: integer('profile_completion_percentage').default(0),
  hasTradeDeck: boolean('has_trade_deck').default(false),
  
  // Supplier Document
  supplierDocumentId: uuid('supplier_document_id'),
  supplierDocumentStatus: text('supplier_document_status').default('not_uploaded'),
  
  // Specialist
  specialistStatus: text('specialist_status').default('not_contacted'),
  specialistAssignedTo: uuid('specialist_assigned_to').references(() => 'auth.users.id'),
  
  // Metrics
  opportunitiesMatched: integer('opportunities_matched').default(0),
  applicationsSubmitted: integer('applications_submitted').default(0),
  dealsClosed: integer('deals_closed').default(0),
  lastLoginAt: timestamp('last_login_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Opportunities Table
export const marketplaceOpportunities = pgTable('marketplace_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Basic Info
  title: text('title').notNull(),
  opportunityType: text('opportunity_type').notNull(),
  shortDescription: text('short_description').notNull(),
  keyRequirements: text('key_requirements').array().default(sql`'{}'`),
  
  // Source
  sourceUrl: text('source_url').notNull(),
  sourceType: text('source_type'),
  
  // Matching Criteria
  matchingCategories: text('matching_categories').array().default(sql`'{}'`),
  matchingCapacityRanges: text('matching_capacity_ranges').array().default(sql`'{}'`),
  matchingShippingMarkets: text('matching_shipping_markets').array().default(sql`'{}'`),
  requireCustomBranding: boolean('require_custom_branding').default(false),
  
  // Timing
  expiryDate: timestamp('expiry_date'),
  addedAt: timestamp('added_at').defaultNow(),
  addedBy: uuid('added_by').references(() => 'auth.users.id'),
  
  // Status
  status: text('status').default('live'),
  priorityLevel: text('priority_level').default('standard'),
  
  // Metrics
  merchantsShown: integer('merchants_shown').default(0),
  applications: integer('applications').default(0),
  
  // Timestamps
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Applications Table
export const marketplaceApplications = pgTable('marketplace_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => marketplaceMerchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  opportunityId: uuid('opportunity_id').references(() => marketplaceOpportunities.id, { onDelete: 'cascade' }).notNull(),
  
  // Status
  applicationStatus: text('application_status').default('applied'),
  appliedAt: timestamp('applied_at').defaultNow(),
  statusUpdatedAt: timestamp('status_updated_at'),
  
  // Notes
  notes: text('notes'),
  
  // Testimonial
  testimonialSubmitted: boolean('testimonial_submitted').default(false),
  testimonialText: text('testimonial_text'),
  testimonialStatus: text('testimonial_status').default('pending'),
});

// Saved Opportunities Table
export const marketplaceSavedOpportunities = pgTable('marketplace_saved_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => marketplaceMerchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  opportunityId: uuid('opportunity_id').references(() => marketplaceOpportunities.id, { onDelete: 'cascade' }).notNull(),
  savedAt: timestamp('saved_at').defaultNow(),
});

// Notifications Table
export const marketplaceNotifications = pgTable('marketplace_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => marketplaceMerchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  
  // Content
  notificationType: text('notification_type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  
  // Link
  actionUrl: text('action_url'),
  
  // Status
  read: boolean('read').default(false),
  readAt: timestamp('read_at'),
  
  // Email
  emailSent: boolean('email_sent').default(false),
  emailSentAt: timestamp('email_sent_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
});

// Internal Notes Table
export const marketplaceInternalNotes = pgTable('marketplace_internal_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => marketplaceMerchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  
  // Content
  note: text('note').notNull(),
  
  // Author
  createdBy: uuid('created_by').references(() => 'auth.users.id'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity Log Table
export const marketplaceActivityLog = pgTable('marketplace_activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Actor
  actorId: uuid('actor_id').references(() => 'auth.users.id'),
  actorType: text('actor_type'),
  
  // Action
  actionType: text('action_type').notNull(),
  actionDetails: jsonb('action_details'),
  
  // Target
  targetType: text('target_type'),
  targetId: uuid('target_id'),
  
  // Timestamp
  createdAt: timestamp('created_at').defaultNow(),
});

// Testimonials Table
export const marketplaceTestimonials = pgTable('marketplace_testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => marketplaceMerchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  
  // Content
  merchantDisplayName: text('merchant_display_name').notNull(),
  serviceOrOpportunity: text('service_or_opportunity').notNull(),
  testimonialText: text('testimonial_text').notNull(),
  starRating: integer('star_rating'),
  
  // Case Study Extension
  isCaseStudy: boolean('is_case_study').default(false),
  situationBefore: text('situation_before'),
  opportunitiesFound: text('opportunities_found'),
  servicesUsed: text('services_used'),
  specificResult: text('specific_result'),
  beforeAfterVisuals: text('before_after_visuals').array(),
  
  // Status
  status: text('status').default('pending'),
  
  // Timestamps
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  featuredAt: timestamp('featured_at'),
});

// Team Members Table
export const marketplaceTeamMembers = pgTable('marketplace_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => 'auth.users.id', { onDelete: 'cascade' }).notNull(),
  
  // Role
  role: text('role').notNull(),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Platform Settings Table
export const marketplacePlatformSettings = pgTable('marketplace_platform_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Setting
  settingKey: text('setting_key').notNull().unique(),
  settingValue: jsonb('setting_value').notNull(),
  
  // Metadata
  description: text('description'),
  updatedBy: uuid('updated_by').references(() => 'auth.users.id'),
  
  // Timestamps
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Email Templates Table
export const marketplaceEmailTemplates = pgTable('marketplace_email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Template
  templateKey: text('template_key').notNull().unique(),
  triggerCondition: text('trigger_condition').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  
  // Status
  isActive: boolean('is_active').default(true),
  
  // Metadata
  updatedBy: uuid('updated_by').references(() => 'auth.users.id'),
  
  // Timestamps
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Upsell Pipeline Table
export const marketplaceUpsellPipeline = pgTable('marketplace_upsell_pipeline', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').references(() => marketplaceMerchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  
  // Pipeline Info
  stage: text('stage').notNull(),
  serviceType: text('service_type'),
  potentialValue: text('potential_value'),
  
  // Specialist
  specialistId: uuid('specialist_id').references(() => 'auth.users.id'),
  
  // Notes
  notes: text('notes'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  closedAt: timestamp('closed_at'),
});

// Types
export type MerchantProfile = typeof marketplaceMerchantProfiles.$inferSelect;
export type NewMerchantProfile = typeof marketplaceMerchantProfiles.$inferInsert;
export type Opportunity = typeof marketplaceOpportunities.$inferSelect;
export type NewOpportunity = typeof marketplaceOpportunities.$inferInsert;
export type Application = typeof marketplaceApplications.$inferSelect;
export type NewApplication = typeof marketplaceApplications.$inferInsert;
export type Notification = typeof marketplaceNotifications.$inferSelect;
export type NewNotification = typeof marketplaceNotifications.$inferInsert;
export type Testimonial = typeof marketplaceTestimonials.$inferSelect;
export type NewTestimonial = typeof marketplaceTestimonials.$inferInsert;
export type TeamMember = typeof marketplaceTeamMembers.$inferSelect;
export type NewTeamMember = typeof marketplaceTeamMembers.$inferInsert;
