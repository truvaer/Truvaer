export type AccountStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';

export type BusinessVerificationStatus = 'HARD_LOCKED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';

export type RegNumberType = 'PAN' | 'TAN' | 'CORPORATE_REG_NO' | 'TIN';

export type UserRole = 'STANDARD_USER' | 'BUSINESS_USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | string;

export interface CustomUserType {
  id: string; // e.g. 'role_standard', 'role_flight_crew', etc.
  key: string; // slug / code
  label: string; // Display name e.g. "Standard User", "Operations Manager"
  description: string;
  defaultAllowedModules: string[]; // Module IDs allowed by default for this user type
  isSystem?: boolean; // System types like Standard, Admin, Super Admin cannot be deleted
  colorBadge?: string;
  createdAt: string;
  updatedAt: string;
  level?: number;
  levelTitle?: string;
  department?: string;
  reportingTo?: string;
  zone?: string;
  operationalReason?: string;
  accountHolder?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'PURCHASE' | 'EARNED_REWARD';
  amount: number;
  creditType: 'PURCHASED' | 'EARNED';
  description: string;
  timestamp: string;
  referenceId?: string;
  counterparty?: string;
}

export interface CurrencyConversionRecord {
  id: string;
  amountPaidInr: number;
  creditsCredited: number;
  bonusCredits: number;
  paymentMethod: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  timestamp: string;
  packageTitle: string;
}

export interface DigitalWallet {
  wallet_id: string;
  purchased_credits: number;
  earned_credits: number;
  balance: number; // total = purchased + earned
  currency: string;
  provisioned_at: string;
  transactions: WalletTransaction[];
  conversionHistory: CurrencyConversionRecord[];
}

export interface RegularUser {
  user_id: string; // UUID v4
  username: string; // 3-30 chars, lowercase, ^[a-z0-9_.]+$
  first_name?: string;
  last_name?: string;
  gender?: 'Male' | 'Female' | 'Other';
  city?: string;
  email: string;
  password_hash: string;
  is_email_verified: boolean;
  date_of_birth: string; // ISO 8601 YYYY-MM-DD
  country_code: string; // ISO-2 (e.g., IN, US, AE)
  phone_number: string; // E.164 (+919876543210)
  account_status: AccountStatus;
  role: UserRole;
  created_at: string;
  wallet?: DigitalWallet;
  employment_status?: 'Active Employee' | 'Alumni' | 'Candidate';
  organization?: string;
  headline?: string;
  avatar_url?: string;
  followed_business_ids?: string[];
  permitted_portals?: string[]; // e.g. ['marketing', 'crm_portal', 'news', 'stores', 'admin_desk']
  allowed_modules?: string[]; // Granular list of enabled module IDs (e.g. ['erp_organisation', 'comm_chat']). Empty for Standard User by requirement.
  assigned_regions?: AviationZone[]; // allowed zones: APAC, ANZ, CIS, EMEA, LATAM, NA
  multi_region_approved?: boolean;
  multi_region_approved_by?: string; // Approved by L5+ Manager or L7/L8
  multi_region_approved_at?: string;
  mpin?: string;
  is_2fa_enabled?: boolean;
  two_step_method?: 'MPIN' | 'OTP' | 'BOTH';
  last_2fa_verified_at?: string;
  historical_passwords?: string[];
  last_password_reset_at?: string;
  active_session_token?: string;
  active_session_device?: string;
  active_session_started_at?: string;
}

export type TransactionReportFrequency = '24_HOURS' | 'WEEKLY' | 'MONTHLY';

export interface TransactionReportSubscription {
  enabled: boolean;
  frequency: TransactionReportFrequency;
  recipient_email: string;
  include_credits: boolean;
  include_debits: boolean;
  format: 'DETAILED_LEDGER' | 'EXECUTIVE_SUMMARY';
  last_dispatched_at?: string;
  next_scheduled_dispatch?: string;
}

export interface DispatchedTransactionReport {
  id: string;
  recipient_id: string; // user_id or business_id
  recipient_name: string;
  recipient_email: string;
  frequency: TransactionReportFrequency;
  dispatched_at: string;
  statement_period: string;
  total_credits_count: number;
  total_debits_count: number;
  total_credits_volume: number;
  total_debits_volume: number;
  opening_balance: number;
  closing_balance: number;
  subject: string;
  html_preview: string;
  transactions_included: Array<{
    id: string;
    type: string;
    amount: number;
    credits?: number;
    description: string;
    timestamp: string;
    referenceId?: string;
  }>;
}

export interface SingleSessionAuditRecord {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  user_name: string;
  old_session_token: string;
  new_session_token: string;
  device_info: string;
  terminated_at: string;
  reason: 'CONCURRENT_LOGIN_DETECTED';
}

export type CustomerCareQueue = 'STANDARD_TIER_QUEUE' | 'B2B_PRIORITY_QUEUE';
export type CustomerCareChannel = 'LIVE_CHAT' | 'EMAIL_SUPPORT' | 'PHONE_CALLBACK';
export type SupportTicketZone = 'APAC' | 'EMEA' | 'NA' | 'LATAM' | 'ANZ';

export interface CustomerCareContextPayload {
  userType: 'STANDARD' | 'BUSINESS';
  userId?: string;
  businessId?: string;
  role?: string;
  app_version?: string;
  recent_action?: string;
  subscription_tier?: string;
}

export interface CustomerCareResponseItem {
  id: string;
  senderName: string;
  senderEmail: string; // Must end with @truvaer.com for representative responses
  message: string;
  timestamp: string;
  isStaff: boolean;
}

export interface CustomerCareTicket {
  ticket_id: string; // Standard format: Zone/(last 2 digits of year)-Followed by AA0001 to AA9999 then AB0001 to AB9999, e.g. APAC/26-AA0001
  zone: SupportTicketZone;
  channel: CustomerCareChannel;
  queue: CustomerCareQueue;
  priority: 'STANDARD' | 'HIGH' | 'URGENT';
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  context: CustomerCareContextPayload;
  callback_phone?: string;
  callback_time_slot?: string;
  assigned_agent?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  responses?: CustomerCareResponseItem[];
  resolution_notes?: string;
}

export interface AgentVerificationGateAudit {
  id: string;
  identifier: string;
  account_type: 'STANDARD' | 'BUSINESS';
  agent_id: string;
  agent_name: string;
  agent_level: string;
  validation_status: 'SUCCESS' | 'FAILED';
  validated_dob?: boolean;
  validated_phone_or_email?: boolean;
  validated_doi?: boolean;
  validated_email?: boolean;
  validated_transaction_amount?: boolean;
  dispatched_link?: string;
  dispatched_at: string;
  recipient_email: string;
}

export interface CorporateTransaction {
  id: string;
  type: 'GRANT' | 'USAGE' | 'PURCHASE' | 'TRANSFER';
  credits: number;
  description: string;
  timestamp: string;
  actionType?: string;
  creditType?: string;
  amount?: number;
  referenceId?: string;
  counterparty?: string;
}

export interface AutoRenewSettings {
  enabled: boolean;
  thresholdCredits: number;
  renewCredits: number;
  paymentGateway: 'RAZORPAY' | 'PAYPAL';
  currency: 'INR' | 'USD';
  amount: number;
  savedMethodTitle?: string;
  lastAutoRenewAt?: string;
}

export interface LowCreditThresholdAlertSettings {
  enabled: boolean;
  thresholdCredits: number; // User-defined threshold, e.g. 1000
  notifyEmail: boolean;
  notifyWebPortal: boolean;
  customEmailAddress?: string; // Optional alternate email, defaults to biz.business_email
  lastAlertSentAt?: string;
  lastAlertBalance?: number;
}

export interface DispatchedThresholdAlert {
  id: string;
  business_id: string;
  business_name: string;
  recipient_email: string;
  threshold_credits: number;
  current_balance: number;
  email_subject: string;
  email_body: string;
  portal_notification_id?: string;
  sent_at: string;
  delivery_status: 'DELIVERED' | 'QUEUED' | 'SIMULATED';
}

export interface CorporateWallet {
  wallet_id: string;
  credit_balance: number;
  tier: string;
  provisioned_at: string;
  transactions: CorporateTransaction[];
  auto_renew_settings?: AutoRenewSettings;
  low_credit_alert_settings?: LowCreditThresholdAlertSettings;
  total_debited_credits?: number;
  last_transaction_date?: string;
}

export interface BusinessProfile {
  business_id: string; // UUID v4
  organization_name: string; // 2-150 chars
  username?: string;
  owner_name: string;
  reg_number_type: RegNumberType;
  registration_number: string;
  date_of_registration?: string;
  date_of_incorporation?: string;
  nature_of_business?: string;
  business_description?: string;
  physical_location?: string;
  website_url?: string;
  city?: string;
  state?: string;
  creator_user_id?: string;
  business_locations?: Array<{ id: string; city: string; state: string; country: string; display: string; is_primary?: boolean }>;
  country: string; // ISO-2
  business_email: string;
  phone_number?: string;
  password_hash: string;
  inc_cert_doc_url: string; // S3 / Cloud link
  inc_cert_file_name: string;
  inc_cert_file_size: number; // in bytes
  bank_account_holder: string;
  bank_account_number: string; // Encrypted representation
  bank_account_number_masked: string; // Masked in UI (****1234)
  bank_ifsc_swift: string;
  bank_name: string;
  verification_status: BusinessVerificationStatus;
  is_hard_locked_by_admin?: boolean;
  account_status?: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  deactivated_at?: string;
  deactivated_by?: string;
  deactivation_refund_amount?: number;
  deactivation_refund_bank_ref?: string;
  rejection_reason_code?: string;
  rejection_remarks?: string;
  domain_challenge_sent?: boolean;
  domain_verified?: boolean;
  submitted_at: string;
  verified_at?: string;
  corporate_wallet?: CorporateWallet;
  rating?: number;
  reviewCount?: number;
  category?: string;
  subCategory?: string;
  photos?: string[];
  servicesOffered?: string[];
  truvaer_id?: string;
  chat_enabled?: boolean;
  can_publish_flashnews?: boolean; // Admin-controlled permission to publish live flashnews
  credit_wallet_balance?: number;
  has_active_inquiries?: boolean;
  followed_by_count?: number;
  budget?: string;
  pricing_rate?: string;
  operating_hours?: string;
  commission_rate_pct?: number; // Organization-specific commission percentage agreed under verification
  logoUrl?: string; // Business avatar / firm profile logo
  finance_bank_verified?: boolean;
  finance_verified_at?: string;
  finance_verified_by?: string;
  bank_verification_status?: BankVerificationStatus;
  bank_uploaded_by_user_id?: string;
  bank_uploaded_by_user_name?: string;
  bank_uploaded_at?: string;
  cancelled_cheque_doc_url?: string;
  cancelled_cheque_filename?: string;
  cancelled_cheque_filesize?: number;
  bank_statement_doc_url?: string;
  // Admin Action Tracker & Level-based logging
  action_date?: string;
  action_by?: string;
  action_by_level?: number;
  bank_statement_filename?: string;
  bank_statement_filesize?: number;
  bank_verification_rejection_reason?: string;
  bank_verification_history?: BankVerificationAuditEntry[];
  mpin?: string;
  is_2fa_enabled?: boolean;
  two_step_method?: 'MPIN' | 'OTP' | 'BOTH';
  last_2fa_verified_at?: string;
  historical_passwords?: string[];
  last_password_reset_at?: string;
}

export type BankVerificationStatus =
  | 'UNSUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REVOKED';

export interface BankVerificationAuditEntry {
  action: 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'REVOKED';
  timestamp: string;
  actor_name: string;
  actor_role: string;
  notes?: string;
}

export type AdminDepartment =
  | 'Sales'
  | 'Marketing'
  | 'Sales & Marketing'
  | 'Finance'
  | 'Operations'
  | 'Stores'
  | 'HR'
  | 'Senior Management Team'
  | 'Customer Care';

export type AdminLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type AccessLevel = 'NONE' | 'VIEW' | 'EDIT' | 'FULL';
export type ModulePermissionAccess = AccessLevel;

export interface ModulePermissionConfig {
  access: AccessLevel; // 'NONE' = Hidden, 'VIEW' = Read Only, 'EDIT' = Read/Write, 'FULL' = Read/Write/Delete
  canDelete: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  canUpdate?: boolean;
}

export interface TerritoryScope {
  zone: string; // e.g. 'All Zones', 'North Zone', 'West Zone', 'South Zone', 'Middle East Hub', 'European Hub', 'Americas'
  country: string; // e.g. 'All Countries', 'IN', 'AE', 'US', 'GB', 'DE', 'SG'
  territory: string; // e.g. 'All Hubs', 'BOM (Mumbai)', 'DEL (Delhi)', 'BLR (Bengaluru)', 'DXB (Dubai)', 'LHR (London)'
}

export interface AdminUser {
  admin_id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER';
  assigned_modules: string[];
  department?: AdminDepartment;
  level?: AdminLevel;
  level_title?: string;
  reporting_manager_id?: string;
  reporting_manager_name?: string;
  permissions?: string[];
  module_permissions?: Record<string, ModulePermissionConfig>;
  territory_scope?: TerritoryScope;
  permitted_portals?: string[]; // e.g. ['admin_erp', 'marketing', 'crm_portal', 'stores', 'news', 'finance']
  allowed_modules?: string[]; // Granular list of enabled module IDs
  assigned_regions?: AviationZone[]; // allowed zones: APAC, ANZ, CIS, EMEA, LATAM, NA
  assigned_departments?: AdminDepartment[]; // For L5+ Managers multi-department matrix assignment
  primary_dept_id?: string; // Primary department identifier for L1-L4 staff
  kpi_score?: number; // 0-100 Performance KPI for dynamic mobility
  kpi_status?: 'EXCELLENT' | 'SATISFACTORY' | 'UNDERPERFORMING';
  mobility_history?: Array<{
    id: string;
    fromDept: string;
    toDept: string;
    timestamp: string;
    reason: string;
    triggeredBy: string;
    kpiScoreAtTransfer?: number;
  }>;
  multi_region_approved?: boolean;
  multi_region_approved_by?: string; // Approved by L5+ Manager or L7/L8
  multi_region_approved_at?: string;
  mpin?: string;
  is_2fa_enabled?: boolean;
  two_step_method?: 'MPIN' | 'OTP' | 'BOTH';
  last_2fa_verified_at?: string;
  historical_passwords?: string[];
  last_password_reset_at?: string;
  status?: 'ACTIVE' | 'DISABLED' | 'SUSPENDED' | 'ARCHIVED';
  status_reason?: string;
  status_changed_at?: string;
  status_changed_by?: string;
  employment_status?: string;
  safeguard_locked?: boolean;
  data_handover_status?: 'COMPLETED' | 'PENDING' | 'TRANSFERRED_TO_RM' | 'NA';
}

export interface AdminWelcomeEmail {
  id: string;
  recipient_email: string;
  recipient_name: string;
  portal_url: string;
  username: string;
  activation_token: string;
  password_setup_link: string;
  clearance_level: string;
  dispatched_at: string;
  dispatched_by: string;
  purpose: 'NEW_ACCOUNT_WELCOME' | 'PASSWORD_RESET_DISPATCH';
}

export type PublicationStatus = 'PUBLISHED' | 'RESTRICTED' | 'PENDING_APPROVAL' | 'SUSPENDED';

export interface UnlockedContactRecord {
  id: string;
  listing_id: string;
  user_id: string;
  business_id: string;
  unlocked_at: number; // timestamp in ms
  valid_until: number; // timestamp in ms (unlocked_at + 30 days)
  debited_credits: number;
}

export type WalletDebitStatus =
  | 'PENDING_STAGE_1'
  | 'PENDING_STAGE_2'
  | 'PENDING_FINANCE_RELEASE'
  | 'APPROVED'
  | 'RELEASED_BY_FINANCE'
  | 'REJECTED';

export interface WalletDebitRequest {
  id: string;
  business_id: string;
  business_name: string;
  amount: number;
  reason: string;
  created_by: string;
  created_at: string;
  stage1_approved: boolean;
  stage1_approved_by?: string;
  stage1_approved_at?: string;
  stage2_approved: boolean;
  stage2_approved_by?: string;
  stage2_approved_at?: string;
  status: WalletDebitStatus;
  rejection_reason?: string;
  // Finance Payment Settlement & Verification Fields
  bank_account_holder?: string;
  bank_name?: string;
  bank_account_number_masked?: string;
  bank_ifsc_swift?: string;
  finance_bank_verified?: boolean;
  finance_released_by?: string;
  finance_released_at?: string;
  payout_utr_reference?: string;
  daily_batch_id?: string;
  settled_currency?: string;
  // Admin Action Tracker & Level-based logging
  action_date?: string;
  action_by?: string;
  action_by_level?: number;
}

export interface DailyPayoutRecord {
  debit_id: string;
  business_id: string;
  business_name: string;
  bank_name: string;
  account_masked: string;
  ifsc: string;
  amount: number;
  currency: string;
  utr: string;
  released_by: string;
  timestamp: string;
}

export interface DailyPayoutReport {
  id: string;
  batch_date: string; // YYYY-MM-DD
  batch_reference: string; // e.g. BATCH-PAY-2026-09-25
  total_payout_amount: number;
  currency: string;
  total_debits_count: number;
  settled_records: DailyPayoutRecord[];
  generated_by: string;
  generated_at: string;
  status: 'COMPLETED' | 'PROCESSING';
}

// =========================================================================
// CENTRALIZED CREDIT DEBIT MATRIX (3-Stage Approval & Dual L7/L8 Governance)
// =========================================================================
export interface CentralizedCreditPolicy {
  phone_lead_cost_credits: number;
  deal_quotation_fee_credits: number;
  marketing_campaign_post_credits: number;
  direct_service_offer_credits: number;
  min_recharge_pack_inr: number;
  credit_to_inr_rate: number;
  payout_reserve_retention_pct: number;
  payout_deactivated_retention_pct: number;
  updated_at: string;
  updated_by: string;
}

export type CreditChangeRequestType =
  | 'WALLET_DEBIT'
  | 'WALLET_CREDIT_ALLOCATION'
  | 'POLICY_RATE_CHANGE'
  | 'VENDOR_SETTLEMENT_WITHDRAWAL';

export interface CentralizedCreditRequest {
  id: string;
  type: CreditChangeRequestType;
  title: string;
  description: string;
  business_id?: string;
  business_name?: string;
  credits_amount?: number;
  inr_equivalent?: number;
  proposed_policy_changes?: Partial<CentralizedCreditPolicy>;
  
  // Initiator Metadata
  initiated_by_admin_id: string;
  initiated_by_admin_name: string;
  initiated_by_admin_level: number;
  initiated_by_admin_role: string;
  initiated_at: string;

  // Multi-Level Governance Status
  status:
    | 'PENDING_STAGE_1'
    | 'PENDING_STAGE_2'
    | 'PENDING_EXECUTIVE_APPROVAL'
    | 'APPROVED_AND_EXECUTED'
    | 'REJECTED';

  // Rule Evaluation: true if initiator < L6 (requires 3 stages + 2 members in L7/L8 including both levels);
  // false if initiator >= L6 (requires any one L7 or L8 member approval)
  requires_dual_l7_l8: boolean;

  // Stage 1 (Operational Review, Level >= 4)
  stage1_approved?: boolean;
  stage1_by_name?: string;
  stage1_by_level?: number;
  stage1_at?: string;

  // Stage 2 (Managerial / Finance Review, Level >= 5)
  stage2_approved?: boolean;
  stage2_by_name?: string;
  stage2_by_level?: number;
  stage2_at?: string;

  // Executive Sign-offs (L7 & L8)
  l7_approved?: boolean;
  l7_approved_by?: string;
  l7_approved_at?: string;

  l8_approved?: boolean;
  l8_approved_by?: string;
  l8_approved_at?: string;

  // Final Execution details
  executed_at?: string;
  executed_by?: string;
  rejection_reason?: string;

  // All Business Users Notification
  broadcast_sent: boolean;
  broadcast_recipients_count?: number;
  broadcast_message?: string;
}

export interface PromotionApprovalRequest {
  id: string;
  admin_id: string;
  admin_name: string;
  department: AdminDepartment;
  current_level: AdminLevel;
  target_level: AdminLevel;
  requested_permission: string;
  reason: string;
  action_type?: 'PROMOTION' | 'DEMOTION'; // Promotion or Demotion
  first_approver_level: AdminLevel; // e.g. target_level + 1
  first_approver_name?: string;
  first_approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  first_approval_date?: string;
  second_approver_level: AdminLevel; // e.g. target_level + 2
  second_approver_name?: string;
  second_approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  second_approval_date?: string;
  overall_status: 'PENDING_LEVEL_1' | 'PENDING_LEVEL_2' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';
  status_message?: string;
  rejected_by?: string;
  rejection_date?: string;
  rejection_reason?: string;
  prior_approvals_nullified?: boolean;
  on_hold_note?: string;
  created_at: string;
  // Admin Action Tracker & Level-based logging
  action_date?: string;
  action_by?: string;
  action_by_level?: number;
}

export interface OtpRecord {
  user_id: string;
  otp: string;
  expires_at: number; // timestamp
  resend_count: number;
  last_sent_at: number;
}

// C-Panel Pricing Matrix
export interface PricingMatrixItem {
  id: string;
  portal: 'Marketing Portal' | 'Job Portal' | 'Community Site' | 'Marketplace';
  actionType: string;
  defaultDebitCredits: number;
  minimumThreshold: number;
  status: 'Active' | 'Paused';
}

// Regional & Country Specific Credit Pricing Rules (Super Admin Controlled)
export interface RegionalCreditPricingRule {
  id: string;
  location_code: string; // e.g. 'US', 'IN', 'GB', 'APAC', 'EMEA', 'GLOBAL_DEFAULT'
  location_name: string; // e.g. 'United States', 'India', 'Asia-Pacific (APAC)', 'Global Default Fallback'
  location_type: 'COUNTRY' | 'REGION' | 'GLOBAL_DEFAULT';
  credit_cost: number; // custom credits/day
  currency?: string;
  is_default?: boolean;
  countries_covered?: string[]; // for regions, e.g. ['US', 'CA', 'MX'] for NA
  updated_at: string;
  updated_by?: string;
  notes?: string;
}

// Marketing Portal Service Provider
export interface ServiceListing {
  id: string;
  business_id: string;
  name: string;
  category: string;
  subCategory?: string;
  logoUrl?: string;
  videoUrl?: string;
  city: string;
  country: string;
  address: string;
  area?: string;
  pincode?: string;
  phone: string;
  email: string;
  registration_number: string;
  established_year: number;
  services: string[];
  pending_services?: string[];
  facilities?: string[];
  amenities?: string[];
  rating: number;
  reviews_count: number;
  photos: string[];
  bannerAdUrl?: string;
  isVerified: boolean;
  leadUnlockCredits: number;
  directChatCredits: number;
  publication_status?: PublicationStatus;
  published_by_admin_id?: string;
  restricted_reason?: string;
  truvaer_id?: string;
  creator_user_id?: string;
  state?: string;
  location_display?: string;
  budget?: string;
  pricing_rate?: string;
  icao?: string;
  iata?: string;
}

export interface CustomerReview {
  id: string;
  listing_id: string;
  author_id: string;
  author_name: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
  status: 'visible' | 'hidden' | 'deleted';
  hidden_by?: 'ADMIN' | 'BUSINESS';
}

// Notifications for Standard & Business Users
export interface UserNotification {
  id: string;
  recipient_id: string; // user_id, business_id, or email
  title: string;
  message: string;
  type: 'CHAT' | 'EMAIL' | 'WALLET' | 'SYSTEM' | 'APPROVAL';
  timestamp: string;
  is_read: boolean;
  action_link?: string;
}

// Live Internal Communication & Mailing
export interface InternalMail {
  id: string;
  from: string; // e.g. sender@truvaer.com
  to: string; // e.g. enterprise@truvaer.com
  subject: string;
  body: string;
  category: 'Primary' | 'Sales' | 'Communication' | 'Updates' | 'Complaints';
  timestamp: string;
  isRead: boolean;
  isTrash: boolean;
  isDraft: boolean;
  piiRedacted: boolean;
  registeredEmailAlertSent?: boolean;
}

export interface LiveChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  message: string;
  original_message?: string;
  pii_redacted: boolean;
  timestamp: string;
  conversation_id?: string;
  is_read?: boolean;
  confidential_anonymized?: boolean;
  priority_sla?: boolean;
}

// Admin Project Management System (PMS) Types
export type PMSProjectCategory =
  | 'COMPLIANCE'
  | 'INFRASTRUCTURE'
  | 'COMMERCIAL'
  | 'SECURITY'
  | 'FINANCE'
  | 'OPERATIONS';

export type PMSPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PMSProjectStatus = 'PLANNING' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'ARCHIVED';

export type PMSTaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CLOSED';

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  category: PMSProjectCategory;
  priority: PMSPriority;
  lead_admin_id: string;
  lead_admin_name: string;
  lead_admin_role: string;
  target_date: string;
  status: PMSProjectStatus;
  tasks_count: number;
  completed_tasks_count: number;
  escalation_level: 'NONE' | 'WARNING' | 'CRITICAL_SLA_BREACH';
  created_at: string;
  sla_hours_remaining?: number;
}

export interface AdminTask {
  id: string;
  project_id: string;
  project_title?: string;
  title: string;
  description: string;
  assigned_admin_id: string;
  assigned_admin_name: string;
  assigned_admin_role?: string;
  status: PMSTaskStatus;
  priority: PMSPriority | 'URGENT_ESCALATION';
  due_date: string;
  sla_escalated: boolean;
  escalation_notes?: string;
  created_at: string;
  completed_at?: string;
}

// Jobs Portal Listing
export interface JobListing {
  id: string;
  business_id: string;
  company_name: string;
  title: string;
  role_type: 'Software Engineer' | 'Chief Flight Instructor' | 'First Officer' | 'Avionics Specialist' | 'Cabin Crew' | 'Flight Operations Coordinator';
  location: string;
  country: string;
  experience_years: string;
  salary_range: string;
  description: string;
  tags: string[];
  published_date: string;
  expiration_date: string; // ISO 8601
  status: 'Pending Verification' | 'Live' | 'Rejected';
  is_pinned?: boolean;
  rejection_reason?: string;
  opportunity_sheet_link?: string;
  applied_users?: { user_id: string; status: 'Applied' | 'Under Review' | 'Accepted' | 'Rejected'; date: string }[];
}

// News Portal Article
export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: 'Aviation' | 'Travel' | 'Career' | 'Technology' | 'Community';
  author_org: string;
  author_id: string;
  published_at: string;
  image_url: string;
  status: 'Pending Verification' | 'Live' | 'Rejected';
  pinned_slot: 'Primary' | 'Secondary' | 'Tertiary' | 'None';
  rejection_reason?: string;
  likes_count: number;
}

// Platform Module Governance, Staged Rollout & Crisis Circuit Breaker
export type ModuleRolloutStage = 'STAGE_1_LAUNCH' | 'STAGE_2_CHARTERS' | 'STAGE_3_TRAVEL' | 'STAGE_4_ENTERPRISE';

export type ModuleOperationalStatus = 'ACTIVE' | 'READ_ONLY' | 'MAINTENANCE' | 'STAGED_PREVIEW';

export interface PlatformModuleControl {
  id: string;
  name: string;
  category: 'CORE_MARKETPLACE' | 'MEDIA_COMMUNITY' | 'CAREER' | 'FLIGHT_CHARTERS' | 'TRAVEL_MOBILITY' | 'ENTERPRISE_MRO';
  stage: ModuleRolloutStage;
  status: ModuleOperationalStatus;
  description: string;
  routeKey: string;
  allowedRoles: {
    STANDARD_USER: boolean;
    BUSINESS_USER: boolean;
    ADMIN: boolean;
    SUPER_ADMIN: boolean;
  };
  circuitBreakerTripped: boolean;
  circuitBreakerReason?: string;
  circuitBreakerTrippedAt?: string;
  securityControls: {
    rateLimitingEnabled: boolean;
    piiMaskingEnforced: boolean;
    auditLogMonitored: boolean;
    financialLockdown: boolean;
  };
  dailyActiveTraffic?: number;
  healthScore?: number; // 0 - 100
}

// Community & Events
export interface AviationEvent {
  id: string;
  title: string;
  category: 'Operational Briefing' | 'Safety Workshop' | 'Flight Lineup' | 'Industry Summit' | 'Alumni Mixer';
  date: string;
  location: string;
  tier: 'Internal Only' | 'Public Ecosystem' | 'Alumni Curated';
  speaker: string;
  organization: string;
  rsvp_users: string[]; // user_ids
  lineup_users: string[]; // user_ids
  requires_clearance: boolean;
}

// API Contracts according to TRD Section 5
export interface RegularRegisterPayload {
  username: string;
  first_name?: string;
  last_name?: string;
  gender?: 'Male' | 'Female' | 'Other';
  city?: string;
  email: string;
  password: string;
  date_of_birth: string;
  country_code: string;
  phone_number: string;
}

export interface RegularRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    username: string;
    email: string;
    status: AccountStatus;
    verification_type: 'EMAIL_OTP';
    otp_expires_in_seconds: number;
  };
}

export interface BusinessRegisterPayload {
  organization_name: string;
  owner_name: string;
  reg_number_type: RegNumberType;
  registration_number: string;
  date_of_registration?: string;
  nature_of_business?: string;
  business_description?: string;
  physical_location?: string;
  city?: string;
  state?: string;
  creator_user_id?: string;
  website_url?: string;
  country: string;
  business_email: string;
  phone_number?: string;
  password: string;
  bank_account_holder: string;
  bank_account_number: string;
  bank_ifsc_swift: string;
  bank_name: string;
  category?: string;
  subCategory?: string;
  custom_category?: string;
  custom_subcategory?: string;
  custom_category_desc?: string;
  file?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  };
}

export interface BusinessRegisterResponse {
  success: boolean;
  message: string;
  data: {
    business_id: string;
    organization_name: string;
    verification_status: BusinessVerificationStatus;
    estimated_review_hours: number;
  };
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: 'POST' | 'GET';
  statusCode: number;
  requestPayload: any;
  responsePayload: any;
}

// -------------------------------------------------------------
// CRM & SALES PIPELINE SYSTEM TYPES
// -------------------------------------------------------------
export type CRMLeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';

export type SalesPaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type SalesStatus = 'Final' | 'Draft' | 'Quotation' | 'Completed' | 'Cancelled' | 'Return Raised';

export interface CRMSalesRecord {
  id: string;
  sales_code: string; // e.g. SL0030, SL0029
  sales_date: string; // YYYY-MM-DD or DD-MM-YYYY
  sales_status: SalesStatus;
  reference_no?: string; // e.g. "111"
  customer_name: string; // e.g. "Walk-in customer"
  customer_email?: string;
  customer_phone?: string;
  business_id: string;
  business_name: string;
  total_amount: number;
  paid_amount: number;
  payment_status: SalesPaymentStatus;
  created_by: 'Admin' | 'Sales' | 'Business' | string;
  payment_method?: 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Corporate Wallet' | 'UPI' | 'Cheque';
  description?: string;
  items?: { description: string; quantity: number; unit_price: number; total: number }[];
  tag?: string; // e.g. 'Return Raised'
  notes?: string;
  zone?: string;
  country?: string;
  territory?: string;
  created_at: string;
  updated_at: string;
}

export interface CRMLead {
  id: string;
  business_id: string;
  business_name: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  category: string;
  subCategory?: string;
  title: string;
  requirement_details: string;
  budget: number;
  currency: string;
  status: CRMLeadStatus;
  source: 'Marketplace Lead' | 'Direct Chat' | 'Phone Unlock' | 'Corporate Inbound' | 'Referral';
  assigned_to: string;
  zone: string;
  country: string;
  territory: string;
  created_at: string;
  updated_at: string;
  // Admin Action Tracker & Level-based logging
  action_date?: string;
  action_by?: string;
  action_by_level?: number;
}

export type CRMOpportunityStage = 'PROSPECTING' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

export interface CRMOpportunity {
  id: string;
  lead_id?: string;
  business_id: string;
  business_name: string;
  deal_name: string;
  client_name: string;
  deal_value: number;
  currency: string;
  probability: number; // 0 to 100%
  stage: CRMOpportunityStage;
  expected_close_date: string;
  assigned_to: string;
  zone: string;
  country: string;
  territory: string;
  created_at: string;
}

export interface CRMQuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export type CRMQuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'INVOICED';

export interface CRMQuotation {
  id: string;
  quotation_number: string;
  business_id: string;
  business_name: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_title: string;
  items: CRMQuotationItem[];
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  grand_total: number;
  currency: string;
  status: CRMQuotationStatus;
  valid_until: string;
  payment_terms: string;
  notes?: string;
  created_at: string;
  zone?: string;
  country?: string;
  territory?: string;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketMessage {
  id: string;
  sender_name: string;
  sender_role: 'CLIENT' | 'SUPPORT_REP' | 'SYSTEM';
  text: string;
  timestamp: string;
}

export interface CRMSupportTicket {
  id: string;
  ticket_number: string;
  business_id: string;
  business_name: string;
  client_name: string;
  client_email: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  assigned_agent: string;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// AUTOMATIC COMMISSION MODULE TYPES (Finance Exclusive & Business Tracker)
// -------------------------------------------------------------
export type CommissionStatus = 'COMMITTED' | 'INVOICE_GENERATED' | 'RELEASED' | 'SETTLED';

export interface CommissionRecord {
  id: string;
  deal_id: string;
  deal_title: string;
  quotation_number?: string;
  business_id: string;
  business_name: string;
  client_name: string;
  sale_amount: number;
  commission_rate_pct: number;
  commission_amount: number;
  net_remaining_balance?: number;
  currency: string;
  sale_date: string;
  due_date: string;
  status: CommissionStatus;
  payment_reference?: string;
  released_at?: string;
  settled_by_admin?: string;
  notes?: string;
  zone: string;
  country: string;
  territory: string;
  // Admin Action Tracker & Level-based logging
  action_date?: string;
  action_by?: string;
  action_by_level?: number;
  logged_by_role?: string;
  shared_with_admin_at?: string;
  admin_accounting_status?: 'SHARED_WITH_ADMIN' | 'ACCOUNTING_VERIFIED' | 'SETTLED';
}

// -------------------------------------------------------------
// STORES & INVENTORY MODULE TYPES
// -------------------------------------------------------------
export type StoreItemCondition = 'FACTORY_NEW' | 'OVERHAULED' | 'SERVICEABLE' | 'AS_REMOVED';
export type StoreItemStatus = 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_REORDER' | 'OUT_OF_STOCK';

export interface StoreInventoryItem {
  id: string;
  part_number: string;
  serial_number: string;
  name: string;
  category:
    | 'Avionics Spares'
    | 'Airframe Rotables'
    | 'Turbine Components'
    | 'Ground Support Equipment'
    | 'Consumables & Hardware'
    | 'Cabin Interior Parts';
  description: string;
  warehouse_hangar: string;
  zone: string;
  country: string;
  territory: string;
  quantity: number;
  min_threshold: number;
  unit_cost: number;
  currency: string;
  condition: StoreItemCondition;
  last_inspected: string;
  status: StoreItemStatus;
  added_by: string;
}

// -------------------------------------------------------------
// Activity Feed & Real-time Action Tracking
// -------------------------------------------------------------
export type AdminActivityCategory =
  | 'BUSINESS_APPROVAL'
  | 'COMMISSION_PAYOUT'
  | 'LEAD_STATUS_CHANGE'
  | 'WALLET_DEBIT'
  | 'HIERARCHY_PROMOTION'
  | 'PUBLICATION_COMPLIANCE'
  | 'SECURITY_AUDIT';

export interface AdminActivityItem {
  id: string;
  category: AdminActivityCategory;
  title: string;
  description: string;
  actor_name: string;
  actor_role: string;
  target_id?: string;
  target_name?: string;
  amount?: number;
  currency?: string;
  status_from?: string;
  status_to?: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  timestamp: string; // ISO string
  metadata?: Record<string, any>;
}

// -------------------------------------------------------------
// LINKEDIN MARKETING FEED & BUSINESS POSTS
// -------------------------------------------------------------
export interface PostComment {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  user_avatar?: string;
  text: string;
  timestamp: string;
}

export type CampaignTargetScope = 'City' | 'Country' | 'Region' | 'World Wide';

export interface PostMarketingCampaign {
  id?: string;
  radius_km?: number; // legacy backwards compatibility
  target_scope?: CampaignTargetScope; // 'City', 'Country', 'Region', 'World Wide'
  country: string; // 'All' or specific ISO-2 like 'IN', 'AE', 'US'
  target_countries?: string[]; // Multiple countries array when multi-country is selected
  duration_days: number; // 1 to 30
  category: string; // e.g. 'Pilot Training & Academies', 'Private Air Charter', 'MRO & Avionics', etc.
  start_date: string;
  end_date: string; // campaign_end_timestamp
  target_audience: 'STANDARD_USERS_ONLY'; // Condition 4: Strictly standard users only, never B2B
  credits_invested: number;
  impressions: number;
  clicks: number;
  // Quantitative Reporting & Lifecycle fields
  views?: number;
  target_audience_reached?: number;
  engagement_rate?: number; // e.g. 4.78 (%)
  total_credit_usage?: number;
  last_notified_12h?: boolean;
  last_daily_alert_date?: string; // YYYY-MM-DD in user's local timezone
  completed_alert_seen?: boolean;
  status?: 'ACTIVE' | 'EXPIRED' | 'EXTENDED';
}

export interface HelpArticle {
  id: string;
  title: string;
  category: 'OPERATIONS' | 'HR' | 'FINANCE' | 'PUBLICATION' | 'REPORTS' | 'GENERAL';
  moduleId: string; // e.g. 'mod_marketing', 'mod_wallet', 'mod_crm', 'mod_pms', 'mod_flashnews', 'mod_reserves', 'mod_rbac', 'mod_safeguard'
  requiredRoleLevels?: number[]; // e.g. [1,2,3,4,5,6,7,8] or [7,8] for high security
  allowedUserRoles?: ('STANDARD_USER' | 'BUSINESS' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN')[];
  summary: string;
  content: string;
  navigationRoute?: string; // Click-by-click navigation path (e.g. Home > C-Panel > Sector: Operations > Module)
  steps?: string[]; // Clear ordered step-by-step procedure
  keywords: string[];
  routeAction?: {
    tab?: string;
    subTab?: string;
    label: string;
  };
}

export type BusinessPostType = 'POST' | 'ARTICLE';

export interface BusinessPost {
  id: string;
  business_id: string;
  business_name: string;
  business_logo?: string;
  business_verified: boolean;
  business_category: string;
  business_city?: string;
  business_country: string;
  author_id?: string;
  author_name?: string;
  post_type: BusinessPostType;
  title?: string;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  tags: string[];
  created_at: string;
  likes: string[]; // IDs of users or businesses who liked
  reactions?: Record<string, number>;
  comments: PostComment[];
  shares_count: number;
  is_marketed: boolean;
  marketing_campaign?: PostMarketingCampaign;
  republished_from?: {
    original_post_id: string;
    original_author_name: string;
    original_business_id: string;
    republished_at: string;
  };
  status?: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  report_count?: number;
}

// -------------------------------------------------------------
// GEOGRAPHIC TARGETING & BROADCAST NOTIFICATIONS
// -------------------------------------------------------------
export type AviationZone = 'APAC' | 'ANZ' | 'CIS' | 'EMEA' | 'LATAM' | 'NA';

export interface BroadcastNotification {
  id: string;
  sender_admin_id: string;
  sender_admin_name: string;
  title: string;
  message: string;
  category: string; // 'All' or specific category
  zone: AviationZone | 'All';
  country: string; // 'All' or specific country name
  target_recipient_type: 'ALL' | 'BUSINESS_ONLY' | 'REGULAR_ONLY';
  published_at: string;
  action_type: 'NOTIFICATION_ONLY' | 'EMAIL_ONLY' | 'BOTH_NOTIFICATION_AND_EMAIL';
  delivered_count: number;
}

// -------------------------------------------------------------
// DIRECT SERVICE OFFERS (Business & Admin to Customers)
// -------------------------------------------------------------
export interface DirectServiceOffer {
  id: string;
  business_id: string;
  business_name: string;
  sender_name: string;
  sender_role: 'BUSINESS_USER' | 'ADMIN';
  customer_id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  category: string;
  pitch_message: string;
  offered_price?: string;
  currency: string;
  timeline?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

// -------------------------------------------------------------
// CUSTOM "OTHER" SERVICE APPROVAL WORKFLOW
// -------------------------------------------------------------
export interface CustomServiceRequest {
  id: string;
  business_id: string;
  business_name: string;
  listing_id: string;
  service_name: string;
  batch_services?: string[];
  category: string;
  description: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

// -------------------------------------------------------------
// CUSTOM "OTHER" CATEGORY & SUB-CATEGORY APPROVAL WORKFLOW
// -------------------------------------------------------------
export interface CustomCategoryRequest {
  id: string;
  business_id: string;
  business_name: string;
  listing_id?: string;
  category_name: string;
  sub_category_name: string;
  original_category_name?: string;
  original_sub_category_name?: string;
  description: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  lock_status?: 'NONE' | 'SOFT_LOCKED' | 'HARD_LOCKED';
  is_suspended?: boolean;
  requested_by: string;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  modified_at?: string;
  modified_by?: string;
}

// -------------------------------------------------------------
// REGIONAL CASH FLOW & FINANCIAL INTELLIGENCE (Image 3)
// -------------------------------------------------------------
export type RegionalFocusPriority =
  | 'CRITICAL_ATTENTION'
  | 'GROWTH_DRIVER'
  | 'PROFIT_ENGINE'
  | 'COST_OPTIMIZE'
  | 'CAPITAL_INTENSIVE'
  | 'STEADY_PERFORMER';

export interface RegionalFinancialMetric {
  zone: AviationZone;
  zoneName: string;
  flag: string;
  turnover: number; // In millions or standard currency units
  salesFlow: number; // Gross Inflow
  expenditure: number; // Operational Outflow
  netCashFlow: number; // Sales Flow - Expenditure
  profitMargin: number; // %
  growthRate: number; // YoY %
  focusPriority: RegionalFocusPriority;
  priorityScore: number; // 1-100 scale for admin/finance decision matrix
  strategicRecommendation: string;
  actionItems: string[];
  salesBreakdown: {
    charterSales: number;
    mroMaintenance: number;
    flightAcademies: number;
    sparesRotables: number;
    groundHandling: number;
  };
  expenditureBreakdown: {
    hangarFuel: number;
    airsideLeasing: number;
    part145Certifications: number;
    commissionsPayouts: number;
    platformLogistics: number;
  };
  quarterlyTrend: Array<{
    quarter: string;
    sales: number;
    expenditure: number;
    netCash: number;
  }>;
  cashFlowStages: Array<{
    stage: string;
    amount: number;
    type: 'inflow' | 'outflow' | 'net';
    description: string;
  }>;
}

export type TransactionReasonCategory =
  | 'ALL'
  | 'CHARTER_SALES'
  | 'FUEL_RAMP_OPEX'
  | 'MRO_OVERHAUL'
  | 'COMMISSION_PAYOUT'
  | 'REGULATORY_COMPLIANCE'
  | 'WALLET_DEBIT'
  | 'ACADEMY_TUITION'
  | 'AIRSIDE_LEASE';

export interface RegionalLedgerTransaction {
  id: string;
  date: string;
  zone: AviationZone;
  reasonCategory: TransactionReasonCategory;
  reasonText: string;
  department: string;
  amount: number;
  status: 'SETTLED' | 'VERIFIED' | 'IN_ESCROW' | 'AUDITED';
  referenceDoc?: string;
  operatorName?: string;
}

// -------------------------------------------------------------
// QUOTATION REQUEST & RFQ WORKFLOW
// -------------------------------------------------------------
export interface QuotationRequest {
  id: string;
  request_number: string;
  business_id: string;
  business_name: string;
  listing_id: string;
  client_id?: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company?: string;
  selected_services: string[];
  required_date?: string;
  departure_hub?: string;
  destination_hub?: string;
  capacity_scope?: string;
  details: string;
  target_budget?: number;
  currency?: string;
  status: 'PENDING_BUSINESS_QUOTATION' | 'QUOTATION_ISSUED' | 'ACCEPTED' | 'DECLINED' | 'CLOSED';
  quotation_id?: string;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------------
// BUSINESS REPORT & CONTENT MODERATION SYSTEM
// -------------------------------------------------------------
export type BusinessReportReason =
  | 'Fake Company / Unverified Business'
  | 'Irrelevant / Misleading Content'
  | 'Fraudulent Pricing / Bait & Switch'
  | 'Unresponsive / Invalid Contact Details'
  | 'Other Suspicious Activity'
  | 'Intellectual Property Violation'
  | 'Harassment / Unprofessional Behavior';

export interface BusinessReport {
  id: string;
  report_number: string;
  listing_id: string;
  listing_name: string;
  business_id: string;
  reporter_user_id?: string;
  reporter_email: string;
  reporter_name: string;
  reason: BusinessReportReason;
  explanation: string;
  is_blocked_by_user?: boolean;
  status: 'PENDING_REVIEW' | 'WARNED' | 'ACTION_TAKEN' | 'DISMISSED';
  action_taken?: '7_DAY_SUSPENSION' | '14_DAY_SUSPENSION' | '30_DAY_SUSPENSION' | 'HARD_LOCKED' | 'WARNING_ISSUED' | 'DISMISSED';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// -------------------------------------------------------------
// POST CONTENT REPORT & PUBLISHING TERMINATION SANCTION SYSTEM
// -------------------------------------------------------------
export type PostReportReason =
  | 'Irrelevant Content / Spam'
  | 'Fake Company or Misleading Information'
  | 'Inappropriate / Offensive Content'
  | 'Fraudulent Pricing or Scam'
  | 'Intellectual Property Violation'
  | 'Harassment / Unprofessional Behavior'
  | 'Other Policy Violation';

export interface PostReport {
  id: string;
  report_number: string;
  post_id: string;
  post_title?: string;
  post_snippet: string;
  author_id: string; // business_id or user_id
  author_name: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  reason: PostReportReason;
  explanation: string;
  status: 'PENDING_REVIEW' | 'SUSPENDED' | 'DELETED' | 'DISMISSED';
  action_taken?:
    | 'DELETED'
    | 'SUSPENDED'
    | 'TERMINATE_PUBLISH_7_DAYS'
    | 'TERMINATE_PUBLISH_14_DAYS'
    | 'TERMINATE_PUBLISH_30_DAYS'
    | 'WARNING_ISSUED'
    | 'DISMISSED';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PublishSanction {
  author_id: string;
  author_name: string;
  violation_count: number;
  is_suspended: boolean;
  suspended_until: string; // ISO timestamp
  last_sanction?: '7_DAYS' | '14_DAYS' | '30_DAYS';
  sanction_history: {
    sanction_type: '7_DAYS' | '14_DAYS' | '30_DAYS';
    applied_at: string;
    applied_by: string;
    reason: string;
  }[];
}
export interface ActiveUserSession {
  token: string;
  userId?: string;
  businessId?: string;
  userType: 'regular' | 'business';
  displayName: string;
  email: string;
  role?: string;
  deviceInfo: string;
  createdAt: number;
  lastActiveAt: number;
  expiresAt: number;
  idleTimeoutMinutes: number;
  warningMinutes: number;
}

export interface SessionKeepAliveResponse {
  success: boolean;
  token: string;
  lastActiveAt: number;
  expiresAt: number;
  remainingMs: number;
  idleTimeoutMinutes: number;
}

// =========================================================================
// LIVE BLINK FEED / FLASHNEWS TYPES (Max 200 Words, 2-Level Approval, Timing & Dynamic Pricing)
// =========================================================================
export type FlashNewsCategory =
  | 'BREAKING'
  | 'OPERATIONS'
  | 'AVIATION_ALERT'
  | 'CHARTER_DISPATCH'
  | 'WEATHER_NOTAM'
  | 'SECURITY'
  | string;

export type FlashNewsStatus =
  | 'ACTIVE'
  | 'PENDING_LEVEL_1'
  | 'PENDING_LEVEL_2'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'INACTIVE';

export interface FlashNewsItem {
  id: string;
  headline: string;
  content: string; // Max 200 words
  word_count: number;
  category: FlashNewsCategory;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  published_by_id: string;
  published_by_name: string;
  published_by_role: string;
  published_by_type?: 'SUPER_ADMIN' | 'ADMIN' | 'BUSINESS';
  published_by_org?: string;
  credits_debited?: number;
  credits_recipient?: 'TRUVAER_PLATFORM' | 'LEDGER';
  created_at?: string;
  published_at: string;
  status: FlashNewsStatus;
  blink_interval_sec?: number; // 5, 10, 15, or 30 seconds
  slot_position?: 'TOP_PRIORITY' | 'STICKY' | 'STANDARD';
  showcase_limit?: number; // 0 for unlimited, or e.g. 10, 25, 50, 100 per day
  impressions_count?: number;
  // 2-Step Verification & 2-Level Approval Fields
  level_1_approved_by?: string;
  level_1_approved_role?: string;
  level_1_approved_at?: string;
  level_2_approved_by?: string;
  level_2_approved_role?: string;
  level_2_approved_at?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
}

export interface FlashNewsPricingMatrix {
  base_cost: number;
  timing_rates: Record<number, number>; // { 5: 15, 10: 25, 15: 35, 30: 50 }
  position_rates: Record<'STANDARD' | 'STICKY' | 'TOP_PRIORITY', number>; // { STANDARD: 10, STICKY: 30, TOP_PRIORITY: 50 }
  showcase_rates: Record<number, number>; // { 0: 75, 10: 15, 25: 30, 50: 50, 100: 65 }
  category_rates: Record<string, number>; // category key -> rate in credits
}

export interface FlashNewsAutoMailBackupConfig {
  enabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipient_emails: string[];
  last_dispatched_at?: string;
  next_dispatch_at?: string;
  backup_count?: number;
  logs?: {
    id: string;
    timestamp: string;
    recipient_count: number;
    record_count: number;
    status: 'DISPATCHED' | 'FAILED';
    format: 'EXCEL_CSV';
    archive_snapshot_id: string;
  }[];
}

export interface FlashNewsConfig {
  max_active_limit: number; // default 10, minimum 10, editable only by Super Admin
  blink_interval_seconds: number; // 5
  business_publish_credit_cost: number; // default 50 credits, editable in Admin C-Panel
  pricing_matrix?: FlashNewsPricingMatrix;
  auto_mail_backup?: FlashNewsAutoMailBackupConfig;
  require_2_level_approval: boolean; // default true
  updated_at: string;
  updated_by: string;
}

// -------------------------------------------------------------
// Story Category & Regional Authority Mapping Types
// -------------------------------------------------------------
export interface StoryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  story_count: number;
  status: 'ACTIVE' | 'ARCHIVED';
  colorBadge?: string;
  created_at: string;
  updated_at: string;
}

export interface RegionalAuthorityZone {
  id: string;
  code: string; // e.g. 'APAC', 'EMEA', 'LATAM', 'NA', 'ANZ', 'CIS', 'MENA'
  name: string;
  description: string;
  headquarters?: string;
  primaryAuthority?: string;
  isSystem?: boolean;
}

export interface RegionCountryMapping {
  id: string;
  code: string; // ISO 2-letter e.g. 'IN', 'US', 'AE'
  name: string;
  regionCode: string; // references RegionalAuthorityZone.code
  regionalAuthorityAgency?: string; // e.g. 'DGCA', 'FAA', 'EASA', 'GCAA', 'CAA', 'CASA'
  currency?: string;
  status: 'ACTIVE' | 'PENDING_AUDIT';
  created_at?: string;
  updated_at?: string;
}

export type AppTab = 'dashboard' | 'marketing' | 'crm_portal' | 'admin_desk' | 'wallet';

// -------------------------------------------------------------
// Unified Credit Management System (CMS) Types
// -------------------------------------------------------------
export type BureauRatingTier = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'DEFAULT_WARNING';
export type CreditRiskCategory = 'LOW_RISK' | 'MODERATE' | 'ELEVATED' | 'HIGH_EXPOSURE' | 'CRITICAL';
export type DunningStage = 'STAGE_1_REMINDER' | 'STAGE_2_URGENT' | 'STAGE_3_FINAL_LEGAL' | 'SETTLED';

export interface CMSCreditAccount {
  id: string;
  business_id: string;
  entity_name: string;
  category: string;
  department: string; // e.g. 'Executive Charters', 'MRO & Engineering', 'Pilot Academy', 'Air Cargo'
  credit_limit: number;
  temporary_extension: number;
  extension_valid_until?: string;
  current_balance: number; // outstanding used credit
  payment_score: number; // 0 - 100
  bureau_rating: BureauRatingTier;
  risk_category: CreditRiskCategory;
  is_frozen: boolean;
  freeze_reason?: string;
  billing_sync_status: 'SYNCED' | 'PENDING' | 'RECONCILED';
  created_at: string;
  updated_at: string;
}

export interface CMSAllocationRequest {
  id: string;
  account_id: string;
  entity_name: string;
  requested_by: string;
  current_limit: number;
  requested_limit: number;
  extension_days?: number;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface CMSAuditEntry {
  id: string;
  timestamp: string;
  account_id: string;
  entity_name: string;
  action_type: 
    | 'CREDIT_LIMIT_ADJUSTED'
    | 'EXTENSION_GRANTED'
    | 'ACCOUNT_FROZEN'
    | 'ACCOUNT_UNFROZEN'
    | 'CREDIT_MEMO_ISSUED'
    | 'PROMO_DISCOUNT_APPLIED'
    | 'BAD_DEBT_WRITE_OFF'
    | 'DUNNING_NOTICE_DISPATCHED'
    | 'PROMISE_TO_PAY_LOGGED';
  previous_value: string;
  new_value: string;
  actor_name: string;
  actor_role: string;
  reason: string;
}

export interface CMSLedgerEntry {
  id: string;
  date: string;
  reference_id: string;
  account_id: string;
  entity_name: string;
  entry_type: 'INVOICE' | 'PAYMENT' | 'CREDIT_MEMO' | 'DISCOUNT' | 'WRITE_OFF';
  amount: number;
  running_balance: number;
  notes: string;
  settlement_status: 'CLEARED' | 'PENDING' | 'DISPUTED';
}

export interface CMSAgingRecord {
  id: string;
  account_id: string;
  entity_name: string;
  department: string;
  bucket_0_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
  total_overdue: number;
  dunning_stage: DunningStage;
  last_dunning_sent?: string;
  has_active_promise: boolean;
}

export interface CMSPromiseToPay {
  id: string;
  account_id: string;
  entity_name: string;
  promise_date: string;
  promised_amount: number;
  logged_by: string;
  logged_at: string;
  notes: string;
  status: 'PENDING' | 'KEPT' | 'BROKEN';
}


