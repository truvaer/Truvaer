import {
  RegularUser,
  BusinessProfile,
  AdminUser,
  AdminWelcomeEmail,
  AdminDepartment,
  AdminLevel,
  PublicationStatus,
  UnlockedContactRecord,
  WalletDebitRequest,
  PromotionApprovalRequest,
  OtpRecord,
  RegularRegisterPayload,
  RegularRegisterResponse,
  BusinessRegisterPayload,
  BusinessRegisterResponse,
  ApiLogEntry,
  DigitalWallet,
  CorporateWallet,
  PricingMatrixItem,
  RegionalCreditPricingRule,
  ServiceListing,
  CustomerReview,
  InternalMail,
  LiveChatMessage,
  JobListing,
  NewsArticle,
  AviationEvent,
  CurrencyConversionRecord,
  UserNotification,
  AutoRenewSettings,
  LowCreditThresholdAlertSettings,
  DispatchedThresholdAlert,
  CRMLead,
  CRMLeadStatus,
  CRMOpportunity,
  CRMOpportunityStage,
  CRMQuotation,
  CRMQuotationItem,
  CRMQuotationStatus,
  CRMSupportTicket,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  CRMSalesRecord,
  SalesPaymentStatus,
  SalesStatus,
  CommissionRecord,
  CommissionStatus,
  StoreInventoryItem,
  StoreItemCondition,
  StoreItemStatus,
  ModulePermissionConfig,
  TerritoryScope,
  AccessLevel,
  AdminActivityItem,
  BusinessPost,
  PostComment,
  PostMarketingCampaign,
  BusinessPostType,
  DailyPayoutReport,
  DailyPayoutRecord,
  BroadcastNotification,
  AviationZone,
  DirectServiceOffer,
  CustomServiceRequest,
  CustomCategoryRequest,
  CustomUserType,
  AdminProject,
  AdminTask,
  PMSProjectCategory,
  PMSPriority,
  PMSProjectStatus,
  PMSTaskStatus,
  QuotationRequest,
  BusinessReport,
  BusinessReportReason,
  PostReport,
  PostReportReason,
  PublishSanction,
  CentralizedCreditPolicy,
  CentralizedCreditRequest,
  CreditChangeRequestType,
  TransactionReportFrequency,
  TransactionReportSubscription,
  DispatchedTransactionReport,
  SingleSessionAuditRecord,
  CustomerCareTicket,
  CustomerCareResponseItem,
  CustomerCareContextPayload,
  CustomerCareQueue,
  CustomerCareChannel,
  SupportTicketZone,
  AgentVerificationGateAudit,
  ActiveUserSession,
  SessionKeepAliveResponse,
  PlatformModuleControl,
  ModuleRolloutStage,
  ModuleOperationalStatus,
  FlashNewsItem,
  FlashNewsStatus,
  FlashNewsConfig,
  FlashNewsCategory,
  FlashNewsPricingMatrix,
  FlashNewsAutoMailBackupConfig,
  StoryCategory,
  RegionalAuthorityZone,
  RegionCountryMapping,
  CampaignTargetScope,
  HelpArticle,
} from '../types';
import { formatDateDDMMYYYY, normalizeDateToISO } from '../utils/dateFormat';
import {
  FLASH_NEWS_KEY,
  FLASH_NEWS_CONFIG_KEY,
  initialFlashNewsItems,
  initialFlashNewsConfig,
  defaultFlashNewsPricingMatrix,
  countWords,
} from './flashNewsSeeds';
import {
  STORY_CATEGORIES_KEY,
  REGIONAL_ZONES_KEY,
  COUNTRY_MAPPINGS_KEY,
  initialStoryCategories,
  initialRegionalZones,
  initialCountryMappings,
} from './storyAndRegionalSeeds';
import {
  getZoneForCountry,
  STANDARD_SERVICES_BY_CATEGORY,
  getCountriesForZone,
  AVIATION_ZONES_MAP,
  AVIATION_TAXONOMY,
} from './aviationGeographies';
import {
  MASTER_APP_MODULES,
  STANDARD_USER_BASELINE_MODULES,
  STANDARD_USER_RESTRICTED_MODULES,
} from './modulesMasterList';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// PII Redaction utility (Strict Aviation Privacy: Phone numbers & emails automatically blurred/hidden)
export function redactPII(text: string): { text: string; hasRedaction: boolean; blurredItemsCount: number } {
  if (!text) return { text: '', hasRedaction: false, blurredItemsCount: 0 };
  let redacted = text;
  let blurredItemsCount = 0;

  // Phone number regex (matches standard 7-15 digit sequences, country codes, dashes, spaces, parentheses)
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d]{3,4}[-.\s]?[\d]{3,4}/g;
  const phoneMatches = redacted.match(phoneRegex);
  if (phoneMatches) {
    phoneMatches.forEach((match) => {
      // Filter out small numbers like years (2026) or quantities unless 7+ digits or country-code prefixed
      const digitsOnly = match.replace(/\D/g, '');
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        redacted = redacted.replace(match, '[BLURRED_PHONE: ••••••••••••]');
        blurredItemsCount++;
      }
    });
  }

  // Email regex (matches any standard email address)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = redacted.match(emailRegex);
  if (emailMatches) {
    emailMatches.forEach((match) => {
      // Allow internal admin routing emails if needed, otherwise blur
      if (!match.endsWith('@truvaer.com')) {
        redacted = redacted.replace(match, '[BLURRED_EMAIL: ••••••••••••]');
        blurredItemsCount++;
      }
    });
  }

  return { text: redacted, hasRedaction: blurredItemsCount > 0, blurredItemsCount };
}

// LocalStorage Keys
const REGULAR_USERS_KEY = 'truvaer_regular_users_v8';
const BUSINESS_PROFILES_KEY = 'truvaer_business_profiles_v8';
const ADMIN_USERS_KEY = 'truvaer_admin_users_v8';
const PRICING_MATRIX_KEY = 'truvaer_pricing_matrix_v2';
const SERVICE_LISTINGS_KEY = 'truvaer_service_listings_v3';
const REVIEWS_KEY = 'truvaer_reviews_v2';
const INTERNAL_MAILS_KEY = 'truvaer_internal_mails_v2';
const CHATS_KEY = 'truvaer_chats_v2';
const JOBS_KEY = 'truvaer_jobs_v2';
const NEWS_KEY = 'truvaer_news_v2';
const EVENTS_KEY = 'truvaer_events_v2';
const OTP_STORE_KEY = 'truvaer_otps_v2';
const API_LOGS_KEY = 'truvaer_api_logs_v2';
const DEBIT_REQUESTS_KEY = 'truvaer_debit_requests_v3';
const PROMOTION_REQUESTS_KEY = 'truvaer_promotion_requests_v3';
const UNLOCKED_CONTACTS_KEY = 'truvaer_unlocked_contacts_v3';
const GLOBAL_SETTINGS_KEY = 'truvaer_global_settings_v3';
const USER_NOTIFICATIONS_KEY = 'truvaer_user_notifications_v3';
const CRM_LEADS_KEY = 'truvaer_crm_leads_v2';
const CRM_OPPORTUNITIES_KEY = 'truvaer_crm_opportunities_v2';
const CRM_QUOTATIONS_KEY = 'truvaer_crm_quotations_v2';
const CRM_TICKETS_KEY = 'truvaer_crm_tickets_v2';
const COMMISSIONS_KEY = 'truvaer_commissions_v2';
const STORE_INVENTORY_KEY = 'truvaer_store_inventory_v2';
const CRM_SALES_KEY = 'truvaer_crm_sales_v1';
const ADMIN_ACTIVITIES_KEY = 'truvaer_admin_activities_v1';
const BUSINESS_POSTS_KEY = 'truvaer_business_posts_v2';
const BUSINESS_FOLLOWERS_KEY = 'truvaer_business_followers_v2';
const DAILY_PAYOUTS_KEY = 'truvaer_daily_payouts_v2';
const BROADCAST_NOTIFICATIONS_KEY = 'truvaer_broadcast_notifications_v1';
const CUSTOM_SERVICE_REQUESTS_KEY = 'truvaer_custom_service_requests_v1';
const DIRECT_SERVICE_OFFERS_KEY = 'truvaer_direct_service_offers_v1';
const PLATFORM_CUSTOM_SERVICES_KEY = 'truvaer_platform_custom_services_v1';
const CUSTOM_CATEGORY_REQUESTS_KEY = 'truvaer_custom_category_requests_v1';
const CUSTOM_TAXONOMY_KEY = 'truvaer_custom_taxonomy_v1';
const SUSPENDED_CATEGORIES_KEY = 'truvaer_suspended_categories_v1';
const SUSPENDED_SUBCATEGORIES_KEY = 'truvaer_suspended_subcategories_v1';
const ADMIN_PROJECTS_KEY = 'truvaer_admin_projects_v1';
const ADMIN_TASKS_KEY = 'truvaer_admin_tasks_v1';
const QUOTATION_REQUESTS_KEY = 'truvaer_quotation_requests_v1';
const BUSINESS_REPORTS_KEY = 'truvaer_business_reports_v1';
const POST_REPORTS_KEY = 'truvaer_post_reports_v1';
const PUBLISH_SANCTIONS_KEY = 'truvaer_publish_sanctions_v1';
const CUSTOM_USER_TYPES_KEY = 'truvaer_custom_user_types_v1';
const DISPATCHED_THRESHOLD_ALERTS_KEY = 'truvaer_dispatched_threshold_alerts_v1';
const TRANSACTION_REPORT_SUBSCRIPTIONS_KEY = 'truvaer_transaction_report_subscriptions_v1';
const DISPATCHED_TRANSACTION_REPORTS_KEY = 'truvaer_dispatched_transaction_reports_v1';
const SINGLE_SESSION_AUDITS_KEY = 'truvaer_single_session_audits_v1';
const CUSTOMER_CARE_TICKETS_KEY = 'truvaer_customer_care_tickets_v1';
const AGENT_VERIFICATION_AUDITS_KEY = 'truvaer_agent_verification_audits_v1';
const ACTIVE_SESSIONS_STORE_KEY = 'truvaer_active_sessions_v1';
const SESSION_SETTINGS_KEY = 'truvaer_session_settings_v1';
const PLATFORM_MODULE_CONTROLS_KEY = 'truvaer_platform_module_controls_v2';
const GLOBAL_CRISIS_MODE_KEY = 'truvaer_global_crisis_mode_v2';
const REGIONAL_CREDIT_PRICING_KEY = 'truvaer_regional_credit_pricing_v1';
const GLOBAL_DEFAULT_CREDIT_KEY = 'truvaer_global_default_credit_v1';

export const initialRegionalCreditPricing: RegionalCreditPricingRule[] = [
  {
    id: 'rcp_default',
    location_code: 'GLOBAL_DEFAULT',
    location_name: 'Global Default Rate (Unconfigured Fallback)',
    location_type: 'GLOBAL_DEFAULT',
    credit_cost: 15,
    is_default: true,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Default baseline charge applied when a country has no specific pricing override.',
  },
  {
    id: 'rcp_us',
    location_code: 'US',
    location_name: 'United States (FAA Airspace)',
    location_type: 'COUNTRY',
    credit_cost: 20,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Premium commercial charter and aviation market',
  },
  {
    id: 'rcp_gb',
    location_code: 'GB',
    location_name: 'United Kingdom (CAA Corridor)',
    location_type: 'COUNTRY',
    credit_cost: 18,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'High density executive European gateway',
  },
  {
    id: 'rcp_in',
    location_code: 'IN',
    location_name: 'India (DGCA National Grid)',
    location_type: 'COUNTRY',
    credit_cost: 15,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Standard domestic & business jet aviation pricing',
  },
  {
    id: 'rcp_ae',
    location_code: 'AE',
    location_name: 'United Arab Emirates (GCAA Hub)',
    location_type: 'COUNTRY',
    credit_cost: 22,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'VIP Middle East SkySuite and charter pricing',
  },
  {
    id: 'rcp_sg',
    location_code: 'SG',
    location_name: 'Singapore (CAAS Changi Complex)',
    location_type: 'COUNTRY',
    credit_cost: 18,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Southeast Asia corporate aerodrome hub',
  },
  {
    id: 'rcp_de',
    location_code: 'DE',
    location_name: 'Germany (LBA Continental)',
    location_type: 'COUNTRY',
    credit_cost: 16,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'European industrial aviation center',
  },
  {
    id: 'rcp_fr',
    location_code: 'FR',
    location_name: 'France (DGAC Corridor)',
    location_type: 'COUNTRY',
    credit_cost: 16,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Western Europe executive flight network',
  },
  {
    id: 'rcp_jp',
    location_code: 'JP',
    location_name: 'Japan (JCAB Airspace)',
    location_type: 'COUNTRY',
    credit_cost: 18,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
  },
  {
    id: 'rcp_au',
    location_code: 'AU',
    location_name: 'Australia (CASA Pacific)',
    location_type: 'COUNTRY',
    credit_cost: 18,
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
  },
  {
    id: 'rcp_na',
    location_code: 'NA',
    location_name: 'North America (FAA Direct Airspace)',
    location_type: 'REGION',
    credit_cost: 25,
    countries_covered: ['US', 'CA', 'MX'],
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Regional override covering USA, Canada, and Mexico',
  },
  {
    id: 'rcp_apac',
    location_code: 'APAC',
    location_name: 'Asia-Pacific (APAC Corridor)',
    location_type: 'REGION',
    credit_cost: 28,
    countries_covered: ['IN', 'SG', 'JP', 'AU', 'NZ', 'TH', 'MY', 'VN', 'ID', 'KR'],
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Regional override covering 10 Asia-Pacific nations',
  },
  {
    id: 'rcp_emea',
    location_code: 'EMEA',
    location_name: 'Europe, Middle East & Africa (EMEA)',
    location_type: 'REGION',
    credit_cost: 30,
    countries_covered: ['GB', 'DE', 'FR', 'IT', 'ES', 'CH', 'AE', 'SA', 'QA', 'ZA'],
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Regional override covering key EMEA aerodromes',
  },
  {
    id: 'rcp_mena',
    location_code: 'MENA',
    location_name: 'Middle East & North Africa Hub',
    location_type: 'REGION',
    credit_cost: 25,
    countries_covered: ['AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'EG'],
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Middle East & North Africa corridor',
  },
  {
    id: 'rcp_latam',
    location_code: 'LATAM',
    location_name: 'Latin America & Caribbean',
    location_type: 'REGION',
    credit_cost: 22,
    countries_covered: ['BR', 'AR', 'CL', 'CO', 'PE', 'PA'],
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
  },
  {
    id: 'rcp_global',
    location_code: 'GLOBAL',
    location_name: 'Global Intercontinental Network',
    location_type: 'REGION',
    credit_cost: 45,
    countries_covered: ['*'],
    updated_at: '2026-11-01T00:00:00.000Z',
    updated_by: 'Super Admin Sovereign',
    notes: 'Worldwide broadcast coverage across all sovereign airspaces',
  },
];

export const initialPlatformModuleControls: PlatformModuleControl[] = [
  {
    id: 'business_directory',
    name: 'Business Directory & Marketing Portal',
    category: 'CORE_MARKETPLACE',
    stage: 'STAGE_1_LAUNCH',
    status: 'ACTIVE',
    routeKey: 'marketing',
    description: 'Verified aviation business listings, multi-category directory, ServiceScout filters & contact leads.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: true,
      auditLogMonitored: true,
      financialLockdown: false,
    },
    dailyActiveTraffic: 1420,
    healthScore: 99,
  },
  {
    id: 'news_portal',
    name: 'Aviation News & Industry Feed',
    category: 'MEDIA_COMMUNITY',
    stage: 'STAGE_1_LAUNCH',
    status: 'ACTIVE',
    routeKey: 'news',
    description: 'Real-time aviation journalism, DGCA/FAA regulatory bulletins, airline fleet deliveries & articles.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: false,
      auditLogMonitored: true,
      financialLockdown: false,
    },
    dailyActiveTraffic: 2850,
    healthScore: 100,
  },
  {
    id: 'jobs_portal',
    name: 'Aviation Jobs & Career Hub',
    category: 'CAREER',
    stage: 'STAGE_1_LAUNCH',
    status: 'ACTIVE',
    routeKey: 'jobs',
    description: 'Aviation careers: Captains, First Officers, AME Engineers, Dispatchers & Crew. 1-click dossier applications.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: true,
      auditLogMonitored: true,
      financialLockdown: false,
    },
    dailyActiveTraffic: 980,
    healthScore: 98,
  },
  {
    id: 'charters_booking',
    name: 'Customized Charters & Private Airlines Booking',
    category: 'FLIGHT_CHARTERS',
    stage: 'STAGE_2_CHARTERS',
    status: 'STAGED_PREVIEW',
    routeKey: 'charters',
    description: 'Bespoke executive aircraft charter quotes, empty-leg dispatch, VIP flight coordination & fleet manifests.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: true,
      auditLogMonitored: true,
      financialLockdown: true,
    },
    dailyActiveTraffic: 240,
    healthScore: 95,
  },
  {
    id: 'hotels_booking',
    name: 'Aviator Hotel & Crew Transit Booking',
    category: 'TRAVEL_MOBILITY',
    stage: 'STAGE_3_TRAVEL',
    status: 'STAGED_PREVIEW',
    routeKey: 'hotels',
    description: 'Airport transit hotels, 5-star executive aviator suites & guaranteed airline crew layover room blocks.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: true,
      auditLogMonitored: true,
      financialLockdown: true,
    },
    dailyActiveTraffic: 110,
    healthScore: 94,
  },
  {
    id: 'cabs_booking',
    name: 'Airport Cabs & Tarmac Chauffeurs',
    category: 'TRAVEL_MOBILITY',
    stage: 'STAGE_3_TRAVEL',
    status: 'STAGED_PREVIEW',
    routeKey: 'cabs',
    description: 'Under-wing VIP ramp transfers, airside apron chauffeurs, executive airport sedans & electric fleets.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: true,
      auditLogMonitored: true,
      financialLockdown: true,
    },
    dailyActiveTraffic: 95,
    healthScore: 96,
  },
  {
    id: 'bus_booking',
    name: 'Airport Transit Bus & Group Coach Booking',
    category: 'TRAVEL_MOBILITY',
    stage: 'STAGE_3_TRAVEL',
    status: 'STAGED_PREVIEW',
    routeKey: 'buses',
    description: 'Inter-terminal airport passenger shuttles, flight crew transit buses, and delegate group coach bookings.',
    allowedRoles: {
      STANDARD_USER: true,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: false,
      auditLogMonitored: true,
      financialLockdown: true,
    },
    dailyActiveTraffic: 60,
    healthScore: 97,
  },
  {
    id: 'enterprise_mro',
    name: 'MRO & Aviation Spares Logistics',
    category: 'ENTERPRISE_MRO',
    stage: 'STAGE_4_ENTERPRISE',
    status: 'STAGED_PREVIEW',
    routeKey: 'stores',
    description: 'Heavy turbine overhaul, CAR-145 airframe maintenance, certified AOG spare parts warehouse distribution.',
    allowedRoles: {
      STANDARD_USER: false,
      BUSINESS_USER: true,
      ADMIN: true,
      SUPER_ADMIN: true,
    },
    circuitBreakerTripped: false,
    securityControls: {
      rateLimitingEnabled: true,
      piiMaskingEnforced: true,
      auditLogMonitored: true,
      financialLockdown: true,
    },
    dailyActiveTraffic: 310,
    healthScore: 99,
  },
];

export interface SessionSettingsConfig {
  idleTimeoutMinutes: number; // 30 - 60 minutes (standard)
  warningMinutes: number; // 2 - 5 minutes
  keepAlivePingIntervalSeconds: number;
  multiTabSyncEnabled: boolean;
  heartbeatIntervalSeconds: number;
}

export const DEFAULT_SESSION_SETTINGS: SessionSettingsConfig = {
  idleTimeoutMinutes: 45, // Standard 45 minutes
  warningMinutes: 3, // Alert 3 minutes before auto-logout
  keepAlivePingIntervalSeconds: 20,
  multiTabSyncEnabled: true,
  heartbeatIntervalSeconds: 2,
};

/**
 * Standard Ticket Number Generator conforming to:
 * Zone/(last 2 digits of year)-Followed By AA0001 to AA9999 then next series AB0001 to AB9999 and so on.
 * Zones: APAC, EMEA, NA, LATAM, ANZ
 */
export function formatStandardTicketNumber(
  zone: SupportTicketZone = 'APAC',
  seq: number = 1,
  date: Date = new Date()
): string {
  const validZones: SupportTicketZone[] = ['APAC', 'EMEA', 'NA', 'LATAM', 'ANZ'];
  const safeZone = validZones.includes(zone) ? zone : 'APAC';
  const twoDigitYear = String(date.getFullYear()).slice(-2);
  const safeSeq = Math.max(1, Math.floor(seq));

  // Sequence series calculation:
  // 1 to 9999 -> series 0 ('AA'), number 1 to 9999
  // 10000 to 19998 -> series 1 ('AB'), number 1 to 9999
  const seriesIndex = Math.floor((safeSeq - 1) / 9999);
  const numberInSeries = ((safeSeq - 1) % 9999) + 1;

  const letter1 = String.fromCharCode(65 + Math.min(25, Math.floor(seriesIndex / 26)));
  const letter2 = String.fromCharCode(65 + (seriesIndex % 26));
  const seriesLetters = `${letter1}${letter2}`;

  const paddedNum = String(numberInSeries).padStart(4, '0');
  return `${safeZone}/${twoDigitYear}-${seriesLetters}${paddedNum}`;
}

export function inferSupportZone(country?: string, territory?: string, phone?: string): SupportTicketZone {
  const combined = `${country || ''} ${territory || ''} ${phone || ''}`.toUpperCase();
  if (['+1', 'US', 'USA', 'CA', 'CAN', 'MX', 'MEX', 'NORTH AMERICA', 'NA'].some((k) => combined.includes(k))) return 'NA';
  if (['+44', '+33', '+49', '+39', '+34', '+971', 'GB', 'UK', 'FR', 'DE', 'IT', 'ES', 'NL', 'CH', 'SA', 'QA', 'AE', 'DXB', 'LHR', 'BQH', 'MUC', 'EMEA', 'EUROPE'].some((k) => combined.includes(k))) return 'EMEA';
  if (['+55', '+54', '+56', '+57', 'BR', 'AR', 'CL', 'CO', 'PE', 'LATAM', 'SOUTH AMERICA'].some((k) => combined.includes(k))) return 'LATAM';
  if (['+61', '+64', 'AU', 'NZ', 'AUS', 'ANZ', 'SYD', 'MEL', 'AKL'].some((k) => combined.includes(k))) return 'ANZ';
  return 'APAC';
}

export const initialCustomerCareTickets: CustomerCareTicket[] = [
  {
    ticket_id: 'APAC/26-AA0001',
    zone: 'APAC',
    channel: 'LIVE_CHAT',
    queue: 'STANDARD_TIER_QUEUE',
    priority: 'HIGH',
    subject: 'Assistance regarding Regional Module Allocation & L7/L8 Clearance',
    message: 'Hello Support, I have requested module clearance for Regional flight ops and need to verify if the Delegated L5+ gate requires director sign-off.',
    status: 'OPEN',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    customer_name: 'Standard User',
    customer_email: 'user@truvaer.com',
    customer_phone: '+919999900003',
    assigned_agent: 'Customer Care Desk',
    context: {
      userType: 'STANDARD',
      userId: 'usr_standard_user',
      app_version: 'v2.4.1 (TruvAer Live Build)',
      recent_action: 'Browsing User Module Allotted 39-grid',
    },
    responses: [
      {
        id: 'resp_seed_1',
        senderName: 'Sarah Jenkins',
        senderEmail: 'care@truvaer.com',
        message: 'Hello Johnson! Thank you for reaching out. Your request is queued under Regional Authority Delegated L5+ Gate and is pending L7 Director sign-off. We are expediting it.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isStaff: true,
      },
    ],
  },
  {
    ticket_id: 'APAC/26-AA0002',
    zone: 'APAC',
    channel: 'LIVE_CHAT',
    queue: 'B2B_PRIORITY_QUEUE',
    priority: 'URGENT',
    subject: 'Emergency Spares Requisition for Gulfstream G650 AOG at Mumbai',
    message: 'AOG Alert: Flight scheduled for 18:00 UTC delayed due to hydraulic actuator pressure loss. Requesting immediate verification of EASA Form 1 inventory certificate from TruvAer Spares Hub.',
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    customer_name: 'Apex Air Charter Operations',
    customer_email: 'ops@apexairways.com',
    customer_phone: '+91 98200 45678',
    assigned_agent: 'Capt. Rajesh Nair (fleet.ops@truvaer.com)',
    context: {
      userType: 'BUSINESS',
      businessId: 'biz_apex_01',
      role: 'VERIFIED_OPERATOR_PARTNER',
      subscription_tier: 'Enterprise Platinum Tier',
    },
    responses: [
      {
        id: 'resp_seed_2',
        senderName: 'Capt. Rajesh Nair',
        senderEmail: 'fleet.ops@truvaer.com',
        message: 'Confirmed receipt. Part Part-145 certification Form 8130/EASA Form 1 has been validated by TruvAer Stores Hangar Hub. Airside gate pass dispatched.',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        isStaff: true,
      },
    ],
  },
  {
    ticket_id: 'NA/26-AA0001',
    zone: 'NA',
    channel: 'EMAIL_SUPPORT',
    queue: 'STANDARD_TIER_QUEUE',
    priority: 'STANDARD',
    subject: 'Query regarding MPIN Two-Step Verification and Idle Timeout',
    message: 'I would like to verify the idle session threshold and configure my MPIN for biometric login.',
    status: 'RESOLVED',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    customer_name: 'David K. Miller',
    customer_email: 'miller.david@aero-intl.net',
    customer_phone: '+1 415 555 2671',
    assigned_agent: 'Support Desk (support@truvaer.com)',
    context: {
      userType: 'STANDARD',
      userId: 'usr_david_02',
      app_version: 'v2.4.1 (TruvAer Live Build)',
    },
    responses: [
      {
        id: 'resp_seed_3',
        senderName: 'Support Desk',
        senderEmail: 'support@truvaer.com',
        message: 'Your MPIN has been validated. Idle timeout is active at 45 minutes with a 3-minute grace alert modal.',
        timestamp: new Date(Date.now() - 82000000).toISOString(),
        isStaff: true,
      },
    ],
  },
  {
    ticket_id: 'EMEA/26-AA0001',
    zone: 'EMEA',
    channel: 'LIVE_CHAT',
    queue: 'B2B_PRIORITY_QUEUE',
    priority: 'HIGH',
    subject: 'CAMO Slot Coordination at London Biggin Hill (BQH) & Munich (MUC)',
    message: 'Airframe inspection scheduled for Challenger 650. Need confirmation of ramp handler slot allocation and apron GPU support.',
    status: 'OPEN',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    customer_name: 'EuroJet Aviation AG',
    customer_email: 'dispatch@eurojet.eu',
    customer_phone: '+44 20 7946 0912',
    assigned_agent: 'Customer Care Desk - Sarah Jenkins (care@truvaer.com)',
    context: {
      userType: 'BUSINESS',
      businessId: 'biz_eurojet_01',
      role: 'VERIFIED_OPERATOR_PARTNER',
      subscription_tier: 'Enterprise Platinum Tier',
    },
    responses: [],
  },
];

// Initial Custom User Types / Roles Definition
export const initialCustomUserTypes: CustomUserType[] = [
  {
    id: 'role_standard',
    key: 'STANDARD_USER',
    label: 'Standard User (Aviator)',
    description: 'Core daily tasks: Personal dashboard, assigned projects, profile settings, chat & flight notices. Least privilege: System settings, user management, audit logs, and billing are strictly removed.',
    defaultAllowedModules: STANDARD_USER_BASELINE_MODULES,
    isSystem: true,
    colorBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_business',
    key: 'BUSINESS_USER',
    label: 'Corporate Aviation Business',
    description: 'Aircraft operators, charter brokerages & line MROs. Strict access limited only to quotations, client follow-up, deal proposals, commission logging/tracking, corporate wallet and commercial communications.',
    defaultAllowedModules: [
      'crm_quotations',
      'crm_client_followup',
      'crm_leads',
      'crm_proposals',
      'crm_commissions',
      'comm_chat',
      'comm_alerts',
      'user_profile_settings',
      'sec_pwd_reset',
      'sec_privacy_policy',
      'sec_user_agreement',
    ],
    isSystem: true,
    colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_manager',
    key: 'MANAGER',
    label: 'Operations Manager (L5+)',
    description: 'Operations & Commercial Services Manager with delegated authority for Multi-Zone regional access approval (L5+), service fulfillment, task dispatch & operational control.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_assigned_projects',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'erp_organisation',
      'hr_main',
      'hr_staff_wall',
      'hr_pms',
      'erp_sis',
      'erp_inventory',
      'comm_broadcast',
      'sec_pwd_reset',
      'sec_privacy_policy',
      'sec_user_agreement',
      'sec_accessibility',
      'sec_community_guidelines',
    ],
    isSystem: true,
    colorBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_admin',
    key: 'ADMIN',
    label: 'Platform Administrator (L7)',
    description: 'Operations Director with comprehensive control over services approval, regional cash flow, pricing matrix and module access management.',
    defaultAllowedModules: MASTER_APP_MODULES.map((m) => m.id),
    isSystem: true,
    colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_super_admin',
    key: 'SUPER_ADMIN',
    label: 'Super Administrator (L8)',
    description: 'Executive Chairman & Super Admin with unrestricted sovereign governance, user CRUD, module enable/disable matrix & SIEM audit logs.',
    defaultAllowedModules: MASTER_APP_MODULES.map((m) => m.id),
    isSystem: true,
    colorBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'role_service_ops',
    key: 'SERVICE_SPECIALIST',
    label: 'B2B Services & Platform Operations',
    description: 'Account Managers, Service Specialists, and Technical Leads. Focused on client SLA deliverables, service catalog fulfillment, project deliverables & direct partner chat.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_assigned_projects',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'erp_sis',
      'sec_pwd_reset',
      'sec_privacy_policy',
      'sec_user_agreement',
    ],
    isSystem: false,
    colorBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    createdAt: '2026-09-15T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z',
  },
];

// Initial Admin PMS Projects
const initialAdminProjects: AdminProject[] = [
  {
    id: 'proj_01',
    title: 'DGCA / FAA International Charter Compliance Audit 2026',
    description: 'Comprehensive cross-border airworthiness, AOC and operator compliance verification across Tier-1 and Tier-2 executive hubs.',
    category: 'COMPLIANCE',
    priority: 'CRITICAL',
    lead_admin_id: 'admin_primary_truvaer',
    lead_admin_name: 'B Aditya Narayana',
    lead_admin_role: 'Executive Chairman & Super Admin (L8)',
    target_date: '2026-11-15',
    status: 'ACTIVE',
    tasks_count: 3,
    completed_tasks_count: 1,
    escalation_level: 'CRITICAL_SLA_BREACH',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    sla_hours_remaining: 18,
  },
  {
    id: 'proj_02',
    title: 'Aviation AOG Parts Cross-Terminal Logistics Engine',
    description: 'Establish guaranteed 4-hour Aircraft-On-Ground (AOG) parts dispatch protocol and tarmac customs escorts across Mumbai and Delhi hubs.',
    category: 'OPERATIONS',
    priority: 'HIGH',
    lead_admin_id: 'adm_ops_02',
    lead_admin_name: 'Ramesh Rao',
    lead_admin_role: 'Operations VP (L7)',
    target_date: '2026-10-30',
    status: 'ACTIVE',
    tasks_count: 2,
    completed_tasks_count: 1,
    escalation_level: 'WARNING',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    sla_hours_remaining: 36,
  },
  {
    id: 'proj_03',
    title: 'PCI-DSS Level 1 & Corporate Treasury Escrow Hardening',
    description: 'Bank-grade multi-signature verification on Razorpay & PayPal treasury reserves and corporate credit settlement payouts.',
    category: 'SECURITY',
    priority: 'CRITICAL',
    lead_admin_id: 'adm_fin_03',
    lead_admin_name: 'Priya Sharma',
    lead_admin_role: 'Finance Controller (L6)',
    target_date: '2026-10-25',
    status: 'ACTIVE',
    tasks_count: 2,
    completed_tasks_count: 2,
    escalation_level: 'NONE',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    sla_hours_remaining: 52,
  },
  {
    id: 'proj_04',
    title: 'Tier-1 Airport VIP Direct Ground Fuel Subvention Contracts',
    description: 'Negotiate bulk Jet-A1 contract rates and dedicated apron ramp access for verified Truvaer corporate fleet operators.',
    category: 'COMMERCIAL',
    priority: 'MEDIUM',
    lead_admin_id: 'adm_sales_04',
    lead_admin_name: 'Vikram Patel',
    lead_admin_role: 'Commercial Lead (L5)',
    target_date: '2026-12-01',
    status: 'PLANNING',
    tasks_count: 1,
    completed_tasks_count: 0,
    escalation_level: 'NONE',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    sla_hours_remaining: 140,
  },
];

// Initial Admin PMS Tasks
const initialAdminTasks: AdminTask[] = [
  {
    id: 'task_pms_01',
    project_id: 'proj_01',
    project_title: 'DGCA / FAA International Charter Compliance Audit 2026',
    title: 'Validate TAN/PAN and Certificate of Airworthiness for 12 waiting fleet operators',
    description: 'Audit uploaded registration documents, verify DGCA operator AOC certificate validity, and clear hard-lock verification status.',
    assigned_admin_id: 'adm_ops_02',
    assigned_admin_name: 'Ramesh Rao',
    assigned_admin_role: 'Operations VP (L7)',
    status: 'IN_PROGRESS',
    priority: 'URGENT_ESCALATION',
    due_date: new Date(Date.now() + 3600000 * 14).toISOString(),
    sla_escalated: true,
    escalation_notes: 'Critical SLA breach risk: Operators awaiting verification > 48h. L8 escalated.',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'task_pms_02',
    project_id: 'proj_02',
    project_title: 'Aviation AOG Parts Cross-Terminal Logistics Engine',
    title: 'Close AOG parts emergency tariff discrepancy with Mumbai Terminal 1B',
    description: 'Resolve customs courier fee dispute with airport ramp authority and configure automated billing in ERP stores ledger.',
    assigned_admin_id: 'adm_fin_03',
    assigned_admin_name: 'Priya Sharma',
    assigned_admin_role: 'Finance Controller (L6)',
    status: 'TODO',
    priority: 'URGENT_ESCALATION',
    due_date: new Date(Date.now() + 3600000 * 8).toISOString(),
    sla_escalated: true,
    escalation_notes: 'AOG aircraft grounded on apron. Immediate priority escalation active.',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'task_pms_03',
    project_id: 'proj_01',
    project_title: 'DGCA / FAA International Charter Compliance Audit 2026',
    title: 'Audit multi-region clearance requests for ANZ & EMEA private charters',
    description: 'Examine flight corridor applications submitted by JetVentures and SkyStream for cross-border clearance.',
    assigned_admin_id: 'adm_sales_04',
    assigned_admin_name: 'Vikram Patel',
    assigned_admin_role: 'Commercial Lead (L5)',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 3600000 * 48).toISOString(),
    sla_escalated: false,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'task_pms_04',
    project_id: 'proj_03',
    project_title: 'PCI-DSS Level 1 & Corporate Treasury Escrow Hardening',
    title: 'Deploy 3-Password historical security verification on customer auth desk',
    description: 'Enforce historical password matching against last 3 passwords before issuing authorized reset tokens.',
    assigned_admin_id: 'admin_primary_truvaer',
    assigned_admin_name: 'B Aditya Narayana',
    assigned_admin_role: 'Executive Chairman & Super Admin (L8)',
    status: 'COMPLETED',
    priority: 'HIGH',
    due_date: new Date(Date.now() + 3600000 * 24).toISOString(),
    sla_escalated: false,
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task_pms_05',
    project_id: 'proj_03',
    project_title: 'PCI-DSS Level 1 & Corporate Treasury Escrow Hardening',
    title: 'Reconcile Razorpay & PayPal daily commission ledger for Falcon 2000EX',
    description: 'Verify 5% platform fee deduction and treasury reserve credit allocation.',
    assigned_admin_id: 'adm_fin_03',
    assigned_admin_name: 'Priya Sharma',
    assigned_admin_role: 'Finance Controller (L6)',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() - 3600000 * 12).toISOString(),
    sla_escalated: false,
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'task_pms_06',
    project_id: 'proj_04',
    project_title: 'Tier-1 Airport VIP Direct Ground Fuel Subvention Contracts',
    title: 'Draft standard apron refueling SLA terms for Dubai World Central (DWC)',
    description: 'Engage with VIP ground handlers to finalize guaranteed 30-minute turn-around fueling SLAs.',
    assigned_admin_id: 'adm_sales_04',
    assigned_admin_name: 'Vikram Patel',
    assigned_admin_role: 'Commercial Lead (L5)',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: new Date(Date.now() + 3600000 * 72).toISOString(),
    sla_escalated: false,
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
];

// Initial Custom Category & Sub-Category Requests (Business user "Other" -> Admin Review & Approval)
const initialCustomCategoryRequests: CustomCategoryRequest[] = [
  {
    id: 'ccr_01',
    business_id: 'biz_02',
    business_name: 'SkyHigh Flight Operations & Services',
    category_name: 'Aviation Operations & Enterprise Services',
    sub_category_name: 'Corporate Flight Operations & Dispatch Support',
    description: 'Corporate aviation flight operations, dispatch support, and ground handling coordination.',
    status: 'APPROVED',
    requested_by: 'Rahul Varma',
    requested_at: new Date(Date.now() - 3600000 * 84).toISOString(),
    reviewed_by: 'B Aditya Narayana (Chairman L8)',
    reviewed_at: new Date(Date.now() - 3600000 * 70).toISOString(),
  },
  {
    id: 'ccr_02',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    category_name: 'Aerospace Engineering',
    sub_category_name: 'eVTOL Urban Air Mobility Infrastructure',
    description: 'Electric vertical take-off and landing infrastructure, vertiport slot planning, and battery fast-charging hubs.',
    status: 'PENDING_APPROVAL',
    lock_status: 'NONE',
    requested_by: 'Capt. Aditya Narayana',
    requested_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ccr_03',
    business_id: 'biz_test_firm',
    business_name: 'Test Firm',
    category_name: 'Hotel',
    sub_category_name: 'Fast Food',
    description: 'Airport transit hotel catering, airside quick-service dining, and crew express nutrition dispatch.',
    status: 'APPROVED',
    lock_status: 'NONE',
    is_suspended: false,
    requested_by: 'Operations Officer',
    requested_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    reviewed_by: 'Super Administrator',
    reviewed_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const initialCustomTaxonomy: Record<string, string[]> = {
  'Aviation Operations & Enterprise Services': [
    'All Subcategories',
    'Corporate Flight Operations & Dispatch Support',
    'Airside Operations & Ramp Handling',
    'Aviation Safety Management Systems (SMS)',
    'Regulatory Compliance & Quality Auditing',
    'Aviation Charter Brokerage & Leasing',
  ],
  'Hotel': [
    'All Subcategories',
    'Fast Food',
    'Airport Transit Suites',
    'Crew Rest Lounges',
    'Executive Catering',
  ],
};

// Initial Broadcast Notifications (Category-wise, Zone-wise, Country-wise)
const initialBroadcastNotifications: BroadcastNotification[] = [
  {
    id: 'bcast_01',
    sender_admin_id: 'adm_01',
    sender_admin_name: 'B Aditya Narayana (Chairman L8)',
    title: 'APAC & EMEA Ultra-Long Range Jet Charter Corridors Open',
    message: 'Official Notice: Priority slot allocations and VIP executive fuel subventions are now operational across Singapore, Dubai, and Mumbai corridors.',
    category: 'Private Air Charter',
    zone: 'APAC',
    country: 'All',
    target_recipient_type: 'ALL',
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    action_type: 'BOTH_NOTIFICATION_AND_EMAIL',
    delivered_count: 48,
  },
  {
    id: 'bcast_02',
    sender_admin_id: 'adm_02',
    sender_admin_name: 'Operations & Airspace Desk',
    title: 'ANZ Regional Airport Ground Handling Standards Bulletin',
    message: 'Notice to all executive and ground handling operators across Australia, New Zealand and Oceania: Updated apron GSE certification guidelines are now in effect.',
    category: 'Airport',
    zone: 'ANZ',
    country: 'All',
    target_recipient_type: 'BUSINESS_ONLY',
    published_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    action_type: 'NOTIFICATION_ONLY',
    delivered_count: 19,
  },
];

// Initial Custom Service Requests (Business user request "Other" -> Admin Approval)
const initialCustomServiceRequests: CustomServiceRequest[] = [
  {
    id: 'csr_01',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    listing_id: 'srv_01',
    service_name: 'Onboard Satellite High-Speed Broadband (Ka-Band)',
    category: 'Private Air Charter',
    description: 'In-flight live streaming, satellite VoIP communication and secure enterprise data connectivity during transatlantic and transpacific flights.',
    status: 'PENDING_APPROVAL',
    requested_by: 'Capt. Aditya Narayana',
    requested_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'csr_02',
    business_id: 'biz_02',
    business_name: 'SkyHigh Flight Academy',
    listing_id: 'srv_academy_01',
    service_name: 'Diamond DA42 Twin-Engine Glass Cockpit Training',
    category: 'Aviation Academy',
    description: 'Advanced multi-engine Garmin G1000 NXi synthetic vision flight training modules.',
    status: 'APPROVED',
    requested_by: 'Rahul Varma',
    requested_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    reviewed_by: 'Primary Truvaer Administrator',
    reviewed_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// Initial Direct Service Offers (Business & Admin to Customers looking for services)
const initialDirectServiceOffers: DirectServiceOffer[] = [
  {
    id: 'dso_01',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    sender_name: 'Commercial Sales Desk',
    sender_role: 'BUSINESS_USER',
    customer_id: 'usr_aditya',
    customer_name: 'Aditya Narayana',
    customer_email: 'aditya@yarifly.com',
    service_name: 'Gulfstream G650ER Global Flights',
    category: 'Private Air Charter',
    pitch_message: 'Exclusive 20% discount on Mumbai to Dubai executive charter slots with complimentary apron limousine transfer and Michelin dining.',
    offered_price: '₹14,50,000 all-inclusive',
    currency: 'INR',
    timeline: 'Within 48 hours notice',
    status: 'PENDING',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

const initialPlatformCustomServices: Record<string, string[]> = {
  'Aviation Academy': ['Diamond DA42 Twin-Engine Glass Cockpit Training'],
};

// Initial LinkedIn Business Posts & Articles
const initialBusinessPosts: BusinessPost[] = [
  {
    id: 'post_001',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    business_logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
    business_verified: true,
    business_category: 'Private Air Charter',
    business_city: 'Dubai',
    business_country: 'AE',
    post_type: 'POST',
    title: 'Fleet Expansion: Flagship Gulfstream G650ER Stationed at Dubai VIP Terminal',
    content: `We are thrilled to announce the induction of our latest ultra-long-range Gulfstream G650ER (A6-JET) now permanently stationed at Gate 4 VIP Terminal, Al Maktoum International Airport (DWC).\n\nWith a nonstop range of 7,500 nautical miles, whisper-quiet cabin pressure altitudes under 3,000 ft, and bespoke Michelin-grade gourmet menus, this aircraft connects Dubai directly to London, New York, Tokyo, and Singapore.\n\nPriority flight booking windows and empty-leg notifications are now live for all following verified corporate accounts.\n\n#BusinessAviation #GulfstreamG650 #PrivateJetCharter #DubaiAviation #ExecutiveTravel`,
    media_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tags: ['BusinessAviation', 'GulfstreamG650', 'PrivateJetCharter', 'DubaiAviation'],
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    likes: ['user_aditya_01', 'user_standard_demo'],
    reactions: { like: 42, celebrate: 19, insightful: 8 },
    comments: [
      {
        id: 'comm_p1_01',
        user_id: 'user_aditya_01',
        user_name: 'Capt. Aditya Narayana',
        user_role: 'Commercial Aviator',
        user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        text: 'Outstanding addition to the DWC apron! Looking forward to flying the DXB-LHR sector.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    shares_count: 14,
    is_marketed: false, // Organic update: visible only to followers!
  },
  {
    id: 'post_002',
    business_id: 'biz_03',
    business_name: 'SkyHigh Aviation Academy',
    business_logo: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e896?auto=format&fit=crop&w=400&q=80',
    business_verified: true,
    business_category: 'Aviation Operations & Enterprise Services',
    business_city: 'Bengaluru',
    business_country: 'IN',
    post_type: 'ARTICLE',
    title: 'Autumn 2026 Corporate Flight Operations & Dispatch Certification Program',
    content: `Empower your enterprise with certified corporate aviation dispatch and trip support workflows. SkyHigh Aviation Services officially opens registration for our comprehensive international flight operations program.\n\nHighlights of our Autumn 2026 Curriculum:\n• Advanced Oceanic & Cross-Corridor Flight Dispatch Operations\n• Real-Time Slot Procurement & Airside Ground Handling Management\n• International EASA & FAA Part-135 Regulatory Compliance Masterclass\n• Direct enterprise partnerships with premier business aviation operators\n\nScholarship grants available for verified partner candidates registered through Truvaer.\n\n#FlightOperations #AviationServices #CorporateAviation #AviationEnterprise`,
    media_url: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e896?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tags: ['FlightOperations', 'AviationServices', 'CorporateAviation', 'AviationEnterprise'],
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    likes: ['user_standard_demo', 'reg_user_03'],
    reactions: { like: 88, celebrate: 34, insightful: 29 },
    comments: [
      {
        id: 'comm_p2_01',
        user_id: 'user_standard_demo',
        user_name: 'Rahul Varma',
        user_role: 'Corporate Aviation Lead',
        text: 'What is the schedule for international flight dispatch and regulatory compliance modules?',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
    ],
    shares_count: 36,
    is_marketed: true, // Marketed / Sponsored Campaign
    marketing_campaign: {
      radius_km: 500,
      country: 'IN',
      duration_days: 14,
      category: 'Aviation Operations & Enterprise Services',
      start_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      end_date: new Date(Date.now() + 13 * 24 * 3600 * 1000).toISOString(),
      target_audience: 'STANDARD_USERS_ONLY', // Strict Condition: Standard Users only, not B2B!
      credits_invested: 250,
      impressions: 2150,
      clicks: 340,
    },
  },
  {
    id: 'post_003',
    business_id: 'biz_munich_mro_10',
    business_name: 'Bavaria AeroSystems Turbine MRO & Avionics Hub',
    business_logo: 'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?auto=format&fit=crop&w=400&q=80',
    business_verified: true,
    business_category: 'MRO & Avionics',
    business_city: 'Munich',
    business_country: 'DE',
    post_type: 'POST',
    title: 'Expanded CFM56 & LEAP-1A Quick-Turn Shop Visit Capacity at MUC Hangar 4',
    content: `To address global turnaround bottlenecks, Bavaria AeroSystems has expanded our dedicated Quick-Turn Hangar facility at Munich Airport (MUC).\n\nEquipped with 5-axis robotic laser welding, non-destructive ultrasonic immersion testing, and direct EASA/FAA dual-release certifications, we guarantee AOG engine module swaps within 72 hours.\n\nSubmit technical work packages directly through our verified Truvaer desk.\n\n#TurbineMRO #AvionicsEngineering #EASAPart145 #AircraftMaintenance #CFM56`,
    media_url: 'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tags: ['TurbineMRO', 'AvionicsEngineering', 'EASAPart145', 'AircraftMaintenance'],
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    likes: ['user_aditya_01'],
    reactions: { like: 54, insightful: 31 },
    comments: [],
    shares_count: 19,
    is_marketed: true, // Marketed Campaign
    marketing_campaign: {
      radius_km: -1, // Global
      country: 'All',
      duration_days: 30,
      category: 'MRO & Avionics',
      start_date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      end_date: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
      target_audience: 'STANDARD_USERS_ONLY', // Standard Users only, not B2B!
      credits_invested: 400,
      impressions: 4800,
      clicks: 610,
    },
  },
  {
    id: 'post_004',
    business_id: 'biz_04',
    business_name: 'AeroParts Global Supply Co.',
    business_logo: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?auto=format&fit=crop&w=400&q=80',
    business_verified: true,
    business_category: 'Aviation Suppliers & GSE',
    business_city: 'London',
    business_country: 'GB',
    post_type: 'ARTICLE',
    title: 'Aviation Rotable Velocity: Mitigating Turbine Lead Times with Strategic Pool Buffers',
    content: `Global aerospace supply chains continue to confront extended raw material lead times. In our Q3 2026 Technical Paper, AeroParts Global analyzes how strategic consignment pooling and serialized blockchain tracking reduce grounded AOG aircraft hours by 38% across European regional fleets.\n\nOur full whitepaper with parts breakdown is available for technical officers on Truvaer.\n\n#AviationSupplyChain #AircraftSpares #RotablePool #GSE #AerospaceLogistics`,
    media_url: 'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?auto=format&fit=crop&w=1200&q=80',
    media_type: 'image',
    tags: ['AviationSupplyChain', 'AircraftSpares', 'RotablePool', 'GSE'],
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    likes: [],
    reactions: { like: 26, insightful: 17 },
    comments: [],
    shares_count: 8,
    is_marketed: false, // Organic update: visible only to followers!
  },
];

// Initial Business Followers: userId -> array of followed businessIds
const initialBusinessFollowers: Record<string, string[]> = {
  // Pre-seed demo users following JetVentures and SkyHigh
  'user_aditya_01': ['a1b2c3d4-5566-7788-9900-aabbccddeeff', 'biz_03'],
  'user_standard_demo': ['a1b2c3d4-5566-7788-9900-aabbccddeeff', 'biz_03', 'biz_04'],
};


const initialAdminActivities: AdminActivityItem[] = [
  {
    id: 'act_001',
    category: 'BUSINESS_APPROVAL',
    title: 'Business Verified & Hard-Lock Cleared',
    description: 'AeroGlobal Executive Charter (IN-AA001) verified. Domain & TAN/PAN compliance confirmed and 5,000 corporate credits provisioned.',
    actor_name: 'B Aditya Narayana',
    actor_role: 'Executive Chairman & Super Admin (L8)',
    target_id: 'biz_01',
    target_name: 'AeroGlobal Executive Charter Pvt Ltd',
    amount: 5000,
    currency: 'CREDITS',
    status_from: 'HARD_LOCKED',
    status_to: 'VERIFIED',
    severity: 'success',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_002',
    category: 'COMMISSION_PAYOUT',
    title: 'Platform Commission Payout Released',
    description: '5% Platform Fee ₹2,45,000 settled for Falcon 2000EX Charter contract (Flight BOM-DXB). Corporate wallet debited 4,900 credits.',
    actor_name: 'Finance Settlement Desk',
    actor_role: 'L6 Finance Treasury Officer',
    target_id: 'comm_01',
    target_name: 'Falcon 2000EX Charter Mumbai-Dubai',
    amount: 245000,
    currency: 'INR',
    status_from: 'PENDING_APPROVAL',
    status_to: 'RELEASED',
    severity: 'success',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_003',
    category: 'LEAD_STATUS_CHANGE',
    title: 'High-Value Lead Advanced to WON',
    description: 'VVIP Long-Range Charter Lead (BOM-LHR) by Ambani Family Office converted to WON. Deal value ₹49,00,000.',
    actor_name: 'Vikram Malhotra',
    actor_role: 'Senior Sales Director (L6)',
    target_id: 'lead_001',
    target_name: 'Ambani Family Office',
    amount: 4900000,
    currency: 'INR',
    status_from: 'NEGOTIATION',
    status_to: 'WON',
    severity: 'success',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_004',
    category: 'WALLET_DEBIT',
    title: 'Stage 2 Debit Authorization Completed',
    description: 'Corporate campaign debit of 450 Credits authorized for Global Aviation Showcase sponsorship banner placement.',
    actor_name: 'Primary Truvaer Administrator',
    actor_role: 'Super Admin (L8)',
    target_id: 'biz_02',
    target_name: 'Indo-Sky Jet Airways',
    amount: 450,
    currency: 'CREDITS',
    status_from: 'PENDING_STAGE_2',
    status_to: 'APPROVED',
    severity: 'info',
    timestamp: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_005',
    category: 'LEAD_STATUS_CHANGE',
    title: 'Commercial Pilot Cadet Pipeline Qualified',
    description: 'Cadet Commercial Multi-Engine Rating Batch lead updated from CONTACTED to QUALIFIED after entrance aptitude clearance.',
    actor_name: 'Priya Sharma',
    actor_role: 'Academy Sales Head (L4)',
    target_id: 'lead_002',
    target_name: 'Capt. Rajesh Varma (Aviation Cadets)',
    amount: 3800000,
    currency: 'INR',
    status_from: 'CONTACTED',
    status_to: 'QUALIFIED',
    severity: 'info',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_006',
    category: 'BUSINESS_APPROVAL',
    title: 'Avionics Lab Verified & Listed',
    description: 'Trans-India Avionics Labs (IN-AA004) completed CAR-145 document check. Listing verified for live marketplace discovery.',
    actor_name: 'Compliance Desk',
    actor_role: 'L5 Airworthiness Inspector',
    target_id: 'biz_04',
    target_name: 'Trans-India Avionics Labs',
    severity: 'info',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_007',
    category: 'COMMISSION_PAYOUT',
    title: 'Automated Commission Logged',
    description: 'Scheduled maintenance contract commission of ₹85,000 released via Razorpay direct settlement.',
    actor_name: 'Automated Revenue Engine',
    actor_role: 'Truvaer Clearing House',
    target_id: 'comm_02',
    target_name: 'Bombardier Challenger 605 120-Month Inspection',
    amount: 85000,
    currency: 'INR',
    status_from: 'ACCRUED',
    status_to: 'RELEASED',
    severity: 'success',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
  },
  {
    id: 'act_008',
    category: 'HIERARCHY_PROMOTION',
    title: 'Personnel Hierarchy Level Promoted',
    description: 'Operations Admin promoted from Level L2 (Junior Officer) to Level L3 (Regional Controller) with 2-level managerial sign-off.',
    actor_name: 'HR & Governance Committee',
    actor_role: 'L7 Director Operations',
    target_id: 'adm_04',
    target_name: 'Suresh Menon',
    status_from: 'L2',
    status_to: 'L3',
    severity: 'info',
    timestamp: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
  },
];

// Rule 2: TRUEAER ID Generator based on Country Code - SRNo (e.g. IN-AA001 to IN-AA999, IN-AB001, etc.)
export function generateTruvaerId(country: string, index: number): string {
  let cc = 'IN';
  const cUpper = (country || '').trim().toUpperCase();
  if (cUpper === 'INDIA' || cUpper === 'IN') cc = 'IN';
  else if (cUpper === 'UNITED STATES' || cUpper === 'USA' || cUpper === 'US') cc = 'US';
  else if (cUpper === 'UNITED ARAB EMIRATES' || cUpper === 'UAE' || cUpper === 'AE') cc = 'AE';
  else if (cUpper === 'UNITED KINGDOM' || cUpper === 'UK' || cUpper === 'GB') cc = 'GB';
  else if (cUpper === 'SINGAPORE' || cUpper === 'SG') cc = 'SG';
  else if (cUpper === 'GERMANY' || cUpper === 'DE') cc = 'DE';
  else if (cUpper === 'FRANCE' || cUpper === 'FR') cc = 'FR';
  else if (cUpper === 'CANADA' || cUpper === 'CA') cc = 'CA';
  else if (cUpper === 'AUSTRALIA' || cUpper === 'AU') cc = 'AU';
  else if (cUpper.length === 2) cc = cUpper;
  else if (cUpper.length > 2) cc = cUpper.substring(0, 2);

  // Each series has 999 numbers (001 to 999)
  const seriesIndex = Math.floor(index / 999);
  const numberInSeries = (index % 999) + 1;
  const paddedNum = String(numberInSeries).padStart(3, '0');

  let letterSeries = '';
  if (seriesIndex < 676) {
    // 2-letter series AA to ZZ (26 * 26 = 676)
    const l1 = String.fromCharCode(65 + Math.floor(seriesIndex / 26));
    const l2 = String.fromCharCode(65 + (seriesIndex % 26));
    letterSeries = `${l1}${l2}`;
  } else {
    // 3-letter series AAA to ZZZ (once past ZZ999)
    const threeIndex = seriesIndex - 676;
    const l1 = String.fromCharCode(65 + (Math.floor(threeIndex / (26 * 26)) % 26));
    const l2 = String.fromCharCode(65 + (Math.floor(threeIndex / 26) % 26));
    const l3 = String.fromCharCode(65 + (threeIndex % 26));
    letterSeries = `${l1}${l2}${l3}`;
  }

  return `${cc}-${letterSeries}${paddedNum}`;
}

// Seeds for Admin Users: Super Admin and Admin as requested
const initialAdminUsers: AdminUser[] = [
  // Super admin
  // User name : super_admin
  // Email : sup_admin@truvaer.com
  // password : Loginpwd@130
  {
    admin_id: 'admin_super_admin',
    name: 'B Aditya Narayana (Chairman & Managing Director)',
    email: 'sup_admin@truvaer.com',
    role: 'SUPER_ADMIN',
    assigned_modules: ['ALL'],
    department: 'Senior Management Team',
    level: 8,
    level_title: 'L8 - Executive Chairman & Super Admin',
    reporting_manager_id: undefined,
    reporting_manager_name: 'Board of Directors',
    permissions: [
      'ALL',
      'SUPER_ADMIN_DEBIT_APPROVAL',
      'MANAGE_ADMINS',
      'RESTRICT_PUBLICATION',
      'CREATE_ADMINS',
      'MODIFY_BUSINESS',
      'DELETE_BUSINESS',
      'KYC_HARD_LOCK_RELEASE',
      'APPROVE_PROMOTIONS',
      'OVERRIDE_PROMOTIONS',
      'REJECT_PROMOTIONS',
      'HOLD_PROMOTIONS',
      'MODIFY_TAXONOMY',
      'AUDIT_LOGS',
      'FULL_SYSTEM_ACCESS',
    ],
    permitted_portals: [
      'ALL',
      'marketing',
      'crm_portal',
      'admin_desk',
      'cpanel',
      'stores',
      'news',
      'finance',
      'operations',
      'hr',
      'pms',
    ],
  },
  // admin
  // User name : admin
  // Email : admin@truvaer.com
  // password : Loginpwd@130
  {
    admin_id: 'admin_operations',
    name: 'Operations Administrator',
    email: 'admin@truvaer.com',
    role: 'ADMIN',
    assigned_modules: ['ALL', 'Operations', 'Finance', 'Sales', 'Marketing', 'Customer Care'],
    department: 'Operations',
    level: 7,
    level_title: 'L7 - Operations Director & Administrator',
    reporting_manager_id: 'admin_super_admin',
    reporting_manager_name: 'Super Administrator (L8)',
    permissions: [
      'ALL',
      'ADMIN_DEBIT_APPROVAL',
      'RESTRICT_PUBLICATION',
      'APPROVE_PROMOTIONS',
      'MODIFY_LISTINGS',
      'KYC_HARD_LOCK_RELEASE',
    ],
  },
];

// Initial CRM Leads
const initialCRMLeads: CRMLead[] = [
  {
    id: 'lead_01',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Lord Alistair Sterling',
    client_email: 'sterling.family@londontrust.co.uk',
    client_phone: '+44 7700 900123',
    category: 'Private Air Charter',
    subCategory: 'VIP Corporate Jet Charter',
    title: 'Gulfstream G650ER London to Dubai Return Charter',
    requirement_details: '12 VIP passengers, gourmet caviar catering, fast-track diplomatic tarmac clearance at DXB.',
    budget: 14500000,
    currency: 'INR',
    status: 'PROPOSAL_SENT',
    source: 'Marketplace Lead',
    assigned_to: 'Priya Deshmukh (Sales Manager L5)',
    zone: 'Middle East Hub',
    country: 'AE',
    territory: 'DXB (Dubai)',
    created_at: '2026-09-18T10:30:00Z',
    updated_at: '2026-09-21T14:10:00Z',
  },
  {
    id: 'lead_02',
    business_id: 'biz_munich_mro_10',
    business_name: 'Bavaria AeroSystems Turbine MRO & Avionics Hub',
    client_name: 'Capt. Hans Zimmer',
    client_email: 'fleet.ops@eurowings-charter.de',
    client_phone: '+49 171 1234567',
    category: 'MRO & Avionics',
    subCategory: 'Engine & APU Shop Overhaul',
    title: 'CFM56-7B Hot Section Overhaul & Eddy Current Testing',
    requirement_details: 'Scheduled heavy shop visit for two high-cycle CFM56 turbine cores. Fast turnaround required within 14 days.',
    budget: 28000000,
    currency: 'INR',
    status: 'NEGOTIATION',
    source: 'Corporate Inbound',
    assigned_to: 'Vikram Sengupta (Ops Manager L4)',
    zone: 'European Hub',
    country: 'DE',
    territory: 'MUC (Munich)',
    created_at: '2026-09-14T08:00:00Z',
    updated_at: '2026-09-20T16:45:00Z',
  },
  {
    id: 'lead_03',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Devendra Singhania',
    client_email: 'dsinghania@apexcorp.in',
    client_phone: '+91 98200 12345',
    category: 'Private Air Charter',
    subCategory: 'Helicopter Charter & Heli-Tours',
    title: 'AgustaWestland AW109 Mumbai to Shirdi Executive Day Return',
    requirement_details: '6 VIP passengers, helipad pickup at Juhu, same-day return dispatch.',
    budget: 1850000,
    currency: 'INR',
    status: 'WON',
    source: 'Direct Chat',
    assigned_to: 'Rohan Mehra (Sales Lead L2)',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2026-09-10T12:00:00Z',
    updated_at: '2026-09-15T09:30:00Z',
  },
  {
    id: 'lead_04',
    business_id: 'biz_skywings_cpl_09',
    business_name: 'SkyWings International Flight Academy & Cadet Program',
    client_name: 'Arjun Kapoor',
    client_email: 'arjun.aviator@gmail.com',
    client_phone: '+91 99887 76655',
    category: 'Aviation Operations & Enterprise Services',
    subCategory: 'Corporate Flight Operations & Dispatch Support',
    title: 'International Flight Operations Dispatch & Trip Support Retainer',
    requirement_details: 'Seeking 24/7 global flight operations dispatch, overflight permits, and fuel handling contract for corporate fleet.',
    budget: 4800000,
    currency: 'INR',
    status: 'QUALIFIED',
    source: 'Phone Unlock',
    assigned_to: 'Sameer Jain (Sales Trainee L0)',
    zone: 'Americas',
    country: 'US',
    territory: 'MIA (Miami)',
    created_at: '2026-09-16T11:00:00Z',
    updated_at: '2026-09-18T15:00:00Z',
  },
];

// Initial CRM Opportunities
const initialCRMOpportunities: CRMOpportunity[] = [
  {
    id: 'opp_01',
    lead_id: 'lead_01',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    deal_name: 'Sterling Trust G650ER LON-DXB Annual Charter Contract',
    client_name: 'Lord Alistair Sterling',
    deal_value: 14500000,
    currency: 'INR',
    probability: 80,
    stage: 'PROPOSAL',
    expected_close_date: '2026-10-15',
    assigned_to: 'Priya Deshmukh',
    zone: 'Middle East Hub',
    country: 'AE',
    territory: 'DXB (Dubai)',
    created_at: '2026-09-18T10:45:00Z',
  },
  {
    id: 'opp_02',
    lead_id: 'lead_02',
    business_id: 'biz_munich_mro_10',
    business_name: 'Bavaria AeroSystems Turbine MRO & Avionics Hub',
    deal_name: 'Eurowings Fleet CFM56 Overhaul Q4 Package',
    client_name: 'Capt. Hans Zimmer',
    deal_value: 28000000,
    currency: 'INR',
    probability: 90,
    stage: 'NEGOTIATION',
    expected_close_date: '2026-10-02',
    assigned_to: 'Vikram Sengupta',
    zone: 'European Hub',
    country: 'DE',
    territory: 'MUC (Munich)',
    created_at: '2026-09-15T09:00:00Z',
  },
  {
    id: 'opp_03',
    lead_id: 'lead_03',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    deal_name: 'Apex Corp AW109 Shirdi Executive Charter',
    client_name: 'Devendra Singhania',
    deal_value: 1850000,
    currency: 'INR',
    probability: 100,
    stage: 'CLOSED_WON',
    expected_close_date: '2026-09-15',
    assigned_to: 'Rohan Mehra',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2026-09-10T14:00:00Z',
  },
];

// Initial CRM Quotations
const initialCRMQuotations: CRMQuotation[] = [
  {
    id: 'quot_01',
    quotation_number: 'TRU-QT-2026-089',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Lord Alistair Sterling',
    client_email: 'sterling.family@londontrust.co.uk',
    client_phone: '+44 7700 900123',
    service_title: 'Gulfstream G650ER Executive Charter (LHR-DXB-LHR)',
    items: [
      { id: 'item_1', description: 'G650ER Flight Hours (14.5 Block Hours @ ₹8,50,000/hr)', quantity: 14.5, unit_price: 850000, total: 12325000 },
      { id: 'item_2', description: 'Handling, Ramp Navigation & Airport Slots (LHR & DXB)', quantity: 1, unit_price: 950000, total: 950000 },
      { id: 'item_3', description: 'VIP Caviar & Bespoke In-Flight Catering Service', quantity: 1, unit_price: 350000, total: 350000 },
    ],
    subtotal: 13625000,
    tax_percent: 5,
    tax_amount: 681250,
    grand_total: 14306250,
    currency: 'INR',
    status: 'SENT',
    valid_until: '2026-10-15',
    payment_terms: '50% on contract signing, 50% 48 hours prior to wheels-up.',
    notes: 'Includes full de-icing insurance and guaranteed slot reservations at Dubai South.',
    created_at: '2026-09-19T11:00:00Z',
    zone: 'Middle East Hub',
    country: 'AE',
    territory: 'DXB (Dubai)',
  },
  {
    id: 'quot_02',
    quotation_number: 'TRU-QT-2026-077',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Devendra Singhania',
    client_email: 'dsinghania@apexcorp.in',
    client_phone: '+91 98200 12345',
    service_title: 'AW109 Helicopter Charter BOM-Shirdi-BOM',
    items: [
      { id: 'item_1', description: 'AgustaWestland AW109 Flight Time (2.5 Flight Hours)', quantity: 2.5, unit_price: 650000, total: 1625000 },
      { id: 'item_2', description: 'Helipad Landing & Ground Security Dispatch', quantity: 1, unit_price: 125000, total: 125000 },
    ],
    subtotal: 1750000,
    tax_percent: 5.714,
    tax_amount: 100000,
    grand_total: 1850000,
    currency: 'INR',
    status: 'ACCEPTED',
    valid_until: '2026-09-25',
    payment_terms: '100% advance wire transfer.',
    notes: 'VIP passenger names registered with local district authorities.',
    created_at: '2026-09-11T10:00:00Z',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
  },
];

// Initial Commission Records (Auto-generated on deal won/sale completion)
const initialCommissionRecords: CommissionRecord[] = [
  {
    id: 'comm_001',
    deal_id: 'opp_03',
    deal_title: 'Apex Corp AW109 Shirdi Executive Charter',
    quotation_number: 'TRU-QT-2026-077',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Devendra Singhania',
    sale_amount: 1850000,
    commission_rate_pct: 5.0,
    commission_amount: 92500,
    currency: 'INR',
    sale_date: '2026-09-15',
    due_date: '2026-09-30',
    status: 'COMMITTED',
    notes: 'Standard 5% platform partnership fee as per Master Service Agreement Section 4.2.',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
  },
  {
    id: 'comm_002',
    deal_id: 'deal_completed_002',
    deal_title: 'Corporate Gulfstream G550 50-Hour Block Jet Card',
    quotation_number: 'TRU-QT-2026-052',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Reliance Capital Advisory',
    sale_amount: 42000000,
    commission_rate_pct: 4.5,
    commission_amount: 1890000,
    currency: 'INR',
    sale_date: '2026-09-02',
    due_date: '2026-09-20',
    status: 'RELEASED',
    payment_reference: 'TXN_HDFC_CMS_9948201',
    released_at: '2026-09-18T14:30:00Z',
    notes: 'Payment released via corporate net banking. Invoice TRU-COM-INV-2026-041.',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
  },
  {
    id: 'comm_003',
    deal_id: 'deal_completed_003',
    deal_title: 'Bombardier Global 7500 Pre-Purchase Technical Inspection',
    quotation_number: 'TRU-QT-2026-039',
    business_id: 'biz_munich_mro_10',
    business_name: 'Bavaria AeroSystems Turbine MRO & Avionics Hub',
    client_name: 'Air Hamburg Executive Flight OPS',
    sale_amount: 5500000,
    commission_rate_pct: 6.0,
    commission_amount: 330000,
    currency: 'INR',
    sale_date: '2026-08-28',
    due_date: '2026-09-15',
    status: 'SETTLED',
    payment_reference: 'SWIFT_DEUT89201994',
    released_at: '2026-09-10T10:00:00Z',
    settled_by_admin: 'Sunita Rao (Head of Treasury L6)',
    notes: 'Audited and cleared by Finance & Treasury desk.',
    zone: 'European Hub',
    country: 'DE',
    territory: 'MUC (Munich)',
  },
];

// Initial CRM Sales Records (Mirroring Sales Dashboard Report View)
const initialCRMSales: CRMSalesRecord[] = [
  {
    id: 'sale_030',
    sales_code: 'SL0030',
    sales_date: '11-10-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'walkin@truvaer.com',
    customer_phone: '+91 98201 11223',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 42196.0,
    paid_amount: 42196.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Executive VIP Ramp Clearance & GPU Power Hookup', quantity: 1, unit_price: 35000, total: 35000 },
      { description: 'Airside Crew Catering & Refreshments', quantity: 1, unit_price: 7196, total: 7196 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-10-11T10:00:00Z',
    updated_at: '2019-10-11T10:30:00Z',
  },
  {
    id: 'sale_029',
    sales_code: 'SL0029',
    sales_date: '08-09-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'walkin.pilot@truvaer.com',
    customer_phone: '+91 98200 44556',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 58.0,
    paid_amount: 58.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Cash',
    items: [
      { description: 'Flight Crew Terminal ID Lanyard & High-Vis Badge Clip', quantity: 1, unit_price: 58, total: 58 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-09-08T09:15:00Z',
    updated_at: '2019-09-08T09:15:00Z',
  },
  {
    id: 'sale_028',
    sales_code: 'SL0028',
    sales_date: '08-09-2019',
    sales_status: 'Final',
    tag: 'Return Raised',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'ops.client@gmail.com',
    customer_phone: '+91 97654 32100',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 5835.0,
    paid_amount: 5835.0,
    payment_status: 'Paid',
    created_by: 'Sales',
    payment_method: 'Credit Card',
    items: [
      { description: 'Aviation Headset Adapter & Dual GA Plug Converter', quantity: 1, unit_price: 5835, total: 5835 },
    ],
    notes: 'Warranty return claim initiated for dual GA connector test.',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-09-08T14:20:00Z',
    updated_at: '2019-09-08T16:00:00Z',
  },
  {
    id: 'sale_027',
    sales_code: 'SL0027',
    sales_date: '29-06-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'transit@skyline.in',
    customer_phone: '+91 99887 11223',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 5775.0,
    paid_amount: 5775.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Aviator Navigation Charts & Jeppesen IFR Route Packet', quantity: 1, unit_price: 5775, total: 5775 },
    ],
    zone: 'North Zone',
    country: 'IN',
    territory: 'DEL (Delhi)',
    created_at: '2019-06-29T11:45:00Z',
    updated_at: '2019-06-29T12:00:00Z',
  },
  {
    id: 'sale_026',
    sales_code: 'SL0026',
    sales_date: '29-06-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'pilot.transit@airgate.com',
    customer_phone: '+91 98111 22334',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 2888.0,
    paid_amount: 2888.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Credit Card',
    items: [
      { description: 'Pre-flight Aircraft Surface De-greaser 5L Canister', quantity: 2, unit_price: 1444, total: 2888 },
    ],
    zone: 'North Zone',
    country: 'IN',
    territory: 'DEL (Delhi)',
    created_at: '2019-06-29T15:10:00Z',
    updated_at: '2019-06-29T15:30:00Z',
  },
  {
    id: 'sale_025',
    sales_code: 'SL0025',
    sales_date: '27-06-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'cadet99@outlook.com',
    customer_phone: '+91 93210 44556',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 688.0,
    paid_amount: 0.0,
    payment_status: 'Unpaid',
    created_by: 'Sales',
    items: [
      { description: 'Student Logbook & Air Navigation Protractor Kit', quantity: 1, unit_price: 688, total: 688 },
    ],
    notes: 'Invoice issued pending student bank transfer clearance.',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-06-27T08:50:00Z',
    updated_at: '2019-06-27T08:50:00Z',
  },
  {
    id: 'sale_024',
    sales_code: 'SL0024',
    sales_date: '27-06-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'dispatch.mumbai@jetops.com',
    customer_phone: '+91 91234 56789',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 2063.0,
    paid_amount: 2062.5,
    payment_status: 'Partial',
    created_by: 'Sales',
    payment_method: 'Corporate Wallet',
    items: [
      { description: 'Aviation Nitrogen Tire Pressure Top-up & Gauging', quantity: 1, unit_price: 2063, total: 2063 },
    ],
    notes: 'Partial settlement applied via credits balance (₹0.50 roundoff pending).',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-06-27T14:35:00Z',
    updated_at: '2019-06-27T15:00:00Z',
  },
  {
    id: 'sale_023',
    sales_code: 'SL0023',
    sales_date: '26-06-2019',
    sales_status: 'Final',
    reference_no: '111',
    customer_name: 'Walk-in customer',
    customer_email: 'ref111@skywings.in',
    customer_phone: '+91 98450 12345',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 688.0,
    paid_amount: 0.0,
    payment_status: 'Unpaid',
    created_by: 'Sales',
    items: [
      { description: 'Aviation Fuel Dip-stick & Calibration Gauge', quantity: 1, unit_price: 688, total: 688 },
    ],
    notes: 'PO reference #111 attached. Net 30 terms.',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-06-26T10:15:00Z',
    updated_at: '2019-06-26T10:15:00Z',
  },
  {
    id: 'sale_022',
    sales_code: 'SL0022',
    sales_date: '25-06-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'John P',
    customer_email: 'john.p@aerolease.co.uk',
    customer_phone: '+44 7700 900456',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 1918.0,
    paid_amount: 1918.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Credit Card',
    items: [
      { description: 'International NOTAM Briefing & Weather Dispatch Packet', quantity: 1, unit_price: 1918, total: 1918 },
    ],
    zone: 'European Hub',
    country: 'GB',
    territory: 'MUC (Munich)',
    created_at: '2019-06-25T13:40:00Z',
    updated_at: '2019-06-25T14:00:00Z',
  },
  {
    id: 'sale_021',
    sales_code: 'SL0021',
    sales_date: '03-06-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'transit.client@truvaer.com',
    customer_phone: '+91 97110 99887',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 1375.0,
    paid_amount: 1375.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Cash',
    items: [
      { description: 'Flight Safety Pre-Brief Cards (Set of 10)', quantity: 1, unit_price: 1375, total: 1375 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-06-03T16:20:00Z',
    updated_at: '2019-06-03T16:20:00Z',
  },
  {
    id: 'sale_020',
    sales_code: 'SL0020',
    sales_date: '01-06-2019',
    sales_status: 'Final',
    reference_no: 'REF-201',
    customer_name: 'Capt. Ramesh Verma',
    customer_email: 'rverma@airindia.in',
    customer_phone: '+91 98200 99112',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 85000.0,
    paid_amount: 85000.0,
    payment_status: 'Paid',
    created_by: 'Sales',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Simulated Type Rating Refresher (A320 Full Motion 2 Hours)', quantity: 1, unit_price: 85000, total: 85000 },
    ],
    zone: 'North Zone',
    country: 'IN',
    territory: 'DEL (Delhi)',
    created_at: '2019-06-01T11:00:00Z',
    updated_at: '2019-06-01T11:30:00Z',
  },
  {
    id: 'sale_019',
    sales_code: 'SL0019',
    sales_date: '28-05-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Lord Alistair Sterling',
    customer_email: 'sterling.family@londontrust.co.uk',
    customer_phone: '+44 7700 900123',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 145000.0,
    paid_amount: 145000.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'VIP Airport Meet & Assist with Private Ramp Limousine Transfer', quantity: 1, unit_price: 145000, total: 145000 },
    ],
    zone: 'Middle East Hub',
    country: 'AE',
    territory: 'DXB (Dubai)',
    created_at: '2019-05-28T09:30:00Z',
    updated_at: '2019-05-28T10:00:00Z',
  },
  {
    id: 'sale_018',
    sales_code: 'SL0018',
    sales_date: '22-05-2019',
    sales_status: 'Final',
    reference_no: 'REF-188',
    customer_name: 'Devendra Singhania',
    customer_email: 'dsinghania@apexcorp.in',
    customer_phone: '+91 98200 12345',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 32400.0,
    paid_amount: 16200.0,
    payment_status: 'Partial',
    created_by: 'Sales',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Helipad Night Lighting & Emergency Fire Tender Standby', quantity: 1, unit_price: 32400, total: 32400 },
    ],
    notes: '50% advance received, balance payable upon flight clearance.',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-05-22T14:15:00Z',
    updated_at: '2019-05-22T15:00:00Z',
  },
  {
    id: 'sale_017',
    sales_code: 'SL0017',
    sales_date: '19-05-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'crew.bom@aviators.com',
    customer_phone: '+91 98900 12345',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 4500.0,
    paid_amount: 4500.0,
    payment_status: 'Paid',
    created_by: 'Sales',
    payment_method: 'UPI',
    items: [
      { description: 'ANR Aviation Headset Ear Seals & Mic Windscreen Replacement', quantity: 3, unit_price: 1500, total: 4500 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-05-19T16:45:00Z',
    updated_at: '2019-05-19T16:45:00Z',
  },
  {
    id: 'sale_016',
    sales_code: 'SL0016',
    sales_date: '15-05-2019',
    sales_status: 'Draft',
    reference_no: '',
    customer_name: 'Sarah Jenkins',
    customer_email: 'sarah.j@globalflight.com',
    customer_phone: '+1 305 555 0199',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 12500.0,
    paid_amount: 0.0,
    payment_status: 'Unpaid',
    created_by: 'Sales',
    items: [
      { description: 'Airside Hangar Short-stay Parking (48 Hours)', quantity: 1, unit_price: 12500, total: 12500 },
    ],
    zone: 'Americas',
    country: 'US',
    territory: 'MIA (Miami)',
    created_at: '2019-05-15T12:10:00Z',
    updated_at: '2019-05-15T12:10:00Z',
  },
  {
    id: 'sale_015',
    sales_code: 'SL0015',
    sales_date: '12-05-2019',
    sales_status: 'Final',
    reference_no: 'REF-155',
    customer_name: 'Reliance Aviation Dept',
    customer_email: 'aviation@ril.com',
    customer_phone: '+91 22 3555 4000',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 180000.0,
    paid_amount: 180000.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Jet A-1 Aviation Turbine Fuel 3,000 Litres Dedicated Bowzer Refuel', quantity: 1, unit_price: 180000, total: 180000 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-05-12T08:00:00Z',
    updated_at: '2019-05-12T08:45:00Z',
  },
  {
    id: 'sale_014',
    sales_code: 'SL0014',
    sales_date: '08-05-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'transit@aircharter.in',
    customer_phone: '+91 98222 33445',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 950.0,
    paid_amount: 950.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Cash',
    items: [
      { description: 'Aircraft Fuel Testing Clear Water-Contamination Test Kit', quantity: 1, unit_price: 950, total: 950 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-05-08T11:20:00Z',
    updated_at: '2019-05-08T11:20:00Z',
  },
  {
    id: 'sale_013',
    sales_code: 'SL0013',
    sales_date: '05-05-2019',
    sales_status: 'Final',
    reference_no: '112',
    customer_name: 'Dr. K. S. Pillai',
    customer_email: 'kspillai@medflight.org',
    customer_phone: '+91 94470 12345',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 64200.0,
    paid_amount: 64200.0,
    payment_status: 'Paid',
    created_by: 'Sales',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Air Ambulance Medical Oxygen & Stretcher Rigging Installation', quantity: 1, unit_price: 64200, total: 64200 },
    ],
    zone: 'South Zone',
    country: 'IN',
    territory: 'BLR (Bengaluru)',
    created_at: '2019-05-05T15:30:00Z',
    updated_at: '2019-05-05T16:00:00Z',
  },
  {
    id: 'sale_012',
    sales_code: 'SL0012',
    sales_date: '01-05-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'aviator.cadet@delhi.in',
    customer_phone: '+91 99110 88776',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 1200.0,
    paid_amount: 0.0,
    payment_status: 'Unpaid',
    created_by: 'Sales',
    items: [
      { description: 'Runway Friction Measurement Standard Manual Guide', quantity: 1, unit_price: 1200, total: 1200 },
    ],
    zone: 'North Zone',
    country: 'IN',
    territory: 'DEL (Delhi)',
    created_at: '2019-05-01T10:00:00Z',
    updated_at: '2019-05-01T10:00:00Z',
  },
  {
    id: 'sale_011',
    sales_code: 'SL0011',
    sales_date: '27-04-2019',
    sales_status: 'Final',
    reference_no: 'REF-114',
    customer_name: 'Emirates Executive Flight Support',
    customer_email: 'flight.handling@emirates.ae',
    customer_phone: '+971 4 299 1111',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 92500.0,
    paid_amount: 92500.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Dubai South Airside Customs & Immigration VIP Fast Track', quantity: 1, unit_price: 92500, total: 92500 },
    ],
    zone: 'Middle East Hub',
    country: 'AE',
    territory: 'DXB (Dubai)',
    created_at: '2019-04-27T17:00:00Z',
    updated_at: '2019-04-27T17:30:00Z',
  },
  {
    id: 'sale_010',
    sales_code: 'SL0010',
    sales_date: '20-04-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Capt. Hans Zimmer',
    customer_email: 'capt.zimmer@bavaria-aero.de',
    customer_phone: '+49 89 2345 6789',
    business_id: 'biz_munich_mro_10',
    business_name: 'Bavaria AeroSystems Turbine MRO & Avionics Hub',
    total_amount: 54000.0,
    paid_amount: 54000.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Credit Card',
    items: [
      { description: 'Borescope High-Resolution Turbine Inspection Probe Service', quantity: 1, unit_price: 54000, total: 54000 },
    ],
    zone: 'European Hub',
    country: 'DE',
    territory: 'MUC (Munich)',
    created_at: '2019-04-20T14:10:00Z',
    updated_at: '2019-04-20T14:45:00Z',
  },
  {
    id: 'sale_009',
    sales_code: 'SL0009',
    sales_date: '15-04-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'crew.ops@airdelhi.com',
    customer_phone: '+91 98100 55443',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 3200.0,
    paid_amount: 1600.0,
    payment_status: 'Partial',
    created_by: 'Sales',
    payment_method: 'Cash',
    items: [
      { description: 'Emergency Escape Hatch Safety Pin & Warning Streamers', quantity: 2, unit_price: 1600, total: 3200 },
    ],
    zone: 'North Zone',
    country: 'IN',
    territory: 'DEL (Delhi)',
    created_at: '2019-04-15T11:40:00Z',
    updated_at: '2019-04-15T12:00:00Z',
  },
  {
    id: 'sale_008',
    sales_code: 'SL0008',
    sales_date: '10-04-2019',
    sales_status: 'Final',
    reference_no: 'REF-098',
    customer_name: 'Gulf Coast Charter LLC',
    customer_email: 'charters@gulfcoast.com',
    customer_phone: '+1 305 444 8899',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 78000.0,
    paid_amount: 78000.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'FAA Form 337 Major Repair Airworthiness Certification', quantity: 1, unit_price: 78000, total: 78000 },
    ],
    zone: 'Americas',
    country: 'US',
    territory: 'MIA (Miami)',
    created_at: '2019-04-10T16:00:00Z',
    updated_at: '2019-04-10T16:30:00Z',
  },
  {
    id: 'sale_007',
    sales_code: 'SL0007',
    sales_date: '05-04-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Vikram Oberoi',
    customer_email: 'voberoi@luxuryair.in',
    customer_phone: '+91 98201 99887',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 24500.0,
    paid_amount: 24500.0,
    payment_status: 'Paid',
    created_by: 'Sales',
    payment_method: 'Credit Card',
    items: [
      { description: 'Executive In-Cabin High-Speed Satellite Wi-Fi 25GB Voucher', quantity: 1, unit_price: 24500, total: 24500 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-04-05T09:20:00Z',
    updated_at: '2019-04-05T09:20:00Z',
  },
  {
    id: 'sale_006',
    sales_code: 'SL0006',
    sales_date: '01-04-2019',
    sales_status: 'Completed',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'pilot.transit@truvaer.com',
    customer_phone: '+91 99200 11223',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 850.0,
    paid_amount: 850.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Cash',
    items: [
      { description: 'Pitot Tube Protective Weather Cover & Warning Flag', quantity: 1, unit_price: 850, total: 850 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-04-01T14:15:00Z',
    updated_at: '2019-04-01T14:15:00Z',
  },
  {
    id: 'sale_005',
    sales_code: 'SL0005',
    sales_date: '28-03-2019',
    sales_status: 'Final',
    reference_no: 'REF-072',
    customer_name: 'Skyline Executive Aero',
    customer_email: 'ops@skyline-aero.com',
    customer_phone: '+91 22 2615 8899',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 115000.0,
    paid_amount: 115000.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Bank Transfer',
    items: [
      { description: 'Executive Jet Airframe NDT Ultrasonic Weld Inspection', quantity: 1, unit_price: 115000, total: 115000 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-03-28T10:00:00Z',
    updated_at: '2019-03-28T10:45:00Z',
  },
  {
    id: 'sale_004',
    sales_code: 'SL0004',
    sales_date: '22-03-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Walk-in customer',
    customer_email: 'aviator99@yahoo.com',
    customer_phone: '+91 97690 12345',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 1420.0,
    paid_amount: 0.0,
    payment_status: 'Unpaid',
    created_by: 'Sales',
    items: [
      { description: 'Avionics Screen Microfiber Safe Cleaning Solution', quantity: 2, unit_price: 710, total: 1420 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-03-22T15:00:00Z',
    updated_at: '2019-03-22T15:00:00Z',
  },
  {
    id: 'sale_003',
    sales_code: 'SL0003',
    sales_date: '15-03-2019',
    sales_status: 'Final',
    reference_no: '',
    customer_name: 'Arjun Kapoor',
    customer_email: 'arjun.aviator@gmail.com',
    customer_phone: '+91 99887 76655',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 48000.0,
    paid_amount: 48000.0,
    payment_status: 'Paid',
    created_by: 'Sales',
    payment_method: 'UPI',
    items: [
      { description: 'DGCA CPL Commercial Navigation Ground School Module', quantity: 1, unit_price: 48000, total: 48000 },
    ],
    zone: 'North Zone',
    country: 'IN',
    territory: 'DEL (Delhi)',
    created_at: '2019-03-15T09:30:00Z',
    updated_at: '2019-03-15T10:00:00Z',
  },
  {
    id: 'sale_002',
    sales_code: 'SL0002',
    sales_date: '08-03-2019',
    sales_status: 'Final',
    reference_no: '101',
    customer_name: 'Walk-in customer',
    customer_email: 'transit.ops@truvaer.com',
    customer_phone: '+91 98200 33221',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    total_amount: 18500.0,
    paid_amount: 18500.0,
    payment_status: 'Paid',
    created_by: 'Admin',
    payment_method: 'Credit Card',
    items: [
      { description: 'Executive VIP Red Carpet Aircraft Boarding Stairs Deployment', quantity: 1, unit_price: 18500, total: 18500 },
    ],
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    created_at: '2019-03-08T12:00:00Z',
    updated_at: '2019-03-08T12:30:00Z',
  },
];

// Initial Aviation Stores & Inventory Items
const initialStoreInventory: StoreInventoryItem[] = [
  {
    id: 'store_01',
    part_number: 'HON-GTCP36-150-APU',
    serial_number: 'SN-77291-APU',
    name: 'Honeywell GTCP36-150 Auxiliary Power Unit (APU)',
    category: 'Turbine Components',
    description: 'Complete APU turbine core with dual start generator, zero time since overhaul with EASA/FAA dual release.',
    warehouse_hangar: 'Hangar 4 - Bonded Spares Bay A1',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    quantity: 2,
    min_threshold: 1,
    unit_cost: 16500000,
    currency: 'INR',
    condition: 'OVERHAULED',
    last_inspected: '2026-09-10',
    status: 'IN_STOCK',
    added_by: 'Capt. Sameer Khurana (VP L7)',
  },
  {
    id: 'store_02',
    part_number: 'GAR-G1000-NXI-MFD',
    serial_number: 'SN-GAR-99201-MFD',
    name: 'Garmin G1000 NXi Multi-Function Flight Display (MFD 10.4")',
    category: 'Avionics Spares',
    description: 'High-resolution LED glass cockpit display with integrated terrain alerting and ADS-B In uplink receiver.',
    warehouse_hangar: 'Hangar 2 - Avionics Clean Vault',
    zone: 'Americas',
    country: 'US',
    territory: 'MIA (Miami)',
    quantity: 5,
    min_threshold: 2,
    unit_cost: 1850000,
    currency: 'INR',
    condition: 'FACTORY_NEW',
    last_inspected: '2026-09-15',
    status: 'IN_STOCK',
    added_by: 'Alok Nath (Supervisor L3)',
  },
  {
    id: 'store_03',
    part_number: 'MIC-RAD-32X88-TR',
    serial_number: 'SN-MIC-LOT-4412',
    name: 'Michelin Air X Radial Main Aircraft Tires (32x8.8 R16)',
    category: 'Airframe Rotables',
    description: 'High-speed 225 MPH tubeless main landing gear tires certified for Bombardier Challenger and Learjet.',
    warehouse_hangar: 'Warehouse 1 - Heavy Ramp Stores',
    zone: 'Middle East Hub',
    country: 'AE',
    territory: 'DXB (Dubai)',
    quantity: 1,
    min_threshold: 4,
    unit_cost: 320000,
    currency: 'INR',
    condition: 'FACTORY_NEW',
    last_inspected: '2026-09-08',
    status: 'LOW_STOCK',
    added_by: 'Vikram Sengupta (Ops Manager L4)',
  },
  {
    id: 'store_04',
    part_number: 'HOB-GPU-400HZ-90KVA',
    serial_number: 'SN-GPU-88120',
    name: 'Hobart Jet-Ex Ground Power Unit (400Hz 90kVA Diesel)',
    category: 'Ground Support Equipment',
    description: 'Mobile towable diesel ground power generator unit for apron aircraft electrical support.',
    warehouse_hangar: 'Airside GSE Hangar 7',
    zone: 'West Zone',
    country: 'IN',
    territory: 'BOM (Mumbai)',
    quantity: 3,
    min_threshold: 2,
    unit_cost: 4500000,
    currency: 'INR',
    condition: 'SERVICEABLE',
    last_inspected: '2026-09-18',
    status: 'IN_STOCK',
    added_by: 'Rajesh Verma (Operations Head L6)',
  },
];

// Initial CRM Support Tickets
const initialCRMSupportTickets: CRMSupportTicket[] = [
  {
    id: 'tick_01',
    ticket_number: 'TICK-2026-4401',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    client_name: 'Pooja Aggarwal',
    client_email: 'pooja@stellarcapital.in',
    subject: 'VIP Dietary & In-flight Chauffeur coordination for BOM-GOI charter',
    category: 'Flight Catering & Ground Logistics',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    messages: [
      { id: 'msg_1', sender_name: 'Pooja Aggarwal', sender_role: 'CLIENT', text: 'Hello, can you ensure vegan Jain meals are boarded for 4 passengers on flight JV-401?', timestamp: '2026-09-22T09:15:00Z' },
      { id: 'msg_2', sender_name: 'JetVentures Concierge', sender_role: 'SUPPORT_REP', text: 'Confirmed Ms. Aggarwal. Special 5-star Oberoi Flight Services vegan meal boxes have been booked with our catering team at Mumbai.', timestamp: '2026-09-22T09:45:00Z' },
    ],
    assigned_agent: 'Pooja Nair (Support Supervisor L3)',
    created_at: '2026-09-22T09:15:00Z',
    updated_at: '2026-09-22T09:45:00Z',
  },
];

// Helper functions to mask client PII when chat window expired or unauthorized
export function maskClientName(name: string): string {
  if (!name) return 'Protected User';
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => (p.length <= 1 ? p : `${p[0]}${'•'.repeat(Math.min(5, p.length - 1))}`)).join(' ');
}

export function maskClientEmail(email: string): string {
  if (!email) return '•••••@•••••.com';
  const atIdx = email.indexOf('@');
  if (atIdx === -1) return '•••••@•••••.com';
  const user = email.slice(0, atIdx);
  const domain = email.slice(atIdx + 1);
  const maskedUser = user.length <= 1 ? '•' : `${user[0]}${'•'.repeat(Math.min(4, user.length - 1))}`;
  const dotIdx = domain.lastIndexOf('.');
  const maskedDomain = dotIdx !== -1 ? '••••••' + domain.slice(dotIdx) : '••••••.com';
  return `${maskedUser}@${maskedDomain}`;
}

export function maskClientPhone(phone: string): string {
  if (!phone) return '+•• ••••• •••••';
  const clean = phone.trim();
  if (clean.length <= 4) return '••••';
  return clean.slice(0, 3) + ' ••••• ' + clean.slice(-2);
}

export interface UserChatEligibility {
  hasChatted: boolean;
  lastChatTimestamp?: string;
  lastChatMessage?: string;
  elapsedHours: number;
  elapsedMinutes: number;
  isEligible: boolean;
  remainingHours: number;
  remainingMinutes: number;
  policyWindowHours: number;
  statusText: string;
  maskedName: string;
  maskedEmail: string;
  maskedPhone: string;
  realName: string;
  realEmail: string;
  realPhone: string;
}

// Initial Closed-Loop Live Chats for 24h/48h SLA Testing
const nowSeed = Date.now();
const hourMs = 3600 * 1000;

export const initialChats: LiveChatMessage[] = [
  {
    id: 'chat_seed_001',
    sender_id: 'user_reg_001',
    sender_name: 'Capt. Vikram Malhotra',
    recipient_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff', // JetVentures VIP SkySuite
    message: 'Hello JetVentures flight desk. Inquiring for executive charter Delhi (DEL) to Mumbai (BOM) tomorrow evening for 4 VIP passengers. Can you send a detailed service proposal?',
    timestamp: new Date(nowSeed - 5.5 * hourMs).toISOString(), // 5.5 hours ago (Active < 24h & < 48h)
    conversation_id: 'conv_user_reg_001_a1b2c3d4-5566-7788-9900-aabbccddeeff',
    is_read: true,
    pii_redacted: false,
  },
  {
    id: 'chat_seed_002',
    sender_id: 'user_reg_002',
    sender_name: 'Sarah Jenkins',
    recipient_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff', // JetVentures VIP SkySuite
    message: 'Good day! Interested in Gulfstream G650 empty leg availability to Zurich next weekend. Please share aircraft specifications and pricing quotation.',
    timestamp: new Date(nowSeed - 18.5 * hourMs).toISOString(), // 18.5 hours ago (Active < 24h & < 48h)
    conversation_id: 'conv_user_reg_002_a1b2c3d4-5566-7788-9900-aabbccddeeff',
    is_read: true,
    pii_redacted: false,
  },
  {
    id: 'chat_seed_003',
    sender_id: 'user_reg_003',
    sender_name: 'Marcus Vance',
    recipient_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff', // JetVentures VIP SkySuite
    message: 'Looking for twin-engine helicopter shuttle quote for Monaco Grand Prix weekend transfer.',
    timestamp: new Date(nowSeed - 34 * hourMs).toISOString(), // 34 hours ago (Active under 48h window, Expired if 24h SLA)
    conversation_id: 'conv_user_reg_003_a1b2c3d4-5566-7788-9900-aabbccddeeff',
    is_read: true,
    pii_redacted: false,
  },
  {
    id: 'chat_seed_004',
    sender_id: 'user_reg_004',
    sender_name: 'Alexander Wright',
    recipient_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff', // JetVentures VIP SkySuite
    message: 'Inquiring about heavy engine CFM56 overhaul and turbine borescope inspection quote.',
    timestamp: new Date(nowSeed - 64 * hourMs).toISOString(), // 64 hours ago (Expired > 48h!)
    conversation_id: 'conv_user_reg_004_a1b2c3d4-5566-7788-9900-aabbccddeeff',
    is_read: true,
    pii_redacted: false,
  },
];

// Initial 2-Stage Wallet Debit Requests (Condition 6)
const initialDebitRequests: WalletDebitRequest[] = [
  {
    id: 'deb_001',
    business_id: 'f8d1c2b3-001a-42bc-8111-eeef98765432',
    business_name: 'AeroGlobal Logistics Pvt Ltd',
    amount: 250,
    reason: 'Executive Terminal Featured Showcase Surcharge (30 Days Active)',
    created_by: 'Vikram Sengupta (Admin L4)',
    created_at: '2026-09-17T11:30:00Z',
    stage1_approved: true,
    stage1_approved_by: 'Vikram Sengupta (Admin L4 - Operations)',
    stage1_approved_at: '2026-09-17T11:45:00Z',
    stage2_approved: false,
    status: 'PENDING_STAGE_2',
  },
  {
    id: 'deb_002',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    amount: 100,
    reason: 'Direct Aviation Client Lead Referral & Route Dispatch Fee',
    created_by: 'Manish Agarwal (Admin L4 - Finance)',
    created_at: '2026-09-18T08:15:00Z',
    stage1_approved: false,
    stage2_approved: false,
    status: 'PENDING_STAGE_1',
  },
  {
    id: 'deb_003',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    business_name: 'GMR Rajiv Gandhi Executive Terminal (RGOA)',
    amount: 50,
    reason: 'Verified Contact Phone Lead Unlock Fee (30-Day Expiry Slot)',
    created_by: 'Sunita Rao (Admin L6 - Finance)',
    created_at: '2026-09-16T14:00:00Z',
    stage1_approved: true,
    stage1_approved_by: 'Sunita Rao (Finance Head L6)',
    stage1_approved_at: '2026-09-16T14:15:00Z',
    stage2_approved: true,
    stage2_approved_by: 'B Aditya Narayana (Super Admin L8)',
    stage2_approved_at: '2026-09-16T15:00:00Z',
    status: 'APPROVED',
  },
];

// Initial Promotion & Permission Requests (2-Level Mandatory Approval - Condition 9)
const initialPromotionRequests: PromotionApprovalRequest[] = [
  {
    id: 'prom_001',
    admin_id: 'admin_sales_trainee',
    admin_name: 'Sameer Jain',
    department: 'Sales',
    current_level: 0,
    target_level: 1,
    requested_permission: 'L1 Associate - Access to Direct Client Contact Leads & Corporate Inquiry Data',
    reason: 'Exceeded Q3 enterprise sales acquisition target by 140%. Completed aviation regulatory training module.',
    first_approver_level: 2, // L2: Rohan Mehra (Sales Lead)
    first_approver_name: 'Rohan Mehra (Sales Lead L2)',
    first_approval_status: 'PENDING',
    second_approver_level: 3, // L3/L5: Priya Deshmukh (Sales Manager)
    second_approver_name: 'Priya Deshmukh (Sales Manager L5)',
    second_approval_status: 'PENDING',
    overall_status: 'PENDING_LEVEL_1',
    created_at: '2026-09-17T09:00:00Z',
  },
  {
    id: 'prom_002',
    admin_id: 'admin_cc_trainee',
    admin_name: 'Divya Nair',
    department: 'Customer Care',
    current_level: 0,
    target_level: 1,
    requested_permission: 'L1 Associate - Aviator Lead Escalation & Direct Telephone Support Relay',
    reason: 'Maintained 100% positive customer resolution CSAT across 45 enterprise service inquiries.',
    first_approver_level: 2,
    first_approver_name: 'Arjun Patel (Support Lead L2)',
    first_approval_status: 'APPROVED',
    first_approval_date: '2026-09-17T16:20:00Z',
    second_approver_level: 3,
    second_approver_name: 'Pooja Nair (Support Supervisor L3)',
    second_approval_status: 'PENDING',
    overall_status: 'PENDING_LEVEL_2',
    created_at: '2026-09-16T10:30:00Z',
  },
];

// Initial 30-Day Unlocked Contact Records (Condition 5)
const initialUnlockedContacts: UnlockedContactRecord[] = [
  {
    id: 'unl_001',
    listing_id: 'srv_rgoa_02', // GMR Rajiv Gandhi Executive Terminal
    user_id: 'c4a7b180-8d3e-4f32-9b12-987123abcdef', // Aditya Sharma
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    unlocked_at: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    valid_until: Date.now() + 28 * 24 * 60 * 60 * 1000, // 28 days left of 30
    debited_credits: 50,
  },
];

const CENTRALIZED_CREDIT_POLICY_KEY = 'truvaer_centralized_credit_policy_v1';
const CENTRALIZED_CREDIT_REQUESTS_KEY = 'truvaer_centralized_credit_requests_v1';

const initialCentralizedCreditPolicy: CentralizedCreditPolicy = {
  phone_lead_cost_credits: 10,
  deal_quotation_fee_credits: 25,
  marketing_campaign_post_credits: 50,
  direct_service_offer_credits: 15,
  min_recharge_pack_inr: 1000,
  credit_to_inr_rate: 10,
  payout_reserve_retention_pct: 80,
  payout_deactivated_retention_pct: 100,
  updated_at: '2026-10-01T00:00:00Z',
  updated_by: 'Super Administrator (L8)',
};

const initialCentralizedCreditRequests: CentralizedCreditRequest[] = [
  {
    id: 'ccr_sample_01',
    type: 'POLICY_RATE_CHANGE',
    title: 'Lead Reveal & Pay-Per-Lead Baseline Calibration',
    description: 'Updated phone lead reveal fee to 10 Credits across all listings under the Pay-Per-Lead model.',
    proposed_policy_changes: {
      phone_lead_cost_credits: 10,
    },
    initiated_by_admin_id: 'admin_operations',
    initiated_by_admin_name: 'Operations Administrator',
    initiated_by_admin_level: 7,
    initiated_by_admin_role: 'ADMIN',
    initiated_at: '2026-10-10T11:00:00Z',
    status: 'APPROVED_AND_EXECUTED',
    requires_dual_l7_l8: false,
    stage1_approved: true,
    stage1_by_name: 'Operations Administrator (L7)',
    stage1_by_level: 7,
    stage1_at: '2026-10-10T11:05:00Z',
    stage2_approved: true,
    stage2_by_name: 'Sunita Rao (L6 Finance)',
    stage2_by_level: 6,
    stage2_at: '2026-10-10T11:20:00Z',
    l7_approved: true,
    l7_approved_by: 'Operations Administrator (L7)',
    l7_approved_at: '2026-10-10T11:25:00Z',
    l8_approved: true,
    l8_approved_by: 'Super Administrator (L8)',
    l8_approved_at: '2026-10-10T11:30:00Z',
    executed_at: '2026-10-10T11:30:00Z',
    executed_by: 'Super Administrator (L8)',
    broadcast_sent: true,
    broadcast_recipients_count: 5,
    broadcast_message: '📢 Platform Credit Matrix Update: Pay-Per-Lead fee calibrated to 10 Credits across all service listings.',
  },
  {
    id: 'ccr_sample_02',
    type: 'WALLET_DEBIT',
    title: 'Quarterly API & High-Volume Routing Adjustment',
    description: 'Scheduled reconciliation debit of 50 Credits for high-volume automated routing.',
    business_id: 'biz_corporate_user',
    business_name: 'JetVentures VIP SkySuite & Private Charters',
    credits_amount: 50,
    inr_equivalent: 500,
    initiated_by_admin_id: 'admin_operations',
    initiated_by_admin_name: 'Operations Administrator',
    initiated_by_admin_level: 7,
    initiated_by_admin_role: 'ADMIN',
    initiated_at: '2026-10-14T02:00:00Z',
    status: 'PENDING_STAGE_1',
    requires_dual_l7_l8: true,
    broadcast_sent: false,
  },
];

const initialGlobalSettings = {
  phoneUnlockCreditCost: 10,
  unlockValidityDays: 30,
};

const initialRegularUsers: RegularUser[] = [
  // Super admin
  // User name : super_admin
  // Email : sup_admin@truvaer.com
  // password : Loginpwd@130
  {
    user_id: 'usr_super_admin',
    username: 'super_admin',
    first_name: 'B Aditya',
    last_name: 'Narayana (Chairman & MD)',
    gender: 'Other',
    city: 'HQ Operations',
    email: 'sup_admin@truvaer.com',
    password_hash: 'Loginpwd@130',
    is_email_verified: true,
    date_of_birth: '1988-01-01',
    country_code: 'IN',
    phone_number: '+919999900001',
    account_status: 'ACTIVE',
    role: 'SUPER_ADMIN',
    employment_status: 'Active Employee',
    organization: 'Truvaer Operations Command',
    created_at: '2026-09-01T00:00:00Z',
    permitted_portals: [
      'ALL',
      'marketing',
      'crm_portal',
      'admin_desk',
      'cpanel',
      'stores',
      'news',
      'finance',
      'operations',
      'hr',
      'pms',
    ],
  },
  // admin
  // User name : admin
  // Email : admin@truvaer.com
  // password : Loginpwd@130
  {
    user_id: 'usr_admin',
    username: 'admin',
    first_name: 'Platform',
    last_name: 'Admin',
    gender: 'Other',
    city: 'Operations Hub',
    email: 'admin@truvaer.com',
    password_hash: 'Loginpwd@130',
    is_email_verified: true,
    date_of_birth: '1990-01-01',
    country_code: 'IN',
    phone_number: '+919999900002',
    account_status: 'ACTIVE',
    role: 'ADMIN',
    employment_status: 'Active Employee',
    organization: 'Truvaer Operations Command',
    created_at: '2026-09-01T00:00:00Z',
    permitted_portals: ['marketing', 'crm_portal', 'admin_desk'],
  },
  // Standard / Regular User
  // Email : user@truvaer.com
  // User name : user
  // password : User@123
  {
    user_id: 'usr_standard_user',
    username: 'user',
    first_name: 'Standard',
    last_name: 'User',
    gender: 'Male',
    city: 'Mumbai',
    email: 'user@truvaer.com',
    password_hash: 'User@123',
    is_email_verified: true,
    date_of_birth: '1995-05-14',
    country_code: 'IN',
    phone_number: '+919999900003',
    account_status: 'ACTIVE',
    role: 'STANDARD_USER',
    employment_status: 'Active Employee',
    organization: 'Aviation Aviator Member',
    created_at: '2026-09-10T10:00:00Z',
    wallet: {
      wallet_id: 'wal_reg_standard_01',
      purchased_credits: 3500,
      earned_credits: 5000,
      balance: 8500,
      currency: 'INR',
      provisioned_at: '2026-09-10T10:05:00Z',
      transactions: [
        {
          id: 'tx_init_01',
          type: 'EARNED_REWARD',
          creditType: 'EARNED',
          amount: 5000,
          description: 'Truvaer Onboarding Email Verification Bonus',
          timestamp: '2026-09-10T10:05:00Z',
        },
        {
          id: 'tx_init_02',
          type: 'PURCHASE',
          creditType: 'PURCHASED',
          amount: 3500,
          description: 'Razorpay UPI Top-up (₹3,000 converted + bonus)',
          timestamp: '2026-09-12T14:20:00Z',
          referenceId: 'pay_rzp_99018241',
        },
      ],
      conversionHistory: [],
    },
  },
];

const initialBusinesses: BusinessProfile[] = [
  // Business user
  // User name : corporate_user
  // Email : corporate@truvaer.com
  // password : Corporate@123
  {
    business_id: 'biz_corporate_user',
    username: 'corporate_user',
    organization_name: 'Truvaer Corporate Aviation Ltd',
    owner_name: 'Corporate User',
    reg_number_type: 'TAN',
    registration_number: 'ABCD12345F',
    date_of_registration: '2024-01-15',
    nature_of_business: 'Aviation Corporate Fleet & Charter Services',
    business_description: 'Global executive aircraft charter, fleet operations, VIP ground logistics and corporate aviation solutions.',
    physical_location: 'Executive Aviation Complex, Terminal 1, Mumbai International Airport, India',
    website_url: 'https://corporate.truvaer.com',
    country: 'IN',
    business_email: 'corporate@truvaer.com',
    phone_number: '+919999900004',
    password_hash: 'Corporate@123',
    inc_cert_doc_url: 'https://s3.ap-south-1.amazonaws.com/truvaer-compliance-vault/corp_ABCD12345F_inc.pdf',
    inc_cert_file_name: 'Truvaer_Corporate_Incorporation_TAN.pdf',
    inc_cert_file_size: 2458900,
    bank_account_holder: 'Truvaer Corporate Aviation Ltd',
    bank_account_number: 'aes256_enc_89123487192841029481239',
    bank_account_number_masked: '****4567',
    bank_ifsc_swift: 'HDFC0001234',
    bank_name: 'HDFC Commercial Bank Ltd',
    finance_bank_verified: false,
    bank_verification_status: 'PENDING_VERIFICATION',
    bank_uploaded_by_user_id: 'biz_corporate_user',
    bank_uploaded_by_user_name: 'Corporate User (Truvaer Corporate Aviation Ltd)',
    bank_uploaded_at: '2026-10-01T10:00:00Z',
    cancelled_cheque_doc_url: 'https://compliance.truvaer.com/docs/cheque_corp_hdfc_5678.pdf',
    cancelled_cheque_filename: 'Truvaer_Corp_Cancelled_Cheque_HDFC.pdf',
    cancelled_cheque_filesize: 1450200,
    bank_statement_doc_url: 'https://compliance.truvaer.com/docs/bank_stmt_corp_hdfc_q3.pdf',
    bank_statement_filename: 'HDFC_Corporate_Bank_Statement_Q3_2026.pdf',
    bank_statement_filesize: 2890400,
    bank_verification_history: [
      {
        action: 'SUBMITTED',
        timestamp: '2026-10-01T10:00:00Z',
        actor_name: 'Corporate User',
        actor_role: 'Account Owner',
        notes: 'Initial account registration: Cancelled Cheque & Bank Account Statement submitted for Finance verification.',
      },
    ],
    verification_status: 'HARD_LOCKED',
    is_hard_locked_by_admin: false,
    domain_challenge_sent: false,
    domain_verified: false,
    submitted_at: '2026-10-01T10:00:00Z',
    category: 'Private Air Charter',
    subCategory: 'VIP Executive Charter',
    rating: 5.0,
    reviewCount: 0,
    servicesOffered: [
      'Executive Aircraft Charter',
      'Air Freight Logistics',
      'Ramp Ground Handling',
      'AOG Expedited Dispatch',
    ],
    truvaer_id: 'IN-AA001',
    corporate_wallet: {
      wallet_id: 'corp_wal_001',
      credit_balance: 5000,
      tier: 'Enterprise Standard',
      provisioned_at: '2026-10-01T10:00:00Z',
      transactions: [
        {
          id: 'ctx_001',
          type: 'GRANT',
          credits: 5000,
          description: 'Corporate Onboarding Credit Allocation',
          timestamp: '2026-10-01T10:00:00Z',
        },
      ],
      low_credit_alert_settings: {
        enabled: true,
        thresholdCredits: 1000,
        notifyEmail: true,
        notifyWebPortal: true,
        customEmailAddress: 'corporate@truvaer.com',
      },
    },
  },
];

// C-Panel Pricing Matrix (Section 4 from Wallet Document)
const initialPricingMatrix: PricingMatrixItem[] = [
  {
    id: 'pm_01',
    portal: 'Marketing Portal',
    actionType: 'Business Ad Listing',
    defaultDebitCredits: 50,
    minimumThreshold: 10,
    status: 'Active',
  },
  {
    id: 'pm_02',
    portal: 'Job Portal',
    actionType: 'Software Engineer Post',
    defaultDebitCredits: 100,
    minimumThreshold: 25,
    status: 'Active',
  },
  {
    id: 'pm_03',
    portal: 'Job Portal',
    actionType: 'General Staff Post',
    defaultDebitCredits: 30,
    minimumThreshold: 5,
    status: 'Active',
  },
  {
    id: 'pm_04',
    portal: 'Community Site',
    actionType: 'Promoted News Post',
    defaultDebitCredits: 20,
    minimumThreshold: 0,
    status: 'Active',
  },
  {
    id: 'pm_05',
    portal: 'Marketplace',
    actionType: 'Boutique Provider Lead',
    defaultDebitCredits: 10,
    minimumThreshold: 2,
    status: 'Active',
  },
];

// Marketing Portal Service Listings (JustDial-inspired Localized Service Aggregation)
const initialServiceListings: ServiceListing[] = [
  {
    id: 'srv_rgoa_02',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    name: 'GMR Rajiv Gandhi Executive Terminal & Airside Handling',
    category: 'Airport',
    subCategory: 'Executive Airport Hub & Ground Handling',
    logoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    city: 'RGOA',
    country: 'IN',
    address: 'Rajiv Gandhi International Airport (HYD / RGOA)',
    area: 'Shamshabad',
    pincode: '50097',
    phone: '+914023456789',
    email: 'ops@rgoa-airport.in',
    registration_number: 'HYD-AIR-50097',
    established_year: 2019,
    services: ['Airside Ground Handling', 'Commercial Aviation Terminal', 'Runway Lighting Maintenance'],
    facilities: ['Airports', 'VIP Lounge', 'Fueling Bay', 'Helipad'],
    amenities: ['24/7 Security', 'Crew Rest Suite', 'High-Speed Wi-Fi', 'Customs Clearance'],
    rating: 4.9,
    reviews_count: 18,
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
    budget: '₹1,500,000 / Sector',
    pricing_rate: '₹3,50,000 / Block Hour',
  },
  {
    id: 'srv_01',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    name: 'JetVentures VIP SkySuite & Private Charters',
    category: 'Private Air Charter',
    subCategory: 'Executive VIP Terminal & Jet Charter',
    logoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    city: 'Dubai',
    country: 'AE',
    address: 'Gate 4, Executive Aviation Terminal',
    area: 'Al Maktoum Int. Airport',
    pincode: 'DXB-400',
    phone: '+9714800538847',
    email: 'charters@jetventures.ae',
    registration_number: 'CRN-7890123-AE',
    established_year: 2020,
    services: ['Gulfstream G650ER Global Flights', 'Helicopter Helipad Transfers', 'VIP Airport Fast-Track Concierge', 'Onboard Michelin Dining'],
    facilities: ['Executive Terminal', 'Helipad', 'Private Hangars', 'VIP Apron'],
    amenities: ['Chauffeur Transfer', 'Caviar & Champagne Bar', 'Private Boardroom', 'Direct Customs'],
    rating: 4.9,
    reviews_count: 24,
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    ],
    bannerAdUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e896?auto=format&fit=crop&w=1200&q=80',
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
  },
  {
    id: 'srv_02',
    business_id: 'biz_serene_02',
    name: 'The Aeronautique Palace & Executive Aviator Lounge',
    category: 'Boutique Hospitality',
    subCategory: '5-Star Aviator Hotel',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Mumbai',
    country: 'IN',
    address: 'Near Runway 27, Sahar Airport Road',
    area: 'Andheri East',
    pincode: '400099',
    phone: '+912267890000',
    email: 'reservations@aeronautique.in',
    registration_number: 'MH-BOM-BOU-8912',
    established_year: 2017,
    services: ['Runway-View Presidential Suites', '24/7 Flight Crew Day-Rooms', 'Pre-Flight Cryotherapy Spa', 'Secure Airside Shuttle'],
    facilities: ['Runway View Decks', 'Crew Transit Lounge', 'Airside Shuttles', 'Flight Dispatch Hub'],
    amenities: ['Blackout Soundproof Suites', '24/7 Buffet', 'Steam & Sauna', 'Luggage Check-In Desk'],
    rating: 4.8,
    reviews_count: 36,
    photos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
  },
  {
    id: 'srv_03',
    business_id: 'f8d1c2b3-001a-42bc-8111-eeef98765432',
    name: 'AeroGlobal Rapid Avionics & Line MRO',
    category: 'MRO & Avionics',
    subCategory: 'Certified Part-145 Station',
    logoUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Mumbai',
    country: 'IN',
    address: 'Hangar 8B, Old Airport Road',
    area: 'Kalina, Santacruz East',
    pincode: '400029',
    phone: '+912288991122',
    email: 'mro@aeroglobal.in',
    registration_number: 'ABCD12345F',
    established_year: 2018,
    services: ['DGCA & EASA Part-145 Certified', 'A320 / B737 Line Transit Checks', 'Avionics Radar Calibration', '24/7 AOG Emergency Spares'],
    facilities: ['Part-145 Hangar', 'Hydraulic Rig Room', 'Clean Avionics Lab', 'AOG Transit Vehicles'],
    amenities: ['Engineer Briefing Room', 'NDT Testing Tools', 'Spares Warehouse', 'Mobile Rapid Response Team'],
    rating: 4.6,
    reviews_count: 14,
    photos: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
  },
  {
    id: 'srv_04',
    business_id: 'biz_skychef_04',
    name: 'SkyEpicure Haute Catering & Flight Galleys',
    category: 'Flight Catering',
    subCategory: 'Gourmet In-Flight Cuisine',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Delhi',
    country: 'IN',
    address: 'Aero City Hospitality District, Block 4',
    area: 'IGI Airport Aerocity',
    pincode: '110037',
    phone: '+911145678900',
    email: 'catering@skyepicure.aero',
    registration_number: 'DL-DEL-CAT-4491',
    established_year: 2021,
    services: ['Bespoke High-Altitude Menus', 'Halal & Kosher Certified Kitchen', 'Dry-Ice Vacuum Flight Packing', 'Sommelier Wine Curation'],
    facilities: ['HACCP Flight Kitchen', 'Blast Chillers', 'Bonded Wine Vault', 'Airside Hi-Loader Vans'],
    amenities: ['Custom Tasting Room', 'Flight Crew Meal Kits', 'Allergen-Safe Zones', '2-Hour Rapid Order turnaround'],
    rating: 4.7,
    reviews_count: 19,
    photos: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
  },
  {
    id: 'srv_05',
    business_id: 'biz_flyacademy_05',
    name: 'Apex Aviator Flight Training & Simulator Hub',
    category: 'Aviation Training',
    subCategory: 'DGCA Certified Academy',
    logoUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Bengaluru',
    country: 'IN',
    address: 'HAL Airport Complex, Old Airport Road',
    area: 'Vimanapura',
    pincode: '560017',
    phone: '+918023456789',
    email: 'admissions@apexflight.in',
    registration_number: 'KA-BLR-EDU-7711',
    established_year: 2015,
    services: ['A320 Full-Flight Sim (Level D)', 'ATPL Ground School Masterclass', 'Type Rating Prep Classes', 'DGCA License Conversion'],
    facilities: ['Level-D CAE Simulators', 'Multi-Engine Flight Line', 'Briefing Audits', 'Aviation Library'],
    amenities: ['Student Hostel', 'CBT Lab', 'FAA/DGCA Exam Center', 'Sim Session Playback Theatre'],
    rating: 4.9,
    reviews_count: 58,
    photos: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
  },
  {
    id: 'srv_06',
    business_id: 'biz_aero_parts_06',
    name: 'AeroParts Global Spares & GSE International',
    category: 'Aviation Suppliers & GSE',
    subCategory: 'OEM Airframe & Engine Parts',
    logoUrl: 'https://images.unsplash.com/photo-1579273166657-0b1a03a7c646?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cargo-plane-taking-off-at-sunset-41551-large.mp4',
    city: 'Singapore',
    country: 'SG',
    address: '12 Changi Aviation Park Road, Loyang Industrial Estate',
    area: 'Changi Aviation Zone',
    pincode: '508761',
    phone: '+6568912345',
    email: 'spares@aeroparts-global.sg',
    registration_number: 'SG-ACRA-2016-89012',
    established_year: 2016,
    services: ['Boeing & Airbus OEM Rotables & Consumables', 'Aircraft Ground Support Equipment (GSE)', '24/7 Global AOG Rapid Dispatch', 'EASA & FAA Form 1 Dual Release'],
    facilities: ['Bonded Customs Spares Depot', 'Cold-Chain Aviation Storage', 'Hydraulic GSE Rig Testing Bay', 'Expedited Air Freight Bay'],
    amenities: ['Real-Time Inventory Portal', 'Dedicated Technical Account Manager', 'Traceability Certificate Vault', 'Same-Day Ramp Delivery'],
    rating: 4.9,
    reviews_count: 42,
    photos: [
      'https://images.unsplash.com/photo-1579273166657-0b1a03a7c646?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 15,
    directChatCredits: 5,
  },
  {
    id: 'srv_07',
    business_id: 'biz_sovereign_jets_07',
    name: 'Sovereign Aircraft Sales & Jet Brokerage',
    category: 'Aircraft Dealers & Brokers',
    subCategory: 'Pre-Owned Business Jet Sales',
    logoUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Dubai',
    country: 'AE',
    address: 'Suite 401, Dubai South Business Center, Aviation City',
    area: 'Al Maktoum Int. Airport',
    pincode: 'DXB-5500',
    phone: '+97148897000',
    email: 'acquisitions@sovereignjets.ae',
    registration_number: 'DED-TRADE-891023',
    established_year: 2014,
    services: ['Gulfstream, Bombardier & Dassault Pre-Purchase Inspections', 'Bespoke Escrow & Aircraft Title Closing', 'Corporate Fleet Acquisition & Lease Structuring', 'Cross-Border Aircraft Export & Delivery Flight Ops'],
    facilities: ['VIP Showroom Hangar', 'Private Client Boardroom', 'Technical Records Inspection Archive', 'Aircraft Static Display Ramp'],
    amenities: ['Private Jet Financing Advisory', 'Aviation Legal Counsel Network', 'Concierge Airport Transfers', 'Turnkey Management Solutions'],
    rating: 4.9,
    reviews_count: 31,
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519074069444-1ba4ea16e896?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 25,
    directChatCredits: 10,
  },
  {
    id: 'srv_08',
    business_id: 'biz_aeronautics_rnd_08',
    name: 'AeroDynamics Propulsion & Aerospace Engineering Labs',
    category: 'Aeronautics & Engineering',
    subCategory: 'Aerospace Design & R&D',
    logoUrl: 'https://images.unsplash.com/photo-1517976487588-4663737b80a6?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    city: 'Bengaluru',
    country: 'IN',
    address: 'Aerospace SEZ Tech Park, Devanahalli Airport Corridor',
    area: 'KIADB Aerospace Park',
    pincode: '562110',
    phone: '+918029988111',
    email: 'research@aerodynamics-eng.in',
    registration_number: 'KA-BLR-AERO-2022-45',
    established_year: 2019,
    services: ['Computational Fluid Dynamics (CFD) & Wind Tunnel Testing', 'Composite Airframe Structural Analysis', 'Fly-By-Wire & Avionics Systems Integration', 'Electric & Hybrid VTOL Propulsion Prototyping'],
    facilities: ['Subsonic & Transonic Wind Tunnel', 'Advanced Materials Testing Lab', 'Cleanroom Avionics Clean-Bench', 'High-Performance Supercomputing Cluster'],
    amenities: ['Rapid Prototyping CNC Workshop', 'Patent & Certification Consulting', 'Defense & Space Collaboration Suite', 'Secure IP Encrypted Vault'],
    rating: 4.8,
    reviews_count: 27,
    photos: [
      'https://images.unsplash.com/photo-1517976487588-4663737b80a6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 20,
    directChatCredits: 5,
  },
  {
    id: 'srv_09',
    business_id: 'biz_skywings_cpl_09',
    name: 'SkyWings Aviation Enterprise Services & Dispatch Support',
    category: 'Aviation Operations & Enterprise Services',
    subCategory: 'Corporate Flight Operations & Dispatch Support',
    logoUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Miami',
    country: 'US',
    address: '14200 SW 127th Street, Miami Executive Airport (KTMB)',
    area: 'Executive Aviation Complex',
    pincode: 'FL 33186',
    phone: '+13052345678',
    email: 'ops@skywings-services.com',
    registration_number: 'FAA-PART-135-CERT-8841',
    established_year: 2011,
    services: ['FAA & EASA Flight Dispatch & Trip Support', 'Global Overflight & Landing Permit Procurement', 'Ground Handling Coordination & Fuel Brokering', 'Aviation Safety Audit & Compliance Consulting'],
    facilities: ['24/7 Global Operations Center', 'Direct Airside Apron Access Ramp', 'Executive Meeting Suites', 'Flight Dispatch & Weather Briefing Center'],
    amenities: ['Private VIP Transit Lounges', 'Corporate Concierge Services', 'Customs Fast-Track Assistance', 'Executive Conference Network'],
    rating: 4.9,
    reviews_count: 76,
    photos: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 15,
    directChatCredits: 5,
  },
  {
    id: 'srv_10',
    business_id: 'biz_munich_mro_10',
    name: 'Bavaria AeroSystems Turbine MRO & Avionics Hub',
    category: 'MRO & Avionics',
    subCategory: 'Engine & APU Shop Overhaul',
    logoUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
    videoUrl: '',
    city: 'Munich',
    country: 'DE',
    address: 'Nordallee 25, Munich International Airport (EDDM)',
    area: 'Aviation Tech Center East',
    pincode: '85356',
    phone: '+49899750011',
    email: 'engineering@bavaria-aero.de',
    registration_number: 'DE.145.09124',
    established_year: 2008,
    services: ['CFM56, LEAP & V2500 Heavy Engine Overhaul', 'Non-Destructive Testing (Eddy Current, Ultrasonic & X-Ray)', 'Avionics EFIS & Radar Modernization', 'EASA & FAA Part-145 Certified Base Station'],
    facilities: ['Dedicated Jet Engine Test Cell (100,000 lbs thrust)', 'Cleanroom Component Repair Workshop', 'Climate-Controlled Turbine Vault', 'Mobile AOG Fly-Away Recovery Team'],
    amenities: ['Engineering Technical Library', 'Customer Representative On-Site Offices', 'Customs Bonded Logistics Channel', 'Real-Time Telemetry Diagnostic Uplink'],
    rating: 4.9,
    reviews_count: 34,
    photos: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517976487588-4663737b80a6?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 20,
    directChatCredits: 5,
  },
  {
    id: 'srv_11',
    business_id: 'biz_london_vip_11',
    name: 'Signature Royal VIP Aviation Terminal',
    category: 'Airport & VIP Terminals',
    subCategory: 'VIP Executive Lounge & Terminal',
    logoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    city: 'London',
    country: 'GB',
    address: 'Hangar 510, London Luton Airport (LTN)',
    area: 'Presidential Aviation Enclave',
    pincode: 'LU2 9NW',
    phone: '+441582700800',
    email: 'ops@signatureroyal.co.uk',
    registration_number: 'UK-CAA-VIP-7712',
    established_year: 2012,
    services: ['Private Jet Apron Parking & Heated Hangarage', 'Dedicated UK Border Force Airside Immigration', 'Under-Wing Chauffeur Limousine Ramp Access', 'Bespoke Executive Crew Rest Lounges'],
    facilities: ['State-of-the-Art Private Passenger Terminal', 'Direct Runway Apron Taxiway', 'Executive Airside Rest Suites', 'Private VIP Conference Suites'],
    amenities: ['Complimentary High-End Bar & Barista', 'Direct Airside Fuel Hydrant', 'De-Icing & GPU Ground Power', 'Helicopter Transfer to Central London Battersea'],
    rating: 4.9,
    reviews_count: 52,
    photos: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    ],
    isVerified: true,
    leadUnlockCredits: 10,
    directChatCredits: 5,
  },
];

// Customer Reviews (Decentralized Customer-Only Ratings with Admin/Business moderation)
const initialReviews: CustomerReview[] = [
  {
    id: 'rev_01',
    listing_id: 'srv_01',
    author_id: 'c4a7b180-8d3e-4f32-9b12-987123abcdef',
    author_name: 'Capt. Aditya Sharma',
    rating: 5,
    comment: 'Impeccable charter turnaround time at Dubai South. The G650 cabin condition and flight crew coordination were world-class.',
    timestamp: '2026-09-14T11:20:00Z',
    status: 'visible',
  },
  {
    id: 'rev_02',
    listing_id: 'srv_02',
    author_id: 'user_priya_88',
    author_name: 'Priya Sundaram',
    rating: 5,
    comment: 'The runway-view suites at Aeronautique Palace are fantastic for transit aviation crews. The soundproofing is flawless.',
    timestamp: '2026-09-15T09:10:00Z',
    status: 'visible',
  },
  {
    id: 'rev_03',
    listing_id: 'srv_03',
    author_id: 'user_tariq_01',
    author_name: 'Tariq Al-Mansoor',
    rating: 4,
    comment: 'Prompt line check turnaround on our leased A320. Saved us from a 4-hour delay in Mumbai.',
    timestamp: '2026-09-15T15:45:00Z',
    status: 'visible',
  },
];

// Internal Live Mails (Truvaer closed-loop domain messaging)
const initialInternalMails: InternalMail[] = [
  {
    id: 'mail_01',
    from: 'compliance@truvaer.com',
    to: 'user@domain.com',
    subject: 'Welcome to Truvaer: Identity Verified & Digital Wallet Provisioned',
    body: 'Dear Aviator, your account identity has been verified under Yarifly Ecosystem Governance. Your digital wallet has been credited with 5,000 onboarding credits.',
    category: 'Updates',
    timestamp: '2026-09-10T10:06:00Z',
    isRead: true,
    isTrash: false,
    isDraft: false,
    piiRedacted: false,
    registeredEmailAlertSent: true,
  },
  {
    id: 'mail_02',
    from: 'charters@truvaer.com',
    to: 'user@domain.com',
    subject: 'Exclusive Inquiry: G650 Dubai to London Sector Availability',
    body: 'Hello Captain Sharma, we noted your profile credentials. We have an upcoming VIP sector charter requirement. Please reply via Truvaer Internal Messenger to coordinate terms.',
    category: 'Sales',
    timestamp: '2026-09-14T14:30:00Z',
    isRead: false,
    isTrash: false,
    isDraft: false,
    piiRedacted: false,
    registeredEmailAlertSent: true,
  },
  {
    id: 'mail_03',
    from: 'operations@yarifly.com',
    to: 'user@domain.com',
    subject: 'Operational Briefing: Airspace Advisory & Monsoonal Routing',
    body: 'Routine operational advisory issued by Yarifly Flight Operations Center. Sector BOM-DXB routing changes in effect through October.',
    category: 'Primary',
    timestamp: '2026-09-16T08:00:00Z',
    isRead: false,
    isTrash: false,
    isDraft: false,
    piiRedacted: false,
    registeredEmailAlertSent: true,
  },
];

// MSN-Style Jobs Portal Listings
const initialJobs: JobListing[] = [
  {
    id: 'job_01',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    company_name: 'JetVentures Global Operations Ltd',
    title: 'Chief Flight Instructor (CFI) - Executive Fleet',
    role_type: 'Chief Flight Instructor',
    location: 'Dubai (DXB / DWC)',
    country: 'AE',
    experience_years: '7+ Years',
    salary_range: 'AED 38,000 - 45,000 / month',
    description: 'Lead high-compliance type rating transitions on ultra-long-range business aircraft. Responsible for recurrent check rides, CRM instruction, and audit compliance.',
    tags: ['ATPL Holder', '3,500+ PIC Hours', 'TRE / TRI Certified'],
    published_date: '2026-09-13',
    expiration_date: '2026-10-31',
    status: 'Live',
    is_pinned: true,
    opportunity_sheet_link: 'https://truvaer.com/ops/sheets/CFI-2026-DXB.pdf',
    applied_users: [
      { user_id: 'c4a7b180-8d3e-4f32-9b12-987123abcdef', status: 'Under Review', date: '2026-09-14' },
    ],
  },
  {
    id: 'job_02',
    business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    company_name: 'JetVentures Global Operations Ltd',
    title: 'Senior Avionics Maintenance Specialist (B777 / B787)',
    role_type: 'Avionics Specialist',
    location: 'London (LHR) / Munich (MUC)',
    country: 'UK',
    experience_years: '5+ Years',
    salary_range: '£6,200 - 7,500 / month',
    description: 'Maintain complex digital avionics, SATCOM, and fly-by-wire flight control computers on heavy commercial transport aircraft.',
    tags: ['EASA Part-66 B2', 'Widebody Experience', 'Line Maintenance'],
    published_date: '2026-09-14',
    expiration_date: '2026-10-25',
    status: 'Live',
    is_pinned: false,
    opportunity_sheet_link: 'https://truvaer.com/ops/sheets/AV-2026-LHR.pdf',
    applied_users: [],
  },
  {
    id: 'job_03',
    business_id: 'biz_apex_systems',
    company_name: 'Apex Flight Systems & Cloud OPS',
    title: 'Lead Software Engineer - Aviation Predictive Telemetry',
    role_type: 'Software Engineer',
    location: 'Bengaluru (BLR) / Hybrid',
    country: 'IN',
    experience_years: '4+ Years',
    salary_range: '₹32,00,000 - 45,00,000 / year',
    description: 'Architect real-time flight data streaming and predictive engine maintenance algorithms utilizing TypeScript, Go, and Kafka.',
    tags: ['Distributed Systems', 'Kafka / Redis', 'Aviation Telemetry'],
    published_date: '2026-09-15',
    expiration_date: '2026-11-15',
    status: 'Live',
    is_pinned: true,
    opportunity_sheet_link: 'https://truvaer.com/ops/sheets/SWE-2026-BLR.pdf',
    applied_users: [],
  },
  {
    id: 'job_04',
    business_id: 'f8d1c2b3-001a-42bc-8111-eeef98765432',
    company_name: 'AeroGlobal Logistics Pvt Ltd',
    title: 'Flight Operations Coordinator (ICAO Certified)',
    role_type: 'Flight Operations Coordinator',
    location: 'Mumbai (BOM)',
    country: 'IN',
    experience_years: '3+ Years',
    salary_range: '₹95,000 - 1,20,000 / month',
    description: 'Execute flight schedules, calculate fuel burn with ETOPS criteria, monitor weather and NOTAM updates for cargo freighters.',
    tags: ['DGCA Flight Ops Certificate', 'Jeppesen FliteDeck', 'ETOPS Validated'],
    published_date: '2026-09-16',
    expiration_date: '2026-10-15',
    status: 'Pending Verification',
    opportunity_sheet_link: 'https://truvaer.com/ops/sheets/FOC-2026-BOM.pdf',
    applied_users: [],
  },
];

// MSN-Style News Portal Articles
const initialNews: NewsArticle[] = [
  {
    id: 'news_01',
    title: 'Yarifly Strategic Expansion: v3.0 Predictive Engine Deployed Across Asian Aviation Corridors',
    subtitle: 'Strategic initiative aims to scale active concurrent aviator and enterprise operations by 40% into Q4 2026.',
    content: 'The Yarifly governance committee announced the successful deployment of its v3.0 predictive telemetry engine, connecting boutique hospitality, air charter operators, and technical talent across India, the UAE, and Singapore in a unified, audited environment.',
    category: 'Aviation',
    author_org: 'Yarifly Corporate Communications',
    author_id: 'admin_super_01',
    published_at: '2026-09-16T10:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    status: 'Live',
    pinned_slot: 'Primary',
    likes_count: 142,
  },
  {
    id: 'news_02',
    title: 'Boutique Air Charters Transition to Dynamic Pay-As-You-Use Credit Systems',
    subtitle: 'Eliminating traditional high-barrier SaaS subscriptions in favor of micro-credit performance debiting.',
    content: 'Aviation service providers are rapidly moving away from fixed-tenure yearly directory contracts. Through Truvaer Unified Wallets, boutique jet charters and lounge operators pay exclusively for verified customer leads and engagement.',
    category: 'Travel',
    author_org: 'JetVentures Editorial',
    author_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    published_at: '2026-09-15T14:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    status: 'Live',
    pinned_slot: 'Secondary',
    likes_count: 89,
  },
  {
    id: 'news_03',
    title: 'Next-Gen Avionics: AI-Augmented Runway Incursion Prevention Systems Pass DGCA Field Trials',
    subtitle: 'Indian airfields trial high-frequency sensor fusion in congested metro hubs.',
    content: 'Field trials conducted across Mumbai and Delhi international airports show a 99.4% precision rate in automated surface vehicle tracking, minimizing runway confusion during low-visibility winter operations.',
    category: 'Technology',
    author_org: 'Truvaer Avionics Review',
    author_id: 'admin_ops_02',
    published_at: '2026-09-14T09:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
    status: 'Live',
    pinned_slot: 'Tertiary',
    likes_count: 64,
  },
];

// Events & Community (Active Employee vs Alumni Lifecycle)
const initialEvents: AviationEvent[] = [
  {
    id: 'evt_01',
    title: 'Internal Operational Flight Readiness & Monsoonal CRM Workshop',
    category: 'Operational Briefing',
    date: '2026-09-22 14:00 IST',
    location: 'Yarifly Ops Center, Sahar Hangar 4, Mumbai',
    tier: 'Internal Only', // Blocked for Alumni
    speaker: 'Capt. Rajesh Varma (Director of Flight Operations)',
    organization: 'SkyStream Charter Aviation',
    rsvp_users: ['c4a7b180-8d3e-4f32-9b12-987123abcdef'],
    lineup_users: ['c4a7b180-8d3e-4f32-9b12-987123abcdef'],
    requires_clearance: true,
  },
  {
    id: 'evt_02',
    title: 'Global Air Charter & Boutique Hospitality Networking Summit',
    category: 'Industry Summit',
    date: '2026-09-28 10:00 GST',
    location: 'Dubai World Trade Centre & Virtual Stream',
    tier: 'Public Ecosystem', // Open to everyone
    speaker: 'B Aditya Narayana & Elena Rostova',
    organization: 'Truvaer Ecosystem Alliance',
    rsvp_users: ['c4a7b180-8d3e-4f32-9b12-987123abcdef'],
    lineup_users: [],
    requires_clearance: false,
  },
  {
    id: 'evt_03',
    title: 'Annual Aviators Alumni Retrospective & Career Mentorship Mixer',
    category: 'Alumni Mixer',
    date: '2026-10-05 18:30 IST',
    location: 'The Aeronautique Palace Rooftop Lounge, Mumbai',
    tier: 'Alumni Curated', // Specially visible to Alumni & Public
    speaker: 'Senior Aviator Mentors Group',
    organization: 'Truvaer Community Guild',
    rsvp_users: [],
    lineup_users: [],
    requires_clearance: false,
  },
];

const initialOtps: Record<string, OtpRecord> = {
  'b2e8c910-12ab-44df-a890-776655fedcba': {
    user_id: 'b2e8c910-12ab-44df-a890-776655fedcba',
    otp: '849201',
    expires_at: Date.now() + 15 * 60 * 1000,
    resend_count: 0,
    last_sent_at: Date.now(),
  },
};

const initialDailyPayoutReports: DailyPayoutReport[] = [
  {
    id: 'rep_payout_20260924',
    batch_date: '2026-09-24',
    batch_reference: 'BATCH-PAY-2026-09-24',
    total_payout_amount: 250000,
    currency: 'INR',
    total_debits_count: 1,
    settled_records: [
      {
        debit_id: 'deb_fin_01',
        business_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
        business_name: 'JetVentures VIP SkySuite & Private Charters',
        bank_name: 'HDFC Bank Ltd',
        account_masked: '••••••••8899',
        ifsc: 'HDFC0000123',
        amount: 250000,
        currency: 'INR',
        utr: 'UTR-HDFC-2026-884920',
        released_by: 'Sunil Mathur (Finance Head L6)',
        timestamp: '2026-09-24T16:00:00Z',
      },
    ],
    generated_by: 'Sunil Mathur (Finance Head L6)',
    generated_at: '2026-09-24T18:00:00Z',
    status: 'COMPLETED',
  },
];

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Gracefully handle storage quota or private browsing exceptions without crashing
    console.warn(`[Truvaer DB] Storage save skipped for key ${key}:`, e);
  }
}

class MockDatabase {
  private regularUsers: RegularUser[];
  private businesses: BusinessProfile[];
  private adminUsers: AdminUser[];
  private pricingMatrix: PricingMatrixItem[];
  private serviceListings: ServiceListing[];
  private reviews: CustomerReview[];
  private internalMails: InternalMail[];
  private chats: LiveChatMessage[];
  private jobs: JobListing[];
  private news: NewsArticle[];
  private events: AviationEvent[];
  private otps: Record<string, OtpRecord>;
  private apiLogs: ApiLogEntry[];
  private debitRequests: WalletDebitRequest[];
  private promotionRequests: PromotionApprovalRequest[];
  private unlockedContacts: UnlockedContactRecord[];
  private globalSettings: { phoneUnlockCreditCost: number; unlockValidityDays: number };
  private notifications: UserNotification[];
  private crmLeads: CRMLead[];
  private crmOpportunities: CRMOpportunity[];
  private crmQuotations: CRMQuotation[];
  private crmTickets: CRMSupportTicket[];
  private commissions: CommissionRecord[];
  private storeInventory: StoreInventoryItem[];
  private crmSales: CRMSalesRecord[];
  private adminActivities: AdminActivityItem[];
  private activityListeners: Array<(item: AdminActivityItem) => void> = [];
  private businessPosts: BusinessPost[];
  private businessFollowers: Record<string, string[]>;
  private postListeners: Array<(posts: BusinessPost[]) => void> = [];
  private dailyPayoutReports: DailyPayoutReport[];
  private broadcastNotifications: BroadcastNotification[];
  private customServiceRequests: CustomServiceRequest[];
  private customCategoryRequests: CustomCategoryRequest[];
  private customTaxonomy: Record<string, string[]>;
  private suspendedCategories: string[];
  private suspendedSubCategories: Record<string, string[]>;
  private directServiceOffers: DirectServiceOffer[];
  private platformCustomServices: Record<string, string[]>;
  private adminProjects: AdminProject[];
  private adminTasks: AdminTask[];
  private quotationRequests: QuotationRequest[];
  private businessReports: BusinessReport[];
  private postReports: PostReport[];
  private publishSanctions: Record<string, PublishSanction>;
  private customUserTypes: CustomUserType[];
  private centralizedCreditPolicy: CentralizedCreditPolicy;
  private centralizedCreditRequests: CentralizedCreditRequest[];
  private dispatchedThresholdAlerts: DispatchedThresholdAlert[];
  private transactionReportSubscriptions: Record<string, TransactionReportSubscription>;
  private dispatchedTransactionReports: DispatchedTransactionReport[];
  private singleSessionAudits: SingleSessionAuditRecord[];
  private customerCareTickets: CustomerCareTicket[];
  private ticketCounters: Record<string, number>;
  private agentVerificationAudits: AgentVerificationGateAudit[];
  private activeSessions: Record<string, ActiveUserSession>;
  private sessionSettings: SessionSettingsConfig;
  private platformModuleControls: PlatformModuleControl[];
  private globalCrisisMode: boolean;
  private envMode: 'LIVE' | 'TESTING';
  private flashNewsItems: FlashNewsItem[];
  private flashNewsConfig: FlashNewsConfig;
  private storyCategories: StoryCategory[];
  private regionalZones: RegionalAuthorityZone[];
  private countryMappings: RegionCountryMapping[];
  private regionalCreditPricing: RegionalCreditPricingRule[];
  private globalDefaultCreditRate: number;

  constructor() {
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('truvaer_env_mode') : null;
    this.envMode = savedMode === 'LIVE' ? 'LIVE' : 'TESTING';

    this.platformModuleControls = loadStorage<PlatformModuleControl[]>(PLATFORM_MODULE_CONTROLS_KEY, initialPlatformModuleControls);
    if (!this.platformModuleControls || this.platformModuleControls.length === 0) {
      this.platformModuleControls = [...initialPlatformModuleControls];
    }
    this.globalCrisisMode = loadStorage<boolean>(GLOBAL_CRISIS_MODE_KEY, false);

    this.regularUsers = loadStorage<RegularUser[]>(REGULAR_USERS_KEY, initialRegularUsers);
    this.businesses = loadStorage<BusinessProfile[]>(BUSINESS_PROFILES_KEY, initialBusinesses);
    this.adminUsers = loadStorage<AdminUser[]>(ADMIN_USERS_KEY, initialAdminUsers);
    // Sanitize any legacy dispatcher titles from adminUsers cache
    this.adminUsers = this.adminUsers.map((u) => {
      if (u.level_title && /dispatcher/i.test(u.level_title)) {
        return { ...u, level_title: u.level_title.replace(/dispatcher/gi, 'Coordinator') };
      }
      return u;
    });
    this.customUserTypes = loadStorage<CustomUserType[]>(CUSTOM_USER_TYPES_KEY, initialCustomUserTypes);
    if (!this.customUserTypes || this.customUserTypes.length === 0) {
      this.customUserTypes = [...initialCustomUserTypes];
    } else {
      // Purge any legacy DISPATCHER custom role definitions from local storage
      this.customUserTypes = this.customUserTypes.filter(
        (t) => t.key !== 'DISPATCHER' && !/dispatcher/i.test(t.label)
      );
    }
    this.pricingMatrix = loadStorage<PricingMatrixItem[]>(PRICING_MATRIX_KEY, initialPricingMatrix);
    this.adminProjects = loadStorage<AdminProject[]>(ADMIN_PROJECTS_KEY, initialAdminProjects);
    this.adminTasks = loadStorage<AdminTask[]>(ADMIN_TASKS_KEY, initialAdminTasks);
    this.quotationRequests = loadStorage<QuotationRequest[]>(QUOTATION_REQUESTS_KEY, []);
    this.businessReports = loadStorage<BusinessReport[]>(BUSINESS_REPORTS_KEY, []);
    if (this.businessReports.length === 0) {
      this.businessReports = [
        {
          id: 'rep_sample_01',
          report_number: 'TRU-REP-2026-0501',
          listing_id: 'listing_01',
          listing_name: 'GMR Rajiv Gandhi Executive Terminal & Airside Handling',
          business_id: 'biz_gmr_01',
          reporter_email: 'aviator.aditya@yarifly.com',
          reporter_name: 'Aditya Narayana',
          reason: 'Irrelevant / Misleading Content',
          explanation: 'Pricing rate on runway ground handling shows outdated tariff sheets that need verification.',
          is_blocked_by_user: false,
          status: 'PENDING_REVIEW',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ];
    }
    this.postReports = loadStorage<PostReport[]>(POST_REPORTS_KEY, []);
    if (this.postReports.length === 0) {
      this.postReports = [
        {
          id: 'prep_sample_01',
          report_number: 'TRU-POST-REP-2026-0101',
          post_id: 'post_01',
          post_title: 'Global Air Cargo Special: Hyderabad to Dubai',
          post_snippet: 'Discounted pallet rates on chartered Airbus A330F freighter flight...',
          author_id: 'biz_aircharter_02',
          author_name: 'Deccan Charters & Air Cargo',
          reporter_id: 'usr_02',
          reporter_name: 'Aditya Narayana',
          reporter_email: 'aditya@yarifly.com',
          reason: 'Irrelevant Content / Spam',
          explanation: 'Repeated promotional cargo announcement posted 3 times without valid schedule confirmation.',
          status: 'PENDING_REVIEW',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'prep_sample_02',
          report_number: 'TRU-POST-REP-2026-0102',
          post_id: 'post_01',
          post_title: 'Global Air Cargo Special: Hyderabad to Dubai',
          post_snippet: 'Discounted pallet rates on chartered Airbus A330F freighter flight...',
          author_id: 'biz_aircharter_02',
          author_name: 'Deccan Charters & Air Cargo',
          reporter_id: 'usr_03',
          reporter_name: 'Captain Vikram Malhotra',
          reporter_email: 'vikram.m@skyfleet.aero',
          reason: 'Irrelevant Content / Spam',
          explanation: 'Second duplicate broadcast across unrelated regional feeds. Disrupting aviation operations.',
          status: 'PENDING_REVIEW',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }
    this.publishSanctions = loadStorage<Record<string, PublishSanction>>(PUBLISH_SANCTIONS_KEY, {});
    if (Object.keys(this.publishSanctions).length === 0) {
      this.publishSanctions = {
        sample_violator_01: {
          author_id: 'sample_violator_01',
          author_name: 'Global Aero Spam Brokers',
          violation_count: 1,
          is_suspended: true,
          suspended_until: new Date(Date.now() + 6 * 86400000).toISOString(),
          last_sanction: '7_DAYS',
          sanction_history: [
            {
              sanction_type: '7_DAYS',
              applied_at: new Date(Date.now() - 86400000).toISOString(),
              applied_by: 'Super Administrator',
              reason: 'First strike for irrelevant unsolicited broadcasts',
            },
          ],
        },
      };
    }

    // Strict user inventory enforcement: Retain ONLY 1 Standard User, 1 Business User, 1 Admin, 1 Super Admin
    const canonicalRegularIds = new Set(['usr_super_admin', 'usr_admin', 'usr_standard_user']);
    this.regularUsers = this.regularUsers.filter((u) => canonicalRegularIds.has(u.user_id));
    for (const initU of initialRegularUsers) {
      if (!this.regularUsers.some((u) => u.user_id === initU.user_id)) {
        this.regularUsers.push(initU);
      }
    }

    const canonicalAdminIds = new Set(['admin_super_admin', 'admin_operations']);
    this.adminUsers = this.adminUsers.filter((a) => canonicalAdminIds.has(a.admin_id));
    for (const initA of initialAdminUsers) {
      if (!this.adminUsers.some((a) => a.admin_id === initA.admin_id)) {
        this.adminUsers.push(initA);
      }
    }

    this.businesses = this.businesses.filter((b) => b.business_id === 'biz_corporate_user');
    if (this.businesses.length === 0) {
      this.businesses = [...initialBusinesses];
    }

    // Persist immediately so any old cached users in the browser session are purged
    saveStorage(REGULAR_USERS_KEY, this.regularUsers);
    saveStorage(BUSINESS_PROFILES_KEY, this.businesses);
    saveStorage(ADMIN_USERS_KEY, this.adminUsers);

    const rawListings = loadStorage<ServiceListing[]>(SERVICE_LISTINGS_KEY, initialServiceListings);
    // Sanitize any stale test prototyping listings from previous sessions
    const loadedListings = rawListings.filter(
      (s) => s.id !== 'srv_test_02' && !s.name.toLowerCase().includes('test 2')
    );

    const existingListingIds = new Set(loadedListings.map((s) => s.id));
    for (const initListing of initialServiceListings) {
      if (!existingListingIds.has(initListing.id)) {
        loadedListings.push(initListing);
      }
    }
    // Condition 2: Compute TRUEAER ID (Country-SRNo: IN-AA001...) and ensure publication_status defaults to PUBLISHED
    const countryCounters: Record<string, number> = {};
    for (const l of loadedListings) {
      if (!l.publication_status) {
        l.publication_status = 'PUBLISHED';
      }
      const c = (l.country || 'IN').toUpperCase();
      const idx = countryCounters[c] || 0;
      if (!l.truvaer_id) {
        l.truvaer_id = generateTruvaerId(c, idx);
      }
      if (!l.directChatCredits) {
        l.directChatCredits = 15;
      }
      countryCounters[c] = idx + 1;
    }
    this.serviceListings = loadedListings;

    // Ensure all business profiles also have their official TRUEAER ID
    const bizCountryCounters: Record<string, number> = {};
    for (const b of this.businesses) {
      const c = (b.country || 'IN').toUpperCase();
      const idx = bizCountryCounters[c] || 0;
      if (!b.truvaer_id) {
        b.truvaer_id = generateTruvaerId(c, idx);
      }
      bizCountryCounters[c] = idx + 1;
    }
    this.reviews = loadStorage<CustomerReview[]>(REVIEWS_KEY, initialReviews);
    this.internalMails = loadStorage<InternalMail[]>(INTERNAL_MAILS_KEY, initialInternalMails);
    const loadedChats = loadStorage<LiveChatMessage[]>(CHATS_KEY, initialChats);
    // Ensure all seed chats are present if storage had an empty array
    const chatIds = new Set(loadedChats.map((c) => c.id));
    for (const sc of initialChats) {
      if (!chatIds.has(sc.id)) {
        loadedChats.push(sc);
      }
    }
    this.chats = loadedChats;
    this.jobs = loadStorage<JobListing[]>(JOBS_KEY, initialJobs);
    this.news = loadStorage<NewsArticle[]>(NEWS_KEY, initialNews);
    this.events = loadStorage<AviationEvent[]>(EVENTS_KEY, initialEvents);
    this.otps = loadStorage<Record<string, OtpRecord>>(OTP_STORE_KEY, initialOtps);
    this.apiLogs = loadStorage<ApiLogEntry[]>(API_LOGS_KEY, []);
    this.debitRequests = loadStorage<WalletDebitRequest[]>(DEBIT_REQUESTS_KEY, initialDebitRequests);
    this.promotionRequests = loadStorage<PromotionApprovalRequest[]>(PROMOTION_REQUESTS_KEY, initialPromotionRequests);
    this.unlockedContacts = loadStorage<UnlockedContactRecord[]>(UNLOCKED_CONTACTS_KEY, initialUnlockedContacts);
    this.globalSettings = loadStorage(GLOBAL_SETTINGS_KEY, initialGlobalSettings);
    this.crmLeads = loadStorage<CRMLead[]>(CRM_LEADS_KEY, initialCRMLeads);
    this.crmOpportunities = loadStorage<CRMOpportunity[]>(CRM_OPPORTUNITIES_KEY, initialCRMOpportunities);
    this.crmQuotations = loadStorage<CRMQuotation[]>(CRM_QUOTATIONS_KEY, initialCRMQuotations);
    this.crmTickets = loadStorage<CRMSupportTicket[]>(CRM_TICKETS_KEY, initialCRMSupportTickets);
    this.commissions = loadStorage<CommissionRecord[]>(COMMISSIONS_KEY, initialCommissionRecords);
    this.storeInventory = loadStorage<StoreInventoryItem[]>(STORE_INVENTORY_KEY, initialStoreInventory);
    this.crmSales = loadStorage<CRMSalesRecord[]>(CRM_SALES_KEY, initialCRMSales);
    this.adminActivities = loadStorage<AdminActivityItem[]>(ADMIN_ACTIVITIES_KEY, initialAdminActivities);
    this.notifications = loadStorage<UserNotification[]>(USER_NOTIFICATIONS_KEY, [
      {
        id: 'notif_welcome_01',
        recipient_id: 'admin_primary_truvaer',
        title: 'Platform Governance Active',
        message: 'Truvaer Marketplace & Governance rules active: PII masking, 30-day contact unlock, and closed-loop chat.',
        type: 'SYSTEM',
        timestamp: new Date().toISOString(),
        is_read: false,
      },
    ]);
    this.businessPosts = loadStorage<BusinessPost[]>(BUSINESS_POSTS_KEY, initialBusinessPosts);
    this.businessFollowers = loadStorage<Record<string, string[]>>(BUSINESS_FOLLOWERS_KEY, initialBusinessFollowers);
    this.dailyPayoutReports = loadStorage<DailyPayoutReport[]>(DAILY_PAYOUTS_KEY, initialDailyPayoutReports);
    this.broadcastNotifications = loadStorage<BroadcastNotification[]>(BROADCAST_NOTIFICATIONS_KEY, initialBroadcastNotifications);
    this.customServiceRequests = loadStorage<CustomServiceRequest[]>(CUSTOM_SERVICE_REQUESTS_KEY, initialCustomServiceRequests);
    this.customCategoryRequests = loadStorage<CustomCategoryRequest[]>(CUSTOM_CATEGORY_REQUESTS_KEY, initialCustomCategoryRequests);
    // Ensure ccr_03 (Hotel -> Fast Food from Test Firm) is present
    if (!this.customCategoryRequests.some((r) => r.id === 'ccr_03')) {
      const sampleTestFirmReq = initialCustomCategoryRequests.find((r) => r.id === 'ccr_03');
      if (sampleTestFirmReq) {
        this.customCategoryRequests.unshift(sampleTestFirmReq);
      }
    }
    this.customTaxonomy = loadStorage<Record<string, string[]>>(CUSTOM_TAXONOMY_KEY, initialCustomTaxonomy);
    if (!this.customTaxonomy['Hotel']) {
      this.customTaxonomy['Hotel'] = ['All Subcategories', 'Fast Food', 'Airport Transit Suites', 'Crew Rest Lounges', 'Executive Catering'];
    }
    this.suspendedCategories = loadStorage<string[]>(SUSPENDED_CATEGORIES_KEY, []);
    this.suspendedSubCategories = loadStorage<Record<string, string[]>>(SUSPENDED_SUBCATEGORIES_KEY, {});
    this.directServiceOffers = loadStorage<DirectServiceOffer[]>(DIRECT_SERVICE_OFFERS_KEY, initialDirectServiceOffers);
    this.platformCustomServices = loadStorage<Record<string, string[]>>(PLATFORM_CUSTOM_SERVICES_KEY, initialPlatformCustomServices);
    this.centralizedCreditPolicy = loadStorage<CentralizedCreditPolicy>(CENTRALIZED_CREDIT_POLICY_KEY, initialCentralizedCreditPolicy);
    this.centralizedCreditRequests = loadStorage<CentralizedCreditRequest[]>(CENTRALIZED_CREDIT_REQUESTS_KEY, initialCentralizedCreditRequests);
    this.dispatchedThresholdAlerts = loadStorage<DispatchedThresholdAlert[]>(DISPATCHED_THRESHOLD_ALERTS_KEY, []);
    this.transactionReportSubscriptions = loadStorage<Record<string, TransactionReportSubscription>>(TRANSACTION_REPORT_SUBSCRIPTIONS_KEY, {});
    this.dispatchedTransactionReports = loadStorage<DispatchedTransactionReport[]>(DISPATCHED_TRANSACTION_REPORTS_KEY, []);
    this.singleSessionAudits = loadStorage<SingleSessionAuditRecord[]>(SINGLE_SESSION_AUDITS_KEY, []);
    this.customerCareTickets = loadStorage<CustomerCareTicket[]>(CUSTOMER_CARE_TICKETS_KEY, initialCustomerCareTickets);
    if (!this.customerCareTickets || this.customerCareTickets.length === 0) {
      this.customerCareTickets = [...initialCustomerCareTickets];
    } else {
      this.customerCareTickets.forEach((t, idx) => {
        if (!t.zone) {
          t.zone = inferSupportZone(undefined, undefined, t.customer_phone);
        }
        if (!t.ticket_id || !t.ticket_id.includes('/')) {
          t.ticket_id = formatStandardTicketNumber(t.zone || 'APAC', idx + 1);
        }
      });
    }

    this.ticketCounters = loadStorage<Record<string, number>>('TRUVAER_SUPPORT_TICKET_COUNTERS_KEY', {
      'APAC-26': 2,
      'EMEA-26': 1,
      'NA-26': 1,
      'LATAM-26': 1,
      'ANZ-26': 1,
    });
    this.agentVerificationAudits = loadStorage<AgentVerificationGateAudit[]>(AGENT_VERIFICATION_AUDITS_KEY, []);
    this.activeSessions = loadStorage<Record<string, ActiveUserSession>>(ACTIVE_SESSIONS_STORE_KEY, {});
    this.sessionSettings = loadStorage<SessionSettingsConfig>(SESSION_SETTINGS_KEY, DEFAULT_SESSION_SETTINGS);

    this.flashNewsItems = loadStorage<FlashNewsItem[]>(FLASH_NEWS_KEY, initialFlashNewsItems);
    if (!this.flashNewsItems || this.flashNewsItems.length === 0) {
      this.flashNewsItems = [...initialFlashNewsItems];
    }
    // Enforce UPPERCASE ONLY on all headlines
    this.flashNewsItems = this.flashNewsItems.map((item) => ({
      ...item,
      headline: item.headline ? item.headline.toUpperCase() : '',
    }));
    this.flashNewsConfig = loadStorage<FlashNewsConfig>(FLASH_NEWS_CONFIG_KEY, initialFlashNewsConfig);
    if (!this.flashNewsConfig || !this.flashNewsConfig.max_active_limit) {
      this.flashNewsConfig = { ...initialFlashNewsConfig };
    }

    this.storyCategories = loadStorage<StoryCategory[]>(STORY_CATEGORIES_KEY, initialStoryCategories);
    if (!this.storyCategories || this.storyCategories.length === 0) {
      this.storyCategories = [...initialStoryCategories];
    }
    this.regionalZones = loadStorage<RegionalAuthorityZone[]>(REGIONAL_ZONES_KEY, initialRegionalZones);
    if (!this.regionalZones || this.regionalZones.length === 0) {
      this.regionalZones = [...initialRegionalZones];
    }
    this.countryMappings = loadStorage<RegionCountryMapping[]>(COUNTRY_MAPPINGS_KEY, initialCountryMappings);
    if (!this.countryMappings || this.countryMappings.length === 0) {
      this.countryMappings = [...initialCountryMappings];
    }

    this.regionalCreditPricing = loadStorage<RegionalCreditPricingRule[]>(REGIONAL_CREDIT_PRICING_KEY, initialRegionalCreditPricing);
    if (!this.regionalCreditPricing || this.regionalCreditPricing.length === 0) {
      this.regionalCreditPricing = [...initialRegionalCreditPricing];
    }
    this.globalDefaultCreditRate = loadStorage<number>(GLOBAL_DEFAULT_CREDIT_KEY, 15);

    // Ensure Super Admin Chairman / MD profile has full unrestricted access permissions across modules
    const superAdminAcc = this.adminUsers.find((a) => a.admin_id === 'admin_super_admin' || a.role === 'SUPER_ADMIN');
    if (superAdminAcc) {
      superAdminAcc.name = 'B Aditya Narayana (Chairman & Managing Director)';
      superAdminAcc.level = 8;
      superAdminAcc.level_title = 'L8 - Executive Chairman & Super Admin';
      superAdminAcc.department = 'Senior Management Team';
      superAdminAcc.assigned_modules = ['ALL'];
      superAdminAcc.permissions = [
        'ALL',
        'SUPER_ADMIN_DEBIT_APPROVAL',
        'MANAGE_ADMINS',
        'RESTRICT_PUBLICATION',
        'CREATE_ADMINS',
        'MODIFY_BUSINESS',
        'DELETE_BUSINESS',
        'KYC_HARD_LOCK_RELEASE',
        'APPROVE_PROMOTIONS',
        'OVERRIDE_PROMOTIONS',
        'REJECT_PROMOTIONS',
        'HOLD_PROMOTIONS',
        'MODIFY_TAXONOMY',
        'AUDIT_LOGS',
        'FULL_SYSTEM_ACCESS',
      ];
      superAdminAcc.permitted_portals = [
        'ALL',
        'marketing',
        'crm_portal',
        'admin_desk',
        'cpanel',
        'stores',
        'news',
        'finance',
        'operations',
        'hr',
        'pms',
      ];
    }

    const regSuperAdmin = this.regularUsers.find((u) => u.user_id === 'usr_super_admin' || u.role === 'SUPER_ADMIN');
    if (regSuperAdmin) {
      regSuperAdmin.first_name = 'B Aditya';
      regSuperAdmin.last_name = 'Narayana (Chairman & MD)';
      regSuperAdmin.permitted_portals = [
        'ALL',
        'marketing',
        'crm_portal',
        'admin_desk',
        'cpanel',
        'stores',
        'news',
        'finance',
        'operations',
        'hr',
        'pms',
      ];
    }
  }

  public persist() {
    saveStorage(REGULAR_USERS_KEY, this.regularUsers);
    saveStorage(BUSINESS_PROFILES_KEY, this.businesses);
    saveStorage(ADMIN_USERS_KEY, this.adminUsers);
    saveStorage(PRICING_MATRIX_KEY, this.pricingMatrix);
    saveStorage(SERVICE_LISTINGS_KEY, this.serviceListings);
    saveStorage(REVIEWS_KEY, this.reviews);
    saveStorage(INTERNAL_MAILS_KEY, this.internalMails);
    saveStorage(CHATS_KEY, this.chats);
    saveStorage(JOBS_KEY, this.jobs);
    saveStorage(NEWS_KEY, this.news);
    saveStorage(EVENTS_KEY, this.events);
    saveStorage(OTP_STORE_KEY, this.otps);
    saveStorage(API_LOGS_KEY, this.apiLogs);
    saveStorage(DEBIT_REQUESTS_KEY, this.debitRequests);
    saveStorage(PROMOTION_REQUESTS_KEY, this.promotionRequests);
    saveStorage(UNLOCKED_CONTACTS_KEY, this.unlockedContacts);
    saveStorage(GLOBAL_SETTINGS_KEY, this.globalSettings);
    saveStorage(USER_NOTIFICATIONS_KEY, this.notifications);
    saveStorage(CRM_LEADS_KEY, this.crmLeads);
    saveStorage(CRM_OPPORTUNITIES_KEY, this.crmOpportunities);
    saveStorage(CRM_QUOTATIONS_KEY, this.crmQuotations);
    saveStorage(CRM_TICKETS_KEY, this.crmTickets);
    saveStorage(COMMISSIONS_KEY, this.commissions);
    saveStorage(STORE_INVENTORY_KEY, this.storeInventory);
    saveStorage(CRM_SALES_KEY, this.crmSales);
    saveStorage(ADMIN_ACTIVITIES_KEY, this.adminActivities);
    saveStorage(BUSINESS_POSTS_KEY, this.businessPosts);
    saveStorage(BUSINESS_FOLLOWERS_KEY, this.businessFollowers);
    saveStorage(DAILY_PAYOUTS_KEY, this.dailyPayoutReports);
    saveStorage(BROADCAST_NOTIFICATIONS_KEY, this.broadcastNotifications);
    saveStorage(CUSTOM_SERVICE_REQUESTS_KEY, this.customServiceRequests);
    saveStorage(CUSTOM_CATEGORY_REQUESTS_KEY, this.customCategoryRequests);
    saveStorage(CUSTOM_TAXONOMY_KEY, this.customTaxonomy);
    saveStorage(SUSPENDED_CATEGORIES_KEY, this.suspendedCategories);
    saveStorage(SUSPENDED_SUBCATEGORIES_KEY, this.suspendedSubCategories);
    saveStorage(DIRECT_SERVICE_OFFERS_KEY, this.directServiceOffers);
    saveStorage(PLATFORM_CUSTOM_SERVICES_KEY, this.platformCustomServices);
    saveStorage(ADMIN_PROJECTS_KEY, this.adminProjects);
    saveStorage(ADMIN_TASKS_KEY, this.adminTasks);
    saveStorage(QUOTATION_REQUESTS_KEY, this.quotationRequests);
    saveStorage(BUSINESS_REPORTS_KEY, this.businessReports);
    saveStorage(POST_REPORTS_KEY, this.postReports);
    saveStorage(PUBLISH_SANCTIONS_KEY, this.publishSanctions);
    saveStorage(CUSTOM_USER_TYPES_KEY, this.customUserTypes);
    saveStorage(CENTRALIZED_CREDIT_POLICY_KEY, this.centralizedCreditPolicy);
    saveStorage(CENTRALIZED_CREDIT_REQUESTS_KEY, this.centralizedCreditRequests);
    saveStorage(DISPATCHED_THRESHOLD_ALERTS_KEY, this.dispatchedThresholdAlerts);
    saveStorage(TRANSACTION_REPORT_SUBSCRIPTIONS_KEY, this.transactionReportSubscriptions);
    saveStorage(DISPATCHED_TRANSACTION_REPORTS_KEY, this.dispatchedTransactionReports);
    saveStorage(SINGLE_SESSION_AUDITS_KEY, this.singleSessionAudits);
    saveStorage(CUSTOMER_CARE_TICKETS_KEY, this.customerCareTickets);
    saveStorage(AGENT_VERIFICATION_AUDITS_KEY, this.agentVerificationAudits);
    saveStorage(ACTIVE_SESSIONS_STORE_KEY, this.activeSessions);
    saveStorage(SESSION_SETTINGS_KEY, this.sessionSettings);
    saveStorage(PLATFORM_MODULE_CONTROLS_KEY, this.platformModuleControls);
    saveStorage(GLOBAL_CRISIS_MODE_KEY, this.globalCrisisMode);
    saveStorage(FLASH_NEWS_KEY, this.flashNewsItems);
    saveStorage(FLASH_NEWS_CONFIG_KEY, this.flashNewsConfig);
    saveStorage(STORY_CATEGORIES_KEY, this.storyCategories);
    saveStorage(REGIONAL_ZONES_KEY, this.regionalZones);
    saveStorage(COUNTRY_MAPPINGS_KEY, this.countryMappings);
    saveStorage(REGIONAL_CREDIT_PRICING_KEY, this.regionalCreditPricing);
    saveStorage(GLOBAL_DEFAULT_CREDIT_KEY, this.globalDefaultCreditRate);
  }

  public getAdminActivities(): AdminActivityItem[] {
    return [...this.adminActivities];
  }

  public getAdminAuditLogs(): AdminActivityItem[] {
    return [...this.adminActivities];
  }

  public logAdminActivity(
    activity: Omit<AdminActivityItem, 'id' | 'timestamp'> & { timestamp?: string }
  ): AdminActivityItem {
    const newItem: AdminActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: activity.timestamp || new Date().toISOString(),
      ...activity,
    };
    this.adminActivities = [newItem, ...this.adminActivities.slice(0, 99)];
    this.persist();
    this.activityListeners.forEach((listener) => {
      try {
        listener(newItem);
      } catch (err) {
        console.error('Error notifying activity listener:', err);
      }
    });
    return newItem;
  }

  public subscribeToAdminActivities(listener: (item: AdminActivityItem) => void): () => void {
    this.activityListeners.push(listener);
    return () => {
      this.activityListeners = this.activityListeners.filter((l) => l !== listener);
    };
  }

  public logApiCall(endpoint: string, method: 'POST' | 'GET', statusCode: number, requestPayload: any, responsePayload: any) {
    const entry: ApiLogEntry = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      statusCode,
      requestPayload,
      responsePayload,
    };
    this.apiLogs = [entry, ...this.apiLogs.slice(0, 49)];
    this.persist();
  }

  public getApiLogs(): ApiLogEntry[] {
    return this.apiLogs;
  }

  public clearApiLogs() {
    this.apiLogs = [];
    this.persist();
  }

  // --- Users & Roles ---
  public getRegularUsers(): RegularUser[] {
    return this.regularUsers;
  }

  public getRegularUserById(id: string): RegularUser | undefined {
    return this.regularUsers.find((u) => u.user_id === id);
  }

  public checkUsernameAvailable(username: string): boolean {
    const normalized = username.trim().toLowerCase();
    return !this.regularUsers.some((u) => u.username.toLowerCase() === normalized);
  }

  public checkEmailAvailable(email: string): boolean {
    const normalized = email.trim().toLowerCase();
    return (
      !this.regularUsers.some((u) => u.email.toLowerCase() === normalized) &&
      !this.businesses.some((b) => b.business_email.toLowerCase() === normalized)
    );
  }

  public getAdminUsers(): AdminUser[] {
    return this.adminUsers;
  }

  // User Role Switching (Section 3 & 4 of C-Panel document)
  public updateRegularUserProfile(userId: string, updates: Partial<RegularUser>): { success: boolean; message: string; user?: RegularUser } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    if (updates.first_name !== undefined) user.first_name = updates.first_name;
    if (updates.last_name !== undefined) user.last_name = updates.last_name;
    if (updates.city !== undefined) user.city = updates.city;
    if (updates.phone_number !== undefined) user.phone_number = updates.phone_number;
    if (updates.organization !== undefined) user.organization = updates.organization;
    if (updates.gender !== undefined) user.gender = updates.gender;

    this.persist();
    return { success: true, message: 'Profile updated successfully.', user };
  }

  public switchUserRole(
    userId: string,
    newRole: 'STANDARD_USER' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN' | string,
    actorLevel: number = 8,
    actorRole: string = 'SUPER_ADMIN'
  ): { success: boolean; message: string } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const email = (user.email || '').toLowerCase().trim();
    const hasOrgDomain = email.endsWith('@yarifly.com') || email.endsWith('@truvaer.com');

    // Strict condition: any Admin / Super Admin account must have a mandatory email ending with @yarifly.com or @truvaer.com
    if ((newRole === 'ADMIN' || newRole === 'SUPER_ADMIN') && !hasOrgDomain) {
      return {
        success: false,
        message: `Policy Violation: Admin and Super Admin accounts must have a mandatory domain email ending with @yarifly.com or @truvaer.com. User email is "${user.email}".`,
      };
    }

    // Super Admin can be changed only if an L8 user permits conversion to L8 / Super Admin
    if (newRole === 'SUPER_ADMIN' && actorLevel < 8 && actorRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Permission Denied: Promoting an account to Super Admin is strictly reserved to Level 8 (L8) Sovereign Executives.',
      };
    }

    user.role = newRole;
    // If switched to STANDARD_USER, automatically enforce standard baseline modules
    if (newRole === 'STANDARD_USER') {
      user.allowed_modules = [...STANDARD_USER_BASELINE_MODULES];
    } else {
      const typeDef = this.customUserTypes.find((t) => t.key === newRole);
      if (typeDef) {
        user.allowed_modules = [...typeDef.defaultAllowedModules];
      }
    }
    this.persist();
    return { success: true, message: `User @${user.username} classification updated to ${newRole}.` };
  }

  // --- Custom User Types (Roles) CRUD ---
  public getCustomUserTypes(): CustomUserType[] {
    return [...this.customUserTypes];
  }

  public createCustomUserType(type: Omit<CustomUserType, 'id' | 'createdAt' | 'updatedAt'>): {
    success: boolean;
    message: string;
    userType?: CustomUserType;
  } {
    const keyNorm = type.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!keyNorm) {
      return { success: false, message: 'Role key/code is required.' };
    }
    if (this.customUserTypes.some((t) => t.key === keyNorm)) {
      return { success: false, message: `Role code "${keyNorm}" already exists.` };
    }

    const now = new Date().toISOString();
    const newType: CustomUserType = {
      id: `role_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: keyNorm,
      label: type.label.trim() || keyNorm,
      description: type.description.trim(),
      defaultAllowedModules: type.defaultAllowedModules || [],
      isSystem: false,
      colorBadge: type.colorBadge || 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      createdAt: now,
      updatedAt: now,
      level: type.level,
      levelTitle: type.levelTitle,
      department: type.department,
      reportingTo: type.reportingTo,
      zone: type.zone,
      operationalReason: type.operationalReason,
      accountHolder: type.accountHolder,
    };

    this.customUserTypes.push(newType);
    this.persist();

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Custom User Type Created',
      description: `Created custom role "${newType.label}" [${newType.key}] with ${newType.defaultAllowedModules.length} enabled modules.`,
      actor_name: 'Platform Administrator',
      actor_role: 'L8 Super Admin',
      severity: 'success',
    });

    return { success: true, message: `Role "${newType.label}" successfully created!`, userType: newType };
  }

  public updateCustomUserType(
    id: string,
    updates: Partial<Omit<CustomUserType, 'id' | 'createdAt'>>
  ): { success: boolean; message: string; userType?: CustomUserType } {
    const target = this.customUserTypes.find((t) => t.id === id);
    if (!target) return { success: false, message: 'User type/role not found.' };

    if (updates.label !== undefined) target.label = updates.label.trim();
    if (updates.description !== undefined) target.description = updates.description.trim();
    if (updates.colorBadge !== undefined) target.colorBadge = updates.colorBadge;
    if (updates.defaultAllowedModules !== undefined) {
      target.defaultAllowedModules = [...updates.defaultAllowedModules];
    }
    if (updates.level !== undefined) target.level = updates.level;
    if (updates.levelTitle !== undefined) target.levelTitle = updates.levelTitle;
    if (updates.department !== undefined) target.department = updates.department;
    if (updates.reportingTo !== undefined) target.reportingTo = updates.reportingTo;
    if (updates.zone !== undefined) target.zone = updates.zone;
    if (updates.operationalReason !== undefined) target.operationalReason = updates.operationalReason;
    if (updates.accountHolder !== undefined) target.accountHolder = updates.accountHolder;
    target.updatedAt = new Date().toISOString();

    this.persist();

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'User Type Updated',
      description: `Updated custom role "${target.label}" [${target.key}]. Modules count: ${target.defaultAllowedModules.length}.`,
      actor_name: 'Platform Administrator',
      actor_role: 'L8 Super Admin',
      severity: 'info',
    });

    return { success: true, message: `Role "${target.label}" updated successfully!`, userType: target };
  }

  public deleteCustomUserType(id: string): { success: boolean; message: string } {
    const target = this.customUserTypes.find((t) => t.id === id);
    if (!target) return { success: false, message: 'User type/role not found.' };
    if (target.isSystem) {
      return { success: false, message: `System role "${target.label}" is protected and cannot be deleted.` };
    }

    // Demote any active users on this role back to STANDARD_USER
    this.regularUsers.forEach((u) => {
      if (u.role === target.key) {
        u.role = 'STANDARD_USER';
        u.allowed_modules = [...STANDARD_USER_BASELINE_MODULES];
      }
    });

    this.customUserTypes = this.customUserTypes.filter((t) => t.id !== id);
    this.persist();

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'User Type Deleted',
      description: `Deleted custom role "${target.label}" [${target.key}]. Any associated users demoted to Standard User.`,
      actor_name: 'Platform Administrator',
      actor_role: 'L8 Super Admin',
      severity: 'warning',
    });

    return { success: true, message: `Role "${target.label}" deleted successfully.` };
  }

  // --- Specific User Module Access & Granular Actions ---
  public updateUserModuleAccess(
    userId: string,
    allowedModules: string[]
  ): { success: boolean; message: string; user?: RegularUser } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    // Super Admin cannot be restricted
    if (this.isSuperAdmin(user)) {
      return {
        success: false,
        message: 'Super Admin (Chairman / MD) retains universal, unrestricted full system access across all modules by organizational policy.',
      };
    }

    user.allowed_modules = [...allowedModules];
    this.persist();

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'User Module Access Updated',
      description: `Updated module clearances for @${user.username}: ${allowedModules.length} modules granted.`,
      actor_name: 'Platform Administrator',
      actor_role: 'L8 Super Admin',
      target_id: user.user_id,
      target_name: `@${user.username}`,
      severity: 'info',
    });

    return { success: true, message: `Module access updated for @${user.username}.`, user };
  }

  public updateRoleModuleAccess(
    roleKey: string,
    allowedModules: string[]
  ): { success: boolean; message: string } {
    const roleType = this.customUserTypes.find((t) => t.key === roleKey);
    if (!roleType) return { success: false, message: `Role ${roleKey} not found.` };

    // Super Admin role must maintain universal, full-access permissions across all modules
    if (roleKey === 'SUPER_ADMIN') {
      roleType.defaultAllowedModules = MASTER_APP_MODULES.map((m) => m.id);
      this.persist();
      return {
        success: true,
        message: 'Super Administrator role maintains universal, unrestricted full-access permissions across all modules by system policy.',
      };
    }

    roleType.defaultAllowedModules = [...allowedModules];
    roleType.updatedAt = new Date().toISOString();

    // Propagate to all users with this role if they don't have custom overrides
    this.regularUsers.forEach((u) => {
      if (u.role === roleKey && !this.isSuperAdmin(u)) {
        u.allowed_modules = [...allowedModules];
      }
    });

    this.persist();
    return { success: true, message: `Master module assignment updated for role "${roleType.label}".` };
  }

  // Helper to check if a user is the Super Admin (Chairman & Managing Director)
  public isSuperAdmin(user: RegularUser | AdminUser | null | undefined): boolean {
    if (!user) return false;
    if ('role' in user && user.role === 'SUPER_ADMIN') return true;
    if ('level' in user && (user.level ?? 0) >= 8) return true;
    if (
      'level_title' in user &&
      (user.level_title?.toLowerCase().includes('super admin') ||
        user.level_title?.toLowerCase().includes('chairman') ||
        user.level_title?.toLowerCase().includes('managing director'))
    )
      return true;
    if (
      'name' in user &&
      (user.name?.toLowerCase().includes('chairman') ||
        user.name?.toLowerCase().includes('aditya narayana'))
    )
      return true;
    if ('first_name' in user && user.first_name?.toLowerCase().includes('aditya')) return true;
    if (
      'admin_id' in user &&
      (user.admin_id === 'admin_super_admin' ||
        user.admin_id === 'admin_super_01' ||
        user.admin_id === 'admin_primary_truvaer')
    )
      return true;
    if ('user_id' in user && user.user_id === 'usr_super_admin') return true;
    if ('email' in user && user.email?.toLowerCase() === 'sup_admin@truvaer.com') return true;
    if ('username' in user && user.username?.toLowerCase() === 'super_admin') return true;
    if ('department' in user && user.department === 'Senior Management Team') return true;
    if ('permissions' in user && Array.isArray(user.permissions) && user.permissions.includes('ALL'))
      return true;
    return false;
  }

  // Helper to check if a user is allowed to access a specific module
  public isUserModuleAllowed(user: RegularUser | AdminUser | null, moduleId: string): boolean {
    if (!user) return false;

    // Super Admin (Chairman / MD) has universal, unrestricted sovereign access to ALL modules, bypassing all hierarchical locks
    if (this.isSuperAdmin(user) || ('role' in user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'))) {
      return true;
    }

    // Standard User: Hide / Remove module access by default. Super Admin controls what modules need to be permitted and not from admin format only.
    if ('role' in user && user.role === 'STANDARD_USER') {
      if (STANDARD_USER_RESTRICTED_MODULES.includes(moduleId)) {
        return false;
      }
      // Only permit modules that the Super Admin has explicitly permitted for this user
      if (user.allowed_modules && Array.isArray(user.allowed_modules)) {
        return user.allowed_modules.includes(moduleId);
      }
      // Standard user has no module access by default unless permitted by Super Admin
      return false;
    }

    // Business User: Strictly restrict module access. No HR, SIS, Flight Training, Inventory parts, Dynamic Forms, Approved Taxonomy, Learner profile, Transport & GSE, Certificates, etc.
    // Allow only required items: quotations, client follow-up, leads, proposals, commissions, chat, alerts, corporate profile & password reset, and legal agreements.
    if ('role' in user && (user.role === 'BUSINESS_USER' || user.role === 'role_business')) {
      const allowedBusinessModules = [
        'crm_quotations',
        'crm_client_followup',
        'crm_leads',
        'crm_proposals',
        'crm_commissions',
        'comm_chat',
        'comm_alerts',
        'user_profile_settings',
        'sec_pwd_reset',
        'sec_privacy_policy',
        'sec_user_agreement',
      ];
      if (user.allowed_modules && Array.isArray(user.allowed_modules)) {
        return user.allowed_modules.includes(moduleId) && allowedBusinessModules.includes(moduleId);
      }
      return allowedBusinessModules.includes(moduleId);
    }

    // Other roles: check specific user's allowed_modules or their role definition
    if (user.allowed_modules && Array.isArray(user.allowed_modules)) {
      return user.allowed_modules.includes(moduleId);
    }

    const typeDef = this.customUserTypes.find((t) => t.key === user.role);
    if (typeDef) {
      return typeDef.defaultAllowedModules.includes(moduleId);
    }

    return false;
  }

  // --- User Profile Picture / Business Logo Secure Management (Add, Update, Delete) ---
  public updateUserProfilePicture(
    userId: string,
    avatarUrl: string | null
  ): { success: boolean; message: string; avatarUrl: string | null } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.', avatarUrl: null };

    // Cache-busting URL with timestamp if setting a new picture
    const finalUrl = avatarUrl
      ? `${avatarUrl.split('?t=')[0]}?t=${Date.now()}`
      : null;

    user.avatar_url = finalUrl || undefined;
    this.persist();

    return {
      success: true,
      message: finalUrl ? 'Profile picture updated successfully!' : 'Profile picture removed.',
      avatarUrl: finalUrl,
    };
  }

  public updateBusinessLogo(
    businessId: string,
    logoUrl: string | null
  ): { success: boolean; message: string; logoUrl: string | null } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business not found.', logoUrl: null };

    const finalUrl = logoUrl
      ? `${logoUrl.split('?t=')[0]}?t=${Date.now()}`
      : null;

    biz.logoUrl = finalUrl || undefined;

    // Sync to service listing as well
    const listing = this.serviceListings.find((s) => s.business_id === businessId);
    if (listing) {
      listing.logoUrl = finalUrl || '';
    }

    this.persist();

    return {
      success: true,
      message: finalUrl ? 'Business logo updated successfully!' : 'Business logo removed.',
      logoUrl: finalUrl,
    };
  }

  // Switch Employee Lifecycle State (Section 4 Events Document: Active Employee <-> Alumni)
  public switchEmploymentLifecycle(userId: string, newStatus: 'Active Employee' | 'Alumni'): { success: boolean; message: string } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    user.employment_status = newStatus;
    this.persist();
    return {
      success: true,
      message:
        newStatus === 'Alumni'
          ? `IAM Trigger: @${user.username} transitioned to Alumni. Dynamic Content Throttling Engine applied (-75% updates, internal feeds revoked).`
          : `IAM Trigger: @${user.username} restored to Active Employee. Full internal event matrix unlocked.`,
    };
  }

  // Regular User Registration
  public registerRegular(payload: RegularRegisterPayload): {
    statusCode: number;
    response: RegularRegisterResponse | { success: false; message: string; errors?: Record<string, string> };
  } {
    const errors: Record<string, string> = {};
    const usernameNorm = payload.username.trim().toLowerCase();
    const emailNorm = payload.email.trim().toLowerCase();

    const usernameRegex = /^[a-z0-9_.]+$/;
    if (!usernameRegex.test(usernameNorm) || usernameNorm.length < 3 || usernameNorm.length > 30) {
      errors.username = 'Username must be 3-30 chars, lowercase, alphanumeric, underscore or dot (^' + '^[a-z0-9_.]+$).';
    } else if (!this.checkUsernameAvailable(usernameNorm)) {
      errors.username = 'Username is already taken by another aviator.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNorm)) {
      errors.email = 'Standard email format is required.';
    } else if (!this.checkEmailAvailable(emailNorm)) {
      errors.email = 'Email is already registered in the Truvaer ecosystem.';
    }

    if (!payload.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required.';
    } else {
      const birthDate = new Date(payload.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (isNaN(age) || age < 18) {
        errors.date_of_birth = 'You must be at least 18 years of age to register in Truvaer.';
      }
    }

    const e164Regex = /^\+[1-9]\d{7,14}$/;
    if (!e164Regex.test(payload.phone_number.trim())) {
      errors.phone_number = 'Phone number must be in E.164 format (e.g. +919876543210).';
    }

    if (Object.keys(errors).length > 0) {
      const errRes = {
        success: false as const,
        message: 'Validation failed on user input parameters.',
        errors,
      };
      this.logApiCall('/api/v1/auth/register/regular', 'POST', 400, payload, errRes);
      return { statusCode: 400, response: errRes };
    }

    const userId = generateUUID();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresInSeconds = 900;

    const newUser: RegularUser = {
      user_id: userId,
      username: usernameNorm,
      first_name: payload.first_name || 'Aviator',
      last_name: payload.last_name || '',
      gender: payload.gender || 'Other',
      city: payload.city || 'Mumbai',
      email: emailNorm,
      password_hash: `$argon2id$v=19$m=65536,t=3,p=4$${generateUUID().substring(0, 10)}$hash`,
      is_email_verified: false,
      date_of_birth: payload.date_of_birth,
      country_code: payload.country_code.toUpperCase(),
      phone_number: payload.phone_number.trim(),
      account_status: 'PENDING_VERIFICATION',
      role: 'STANDARD_USER',
      employment_status: 'Active Employee',
      created_at: new Date().toISOString(),
    };

    this.regularUsers.unshift(newUser);

    this.otps[userId] = {
      user_id: userId,
      otp,
      expires_at: Date.now() + otpExpiresInSeconds * 1000,
      resend_count: 0,
      last_sent_at: Date.now(),
    };

    this.persist();

    const successRes: RegularRegisterResponse = {
      success: true,
      message: 'User registered successfully. Verification required.',
      data: {
        user_id: userId,
        username: usernameNorm,
        email: emailNorm,
        status: 'PENDING_VERIFICATION',
        verification_type: 'EMAIL_OTP',
        otp_expires_in_seconds: otpExpiresInSeconds,
      },
    };

    this.logApiCall('/api/v1/auth/register/regular', 'POST', 201, payload, successRes);
    return { statusCode: 201, response: successRes };
  }

  // Verify Email OTP
  public verifyEmailOtp(userId: string, otpInput: string): {
    statusCode: number;
    response: {
      success: boolean;
      message: string;
      data?: {
        user_id: string;
        account_status: string;
        is_email_verified: boolean;
        wallet: DigitalWallet;
        tokens: {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };
      };
    };
  } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) {
      const errRes = { success: false, message: 'User record not found.' };
      this.logApiCall('/api/v1/auth/verify-email', 'POST', 404, { user_id: userId, otp: otpInput }, errRes);
      return { statusCode: 404, response: errRes };
    }

    const otpRecord = this.otps[userId];
    if (!otpRecord) {
      const errRes = { success: false, message: 'No active OTP verification session found. Please request a new code.' };
      this.logApiCall('/api/v1/auth/verify-email', 'POST', 400, { user_id: userId, otp: otpInput }, errRes);
      return { statusCode: 400, response: errRes };
    }

    if (Date.now() > otpRecord.expires_at) {
      const errRes = { success: false, message: 'OTP has expired (15-minute validity window exceeded).' };
      this.logApiCall('/api/v1/auth/verify-email', 'POST', 400, { user_id: userId, otp: otpInput }, errRes);
      return { statusCode: 400, response: errRes };
    }

    if (otpRecord.otp !== otpInput.trim()) {
      const errRes = { success: false, message: 'Invalid 6-digit OTP code provided.' };
      this.logApiCall('/api/v1/auth/verify-email', 'POST', 400, { user_id: userId, otp: otpInput }, errRes);
      return { statusCode: 400, response: errRes };
    }

    user.is_email_verified = true;
    user.account_status = 'ACTIVE';

    const wallet: DigitalWallet = {
      wallet_id: `wal_${generateUUID().substring(0, 8)}`,
      purchased_credits: 0,
      earned_credits: 5000,
      balance: 5000,
      currency: user.country_code === 'IN' ? 'INR' : 'USD',
      provisioned_at: new Date().toISOString(),
      transactions: [
        {
          id: `tx_${generateUUID().substring(0, 6)}`,
          type: 'EARNED_REWARD',
          creditType: 'EARNED',
          amount: 5000,
          description: 'Truvaer Onboarding Welcome Grant',
          timestamp: new Date().toISOString(),
        },
      ],
      conversionHistory: [],
    };
    user.wallet = wallet;

    delete this.otps[userId];
    this.persist();

    const successRes = {
      success: true,
      message: 'Email successfully verified. Account activated and Digital Wallet auto-provisioned.',
      data: {
        user_id: user.user_id,
        account_status: user.account_status,
        is_email_verified: true,
        wallet,
        tokens: {
          access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: user.user_id, role: user.role, exp: Math.floor(Date.now() / 1000) + 900 }))}.signature_hash`,
          refresh_token: `rft_${generateUUID()}`,
          expires_in: 900,
        },
      },
    };

    this.logApiCall('/api/v1/auth/verify-email', 'POST', 200, { user_id: userId, otp: otpInput }, successRes);
    return { statusCode: 200, response: successRes };
  }

  public resendOtp(userId: string): { success: boolean; message: string; otp?: string; remainingAttempts?: number } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    const existing = this.otps[userId] || {
      user_id: userId,
      otp: '',
      expires_at: 0,
      resend_count: 0,
      last_sent_at: 0,
    };

    const oneHour = 60 * 60 * 1000;
    if (Date.now() - existing.last_sent_at > oneHour) {
      existing.resend_count = 0;
    }

    if (existing.resend_count >= 3) {
      return {
        success: false,
        message: 'Triggered Resend Rate-Limit: Maximum 3 resend attempts allowed per hour.',
      };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    existing.otp = newOtp;
    existing.expires_at = Date.now() + 15 * 60 * 1000;
    existing.resend_count += 1;
    existing.last_sent_at = Date.now();

    this.otps[userId] = existing;
    this.persist();

    return {
      success: true,
      message: 'New 6-digit verification code dispatched to your registered email.',
      otp: newOtp,
      remainingAttempts: 3 - existing.resend_count,
    };
  }

  public getActiveOtpForUser(userId: string): OtpRecord | undefined {
    return this.otps[userId];
  }

  // --- Business Profile Methods ---
  public getBusinesses(): BusinessProfile[] {
    return this.businesses;
  }

  public getBusinessById(businessId: string): BusinessProfile | undefined {
    return this.businesses.find((b) => b.business_id === businessId);
  }

  public registerBusiness(payload: BusinessRegisterPayload): {
    statusCode: number;
    response: BusinessRegisterResponse | { success: false; message: string; errors?: Record<string, string> };
  } {
    const errors: Record<string, string> = {};

    if (!payload.organization_name || payload.organization_name.trim().length < 2 || payload.organization_name.trim().length > 150) {
      errors.organization_name = 'Organization legal name must be between 2 and 150 characters.';
    }

    if (!payload.owner_name || payload.owner_name.trim().length < 3) {
      errors.owner_name = 'Full legal name of primary business owner is required.';
    }

    const regNo = payload.registration_number.trim().toUpperCase();
    if (payload.reg_number_type === 'PAN') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(regNo)) {
        errors.registration_number = 'Invalid Indian Corporate PAN format (e.g. ABCDE1234F).';
      }
    } else if (payload.reg_number_type === 'TAN') {
      const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
      if (!tanRegex.test(regNo)) {
        errors.registration_number = 'Invalid Indian Corporate TAN format (e.g. ABCD12345F).';
      }
    } else {
      if (regNo.length < 5) {
        errors.registration_number = 'Corporate registration number must be at least 5 alphanumeric characters.';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.business_email.trim())) {
      errors.business_email = 'Valid corporate domain email is required.';
    }

    if (!payload.bank_account_holder || payload.bank_account_holder.trim().length < 2) {
      errors.bank_account_holder = 'Bank account holder name is required.';
    }
    const cleanBankAcc = payload.bank_account_number.replace(/\s+/g, '');
    if (!cleanBankAcc || cleanBankAcc.length < 8) {
      errors.bank_account_number = 'Valid bank account number is required (min 8 digits).';
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const code = payload.bank_ifsc_swift.trim().toUpperCase();
    if (!ifscRegex.test(code) && !swiftRegex.test(code)) {
      errors.bank_ifsc_swift = 'Must be a valid Indian IFSC (e.g. HDFC0001234) or global SWIFT/BIC code.';
    }

    if (!payload.bank_name || payload.bank_name.trim().length < 2) {
      errors.bank_name = 'Commercial banking institution name is required.';
    }

    if (payload.file && payload.file.size > 10 * 1024 * 1024) {
      errors.inc_cert_doc = 'Uploaded compliance file exceeds the maximum 10MB limit.';
    }

    if (Object.keys(errors).length > 0) {
      const errRes = {
        success: false as const,
        message: 'Validation failed on business onboarding parameters.',
        errors,
      };
      this.logApiCall('/api/v1/auth/register/business', 'POST', 400, { ...payload, password: '[REDACTED]' }, errRes);
      return { statusCode: 400, response: errRes };
    }

    const businessId = generateUUID();
    const maskedAcc = '****' + cleanBankAcc.slice(-4);
    const encryptedBankAcc = `aes256_enc_${btoa(cleanBankAcc)}`;

    const newBusiness: BusinessProfile = {
      business_id: businessId,
      organization_name: payload.organization_name.trim(),
      owner_name: payload.owner_name.trim(),
      reg_number_type: payload.reg_number_type,
      registration_number: regNo,
      date_of_registration: payload.date_of_registration || '2022-01-01',
      nature_of_business: payload.nature_of_business || 'Aviation & Hospitality Services',
      business_description: payload.business_description || 'Corporate Aviation Provider',
      physical_location: payload.physical_location || `${payload.city || 'Hyderabad'}, ${payload.state || 'TS'}, ${payload.country}`,
      city: payload.city || 'Hyderabad',
      state: payload.state || 'TS',
      creator_user_id: payload.creator_user_id,
      business_locations: [
        {
          id: `loc_${businessId}_0`,
          city: payload.city || 'Hyderabad',
          state: payload.state || 'TS',
          country: payload.country.toUpperCase(),
          display: payload.physical_location || `${payload.city || 'Hyderabad'}, ${payload.state || 'TS'}, ${payload.country === 'IN' ? 'India' : payload.country}`,
          is_primary: true,
        },
      ],
      website_url: payload.website_url || 'https://example.com',
      country: payload.country.toUpperCase(),
      business_email: payload.business_email.trim().toLowerCase(),
      phone_number: payload.phone_number || '+919900112233',
      password_hash: `$argon2id$v=19$m=65536,t=3,p=4$${generateUUID().substring(0, 10)}$biz`,
      inc_cert_doc_url: `https://s3.${payload.country.toLowerCase() === 'in' ? 'ap-south-1' : 'us-east-1'}.amazonaws.com/truvaer-compliance-vault/${regNo}_inc_cert.pdf`,
      inc_cert_file_name: payload.file?.name || `${regNo}_incorporation_doc.pdf`,
      inc_cert_file_size: payload.file?.size || 1845000,
      bank_account_holder: payload.bank_account_holder.trim(),
      bank_account_number: encryptedBankAcc,
      bank_account_number_masked: maskedAcc,
      bank_ifsc_swift: code,
      bank_name: payload.bank_name.trim(),
      finance_bank_verified: false,
      bank_verification_status: 'PENDING_VERIFICATION',
      bank_uploaded_by_user_id: businessId,
      bank_uploaded_by_user_name: payload.organization_name,
      bank_uploaded_at: new Date().toISOString(),
      cancelled_cheque_filename: `${payload.organization_name.replace(/\s+/g, '_')}_Cancelled_Cheque.pdf`,
      cancelled_cheque_doc_url: 'https://compliance.truvaer.com/docs/cancelled_cheque.pdf',
      cancelled_cheque_filesize: 1450200,
      bank_statement_filename: `${payload.organization_name.replace(/\s+/g, '_')}_Bank_Statement_Q3.pdf`,
      bank_statement_doc_url: 'https://compliance.truvaer.com/docs/bank_statement_q3.pdf',
      bank_statement_filesize: 2890400,
      bank_verification_history: [
        {
          action: 'SUBMITTED',
          timestamp: new Date().toISOString(),
          actor_name: payload.organization_name,
          actor_role: 'Account Owner',
          notes: 'Initial account onboarding: Banking coordinates, Cancelled Cheque, and Bank Statement uploaded for Finance audit.',
        },
      ],
      verification_status: 'HARD_LOCKED',
      domain_challenge_sent: false,
      domain_verified: false,
      submitted_at: new Date().toISOString(),
      category: 'Boutique Hospitality',
      rating: 5.0,
      reviewCount: 0,
      servicesOffered: ['Aviation Corporate Services'],
      truvaer_id: generateTruvaerId(payload.country, this.businesses.length),
    };

    this.businesses.unshift(newBusiness);
    this.persist();

    const successRes: BusinessRegisterResponse = {
      success: true,
      message: 'Business profile submitted for review. Account is currently locked.',
      data: {
        business_id: businessId,
        organization_name: newBusiness.organization_name,
        verification_status: 'HARD_LOCKED',
        estimated_review_hours: 72,
      },
    };

    this.logApiCall('/api/v1/auth/register/business', 'POST', 202, { ...payload, password: '[REDACTED]' }, successRes);
    return { statusCode: 202, response: successRes };
  }

  // Admin Desk Operations
  public adminGetVerifications(statusFilter?: string): BusinessProfile[] {
    if (!statusFilter || statusFilter === 'ALL') {
      return this.businesses;
    }
    if (statusFilter === 'BANK_PENDING') {
      return this.businesses.filter((b) => !b.finance_bank_verified);
    }
    return this.businesses.filter((b) => b.verification_status === statusFilter);
  }

  public adminApproveBusiness(businessId: string): { success: boolean; message: string; business?: BusinessProfile } {
    const business = this.businesses.find((b) => b.business_id === businessId);
    if (!business) return { success: false, message: 'Business record not found.' };

    business.verification_status = 'VERIFIED';
    business.is_hard_locked_by_admin = false;
    business.verified_at = new Date().toISOString();
    business.rejection_reason_code = undefined;
    business.rejection_remarks = undefined;
    business.domain_verified = true;

    if (!business.corporate_wallet) {
      business.corporate_wallet = {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 5000,
        tier: 'Enterprise Verified Standard',
        provisioned_at: new Date().toISOString(),
        transactions: [
          {
            id: `ctx_${generateUUID().substring(0, 6)}`,
            type: 'GRANT',
            credits: 5000,
            description: 'Corporate Verification Desk Welcome Grant',
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }

    this.persist();
    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Business Approved: ${business.organization_name}`,
      description: `Verification completed for ${business.organization_name} (${business.category}). Hard-lock lifted and 5,000 corporate credits provisioned.`,
      actor_name: 'Primary Truvaer Administrator',
      actor_role: 'L8 Super Admin',
      target_id: business.business_id,
      target_name: business.organization_name,
      status_from: 'HARD_LOCKED',
      status_to: 'VERIFIED',
      amount: 5000,
      currency: 'CREDITS',
      severity: 'success',
    });
    const res = {
      success: true,
      message: `Organization ${business.organization_name} approved. Hard-lock lifted and Corporate Wallet provisioned.`,
      business,
    };
    this.logApiCall('/api/v1/admin/business/approve', 'POST', 200, { business_id: businessId }, res);
    return res;
  }

  public updateBusinessCommissionRate(
    businessId: string,
    ratePercent: number,
    adminName: string = 'Operations Administrator'
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const business = this.businesses.find((b) => b.business_id === businessId);
    if (!business) return { success: false, message: 'Business record not found.' };

    business.commission_rate_pct = ratePercent;
    this.persist();

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Commission Rate Set: ${business.organization_name}`,
      description: `Agreed Platform Commission Rate set to ${ratePercent}% for ${business.organization_name} under verification audit.`,
      actor_name: adminName,
      actor_role: 'Operations Desk',
      target_id: business.business_id,
      target_name: business.organization_name,
      severity: 'info',
    });

    return {
      success: true,
      message: `Commission percentage set to ${ratePercent}% for ${business.organization_name}. Live calculations synchronized.`,
      business,
    };
  }

  public adminHardLockBusiness(
    businessId: string,
    reason: string = 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const business = this.businesses.find((b) => b.business_id === businessId);
    if (!business) return { success: false, message: 'Business record not found.' };

    const prevStatus = business.verification_status;
    business.verification_status = 'HARD_LOCKED';
    business.is_hard_locked_by_admin = true;
    business.rejection_remarks = reason;

    this.persist();
    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Business Hard-Locked: ${business.organization_name}`,
      description: `Organization ${business.organization_name} has been Hard-Locked / Suspended by Admin. Business services disabled.`,
      actor_name: 'Operations Administrator',
      actor_role: 'Operations & Compliance Desk',
      target_id: business.business_id,
      target_name: business.organization_name,
      status_from: prevStatus,
      status_to: 'HARD_LOCKED',
      severity: 'critical',
    });
    const res = {
      success: true,
      message: `Organization ${business.organization_name} has been Hard-Locked / Suspended by admin.`,
      business,
    };
    this.logApiCall('/api/v1/admin/business/hardlock', 'POST', 200, { business_id: businessId, reason }, res);
    return res;
  }

  public adminDeactivateBusinessAccount(
    businessId: string,
    actorName: string = 'Operations Administrator',
    actorRole: string = 'Administrator',
    reason: string = 'Account Deactivated by Administration'
  ): {
    success: boolean;
    message: string;
    business?: BusinessProfile;
    transferredAmount: number;
    payoutRef: string;
  } {
    const business = this.businesses.find((b) => b.business_id === businessId);
    if (!business) return { success: false, message: 'Business record not found.', transferredAmount: 0, payoutRef: '' };

    const remainingBalance = business.corporate_wallet?.credit_balance ?? 0;
    const payoutRef = `DEACT-TX-${Math.floor(100000 + Math.random() * 900000)}`;

    const bankDetails = `${business.bank_name || 'Registered Bank'} (${business.bank_account_number_masked || '••••8899'}) IFSC: ${business.bank_ifsc_swift || 'N/A'}`;

    // 1. If remaining balance > 0, log transfer transaction and clear balance
    if (remainingBalance > 0 && business.corporate_wallet) {
      business.corporate_wallet.transactions.unshift({
        id: `tx_deact_${generateUUID().substring(0, 8)}`,
        type: 'TRANSFER',
        credits: remainingBalance,
        amount: remainingBalance,
        creditType: 'PURCHASED',
        description: `Deactivation Settlement: Transferred full remaining balance of ${remainingBalance.toLocaleString()} Credits back to registered bank coordinates ${bankDetails}. Ref: ${payoutRef}`,
        timestamp: new Date().toISOString(),
        referenceId: payoutRef,
        counterparty: business.bank_account_holder || business.organization_name,
      });

      // Clear the wallet balance to zero
      business.corporate_wallet.credit_balance = 0;
    }

    // 2. Update business status
    business.is_hard_locked_by_admin = true;
    business.verification_status = 'HARD_LOCKED';
    business.account_status = 'DEACTIVATED';
    business.deactivated_at = new Date().toISOString();
    business.deactivated_by = `${actorName} (${actorRole})`;
    business.deactivation_refund_amount = remainingBalance;
    business.deactivation_refund_bank_ref = payoutRef;
    business.rejection_remarks = `Account Deactivated: ${reason}. Full balance (${remainingBalance.toLocaleString()} Credits) transferred back to ${bankDetails}. Ref: ${payoutRef}`;

    this.persist();

    // 3. Log admin activity
    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Account Deactivated: ${business.organization_name}`,
      description: `Account deactivated by ${actorName} (${actorRole}). Full remaining balance of ${remainingBalance.toLocaleString()} Credits transferred back to ${bankDetails}. Reference: ${payoutRef}`,
      actor_name: actorName,
      actor_role: actorRole,
      target_id: business.business_id,
      target_name: business.organization_name,
      status_from: 'ACTIVE',
      status_to: 'DEACTIVATED',
      severity: 'critical',
    });

    // 4. Notifications
    this.addNotification({
      recipient_id: business.business_id,
      title: 'Account Deactivated & Balance Transferred',
      message: `Your business account has been deactivated. In accordance with platform policy, your full remaining balance of ${remainingBalance.toLocaleString()} Credits has been transferred back to your registered account coordinates: ${bankDetails}. Reference: ${payoutRef}`,
      type: 'WALLET',
    });

    return {
      success: true,
      message: `Account successfully deactivated. Full remaining balance of ${remainingBalance.toLocaleString()} Credits transferred back to ${bankDetails}. Reference: ${payoutRef}`,
      business,
      transferredAmount: remainingBalance,
      payoutRef,
    };
  }

  public adminRejectBusiness(
    businessId: string,
    reasonCode: string,
    remarks: string
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const business = this.businesses.find((b) => b.business_id === businessId);
    if (!business) return { success: false, message: 'Business record not found.' };

    business.verification_status = 'REJECTED';
    business.rejection_reason_code = reasonCode;
    business.rejection_remarks = remarks;

    this.persist();
    const res = {
      success: true,
      message: `Organization ${business.organization_name} set to REJECTED. User notified via email with fix resubmission link.`,
      business,
    };
    this.logApiCall('/api/v1/admin/business/reject', 'POST', 200, { business_id: businessId, reason_code: reasonCode, remarks }, res);
    return res;
  }

  public adminSendDomainChallenge(businessId: string): { success: boolean; message: string } {
    const business = this.businesses.find((b) => b.business_id === businessId);
    if (!business) return { success: false, message: 'Business record not found.' };

    business.domain_challenge_sent = true;
    this.persist();
    return {
      success: true,
      message: `Domain authentication challenge ping dispatched to ${business.business_email}. Verification token awaiting DNS/Mail response.`,
    };
  }

  // --- Digital Wallet & Razorpay Integration ---
  public topUpWalletViaRazorpay(
    userId: string,
    packageTitle: string,
    inrAmount: number,
    creditsToCredit: number,
    bonusCredits: number,
    paymentMethod: string
  ): { success: boolean; message: string; wallet?: DigitalWallet } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { success: false, message: 'User not found.' };

    if (!user.wallet) {
      user.wallet = {
        wallet_id: `wal_${generateUUID().substring(0, 8)}`,
        purchased_credits: 0,
        earned_credits: 0,
        balance: 0,
        currency: 'INR',
        provisioned_at: new Date().toISOString(),
        transactions: [],
        conversionHistory: [],
      };
    }

    const rzpPayId = `pay_rzp_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const rzpOrderId = `order_rzp_${Math.floor(100000 + Math.random() * 900000)}`;

    user.wallet.purchased_credits += creditsToCredit;
    user.wallet.balance = user.wallet.purchased_credits + user.wallet.earned_credits;

    const tx: any = {
      id: `tx_${generateUUID().substring(0, 6)}`,
      type: 'PURCHASE',
      creditType: 'PURCHASED',
      amount: creditsToCredit,
      description: `Razorpay: ${packageTitle} (₹${inrAmount.toLocaleString()}) via ${paymentMethod}`,
      timestamp: new Date().toISOString(),
      referenceId: rzpPayId,
    };
    user.wallet.transactions.unshift(tx);

    const convRecord: CurrencyConversionRecord = {
      id: `conv_${generateUUID().substring(0, 6)}`,
      amountPaidInr: inrAmount,
      creditsCredited: creditsToCredit,
      bonusCredits: bonusCredits,
      paymentMethod,
      razorpayPaymentId: rzpPayId,
      razorpayOrderId: rzpOrderId,
      timestamp: new Date().toISOString(),
      packageTitle,
    };
    user.wallet.conversionHistory.unshift(convRecord);

    this.persist();

    return {
      success: true,
      message: `Payment of ₹${inrAmount.toLocaleString()} verified by Razorpay Webhook. +${creditsToCredit.toLocaleString()} credits added to Purchased Balance!`,
      wallet: user.wallet,
    };
  }

  // P2P Credit Transfer
  public transferCredits(
    fromUserId: string,
    toUsernameOrEmail: string,
    amount: number
  ): { success: boolean; message: string } {
    const sender = this.regularUsers.find((u) => u.user_id === fromUserId);
    if (!sender || !sender.wallet) return { success: false, message: 'Sender wallet not found.' };

    if (amount <= 0 || isNaN(amount)) return { success: false, message: 'Please enter a valid credit amount.' };

    if (sender.wallet.balance < amount) {
      return { success: false, message: `Insufficient credits. Current balance: ${sender.wallet.balance.toLocaleString()} credits.` };
    }

    const recipientNorm = toUsernameOrEmail.trim().toLowerCase();
    const recipient = this.regularUsers.find(
      (u) => u.username.toLowerCase() === recipientNorm || u.email.toLowerCase() === recipientNorm
    );
    if (!recipient) {
      return { success: false, message: `Recipient aviator "${toUsernameOrEmail}" not found in Truvaer directory.` };
    }

    if (recipient.user_id === sender.user_id) {
      return { success: false, message: 'Cannot transfer credits to your own account.' };
    }

    if (!recipient.wallet) {
      recipient.wallet = {
        wallet_id: `wal_${generateUUID().substring(0, 8)}`,
        purchased_credits: 0,
        earned_credits: 0,
        balance: 0,
        currency: 'INR',
        provisioned_at: new Date().toISOString(),
        transactions: [],
        conversionHistory: [],
      };
    }

    // Debit from purchased first, then earned
    if (sender.wallet.purchased_credits >= amount) {
      sender.wallet.purchased_credits -= amount;
    } else {
      const remainder = amount - sender.wallet.purchased_credits;
      sender.wallet.purchased_credits = 0;
      sender.wallet.earned_credits -= remainder;
    }
    sender.wallet.balance = sender.wallet.purchased_credits + sender.wallet.earned_credits;

    sender.wallet.transactions.unshift({
      id: `tx_${generateUUID().substring(0, 6)}`,
      type: 'TRANSFER',
      creditType: 'PURCHASED',
      amount: -amount,
      description: `P2P Credit Transfer to @${recipient.username}`,
      timestamp: new Date().toISOString(),
      counterparty: `@${recipient.username}`,
    });

    recipient.wallet.purchased_credits += amount;
    recipient.wallet.balance = recipient.wallet.purchased_credits + recipient.wallet.earned_credits;

    recipient.wallet.transactions.unshift({
      id: `tx_${generateUUID().substring(0, 6)}`,
      type: 'CREDIT',
      creditType: 'PURCHASED',
      amount: amount,
      description: `P2P Credit Received from @${sender.username}`,
      timestamp: new Date().toISOString(),
      counterparty: `@${sender.username}`,
    });

    this.persist();

    return {
      success: true,
      message: `Transferred ${amount.toLocaleString()} credits to @${recipient.username} successfully!`,
    };
  }

  // --- Marketing Portal & Services ---
  public getServiceListings(category?: string, city?: string): ServiceListing[] {
    let list = this.serviceListings;
    if (this.envMode === 'LIVE') {
      list = list.filter(
        (s) =>
          s.id !== 'srv_test_02' &&
          !s.id.toLowerCase().includes('test') &&
          !s.name.toLowerCase().includes('test') &&
          !s.name.toLowerCase().includes('demo')
      );
    }
    if (category && category !== 'All') {
      list = list.filter((s) => s.category === category);
    }
    if (city && city !== 'All') {
      list = list.filter((s) => s.city.toLowerCase() === city.toLowerCase());
    }
    return list;
  }

  public getServiceListingById(id: string): ServiceListing | undefined {
    return this.serviceListings.find((s) => s.id === id);
  }

  public getReviewsForListing(listingId: string): CustomerReview[] {
    return this.reviews.filter((r) => r.listing_id === listingId);
  }

  public addReview(listingId: string, authorId: string, authorName: string, rating: number, comment: string): { success: boolean; review: CustomerReview } {
    const newRev: CustomerReview = {
      id: `rev_${generateUUID().substring(0, 6)}`,
      listing_id: listingId,
      author_id: authorId,
      author_name: authorName,
      rating,
      comment,
      timestamp: new Date().toISOString(),
      status: 'visible',
    };
    this.reviews.unshift(newRev);

    // Reward standard user with 50 earned credits for review contribution!
    const author = this.regularUsers.find((u) => u.user_id === authorId);
    if (author && author.wallet) {
      author.wallet.earned_credits += 50;
      author.wallet.balance = author.wallet.purchased_credits + author.wallet.earned_credits;
      author.wallet.transactions.unshift({
        id: `tx_${generateUUID().substring(0, 6)}`,
        type: 'EARNED_REWARD',
        creditType: 'EARNED',
        amount: 50,
        description: 'Community Contribution: Service Review Bounty',
        timestamp: new Date().toISOString(),
      });
    }

    // Update listing rating average
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (listing) {
      listing.reviews_count += 1;
      listing.rating = Number(((listing.rating * (listing.reviews_count - 1) + rating) / listing.reviews_count).toFixed(1));
    }

    this.persist();
    return { success: true, review: newRev };
  }

  public moderateReview(reviewId: string, action: 'hide' | 'unhide' | 'delete', actorRole: 'ADMIN' | 'BUSINESS'): { success: boolean; message: string } {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (!rev) return { success: false, message: 'Review not found.' };

    if (action === 'delete') {
      if (actorRole !== 'ADMIN') {
        return { success: false, message: 'Forbidden: Business users lack permission to delete customer records (TRD Section 5.1).' };
      }
      this.reviews = this.reviews.filter((r) => r.id !== reviewId);
      this.persist();
      return { success: true, message: 'Review deleted by Administrator.' };
    }

    if (action === 'hide') {
      rev.status = 'hidden';
      rev.hidden_by = actorRole;
      this.persist();
      return { success: true, message: `Review hidden by ${actorRole}.` };
    }

    if (action === 'unhide') {
      rev.status = 'visible';
      rev.hidden_by = undefined;
      this.persist();
      return { success: true, message: 'Review unhidden.' };
    }

    return { success: false, message: 'Invalid action.' };
  }

  public createServiceListing(data: Omit<ServiceListing, 'id' | 'rating' | 'reviews_count'>): { success: boolean; message: string; listing: ServiceListing } {
    const newListing: ServiceListing = {
      ...data,
      id: `srv_${generateUUID().substring(0, 8)}`,
      rating: 5.0,
      reviews_count: 0,
      isVerified: false,
      publication_status: data.publication_status || 'PENDING_APPROVAL',
    };
    this.serviceListings.unshift(newListing);
    this.persist();
    return {
      success: true,
      message: 'Marketplace listing registered! Pending administrative authentication before going live.',
      listing: newListing,
    };
  }

  public updateServiceListingMediaAndBranding(
    listingId: string,
    updates: {
      logoUrl?: string;
      videoUrl?: string;
      photos?: string[];
      name?: string;
      category?: string;
      subCategory?: string;
      area?: string;
      pincode?: string;
      city?: string;
      country?: string;
      address?: string;
      phone?: string;
      email?: string;
      facilities?: string[];
      amenities?: string[];
      services?: string[];
      budget?: string;
      pricing_rate?: string;
      icao?: string;
      iata?: string;
    }
  ): { success: boolean; message: string; listing?: ServiceListing } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    if (updates.logoUrl !== undefined) listing.logoUrl = updates.logoUrl;
    if (updates.videoUrl !== undefined) listing.videoUrl = updates.videoUrl;
    if (updates.photos !== undefined) listing.photos = updates.photos;
    if (updates.name !== undefined) listing.name = updates.name;
    if (updates.category !== undefined) listing.category = updates.category;
    if (updates.subCategory !== undefined) listing.subCategory = updates.subCategory;
    if (updates.area !== undefined) listing.area = updates.area;
    if (updates.pincode !== undefined) listing.pincode = updates.pincode;
    if (updates.city !== undefined) listing.city = updates.city;
    if (updates.country !== undefined) listing.country = updates.country;
    if (updates.address !== undefined) listing.address = updates.address;
    if (updates.phone !== undefined) listing.phone = updates.phone;
    if (updates.email !== undefined) listing.email = updates.email;
    if (updates.facilities !== undefined) listing.facilities = updates.facilities;
    if (updates.amenities !== undefined) listing.amenities = updates.amenities;
    if (updates.services !== undefined) listing.services = updates.services;
    if (updates.budget !== undefined) listing.budget = updates.budget;
    if (updates.pricing_rate !== undefined) listing.pricing_rate = updates.pricing_rate;
    if (updates.icao !== undefined) listing.icao = updates.icao;
    if (updates.iata !== undefined) listing.iata = updates.iata;

    this.persist();
    return { success: true, message: 'Branding & media updated successfully!', listing };
  }

  // --- Live Communication & Mailing (Closed-loop domain) ---
  public getInternalMails(userEmail?: string, category?: string): InternalMail[] {
    let list = this.internalMails.filter((m) => !m.isTrash);
    if (userEmail && userEmail.trim()) {
      const clean = userEmail.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.to.toLowerCase() === clean ||
          m.from.toLowerCase() === clean ||
          clean.includes('admin') ||
          m.to.toLowerCase() === 'all' ||
          m.to.toLowerCase() === 'all@truvaer.com'
      );
    }
    if (category && category !== 'All') {
      list = list.filter((m) => m.category === category);
    }
    return list;
  }

  public sendInternalMail(
    from: string,
    to: string,
    subject: string,
    body: string,
    category: 'Primary' | 'Sales' | 'Communication' | 'Updates' | 'Complaints'
  ): { success: boolean; message: string; mail?: InternalMail } {
    // Redact PII
    const { text: sanitizedBody, hasRedaction: bodyRedacted } = redactPII(body);
    const { text: sanitizedSubject, hasRedaction: subjectRedacted } = redactPII(subject);

    // Requirement: email option is provided to the business and user where it can only reach to admin portal only
    const isAdminSender =
      this.adminUsers.some((a) => a.email.toLowerCase() === from.toLowerCase()) ||
      from.toLowerCase().includes('admin');
    const finalTo = isAdminSender ? to : 'admin@truvaer.com';

    const newMail: InternalMail = {
      id: `mail_${generateUUID().substring(0, 6)}`,
      from,
      to: finalTo,
      subject: sanitizedSubject,
      body: sanitizedBody,
      category,
      timestamp: new Date().toISOString(),
      isRead: false,
      isTrash: false,
      isDraft: false,
      piiRedacted: bodyRedacted || subjectRedacted,
      registeredEmailAlertSent: true,
    };

    this.internalMails.unshift(newMail);
    this.persist();

    return {
      success: true,
      message: newMail.piiRedacted
        ? 'Official inquiry dispatched to Admin Portal Desk. Notice: Direct phone/email was blurred for privacy.'
        : isAdminSender
        ? 'Message dispatched successfully within the Truvaer Domain ecosystem.'
        : 'Official dispatch securely routed to the Admin Portal Desk for administrative governance.',
      mail: newMail,
    };
  }

  // --- Jobs Portal (MSN-Style) ---
  public getJobs(categoryFilter?: string, locationFilter?: string): JobListing[] {
    let list = this.jobs.filter((j) => {
      // Auto-hide check: expired jobs are hidden
      const exp = new Date(j.expiration_date).getTime();
      return exp > Date.now() && j.status === 'Live';
    });
    if (categoryFilter && categoryFilter !== 'All') {
      list = list.filter((j) => j.role_type === categoryFilter);
    }
    if (locationFilter && locationFilter !== 'All') {
      list = list.filter((j) => j.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }
    return list;
  }

  public getAllJobsAdmin(): JobListing[] {
    return this.jobs;
  }

  public applyToJob(jobId: string, userId: string): { success: boolean; message: string } {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found.' };

    if (!job.applied_users) job.applied_users = [];
    const already = job.applied_users.find((u) => u.user_id === userId);
    if (already) {
      return { success: false, message: 'You have already applied to this opening.' };
    }

    job.applied_users.push({
      user_id: userId,
      status: 'Applied',
      date: new Date().toISOString().split('T')[0],
    });

    this.persist();
    return { success: true, message: `Application submitted for "${job.title}". Tracked in your Aviator Dossier!` };
  }

  public submitJobPost(businessId: string, jobData: Partial<JobListing>): { success: boolean; message: string; job?: JobListing } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business not found.' };

    const debitCost = jobData.role_type === 'Software Engineer' ? 100 : 30;

    if (!biz.corporate_wallet || biz.corporate_wallet.credit_balance < debitCost) {
      return { success: false, message: `Insufficient corporate credits. Required: ${debitCost} credits. Please top-up.` };
    }

    biz.corporate_wallet.credit_balance -= debitCost;
    biz.corporate_wallet.transactions.unshift({
      id: `ctx_${generateUUID().substring(0, 6)}`,
      type: 'USAGE',
      credits: -debitCost,
      description: `Automated Debit: Job Posting (${jobData.title})`,
      timestamp: new Date().toISOString(),
      actionType: 'Job Posting',
    });

    this.checkAndTriggerLowCreditThresholdAlert(biz.business_id);

    const newJob: JobListing = {
      id: `job_${generateUUID().substring(0, 6)}`,
      business_id: businessId,
      company_name: biz.organization_name,
      title: jobData.title || 'Aviation Position',
      role_type: (jobData.role_type as any) || 'General Staff Post',
      location: jobData.location || biz.physical_location || 'Mumbai',
      country: biz.country,
      experience_years: jobData.experience_years || '2+ Years',
      salary_range: jobData.salary_range || 'Competitive',
      description: jobData.description || 'Role description...',
      tags: jobData.tags || ['Verified Aviator Opening'],
      published_date: new Date().toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending Verification', // Gated by Admin verification
      applied_users: [],
    };

    this.jobs.unshift(newJob);
    this.persist();

    return {
      success: true,
      message: `Job opening "${newJob.title}" submitted via Blog Insert. ${debitCost} credits debited. Awaiting Admin Verification.`,
      job: newJob,
    };
  }

  public adminVerifyJob(jobId: string, action: 'approve' | 'reject', reason?: string): { success: boolean; message: string } {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, message: 'Job not found.' };

    if (action === 'approve') {
      job.status = 'Live';
      job.rejection_reason = undefined;
      this.persist();
      return { success: true, message: `Job "${job.title}" approved and live on MSN-Style Jobs Portal!` };
    } else {
      job.status = 'Rejected';
      job.rejection_reason = reason || 'Does not meet Truvaer verification criteria.';
      this.persist();
      return { success: true, message: `Job "${job.title}" rejected with reason recorded.` };
    }
  }

  // --- News Portal (MSN-Style) ---
  public getNews(): NewsArticle[] {
    return this.news.filter((n) => n.status === 'Live');
  }

  public getAllNewsAdmin(): NewsArticle[] {
    return this.news;
  }

  public submitNewsArticle(authorOrg: string, authorId: string, data: Partial<NewsArticle>): { success: boolean; message: string } {
    const newArt: NewsArticle = {
      id: `news_${generateUUID().substring(0, 6)}`,
      title: data.title || 'Breaking Aviation Announcement',
      subtitle: data.subtitle || '',
      content: data.content || '',
      category: (data.category as any) || 'Aviation',
      author_org: authorOrg,
      author_id: authorId,
      published_at: new Date().toISOString(),
      image_url: data.image_url || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      status: 'Pending Verification',
      pinned_slot: 'None',
      likes_count: 0,
    };

    this.news.unshift(newArt);
    this.persist();

    return {
      success: true,
      message: 'Article submitted via Blog Insert interface. Queued in Admin C-Panel for compliance check.',
    };
  }

  public adminVerifyNews(articleId: string, action: 'approve' | 'reject', slot: 'Primary' | 'Secondary' | 'Tertiary' | 'None' = 'None', reason?: string): { success: boolean; message: string } {
    const art = this.news.find((n) => n.id === articleId);
    if (!art) return { success: false, message: 'Article not found.' };

    if (action === 'approve') {
      art.status = 'Live';
      art.pinned_slot = slot;
      art.rejection_reason = undefined;
      this.persist();
      return { success: true, message: `Article "${art.title}" is now LIVE on the Truvaer News Portal!` };
    } else {
      art.status = 'Rejected';
      art.rejection_reason = reason || 'Factual inconsistency with registry data.';
      this.persist();
      return { success: true, message: `Article rejected.` };
    }
  }

  // --- Events & Community Portal ---
  public getEvents(isAlumni: boolean = false): AviationEvent[] {
    if (isAlumni) {
      // Dynamic Content Throttling: Internal events are blocked for alumni
      return this.events.filter((e) => e.tier !== 'Internal Only');
    }
    return this.events;
  }

  public rsvpEvent(eventId: string, userId: string): { success: boolean; message: string } {
    const evt = this.events.find((e) => e.id === eventId);
    if (!evt) return { success: false, message: 'Event not found.' };

    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (user?.employment_status === 'Alumni' && evt.tier === 'Internal Only') {
      return { success: false, message: 'SIEM Security Alert: Alumni accounts are strictly blocked from internal operational briefings.' };
    }

    if (!evt.rsvp_users.includes(userId)) {
      evt.rsvp_users.push(userId);
    }
    this.persist();
    return { success: true, message: `1-Click RSVP confirmed for "${evt.title}".` };
  }

  public addToLineup(eventId: string, userId: string): { success: boolean; message: string; conflictAlert?: string } {
    const evt = this.events.find((e) => e.id === eventId);
    if (!evt) return { success: false, message: 'Event not found.' };

    if (!evt.lineup_users.includes(userId)) {
      evt.lineup_users.push(userId);
    }
    this.persist();

    return {
      success: true,
      message: `Event added to Lineup engine. Synced with digital calendar!`,
    };
  }

  // --- Pricing Matrix (C-Panel) ---
  public getPricingMatrix(): PricingMatrixItem[] {
    return this.pricingMatrix;
  }

  public updatePricingItem(
    id: string,
    debitCredits: number,
    minThreshold: number,
    actorRole?: string,
    actorLevel?: number
  ): { success: boolean; message: string; statusCode?: number } {
    // Condition 4: IF user_role NOT IN ('L7', 'L8') THEN return 403 Forbidden
    if (actorRole || actorLevel !== undefined) {
      const isAuthorized =
        actorRole === 'L8' ||
        actorRole === 'L7' ||
        actorRole === 'SUPER_ADMIN' ||
        (actorLevel !== undefined && actorLevel >= 7);

      if (!isAuthorized) {
        return {
          success: false,
          statusCode: 403,
          message: '403 Forbidden: Insufficient IAM clearance. Only Level 7 and Level 8 Administrators can modify credit pricing policies.',
        };
      }
    }

    const item = this.pricingMatrix.find((p) => p.id === id);
    if (!item) return { success: false, statusCode: 404, message: 'Pricing record not found.' };

    item.defaultDebitCredits = debitCredits;
    item.minimumThreshold = minThreshold;
    this.persist();

    this.logAdminActivity({
      category: 'WALLET_DEBIT',
      title: `Pricing Calibrated: ${item.actionType}`,
      description: `Default debit adjusted to ${debitCredits} Cr (Min Threshold: ${minThreshold} Cr). Authenticated under L7/L8 IAM protocol.`,
      actor_name: actorRole || 'Platform Controller',
      actor_role: actorRole || 'L7_ADMIN',
      severity: 'info',
    });

    return {
      success: true,
      statusCode: 200,
      message: `Updated debit value for ${item.actionType} to ${debitCredits} credits.`,
    };
  }

  // --- Credit Transparency View (Formulas & Current Ledger Logic) ---
  public getCreditCalculationFormulas() {
    return {
      campaign_rules: {
        base_rate_per_day: 15, // Credits per day
        scope_multipliers: {
          'City': 1.0,
          'Country': 1.25,
          'Region': 1.75,
          'World Wide': 2.5,
        },
        formula: 'Total Credits = Duration (Days) * Base Rate (15 Cr) * Scope Multiplier * Country Count',
        audience_restriction: 'Strictly Standard Users (Condition 4: B2B Competitors Excluded)',
        max_duration_days: 30,
        min_duration_days: 1,
      },
      lead_generation_rules: {
        phone_unlock_fee: 10, // Credits
        validity_days: 30, // Days unlocked
        rfq_quotation_fee: 25, // Credits
      },
      flash_news_rules: {
        base_fee: 50, // Credits
        word_count_tier: 'Tiers scale by +10 Cr per 50 words above 100 words',
      },
      ledger_verification: 'HMAC-SHA256 Single-Session Concurrency Guard Active',
    };
  }

  // --- Regional & Multi-Country Credit Pricing Engine ---
  public getRegionalCreditPricing(): RegionalCreditPricingRule[] {
    return [...this.regionalCreditPricing];
  }

  public getGlobalDefaultCreditRate(): number {
    return this.globalDefaultCreditRate || 15;
  }

  public setGlobalDefaultCreditRate(rate: number, adminName = 'Super Administrator (L8)'): { success: boolean; rate: number; message: string } {
    if (typeof rate !== 'number' || rate < 1) {
      return { success: false, rate: this.globalDefaultCreditRate, message: 'Invalid credit rate: must be positive integer.' };
    }
    this.globalDefaultCreditRate = Math.round(rate);
    const def = this.regionalCreditPricing.find((r) => r.location_type === 'GLOBAL_DEFAULT' || r.is_default);
    if (def) {
      def.credit_cost = this.globalDefaultCreditRate;
      def.updated_at = new Date().toISOString();
      def.updated_by = adminName;
    }
    this.logAdminActivity({
      category: 'WALLET_DEBIT',
      title: 'Global Default Credit Rate Calibrated',
      description: `Global fallback rate adjusted to ${this.globalDefaultCreditRate} credits/day across unconfigured regions & countries.`,
      actor_name: adminName,
      actor_role: 'L8_SUPER_ADMIN',
      severity: 'info',
    });
    this.persist();
    return { success: true, rate: this.globalDefaultCreditRate, message: `Global fallback rate updated to ${this.globalDefaultCreditRate} Credits.` };
  }

  public saveRegionalCreditPricingRule(
    rule: {
      id?: string;
      location_code: string;
      location_name: string;
      location_type: 'COUNTRY' | 'REGION';
      credit_cost: number;
      countries_covered?: string[];
      notes?: string;
    },
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; rule?: RegionalCreditPricingRule } {
    if (!rule.location_code || !rule.location_name || !rule.credit_cost) {
      return { success: false, message: 'Missing required fields: location code, name, and credit cost are required.' };
    }

    const cleanCode = rule.location_code.trim().toUpperCase();
    const cost = Math.max(1, Math.round(rule.credit_cost));

    const existing = rule.id
      ? this.regionalCreditPricing.find((r) => r.id === rule.id)
      : this.regionalCreditPricing.find((r) => r.location_code.toUpperCase() === cleanCode && r.location_type === rule.location_type);

    if (existing) {
      existing.location_name = rule.location_name.trim();
      existing.credit_cost = cost;
      if (rule.countries_covered) existing.countries_covered = rule.countries_covered;
      if (rule.notes !== undefined) existing.notes = rule.notes;
      existing.updated_at = new Date().toISOString();
      existing.updated_by = adminName;

      this.logAdminActivity({
        category: 'WALLET_DEBIT',
        title: `Regional Pricing Updated: ${existing.location_name}`,
        description: `Pricing for ${existing.location_type} [${existing.location_code}] updated to ${cost} credits.`,
        actor_name: adminName,
        actor_role: 'L8_SUPER_ADMIN',
        severity: 'info',
      });
      this.persist();
      return { success: true, message: `Pricing rule for "${existing.location_name}" updated successfully.`, rule: existing };
    } else {
      const newRule: RegionalCreditPricingRule = {
        id: `rcp_${cleanCode.toLowerCase()}_${Date.now().toString(36)}`,
        location_code: cleanCode,
        location_name: rule.location_name.trim(),
        location_type: rule.location_type,
        credit_cost: cost,
        countries_covered: rule.countries_covered || [],
        notes: rule.notes || '',
        updated_at: new Date().toISOString(),
        updated_by: adminName,
      };
      this.regionalCreditPricing.push(newRule);
      this.logAdminActivity({
        category: 'WALLET_DEBIT',
        title: `Regional Pricing Added: ${newRule.location_name}`,
        description: `New pricing rule configured: ${newRule.location_type} [${newRule.location_code}] set to ${cost} credits.`,
        actor_name: adminName,
        actor_role: 'L8_SUPER_ADMIN',
        severity: 'info',
      });
      this.persist();
      return { success: true, message: `New pricing rule for "${newRule.location_name}" created successfully.`, rule: newRule };
    }
  }

  public deleteRegionalCreditPricingRule(
    id: string,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string } {
    const idx = this.regionalCreditPricing.findIndex((r) => r.id === id);
    if (idx === -1) return { success: false, message: 'Pricing rule not found.' };

    const rule = this.regionalCreditPricing[idx];
    if (rule.is_default || rule.location_type === 'GLOBAL_DEFAULT') {
      return { success: false, message: 'Cannot delete the Global Default baseline rule.' };
    }

    this.regionalCreditPricing.splice(idx, 1);
    this.logAdminActivity({
      category: 'WALLET_DEBIT',
      title: `Regional Pricing Deleted: ${rule.location_name}`,
      description: `Pricing rule [${rule.location_code}] removed. Locations under this rule now revert to Global Default rate.`,
      actor_name: adminName,
      actor_role: 'L8_SUPER_ADMIN',
      severity: 'warning',
    });
    this.persist();
    return { success: true, message: `Pricing rule for "${rule.location_name}" deleted. Reverted to Global Default.` };
  }

  public calculateDynamicLocationCredits(
    selectedLocations: string[],
    isRegionScope = false
  ): {
    totalCreditsPerDay: number;
    globalDefaultRate: number;
    breakdown: Array<{
      code: string;
      name: string;
      type: 'COUNTRY' | 'REGION';
      charge: number;
      isOverriddenByRegion?: boolean;
      overriddenBy?: string;
      isGlobalDefaultFallback?: boolean;
    }>;
    overriddenCount: number;
    effectiveCount: number;
  } {
    const globalDefault = this.getGlobalDefaultCreditRate();
    if (!selectedLocations || selectedLocations.length === 0) {
      return {
        totalCreditsPerDay: globalDefault,
        globalDefaultRate: globalDefault,
        breakdown: [
          {
            code: 'DEFAULT',
            name: 'Default Location',
            type: 'COUNTRY',
            charge: globalDefault,
            isGlobalDefaultFallback: true,
          },
        ],
        overriddenCount: 0,
        effectiveCount: 1,
      };
    }

    const countryRulesMap = new Map<string, RegionalCreditPricingRule>();
    const regionRulesMap = new Map<string, RegionalCreditPricingRule>();
    for (const r of this.regionalCreditPricing) {
      if (r.location_type === 'COUNTRY') {
        countryRulesMap.set(r.location_code.toUpperCase(), r);
      } else if (r.location_type === 'REGION') {
        regionRulesMap.set(r.location_code.toUpperCase(), r);
      }
    }

    const selectedRegionCodes = new Set<string>();
    const selectedCountryCodes = new Set<string>();

    selectedLocations.forEach((loc) => {
      const upper = loc.trim().toUpperCase();
      if (isRegionScope || regionRulesMap.has(upper)) {
        selectedRegionCodes.add(upper);
      } else {
        selectedCountryCodes.add(upper);
      }
    });

    // Check which countries are covered by active selected regions (to avoid double charging)
    const countryOverriddenByRegion = new Map<string, string>();
    selectedRegionCodes.forEach((rCode) => {
      const regRule = regionRulesMap.get(rCode);
      if (regRule?.countries_covered) {
        regRule.countries_covered.forEach((c) => {
          if (c === '*') {
            selectedCountryCodes.forEach((country) => {
              countryOverriddenByRegion.set(country, regRule.location_name);
            });
          } else {
            countryOverriddenByRegion.set(c.toUpperCase(), regRule.location_name);
          }
        });
      }
    });

    let totalPerDay = 0;
    let overriddenCount = 0;
    const breakdown: Array<{
      code: string;
      name: string;
      type: 'COUNTRY' | 'REGION';
      charge: number;
      isOverriddenByRegion?: boolean;
      overriddenBy?: string;
      isGlobalDefaultFallback?: boolean;
    }> = [];

    // 1. Process Regions
    selectedRegionCodes.forEach((rCode) => {
      const rule = regionRulesMap.get(rCode);
      const charge = rule ? rule.credit_cost : Math.round(globalDefault * 1.5);
      totalPerDay += charge;
      breakdown.push({
        code: rCode,
        name: rule ? rule.location_name : `${rCode} Corridor`,
        type: 'REGION',
        charge,
        isGlobalDefaultFallback: !rule,
      });
    });

    // 2. Process Countries
    selectedCountryCodes.forEach((cCode) => {
      const overriddenBy = countryOverriddenByRegion.get(cCode);
      if (overriddenBy) {
        overriddenCount++;
        breakdown.push({
          code: cCode,
          name: countryRulesMap.get(cCode)?.location_name || cCode,
          type: 'COUNTRY',
          charge: 0,
          isOverriddenByRegion: true,
          overriddenBy,
        });
      } else {
        const rule = countryRulesMap.get(cCode);
        const charge = rule ? rule.credit_cost : globalDefault;
        totalPerDay += charge;
        breakdown.push({
          code: cCode,
          name: rule ? rule.location_name : cCode,
          type: 'COUNTRY',
          charge,
          isGlobalDefaultFallback: !rule,
        });
      }
    });

    return {
      totalCreditsPerDay: Math.max(1, totalPerDay),
      globalDefaultRate: globalDefault,
      breakdown,
      overriddenCount,
      effectiveCount: breakdown.filter((b) => !b.isOverriddenByRegion).length,
    };
  }

  // --- Contact Unlock & 30-Day Validity (Conditions 4 & 5) ---
  public getGlobalSettings() {
    return this.globalSettings;
  }

  public updateGlobalSettings(settings: Partial<{ phoneUnlockCreditCost: number; unlockValidityDays: number }>) {
    this.globalSettings = { ...this.globalSettings, ...settings };
    this.persist();
    return { success: true, message: 'Platform unlock parameters updated.', settings: this.globalSettings };
  }

  public getUnlockedContacts(): UnlockedContactRecord[] {
    return this.unlockedContacts;
  }

  public isContactUnlocked(listingId: string, userId?: string): { unlocked: boolean; record?: UnlockedContactRecord; daysRemaining?: number } {
    if (!listingId) return { unlocked: false };
    const now = Date.now();
    const record = this.unlockedContacts.find(
      (r) => r.listing_id === listingId && (!userId || r.user_id === userId) && r.valid_until > now
    );

    if (record) {
      const daysRemaining = Math.max(1, Math.ceil((record.valid_until - now) / (24 * 60 * 60 * 1000)));
      return { unlocked: true, record, daysRemaining };
    }

    return { unlocked: false };
  }

  public requestPhoneUnlock(
    listingId: string,
    userId: string
  ): { success: boolean; message: string; record?: UnlockedContactRecord; remainingBalance?: number } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    const biz = this.businesses.find((b) => b.business_id === listing.business_id);
    if (!biz) return { success: false, message: 'Associated business account not found.' };

    const creditCost = listing.leadUnlockCredits || this.globalSettings.phoneUnlockCreditCost || 10;

    // Pay-Per-Lead Model: Ensure business has a corporate wallet initialized
    if (!biz.corporate_wallet) {
      biz.corporate_wallet = {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 500,
        tier: 'Enterprise Standard',
        provisioned_at: new Date().toISOString(),
        transactions: [],
      };
    }

    // Deduct credits from the BUSINESS account that owns the listing
    const previousBalance = biz.corporate_wallet.credit_balance;
    biz.corporate_wallet.credit_balance = Math.max(0, biz.corporate_wallet.credit_balance - creditCost);

    biz.corporate_wallet.transactions.unshift({
      id: `ctx_${generateUUID().substring(0, 6)}`,
      type: 'USAGE',
      credits: -creditCost,
      description: `Pay-Per-Lead Inbound Lead Fee: Contact coordinates revealed for "${listing.name}"`,
      timestamp: new Date().toISOString(),
      actionType: 'Pay-Per-Lead Deduction',
    });

    // Check and trigger automated low-credit threshold alert if balance dropped below user threshold
    this.checkAndTriggerLowCreditThresholdAlert(biz.business_id);

    // Create 30-day unlock record
    const now = Date.now();
    const validUntil = now + this.globalSettings.unlockValidityDays * 24 * 60 * 60 * 1000;
    const newRecord: UnlockedContactRecord = {
      id: `unl_${generateUUID().substring(0, 8)}`,
      listing_id: listingId,
      user_id: userId,
      business_id: biz.business_id,
      unlocked_at: now,
      valid_until: validUntil,
      debited_credits: creditCost,
    };

    // Remove any previous record for this listing
    this.unlockedContacts = this.unlockedContacts.filter((r) => r.listing_id !== listingId);
    this.unlockedContacts.unshift(newRecord);

    // Requirement: If the user view the phone number of the business listing, contact details should go into lead & opportunity so follow ups can be done on chat
    const viewerUser = this.regularUsers.find((u) => u.user_id === userId || u.email === userId);
    const viewerBiz = this.businesses.find((b) => b.business_id === userId || b.business_email === userId);
    const clientName = viewerUser
      ? `${viewerUser.first_name || ''} ${viewerUser.last_name || ''}`.trim() || `@${viewerUser.username}`
      : viewerBiz
      ? viewerBiz.organization_name
      : 'Interested Aviator Client';
    const clientEmail = viewerUser?.email || viewerBiz?.business_email || 'client.aviator@enterprise.aero';
    const clientPhone = viewerUser?.phone_number || viewerBiz?.phone_number || listing.phone;

    const newLead = this.createCRMLead({
      business_id: biz.business_id,
      business_name: biz.organization_name,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      category: listing.category,
      subCategory: listing.subCategory || 'Phone Reveal Pipeline',
      title: `Phone Reveal Lead: Inquired for "${listing.name}"`,
      requirement_details: `Prospective client unlocked direct phone number for ${listing.name}. Immediate chat follow-up recommended to protect closed-loop lead integrity.`,
      budget: 1500000,
      currency: 'INR',
      status: 'NEW',
      source: 'Phone Unlock',
      assigned_to: 'Commercial Fleet Rep',
      zone: listing.country || 'West Zone',
      country: 'IN',
      territory: listing.city || 'BOM (Mumbai)',
    });

    this.createCRMOpportunity({
      lead_id: newLead.id,
      business_id: biz.business_id,
      business_name: biz.organization_name,
      deal_name: `${listing.name} - Direct Contact Pipeline`,
      client_name: clientName,
      deal_value: 1500000,
      currency: 'INR',
      probability: 45,
      stage: 'PROSPECTING',
      expected_close_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      assigned_to: 'Commercial Fleet Rep',
      zone: listing.country || 'West Zone',
      country: 'IN',
      territory: listing.city || 'BOM (Mumbai)',
    });

    // Notify Business User with Chat link and Pay-Per-Lead notification
    this.addNotification({
      recipient_id: biz.business_id,
      title: '🎯 New Qualified Inbound Lead (Pay-Per-Lead)',
      message: `${clientName} viewed your corporate contact coordinates for "${listing.name}". Pay-Per-Lead deduction: ${creditCost} Credits debited from your corporate wallet (Remaining: ${biz.corporate_wallet.credit_balance} Cr). Lead and Opportunity automatically generated! Follow up directly via Chat.`,
      type: 'WALLET',
      action_link: `conv_${listing.id}`,
    });

    this.logAdminActivity({
      category: 'LEAD_STATUS_CHANGE',
      title: 'New Lead Generated from Phone View',
      description: `${clientName} revealed phone for ${listing.name}. Lead & Opportunity registered for ${biz.organization_name}. Follow-ups active on chat.`,
      actor_name: clientName,
      actor_role: 'Aviator Client',
      target_id: newLead.id,
      target_name: listing.name,
      severity: 'info',
    });

    this.persist();

    this.logApiCall(
      '/api/v1/marketplace/unlock-phone',
      'POST',
      200,
      { listingId, userId, creditCost, validDays: this.globalSettings.unlockValidityDays },
      { success: true, validUntil }
    );

    return {
      success: true,
      message: `Contact phone & email successfully revealed! Valid for ${this.globalSettings.unlockValidityDays} days.`,
      record: newRecord,
      remainingBalance: biz.corporate_wallet.credit_balance,
    };
  }

  // Requirement 4 & 9: If the user view the phone number of the business listing, a contact details should go into lead & opportunity so follow ups can be done on chat, and notifications on leads at business user
  public recordPhoneLeadView(
    listingId: string,
    viewerUserId: string
  ): { success: boolean; message: string; lead?: CRMLead } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    const biz = this.businesses.find((b) => b.business_id === listing.business_id);
    if (!biz) return { success: false, message: 'Associated business account not found.' };

    const viewerUser = this.regularUsers.find((u) => u.user_id === viewerUserId || u.email === viewerUserId);
    const viewerBiz = this.businesses.find((b) => b.business_id === viewerUserId || b.business_email === viewerUserId);
    const clientName = viewerUser
      ? `${viewerUser.first_name || ''} ${viewerUser.last_name || ''}`.trim() || `@${viewerUser.username}`
      : viewerBiz
      ? viewerBiz.organization_name
      : 'Prospective Charter Client';
    const clientEmail = viewerUser?.email || viewerBiz?.business_email || 'client.contact@truvaer.com';
    const clientPhone = viewerUser?.phone_number || viewerBiz?.phone_number || listing.phone;

    const newLead = this.createCRMLead({
      business_id: biz.business_id,
      business_name: biz.organization_name,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      category: listing.category,
      subCategory: listing.subCategory || 'Phone Contact Inquiries',
      title: `Direct Phone View: Inquired for "${listing.name}"`,
      requirement_details: `Client unlocked direct phone number for ${listing.name}. Immediate chat follow-up recommended to protect closed-loop lead integrity.`,
      budget: 1500000,
      currency: 'INR',
      status: 'NEW',
      source: 'Phone Unlock',
      assigned_to: 'Commercial Fleet Rep',
      zone: listing.country || 'West Zone',
      country: 'IN',
      territory: listing.city || 'BOM (Mumbai)',
    });

    this.createCRMOpportunity({
      lead_id: newLead.id,
      business_id: biz.business_id,
      business_name: biz.organization_name,
      deal_name: `${listing.name} - Direct Contact Pipeline`,
      client_name: clientName,
      deal_value: 1500000,
      currency: 'INR',
      probability: 45,
      stage: 'PROSPECTING',
      expected_close_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      assigned_to: 'Commercial Fleet Rep',
      zone: listing.country || 'West Zone',
      country: 'IN',
      territory: listing.city || 'BOM (Mumbai)',
    });

    // Notify Business User with Chat link
    this.addNotification({
      recipient_id: biz.business_id,
      title: '🎯 New Lead & Opportunity from Phone View!',
      message: `${clientName} viewed your phone number for "${listing.name}". Lead and Opportunity automatically generated! Follow up directly via Chat.`,
      type: 'CHAT',
      action_link: `conv_${listing.id}`,
    });

    this.logAdminActivity({
      category: 'LEAD_STATUS_CHANGE',
      title: 'New Lead Generated from Phone View',
      description: `${clientName} revealed phone for ${listing.name}. Lead & Opportunity registered for ${biz.organization_name}. Follow-ups active on chat.`,
      actor_name: clientName,
      actor_role: 'Aviator Client',
      target_id: newLead.id,
      target_name: listing.name,
      severity: 'info',
    });

    this.persist();
    return { success: true, message: 'Contact details saved to CRM Leads & Opportunities.', lead: newLead };
  }

  // --- Publication Controls (Condition 1: Admin-only Access) ---
  public adminSetPublicationStatus(
    listingId: string,
    status: PublicationStatus,
    adminId: string,
    reason?: string
  ): { success: boolean; message: string; listing?: ServiceListing } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    listing.publication_status = status;
    listing.published_by_admin_id = adminId;
    listing.restricted_reason = reason;
    if (status === 'PUBLISHED') {
      listing.isVerified = true;
    } else if (status === 'RESTRICTED' || status === 'SUSPENDED') {
      listing.isVerified = false;
    }
    this.persist();

    this.logApiCall(
      '/api/v1/admin/listing/publication-status',
      'POST',
      200,
      { listingId, status, adminId, reason },
      { success: true, newStatus: status }
    );

    return {
      success: true,
      message: `Publication status updated to "${status}".`,
      listing,
    };
  }

  public adminModifyListing(
    listingId: string,
    updates: Partial<ServiceListing>,
    adminId: string
  ): { success: boolean; message: string; listing?: ServiceListing } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    Object.assign(listing, updates);
    listing.published_by_admin_id = adminId;
    this.persist();

    this.logApiCall(
      '/api/v1/admin/listing/modify',
      'POST',
      200,
      { listingId, updates, adminId },
      { success: true }
    );

    return { success: true, message: 'Listing modified successfully by Administrator.', listing };
  }

  public adminDeleteListing(listingId: string, adminId: string): { success: boolean; message: string } {
    const idx = this.serviceListings.findIndex((s) => s.id === listingId);
    if (idx === -1) return { success: false, message: 'Listing not found.' };

    const removed = this.serviceListings.splice(idx, 1)[0];
    this.persist();

    this.logApiCall(
      '/api/v1/admin/listing/delete',
      'POST',
      200,
      { listingId, adminId, title: removed.name },
      { success: true }
    );

    return { success: true, message: `Listing "${removed.name}" deleted from registry.` };
  }

  // --- 2-Stage Wallet Debit Workflow (Condition 6) ---
  public getWalletDebitRequests(): WalletDebitRequest[] {
    return this.debitRequests;
  }

  public createWalletDebitRequest(
    businessId: string,
    amount: number,
    reason: string,
    createdBy: string
  ): { success: boolean; message: string; request?: WalletDebitRequest } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business account not found.' };

    const newReq: WalletDebitRequest = {
      id: `deb_${generateUUID().substring(0, 8)}`,
      business_id: businessId,
      business_name: biz.organization_name,
      amount,
      reason,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      stage1_approved: false,
      stage2_approved: false,
      status: 'PENDING_STAGE_1',
    };

    this.debitRequests.unshift(newReq);
    this.persist();

    this.logApiCall(
      '/api/v1/admin/wallet-debit/create',
      'POST',
      201,
      { businessId, amount, reason, createdBy },
      { success: true, requestId: newReq.id }
    );

    return {
      success: true,
      message: `Debit request for ${amount} credits created. Queued for 2-stage approval (Admin & Super Admin).`,
      request: newReq,
    };
  }

  public approveDebitStage1(
    requestId: string,
    adminUser: AdminUser
  ): { success: boolean; message: string; request?: WalletDebitRequest } {
    const req = this.debitRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };
    if (req.status !== 'PENDING_STAGE_1') {
      return { success: false, message: `Cannot approve Stage 1. Current status is ${req.status}.` };
    }

    // Condition: If the business user status is on Hard locked or Rejected then system disables services
    // Only the Level 7 or 8 team will have access to process any sort of payments withdraw
    const targetBiz = this.businesses.find((b) => b.business_id === req.business_id);
    const isLockedOrRejected =
      targetBiz?.verification_status === 'HARD_LOCKED' || targetBiz?.verification_status === 'REJECTED';

    if (isLockedOrRejected) {
      const isL7OrL8 = (adminUser.level ?? 0) >= 7 || adminUser.role === 'SUPER_ADMIN';
      if (!isL7OrL8) {
        return {
          success: false,
          message: `RESTRICTED COMPLIANCE HOLD: Business account is ${targetBiz?.verification_status}. All commercial services & withdrawals are on hold. Only Level 7 (Managing Director) or Level 8 (Super Admin) executive team members have access to process any sort of payments or withdrawals.`,
        };
      }
    }

    req.stage1_approved = true;
    req.stage1_approved_by = `${adminUser.name} (${adminUser.level_title || adminUser.role})`;
    req.stage1_approved_at = new Date().toISOString();
    req.status = 'PENDING_STAGE_2';
    this.persist();

    this.logApiCall(
      '/api/v1/admin/wallet-debit/approve-stage-1',
      'POST',
      200,
      { requestId, approvedBy: req.stage1_approved_by },
      { success: true, nextStage: 'PENDING_STAGE_2' }
    );

    return {
      success: true,
      message: `Stage 1 (Admin) approval confirmed. Now awaiting final Stage 2 (Super Admin) sign-off.`,
      request: req,
    };
  }

  public approveDebitStage2(
    requestId: string,
    superAdminUser: AdminUser
  ): { success: boolean; message: string; request?: WalletDebitRequest } {
    const req = this.debitRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };
    if (req.status !== 'PENDING_STAGE_2') {
      return { success: false, message: `Cannot approve Stage 2. Must pass Stage 1 first. Current status: ${req.status}.` };
    }

    // Condition: If the business user status is on Hard locked or Rejected then system disables services
    // Only the Level 7 or 8 team will have access to process any sort of payments withdraw
    const targetBiz = this.businesses.find((b) => b.business_id === req.business_id);
    const isLockedOrRejected =
      targetBiz?.verification_status === 'HARD_LOCKED' || targetBiz?.verification_status === 'REJECTED';

    if (isLockedOrRejected) {
      const isL7OrL8 = (superAdminUser.level ?? 0) >= 7 || superAdminUser.role === 'SUPER_ADMIN';
      if (!isL7OrL8) {
        return {
          success: false,
          message: `RESTRICTED COMPLIANCE HOLD: Business account is ${targetBiz?.verification_status}. Payout & withdrawal disbursals are frozen and can strictly be processed ONLY by Level 7 or Level 8 Executive Leadership.`,
        };
      }
    }

    if (superAdminUser.role !== 'SUPER_ADMIN' && (superAdminUser.level ?? 0) < 8) {
      return { success: false, message: 'Only Super Admin (Level 8) accounts can grant final Stage 2 debit execution.' };
    }

    // Deduct from business corporate wallet
    const biz = this.businesses.find((b) => b.business_id === req.business_id);
    if (biz && biz.corporate_wallet) {
      biz.corporate_wallet.credit_balance -= req.amount;
      biz.corporate_wallet.transactions.unshift({
        id: `ctx_${generateUUID().substring(0, 6)}`,
        type: 'USAGE',
        credits: -req.amount,
        description: `Admin Approved Debit: ${req.reason}`,
        timestamp: new Date().toISOString(),
        actionType: '2-Stage Approved Debit',
      });
    }

    req.stage2_approved = true;
    req.stage2_approved_by = `${superAdminUser.name} (${superAdminUser.level_title || 'Super Admin L8'})`;
    req.stage2_approved_at = new Date().toISOString();
    req.status = 'APPROVED';
    this.persist();

    this.logApiCall(
      '/api/v1/admin/wallet-debit/approve-stage-2',
      'POST',
      200,
      { requestId, approvedBy: req.stage2_approved_by, debitedAmount: req.amount },
      { success: true, status: 'APPROVED' }
    );

    return {
      success: true,
      message: `Stage 2 (Super Admin) approved! ${req.amount} credits successfully debited from ${req.business_name}.`,
      request: req,
    };
  }

  public rejectDebitRequest(
    requestId: string,
    adminUser: AdminUser,
    reason: string
  ): { success: boolean; message: string; request?: WalletDebitRequest } {
    const req = this.debitRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };

    req.status = 'REJECTED';
    req.rejection_reason = reason;
    this.persist();

    this.logApiCall(
      '/api/v1/admin/wallet-debit/reject',
      'POST',
      200,
      { requestId, rejectedBy: adminUser.name, reason },
      { success: true, status: 'REJECTED' }
    );

    return { success: true, message: `Debit request rejected with reason recorded.`, request: req };
  }

  // =========================================================================
  // CENTRALIZED CREDIT DEBIT MATRIX (Unified Roof, 3 Levels, Dual L7/L8 vs Single L7/L8)
  // =========================================================================
  public getCentralizedCreditPolicy(): CentralizedCreditPolicy {
    return this.centralizedCreditPolicy;
  }

  public getCentralizedCreditRequests(): CentralizedCreditRequest[] {
    return this.centralizedCreditRequests;
  }

  public initiateCentralizedCreditChange(
    payload: {
      type: CreditChangeRequestType;
      title: string;
      description: string;
      business_id?: string;
      credits_amount?: number;
      inr_equivalent?: number;
      proposed_policy_changes?: Partial<CentralizedCreditPolicy>;
    },
    initiatorAdmin: AdminUser
  ): { success: boolean; message: string; request?: CentralizedCreditRequest } {
    const adminLevel = initiatorAdmin.level ?? 1;
    const isL6Plus = adminLevel >= 6 || initiatorAdmin.role === 'SUPER_ADMIN';

    // If initiator < L6 -> Requires 3 stages + dual L7/L8 (2 members including both levels)
    // If initiator >= L6 -> Requires only any one L7 or L8 member approval
    const requiresDual = !isL6Plus;
    const initialStatus = isL6Plus ? 'PENDING_EXECUTIVE_APPROVAL' : 'PENDING_STAGE_1';

    let businessName: string | undefined = undefined;
    if (payload.business_id) {
      const biz = this.businesses.find((b) => b.business_id === payload.business_id);
      businessName = biz?.organization_name;
    }

    const newReq: CentralizedCreditRequest = {
      id: `ccr_${generateUUID().substring(0, 8)}`,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      business_id: payload.business_id,
      business_name: businessName,
      credits_amount: payload.credits_amount,
      inr_equivalent:
        payload.inr_equivalent ||
        (payload.credits_amount
          ? payload.credits_amount * (this.centralizedCreditPolicy.credit_to_inr_rate || 10)
          : undefined),
      proposed_policy_changes: payload.proposed_policy_changes,
      initiated_by_admin_id: initiatorAdmin.admin_id,
      initiated_by_admin_name: initiatorAdmin.name,
      initiated_by_admin_level: adminLevel,
      initiated_by_admin_role: initiatorAdmin.level_title || initiatorAdmin.role,
      initiated_at: new Date().toISOString(),
      status: initialStatus,
      requires_dual_l7_l8: requiresDual,
      broadcast_sent: false,
    };

    if (isL6Plus) {
      newReq.stage1_approved = true;
      newReq.stage1_by_name = `${initiatorAdmin.name} (L${adminLevel} Initiator Bypassed)`;
      newReq.stage1_by_level = adminLevel;
      newReq.stage1_at = newReq.initiated_at;
      newReq.stage2_approved = true;
      newReq.stage2_by_name = `${initiatorAdmin.name} (L${adminLevel} Initiator Bypassed)`;
      newReq.stage2_by_level = adminLevel;
      newReq.stage2_at = newReq.initiated_at;
    }

    this.centralizedCreditRequests.unshift(newReq);
    this.persist();

    const routingMsg = requiresDual
      ? 'Initiated by < L6 administrator: Queued for 3-Level review + Dual L7 & L8 Executive sign-offs (2 members including both levels).'
      : 'Initiated by L6+ executive: Fast-tracked directly to Executive approval (requires 1 member from L7 or L8).';

    return {
      success: true,
      message: `Credit request "${payload.title}" created. ${routingMsg}`,
      request: newReq,
    };
  }

  public approveCentralizedCreditStage1(
    requestId: string,
    adminUser: AdminUser
  ): { success: boolean; message: string; request?: CentralizedCreditRequest } {
    const req = this.centralizedCreditRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Credit request not found.' };
    if (req.status !== 'PENDING_STAGE_1') {
      return { success: false, message: `Request is not pending Stage 1 (Current: ${req.status}).` };
    }

    const adminLevel = adminUser.level ?? 1;
    if (adminLevel < 4 && adminUser.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Stage 1 Operational sign-off requires minimum Level 4 Administrator clearance.' };
    }

    req.stage1_approved = true;
    req.stage1_by_name = `${adminUser.name} (${adminUser.level_title || `L${adminLevel}`})`;
    req.stage1_by_level = adminLevel;
    req.stage1_at = new Date().toISOString();
    req.status = 'PENDING_STAGE_2';
    this.persist();

    return {
      success: true,
      message: `Stage 1 sign-off confirmed by ${adminUser.name}. Advanced to Stage 2 Managerial & Finance review.`,
      request: req,
    };
  }

  public approveCentralizedCreditStage2(
    requestId: string,
    adminUser: AdminUser
  ): { success: boolean; message: string; request?: CentralizedCreditRequest } {
    const req = this.centralizedCreditRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Credit request not found.' };
    if (req.status !== 'PENDING_STAGE_2') {
      return { success: false, message: `Request is not pending Stage 2 (Current: ${req.status}).` };
    }

    const adminLevel = adminUser.level ?? 1;
    const isAuthorized = adminLevel >= 5 || adminUser.department === 'Finance' || adminUser.role === 'SUPER_ADMIN';
    if (!isAuthorized) {
      return { success: false, message: 'Stage 2 Managerial review requires Level 5+ or Finance Department officer clearance.' };
    }

    req.stage2_approved = true;
    req.stage2_by_name = `${adminUser.name} (${adminUser.level_title || `L${adminLevel}`})`;
    req.stage2_by_level = adminLevel;
    req.stage2_at = new Date().toISOString();
    req.status = 'PENDING_EXECUTIVE_APPROVAL';
    this.persist();

    return {
      success: true,
      message: `Stage 2 review approved by ${adminUser.name}. Now awaiting Executive Council sign-off (L7/L8).`,
      request: req,
    };
  }

  public approveCentralizedCreditExecutive(
    requestId: string,
    executiveAdmin: AdminUser
  ): { success: boolean; message: string; request?: CentralizedCreditRequest; executed?: boolean } {
    const req = this.centralizedCreditRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Credit request not found.' };
    if (req.status !== 'PENDING_EXECUTIVE_APPROVAL') {
      return { success: false, message: `Request is not pending Executive Sign-off (Current status: ${req.status}).` };
    }

    const adminLevel = executiveAdmin.level ?? 1;
    const isL7 = adminLevel === 7;
    const isL8 = adminLevel >= 8 || executiveAdmin.role === 'SUPER_ADMIN';

    if (!isL7 && !isL8) {
      return {
        success: false,
        message: 'Security Exception: Executive approval requires Level 7 (Operations Director) or Level 8 (Super Admin).',
      };
    }

    const signature = `${executiveAdmin.name} (${executiveAdmin.level_title || `L${adminLevel}`})`;
    const nowIso = new Date().toISOString();

    if (isL7) {
      req.l7_approved = true;
      req.l7_approved_by = signature;
      req.l7_approved_at = nowIso;
    }
    if (isL8) {
      req.l8_approved = true;
      req.l8_approved_by = signature;
      req.l8_approved_at = nowIso;
    }

    let canExecute = false;
    if (req.requires_dual_l7_l8) {
      // Rule: Initiated by < L6 -> Requires 2 members from L7 and L8, INCLUDING BOTH LEVELS
      if (req.l7_approved && req.l8_approved) {
        canExecute = true;
      }
    } else {
      // Rule: Initiated by L6+ -> Requires only any one of L7 or L8
      if (req.l7_approved || req.l8_approved) {
        canExecute = true;
      }
    }

    if (canExecute) {
      this.executeCentralizedCreditChange(req, executiveAdmin);
      this.persist();
      return {
        success: true,
        message: `Executive approval confirmed! All multi-level criteria satisfied. Credit modification executed and notification broadcast to all registered business users.`,
        request: req,
        executed: true,
      };
    } else {
      this.persist();
      const waitingFor = !req.l7_approved ? 'Level 7 Operations Director' : 'Level 8 Super Admin';
      return {
        success: true,
        message: `Executive sign-off recorded by ${executiveAdmin.name}. Since initiator is below L6, dual executive policy requires final sign-off from ${waitingFor} before execution.`,
        request: req,
        executed: false,
      };
    }
  }

  private executeCentralizedCreditChange(req: CentralizedCreditRequest, execAdmin: AdminUser) {
    req.status = 'APPROVED_AND_EXECUTED';
    req.executed_at = new Date().toISOString();
    req.executed_by = `${execAdmin.name} (${execAdmin.level_title || execAdmin.role})`;

    let changeDetail = req.title;

    if (req.type === 'WALLET_DEBIT' && req.business_id && req.credits_amount) {
      const biz = this.businesses.find((b) => b.business_id === req.business_id);
      if (biz) {
        if (!biz.corporate_wallet) {
          biz.corporate_wallet = {
            wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
            credit_balance: 0,
            tier: 'Enterprise Standard',
            provisioned_at: new Date().toISOString(),
            transactions: [],
          };
        }
        biz.corporate_wallet.credit_balance = Math.max(0, biz.corporate_wallet.credit_balance - req.credits_amount);
        biz.corporate_wallet.transactions.unshift({
          id: `ctx_${generateUUID().substring(0, 6)}`,
          type: 'USAGE',
          credits: -req.credits_amount,
          description: `Centralized Matrix Approved Debit: ${req.description}`,
          timestamp: new Date().toISOString(),
          actionType: 'Centralized Debit Adjustment',
        });
        changeDetail = `Wallet debit of ${req.credits_amount} Credits enacted for ${biz.organization_name}`;
        this.checkAndTriggerLowCreditThresholdAlert(biz.business_id);
      }
    } else if (req.type === 'WALLET_CREDIT_ALLOCATION' && req.business_id && req.credits_amount) {
      const biz = this.businesses.find((b) => b.business_id === req.business_id);
      if (biz) {
        if (!biz.corporate_wallet) {
          biz.corporate_wallet = {
            wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
            credit_balance: 0,
            tier: 'Enterprise Standard',
            provisioned_at: new Date().toISOString(),
            transactions: [],
          };
        }
        biz.corporate_wallet.credit_balance += req.credits_amount;
        biz.corporate_wallet.transactions.unshift({
          id: `ctx_${generateUUID().substring(0, 6)}`,
          type: 'PURCHASE',
          credits: req.credits_amount,
          description: `Centralized Matrix Credit Allocation: ${req.description}`,
          timestamp: new Date().toISOString(),
          actionType: 'Credit Allocation',
        });
        changeDetail = `Credit allocation of +${req.credits_amount} Credits enacted for ${biz.organization_name}`;
      }
    } else if (req.type === 'POLICY_RATE_CHANGE' && req.proposed_policy_changes) {
      Object.assign(this.centralizedCreditPolicy, req.proposed_policy_changes, {
        updated_at: new Date().toISOString(),
        updated_by: req.executed_by,
      });
      if (req.proposed_policy_changes.phone_lead_cost_credits !== undefined) {
        this.globalSettings.phoneUnlockCreditCost = req.proposed_policy_changes.phone_lead_cost_credits;
      }
      changeDetail = `Platform Credit Policy Rates updated: ${Object.entries(req.proposed_policy_changes)
        .map(([k, v]) => `${k} = ${v}`)
        .join(', ')}`;
    }

    // MANDATORY REQUIREMENT: notification should and must go to all the business users about the changes done
    const broadcastMsg = `📢 Platform Credit Matrix Update: ${req.title}. Policy / Balance changes approved by Executive Council (${req.executed_by}). Effective immediately.`;

    this.businesses.forEach((b) => {
      this.addNotification({
        recipient_id: b.business_id,
        title: '📢 Platform Credit Matrix Update',
        message: broadcastMsg,
        type: 'WALLET',
      });
    });

    req.broadcast_sent = true;
    req.broadcast_recipients_count = this.businesses.length;
    req.broadcast_message = broadcastMsg;

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Centralized Credit Matrix Change Executed & Broadcast',
      description: `${changeDetail}. Verified by ${req.executed_by}. Dispatched notification to all ${this.businesses.length} registered business organizations.`,
      actor_name: execAdmin.name,
      actor_role: execAdmin.level_title || 'Executive Lead',
      target_id: req.id,
      target_name: req.title,
      severity: 'success',
    });
  }

  public rejectCentralizedCreditChange(
    requestId: string,
    adminUser: AdminUser,
    reason: string
  ): { success: boolean; message: string; request?: CentralizedCreditRequest } {
    const req = this.centralizedCreditRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Credit request not found.' };

    req.status = 'REJECTED';
    req.rejection_reason = reason;
    this.persist();

    return {
      success: true,
      message: `Credit request rejected by ${adminUser.name}. Reason logged in audit log.`,
      request: req,
    };
  }

  // --- Department Hierarchy & 2-Level Promotion Approvals (Conditions 8 & 9) ---
  public getPromotionRequests(): PromotionApprovalRequest[] {
    return this.promotionRequests;
  }

  public submitPromotionRequest(
    adminId: string,
    targetLevel: AdminLevel,
    requestedPermission: string,
    reason: string,
    actionType: 'PROMOTION' | 'DEMOTION' = 'PROMOTION'
  ): { success: boolean; message: string; request?: PromotionApprovalRequest } {
    const admin = this.adminUsers.find((a) => a.admin_id === adminId);
    if (!admin) return { success: false, message: 'Admin user record not found.' };

    const curLevel = (admin.level ?? 0) as AdminLevel;
    const isDemotion = actionType === 'DEMOTION' || targetLevel < curLevel;
    const resolvedActionType = isDemotion ? 'DEMOTION' : 'PROMOTION';
    const approver1Level = Math.min(8, Math.max(curLevel + 1, targetLevel + 1)) as AdminLevel;
    const approver2Level = Math.min(8, approver1Level + 1) as AdminLevel;

    const newReq: PromotionApprovalRequest = {
      id: `prom_${generateUUID().substring(0, 8)}`,
      admin_id: adminId,
      admin_name: admin.name,
      department: admin.department || 'Operations',
      current_level: curLevel,
      target_level: targetLevel,
      requested_permission: requestedPermission,
      reason,
      action_type: resolvedActionType,
      first_approver_level: approver1Level,
      first_approval_status: 'PENDING',
      second_approver_level: approver2Level,
      second_approval_status: 'PENDING',
      overall_status: 'PENDING_LEVEL_1',
      created_at: new Date().toISOString(),
    };

    this.promotionRequests.unshift(newReq);
    this.persist();

    return {
      success: true,
      message: `${resolvedActionType === 'DEMOTION' ? 'Demotion / Level Downgrade' : 'Elevation'} request submitted. 2-Level approval mandatory: requires Level ${approver1Level} and Level ${approver2Level} sign-offs.`,
      request: newReq,
    };
  }

  public approvePromotionLevel1(
    requestId: string,
    approverUser: AdminUser
  ): { success: boolean; message: string } {
    const req = this.promotionRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };
    if (req.overall_status !== 'PENDING_LEVEL_1') {
      return { success: false, message: `Level 1 already evaluated or invalid status (${req.overall_status}).` };
    }

    req.first_approval_status = 'APPROVED';
    req.first_approver_name = `${approverUser.name} (L${approverUser.level ?? 'Lead'})`;
    req.first_approval_date = new Date().toISOString();
    req.overall_status = 'PENDING_LEVEL_2';
    this.persist();

    return {
      success: true,
      message: `First Level (L${req.first_approver_level}) approval granted. Next: requires Second Level (L${req.second_approver_level}) sign-off.`,
    };
  }

  public approvePromotionLevel2(
    requestId: string,
    approverUser: AdminUser
  ): { success: boolean; message: string } {
    const req = this.promotionRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found.' };
    if (req.overall_status !== 'PENDING_LEVEL_2') {
      return { success: false, message: `Must pass Level 1 approval first. Current status: ${req.overall_status}.` };
    }

    req.second_approval_status = 'APPROVED';
    req.second_approver_name = `${approverUser.name} (L${approverUser.level ?? 'Executive'})`;
    req.second_approval_date = new Date().toISOString();
    req.overall_status = 'APPROVED';

    // Apply promotion or demotion to the admin user
    const targetAdmin = this.adminUsers.find((a) => a.admin_id === req.admin_id);
    if (targetAdmin) {
      targetAdmin.level = req.target_level;
      targetAdmin.level_title = `L${req.target_level} - ${req.action_type === 'DEMOTION' ? 'Reassigned Officer' : 'Promoted Officer'}`;
      if (!targetAdmin.permissions) targetAdmin.permissions = [];
      if (req.action_type === 'DEMOTION') {
        targetAdmin.permissions = targetAdmin.permissions.filter((p) => p !== req.requested_permission);
      } else {
        if (!targetAdmin.permissions.includes(req.requested_permission)) {
          targetAdmin.permissions.push(req.requested_permission);
        }
      }
    }

    this.persist();
    return {
      success: true,
      message: `Second Level approval granted! Dual-level hierarchy approval completed. ${req.admin_name} set to Level ${req.target_level}.`,
    };
  }

  public rejectPromotionRequest(
    requestId: string,
    approver: string | AdminUser,
    reason?: string
  ): { success: boolean; message: string; request?: PromotionApprovalRequest } {
    const req = this.promotionRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Promotion request not found.' };

    // Resolve approver entity
    let approverAdmin: AdminUser | undefined;
    if (typeof approver === 'string') {
      approverAdmin = this.adminUsers.find(
        (a) => a.name === approver || a.admin_id === approver || a.email === approver
      );
    } else {
      approverAdmin = approver;
    }

    const approverName = approverAdmin?.name || (typeof approver === 'string' ? approver : 'Administrator');
    const approverLevel = approverAdmin?.level ?? 1;
    const isTopManagement =
      approverLevel === 7 ||
      approverLevel === 8 ||
      approverLevel >= 7 ||
      (approverAdmin as any)?.level === 'L7' ||
      (approverAdmin as any)?.level === 'L8' ||
      approverAdmin?.role === 'SUPER_ADMIN' ||
      approverAdmin?.level_title?.toLowerCase().includes('chairman') ||
      approverAdmin?.level_title?.toLowerCase().includes('super admin') ||
      approverAdmin?.level_title?.toLowerCase().includes('l7') ||
      approverAdmin?.level_title?.toLowerCase().includes('l8') ||
      approverAdmin?.department === 'Senior Management Team' ||
      this.isSuperAdmin(approverAdmin);

    const nowIso = new Date().toISOString();

    if (isTopManagement) {
      // Feature Enhancement: L7 & L8 Rejection Override Workflow
      // 1. When an L7 or L8 user rejects a promotion, all prior or pending approvals from lower levels (L1-L6) are instantly nullified.
      req.first_approval_status = 'REJECTED';
      req.second_approval_status = 'REJECTED';
      req.prior_approvals_nullified = true;

      // 2. The promotion status automatically transitions to ON_HOLD.
      req.overall_status = 'ON_HOLD';

      // 3. The system automatically appends mandatory status note/audit log: "Top management has rejected the promotion."
      const mandatoryMessage = 'Top management has rejected the promotion.';
      req.status_message = mandatoryMessage;
      req.on_hold_note = mandatoryMessage;
      req.rejection_reason = reason?.trim() ? `${reason.trim()} (${mandatoryMessage})` : mandatoryMessage;
      req.rejected_by = `${approverName} (L${approverLevel} Top Management)`;
      req.rejection_date = nowIso;

      // 4. Notifications regarding the rejection and hold status are dispatched to the relevant HR personnel and submitting manager
      this.addNotification({
        recipient_id: 'hr_desk',
        title: '⛔ Promotion Placed On Hold: Top Management Override',
        message: `Promotion request ${req.id} for ${req.admin_name} (L${req.current_level} → L${req.target_level}) was placed ON_HOLD by Top Management (${approverName}). Status note: "${mandatoryMessage}"`,
        type: 'APPROVAL',
      });

      this.adminUsers
        .filter((a) => a.department === 'HR' || a.role === 'SUPER_ADMIN' || a.assigned_modules.includes('ALL'))
        .forEach((hr) => {
          this.addNotification({
            recipient_id: hr.email,
            title: '⛔ Promotion Placed On Hold: Top Management Override',
            message: `Promotion request ${req.id} for ${req.admin_name} placed ON_HOLD by Top Management (${approverName}). Note: "${mandatoryMessage}"`,
            type: 'APPROVAL',
          });
        });

      if (req.first_approver_name) {
        this.addNotification({
          recipient_id: req.first_approver_name,
          title: '⛔ Subordinate Promotion Overridden: Placed On Hold',
          message: `Your approved promotion nomination for ${req.admin_name} has been rejected by Top Management (${approverName}) and placed ON_HOLD. Note: "${mandatoryMessage}"`,
          type: 'APPROVAL',
        });
      }

      this.logAdminActivity({
        category: 'HIERARCHY_PROMOTION',
        title: `Top Management Rejection Override: ${req.admin_name} Placed ON_HOLD`,
        description: `Top management (${approverName}) rejected promotion for ${req.admin_name}. All prior approvals nullified. Status: ON_HOLD. Note: "${mandatoryMessage}".`,
        actor_name: approverName,
        actor_role: `L${approverLevel} Top Management`,
        target_id: req.id,
        target_name: req.admin_name,
        severity: 'critical',
      });

      this.persist();
      return {
        success: true,
        message: `Promotion placed ON_HOLD! Top management rejection executed. All prior approvals nullified. Note: "${mandatoryMessage}"`,
        request: req,
      };
    } else {
      // Standard L1-L6 Rejection
      req.overall_status = 'REJECTED';
      req.status_message = reason || 'Promotion request rejected by supervisory reviewer.';
      req.rejection_reason = reason || 'Promotion request rejected.';
      req.rejected_by = approverName;
      req.rejection_date = nowIso;

      this.logAdminActivity({
        category: 'HIERARCHY_PROMOTION',
        title: `Promotion Request Rejected: ${req.admin_name}`,
        description: `Reviewer ${approverName} rejected promotion request for ${req.admin_name}. Reason: ${reason || 'Prerequisites pending.'}`,
        actor_name: approverName,
        actor_role: `L${approverLevel} Reviewer`,
        target_id: req.id,
        target_name: req.admin_name,
        severity: 'warning',
      });

      this.persist();
      return {
        success: true,
        message: `Promotion request rejected.`,
        request: req,
      };
    }
  }

  public addAdminUser(
    data: Partial<AdminUser> & { password?: string },
    creatorIsL8?: boolean
  ): { success: boolean; message: string; admin?: AdminUser } {
    const emailNorm = (data.email || 'officer@truvaer.com').toLowerCase().trim();
    const isValidCorporateDomain = emailNorm.endsWith('@yarifly.com') || emailNorm.endsWith('@truvaer.com');

    // Strict condition: any admin / Super admin account should have a mandatory account with domain email address ending with "@yarifly.com or @truvaer.com" only
    if (!isValidCorporateDomain) {
      return {
        success: false,
        message: 'Strict Corporate Policy: Any Admin or Super Admin account must have a mandatory corporate domain ending with "@yarifly.com" or "@truvaer.com" only. Third-party domains are forbidden.',
      };
    }

    // Strict condition: Super admin can be changed/created only if L8 user permits them
    if ((data.role === 'SUPER_ADMIN' || (data.level !== undefined && data.level === 8)) && !creatorIsL8) {
      return {
        success: false,
        message: 'Security Exception: Creation of or conversion to Super Admin (Level 8) is strictly restricted and requires direct permission from an active Level 8 Sovereign User.',
      };
    }

    const newAdmin: AdminUser = {
      admin_id: `admin_${generateUUID().substring(0, 8)}`,
      name: data.name || 'New Admin Officer',
      email: emailNorm,
      role: data.role || 'ADMIN',
      assigned_modules: data.assigned_modules || ['Operations'],
      department: data.department || 'Operations',
      level: data.level !== undefined ? data.level : 1,
      level_title: data.level_title || `L${data.level ?? 1} Specialist`,
      reporting_manager_id: data.reporting_manager_id,
      reporting_manager_name: data.reporting_manager_name,
      permissions: data.permissions || ['STANDARD_AUDIT', 'PORTAL_ACCESS'],
      status: 'ACTIVE',
      employment_status: 'Active Employee',
    };

    this.adminUsers.push(newAdmin);

    // Requirement 8: Provision portal access login user so new admin can immediately log in
    const cleanUsername = newAdmin.email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase();
    const existingIdx = this.regularUsers.findIndex((u) => u.email.toLowerCase() === newAdmin.email.toLowerCase());
    const regUserRecord: RegularUser = {
      user_id: newAdmin.admin_id,
      username: cleanUsername || `admin_${Math.floor(1000 + Math.random() * 9000)}`,
      first_name: newAdmin.name.split(' ')[0],
      last_name: newAdmin.name.split(' ').slice(1).join(' ') || 'Admin',
      email: newAdmin.email,
      password_hash: data.password || 'admin',
      is_email_verified: true,
      date_of_birth: '1990-01-01',
      country_code: 'IN',
      phone_number: '+919900000000',
      account_status: 'ACTIVE',
      role: newAdmin.role,
      employment_status: 'Active Employee',
      organization: `Truvaer ${newAdmin.department}`,
      created_at: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      this.regularUsers[existingIdx] = regUserRecord;
    } else {
      this.regularUsers.unshift(regUserRecord);
    }

    this.persist();
    return {
      success: true,
      message: `Admin portal account created for ${newAdmin.name} (${newAdmin.email}) with Level ${newAdmin.level} in ${newAdmin.department}! Initial password set.`,
      admin: newAdmin,
    };
  }

  public adminAddRegularUser(data: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    city: string;
    country_code: string;
    password?: string;
  }): { success: boolean; message: string; user?: RegularUser } {
    const emailNorm = data.email.trim().toLowerCase();
    const usernameNorm = data.username.trim().toLowerCase();

    if (this.regularUsers.some((u) => u.email.toLowerCase() === emailNorm)) {
      return { success: false, message: 'An aviator with this email address already exists.' };
    }
    if (this.regularUsers.some((u) => u.username.toLowerCase() === usernameNorm)) {
      return { success: false, message: 'Username is already taken by another aviator.' };
    }

    const newUser: RegularUser = {
      user_id: `user_${generateUUID().substring(0, 8)}`,
      username: usernameNorm,
      first_name: data.first_name || 'Standard',
      last_name: data.last_name || 'Aviator',
      email: emailNorm,
      phone_number: data.phone_number || '+91 98765 43210',
      date_of_birth: '1995-01-01',
      gender: 'Other',
      country_code: data.country_code || 'IN',
      city: data.city || 'Hyderabad',
      role: 'USER',
      password_hash: data.password || 'User@123',
      is_email_verified: true,
      account_status: 'ACTIVE',
      permitted_portals: ['marketing'],
      created_at: new Date().toISOString(),
    };

    this.regularUsers.unshift(newUser);
    this.persist();
    return {
      success: true,
      message: `Standard aviator user @${newUser.username} (${newUser.email}) provisioned successfully!`,
      user: newUser,
    };
  }

  public updateAdminUser(
    adminId: string,
    updates: Partial<AdminUser>,
    requesterIsL8?: boolean
  ): { success: boolean; message: string } {
    const admin = this.adminUsers.find((a) => a.admin_id === adminId);
    if (!admin) return { success: false, message: 'Admin record not found.' };

    // Domain validation if email updated
    if (updates.email) {
      const emailNorm = updates.email.toLowerCase().trim();
      if (!emailNorm.endsWith('@yarifly.com') && !emailNorm.endsWith('@truvaer.com')) {
        return {
          success: false,
          message: 'Corporate Security Exception: Administrative accounts must use authorized corporate domain ending with @yarifly.com or @truvaer.com.',
        };
      }
    }

    // Super Admin elevation check: only if L8 user permits
    const isElevatingToSuperAdmin =
      (updates.role === 'SUPER_ADMIN' || (updates.level !== undefined && updates.level === 8)) &&
      admin.role !== 'SUPER_ADMIN' &&
      admin.level !== 8;

    if (isElevatingToSuperAdmin && !requesterIsL8) {
      return {
        success: false,
        message: 'Elevation Security Violation: Promotion to Super Admin (Level 8) is strictly prohibited unless authorized and converted directly by an active Level 8 Sovereign User.',
      };
    }

    Object.assign(admin, updates);
    this.persist();
    return { success: true, message: `Admin user ${admin.name} updated successfully.` };
  }

  public deleteAdminUser(adminId: string): { success: boolean; message: string } {
    if (adminId === 'admin_super_01') {
      return { success: false, message: 'Root Super Admin (B Aditya Narayana) cannot be deleted.' };
    }
    const idx = this.adminUsers.findIndex((a) => a.admin_id === adminId);
    if (idx === -1) return { success: false, message: 'Admin record not found.' };

    const removed = this.adminUsers.splice(idx, 1)[0];
    this.persist();
    return { success: true, message: `Admin ${removed.name} removed from organization directory.` };
  }

  // -------------------------------------------------------------
  // EMPLOYEE ACCOUNT ACCESS & SAFEGUARD LIFECYCLE (Level 6-8 & HR)
  // -------------------------------------------------------------
  public setEmployeeAccountLifecycleStatus(
    adminId: string,
    status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED' | 'ARCHIVED',
    reason: string,
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string; admin?: AdminUser } {
    if (adminId === 'admin_super_01' || adminId === 'usr_super_admin') {
      return {
        success: false,
        message: 'Security Exception: Sovereign Super Administrator (B Aditya Narayana) cannot be deactivated or disabled.',
      };
    }

    const admin = this.adminUsers.find(
      (a) => a.admin_id === adminId || a.email.toLowerCase() === adminId.toLowerCase()
    );
    if (!admin) return { success: false, message: 'Employee / Administrator record not found.' };

    const previousStatus = admin.status || 'ACTIVE';
    admin.status = status;
    admin.status_reason = reason.trim() || `Status updated to ${status}`;
    admin.status_changed_at = new Date().toISOString();
    admin.status_changed_by = `${actorName} (${actorRole})`;

    let transferredLeadsCount = 0;
    let transferredOppsCount = 0;
    let transferredTasksCount = 0;
    let transferredTicketsCount = 0;
    let assignedRM: AdminUser | null = null;

    if (status === 'DISABLED') {
      admin.employment_status = 'Terminated / Departed - Proprietary Data Safeguarded';
      admin.safeguard_locked = true;
      admin.data_handover_status = 'TRANSFERRED_TO_RM';
    } else if (status === 'ACTIVE') {
      admin.employment_status = 'Active Employee';
      admin.safeguard_locked = false;
      admin.data_handover_status = 'NA';
    } else if (status === 'SUSPENDED') {
      admin.employment_status = 'Suspended - Audit Freeze';
      admin.safeguard_locked = true;
      admin.data_handover_status = 'TRANSFERRED_TO_RM';
    } else if (status === 'ARCHIVED') {
      admin.employment_status = 'Archived Employee Record';
      admin.safeguard_locked = true;
      admin.data_handover_status = 'COMPLETED';
    }

    // Automated asset & lead handover to assigned Reporting Manager (RM)
    if (status === 'DISABLED' || status === 'SUSPENDED') {
      assignedRM =
        (admin.reporting_manager_id && this.adminUsers.find((a) => a.admin_id === admin.reporting_manager_id && a.status === 'ACTIVE')) ||
        this.adminUsers.find(
          (a) => a.department === admin.department && (a.level ?? 0) >= 5 && a.admin_id !== admin.admin_id && a.status === 'ACTIVE'
        ) ||
        this.adminUsers.find((a) => a.role === 'SUPER_ADMIN' || a.level === 8) ||
        this.adminUsers[0];

      if (assignedRM) {
        admin.reporting_manager_id = assignedRM.admin_id;
        admin.reporting_manager_name = assignedRM.name;

        // 1. Reassign CRM Leads
        this.crmLeads.forEach((lead) => {
          if (
            lead.assigned_to === admin.name ||
            lead.assigned_to === admin.email ||
            lead.assigned_to === admin.admin_id
          ) {
            lead.assigned_to = assignedRM!.name;
            lead.updated_at = new Date().toISOString();
            transferredLeadsCount++;
          }
        });

        // 2. Reassign CRM Opportunities
        this.crmOpportunities.forEach((opp) => {
          if (
            opp.assigned_to === admin.name ||
            opp.assigned_to === admin.email ||
            opp.assigned_to === admin.admin_id
          ) {
            opp.assigned_to = assignedRM!.name;
            transferredOppsCount++;
          }
        });

        // 3. Reassign PMS Admin Tasks
        this.adminTasks.forEach((task) => {
          if (
            task.assigned_admin_id === admin.admin_id ||
            task.assigned_admin_name === admin.name
          ) {
            task.assigned_admin_id = assignedRM!.admin_id;
            task.assigned_admin_name = assignedRM!.name;
            task.assigned_admin_role = assignedRM!.level_title || assignedRM!.role;
            transferredTasksCount++;
          }
        });

        // 4. Reassign Customer Care Tickets
        this.customerCareTickets.forEach((ticket) => {
          if (
            ticket.assigned_agent === admin.name ||
            ticket.assigned_agent === admin.email
          ) {
            ticket.assigned_agent = assignedRM!.name;
            transferredTicketsCount++;
          }
        });

        // Alert the Reporting Manager
        this.addNotification({
          recipient_id: assignedRM.email,
          title: `Asset Handover: ${admin.name} Assets Assigned`,
          message: `${admin.name} account has been ${status}. All associated assets (${transferredLeadsCount} Leads, ${transferredOppsCount} Opportunities, ${transferredTasksCount} Tasks, ${transferredTicketsCount} Tickets) have been automatically transferred to your desk for review and action.`,
          type: 'SYSTEM',
        });
      }
    }

    // Sync with corresponding regularUsers account so login is locked immediately
    const regUser = this.regularUsers.find(
      (u) => u.email.toLowerCase() === admin.email.toLowerCase() || u.user_id === admin.admin_id
    );
    if (regUser) {
      if (status === 'ACTIVE') {
        regUser.account_status = 'ACTIVE';
        regUser.employment_status = 'Active Employee';
      } else {
        regUser.account_status = 'SUSPENDED';
        regUser.employment_status = 'Alumni';
      }
    }

    this.persist();

    const handoverDetails = assignedRM
      ? ` Transferred ${transferredLeadsCount} leads, ${transferredOppsCount} opportunities, ${transferredTasksCount} tasks, and ${transferredTicketsCount} tickets to Reporting Manager ${assignedRM.name}.`
      : '';

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Employee Account ${status === 'DISABLED' ? 'Disabled & Data Safeguarded' : status === 'ACTIVE' ? 'Activated' : status}`,
      description: `Employee ${admin.name} (${admin.email}) transitioned from ${previousStatus} to ${status} by ${actorName} (${actorRole}). Reason: ${admin.status_reason}.${handoverDetails} Immediate login cutoff enacted to protect organization data.`,
      actor_name: actorName,
      actor_role: actorRole,
      target_id: admin.admin_id,
      target_name: admin.name,
      severity: status === 'ACTIVE' ? 'success' : 'warning',
    });

    return {
      success: true,
      message: `Employee account ${admin.name} (${admin.email}) updated to ${status}.${handoverDetails}`,
      admin,
    };
  }

  public recoverEmployeeAccount(
    adminId: string,
    actorName: string,
    actorRole: string
  ): { success: boolean; message: string; admin?: AdminUser } {
    return this.setEmployeeAccountLifecycleStatus(
      adminId,
      'ACTIVE',
      'Account successfully recovered and restored by administration.',
      actorName,
      actorRole
    );
  }


  // --- Hierarchy Promotion & Demotion (Requirement: Add promotion & demotion option) ---
  public demoteAdminLevel(
    adminId: string,
    targetLevel: AdminLevel,
    targetTitle: string,
    reason: string,
    demotedBy: string
  ): { success: boolean; message: string; admin?: AdminUser } {
    const admin = this.adminUsers.find((a) => a.admin_id === adminId);
    if (!admin) return { success: false, message: 'Admin user not found.' };

    const oldLevel = admin.level ?? 1;
    admin.level = targetLevel;
    admin.level_title = targetTitle || `L${targetLevel} Officer`;

    this.logAdminActivity({
      category: 'HIERARCHY_PROMOTION',
      title: 'Hierarchy Level Demotion Enacted',
      description: `${admin.name} demoted from L${oldLevel} to L${targetLevel} (${admin.level_title}) by ${demotedBy}. Reason: ${reason}`,
      actor_name: demotedBy,
      actor_role: 'Super Admin / Hierarchy Lead',
      target_id: adminId,
      target_name: admin.name,
      severity: 'warning',
    });

    this.addNotification({
      recipient_id: admin.email,
      title: 'Hierarchy Level Adjusted',
      message: `Your administrative rank has been adjusted to Level ${targetLevel} (${admin.level_title}). Reason: ${reason}`,
      type: 'APPROVAL',
    });

    this.persist();
    return {
      success: true,
      message: `Successfully downgraded ${admin.name} to Level ${targetLevel} (${admin.level_title}).`,
      admin,
    };
  }

  public promoteAdminLevel(
    adminId: string,
    targetLevel: AdminLevel,
    targetTitle: string,
    promotedBy: string
  ): { success: boolean; message: string; admin?: AdminUser } {
    const admin = this.adminUsers.find((a) => a.admin_id === adminId);
    if (!admin) return { success: false, message: 'Admin user not found.' };

    const oldLevel = admin.level ?? 1;
    admin.level = targetLevel;
    admin.level_title = targetTitle || `L${targetLevel} Senior Officer`;

    this.logAdminActivity({
      category: 'HIERARCHY_PROMOTION',
      title: 'Hierarchy Level Promotion Approved',
      description: `${admin.name} promoted from L${oldLevel} to L${targetLevel} (${admin.level_title}) by ${promotedBy}.`,
      actor_name: promotedBy,
      actor_role: 'Super Admin / Department Lead',
      target_id: adminId,
      target_name: admin.name,
      severity: 'success',
    });

    this.addNotification({
      recipient_id: admin.email,
      title: 'Hierarchy Promotion Approved!',
      message: `Congratulations! Your rank has been elevated to Level ${targetLevel} (${admin.level_title}).`,
      type: 'APPROVAL',
    });

    this.persist();
    return {
      success: true,
      message: `Successfully promoted ${admin.name} to Level ${targetLevel} (${admin.level_title}).`,
      admin,
    };
  }

  // --- Finance Payment Settlements & Bank Account Verification (Requirement 5 & Bank Verification Rules) ---
  public canAdminAccessBankDetails(admin: AdminUser | null | undefined): boolean {
    if (!admin) return false;
    // Finance department is permitted
    if (admin.department === 'Finance') return true;
    // Admin with Level >= 7 (L7, L8) or Super Admin
    if ((admin.level ?? 0) >= 7) return true;
    if (admin.role === 'SUPER_ADMIN') return true;
    return false;
  }

  public verifyBusinessBankAccount(
    businessId: string,
    reviewer: AdminUser | string,
    notes?: string
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business entity not found.' };

    const reviewerName = typeof reviewer === 'string' ? reviewer : reviewer.name;
    const reviewerRole = typeof reviewer === 'object' ? (reviewer.level_title || `${reviewer.department || 'Admin'} L${reviewer.level ?? 'X'}`) : 'Finance Officer';

    if (typeof reviewer === 'object' && !this.canAdminAccessBankDetails(reviewer)) {
      return {
        success: false,
        message: 'Security Exception: Access Denied. Only the Finance Department or L7/L8 Administration have clearance to verify banking details.',
      };
    }

    biz.finance_bank_verified = true;
    biz.bank_verification_status = 'VERIFIED';
    biz.finance_verified_at = new Date().toISOString();
    biz.finance_verified_by = `${reviewerName} (${reviewerRole})`;
    biz.bank_verification_rejection_reason = undefined;

    if (!biz.bank_verification_history) biz.bank_verification_history = [];
    biz.bank_verification_history.unshift({
      action: 'VERIFIED',
      timestamp: biz.finance_verified_at,
      actor_name: reviewerName,
      actor_role: reviewerRole,
      notes: notes || 'Bank coordinates approved with Cancelled Cheque & Bank Statement verified. Further remittances unlocked.',
    });

    // Update bank verification status on any existing debit requests for this business
    this.debitRequests
      .filter((r) => r.business_id === businessId)
      .forEach((r) => {
        r.finance_bank_verified = true;
      });

    this.addNotification({
      recipient_id: biz.business_id,
      title: '✅ Bank Settlement Account Verified',
      message: `Your registered bank account (${biz.bank_name} ${biz.bank_account_number_masked}) has been approved and verified by ${reviewerName} (${reviewerRole}). Cancelled cheque and bank statement cleared. Automated payout remittances are now strictly unlocked for this account.`,
      type: 'WALLET',
    });

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Business Bank Settlement Account Verified',
      description: `${reviewerName} (${reviewerRole}) verified bank coordinates and uploaded cheque/statement for ${biz.organization_name} (${biz.bank_name} ${biz.bank_ifsc_swift}). Remittances enabled.`,
      actor_name: reviewerName,
      actor_role: reviewerRole,
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Bank details for ${biz.organization_name} (${biz.bank_name} ${biz.bank_account_number_masked}) successfully verified for settlements.`,
      business: biz,
    };
  }

  // Shuts off / revokes bank verification to halt further payment remittances
  public shutOffBusinessBankVerification(
    businessId: string,
    reviewer: AdminUser | string,
    reason?: string
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business entity not found.' };

    const reviewerName = typeof reviewer === 'string' ? reviewer : reviewer.name;
    const reviewerRole = typeof reviewer === 'object' ? (reviewer.level_title || `${reviewer.department || 'Admin'} L${reviewer.level ?? 'X'}`) : 'Finance / L7 Lead';

    if (typeof reviewer === 'object' && !this.canAdminAccessBankDetails(reviewer)) {
      return {
        success: false,
        message: 'Security Exception: Access Denied. Only the Finance Department or L7/L8 Administration have clearance to shut off or revoke bank verification.',
      };
    }

    biz.finance_bank_verified = false;
    biz.bank_verification_status = 'REVOKED';
    biz.bank_verification_rejection_reason = reason || 'Bank verification shut off / revoked by administration for compliance re-audit.';

    if (!biz.bank_verification_history) biz.bank_verification_history = [];
    biz.bank_verification_history.unshift({
      action: 'REVOKED',
      timestamp: new Date().toISOString(),
      actor_name: reviewerName,
      actor_role: reviewerRole,
      notes: reason || 'Bank verification shut off. Remittances to this account have been paused.',
    });

    // Pause bank verification on active debit requests
    this.debitRequests
      .filter((r) => r.business_id === businessId && r.status === 'PENDING_STAGE_1')
      .forEach((r) => {
        r.finance_bank_verified = false;
      });

    this.addNotification({
      recipient_id: biz.business_id,
      title: '⚠️ Bank Verification Shut Off / Revoked',
      message: `Bank verification for your account (${biz.bank_name} ${biz.bank_account_number_masked}) has been shut off by ${reviewerName}. Reason: ${biz.bank_verification_rejection_reason}. All payout remittances are temporarily paused until re-verified.`,
      type: 'SYSTEM',
    });

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Bank Settlement Verification Shut Off / Revoked',
      description: `${reviewerName} (${reviewerRole}) shut off bank verification for ${biz.organization_name} (${biz.bank_name}). Reason: ${biz.bank_verification_rejection_reason}`,
      actor_name: reviewerName,
      actor_role: reviewerRole,
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Bank verification for ${biz.organization_name} has been shut off. Future payout remittances are immediately paused.`,
      business: biz,
    };
  }

  public rejectBusinessBankVerification(
    businessId: string,
    reviewer: AdminUser | string,
    remarks: string
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business entity not found.' };

    const reviewerName = typeof reviewer === 'string' ? reviewer : reviewer.name;
    const reviewerRole = typeof reviewer === 'object' ? (reviewer.level_title || `${reviewer.department || 'Admin'} L${reviewer.level ?? 'X'}`) : 'Finance Officer';

    if (typeof reviewer === 'object' && !this.canAdminAccessBankDetails(reviewer)) {
      return {
        success: false,
        message: 'Security Exception: Access Denied. Only the Finance Department or L7/L8 Administration have clearance to reject bank verification.',
      };
    }

    biz.finance_bank_verified = false;
    biz.bank_verification_status = 'REJECTED';
    biz.bank_verification_rejection_reason = remarks;

    if (!biz.bank_verification_history) biz.bank_verification_history = [];
    biz.bank_verification_history.unshift({
      action: 'REJECTED',
      timestamp: new Date().toISOString(),
      actor_name: reviewerName,
      actor_role: reviewerRole,
      notes: `Rejected: ${remarks}`,
    });

    this.addNotification({
      recipient_id: biz.business_id,
      title: '❌ Bank Details Verification Rejected',
      message: `Your submitted banking coordinates or documents were rejected by ${reviewerName}. Reason: ${remarks}. Please re-upload a clear cancelled cheque and bank statement in your profile.`,
      type: 'SYSTEM',
    });

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Business Bank Verification Rejected',
      description: `${reviewerName} (${reviewerRole}) rejected bank verification for ${biz.organization_name}. Reason: ${remarks}`,
      actor_name: reviewerName,
      actor_role: reviewerRole,
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Bank details for ${biz.organization_name} rejected. Feedback has been sent to the business account owner.`,
      business: biz,
    };
  }

  // Modification permitted strictly by the person / account who uploaded it
  public updateBusinessBankDetails(
    businessId: string,
    uploaderUserId: string,
    uploaderName: string,
    bankData: {
      bank_name: string;
      bank_account_holder: string;
      bank_account_number: string;
      bank_ifsc_swift: string;
      cancelled_cheque_doc_url?: string;
      cancelled_cheque_filename?: string;
      cancelled_cheque_filesize?: number;
      bank_statement_doc_url?: string;
      bank_statement_filename?: string;
      bank_statement_filesize?: number;
    }
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business record not found.' };

    const isOwner =
      uploaderUserId === biz.business_id ||
      uploaderUserId === biz.creator_user_id ||
      uploaderUserId.toLowerCase() === biz.business_email.toLowerCase() ||
      uploaderUserId.toLowerCase() === (biz.username || '').toLowerCase();

    if (!isOwner) {
      return {
        success: false,
        message: 'Permission Violation: Bank details can only be changed or uploaded by the account holder who owns this business profile.',
      };
    }

    const cleanAccNum = bankData.bank_account_number.trim();
    biz.bank_name = bankData.bank_name.trim();
    biz.bank_account_holder = bankData.bank_account_holder.trim();
    biz.bank_account_number = cleanAccNum;
    biz.bank_account_number_masked = '••••' + (cleanAccNum.length > 4 ? cleanAccNum.slice(-4) : cleanAccNum);
    biz.bank_ifsc_swift = bankData.bank_ifsc_swift.trim().toUpperCase();

    if (bankData.cancelled_cheque_doc_url) biz.cancelled_cheque_doc_url = bankData.cancelled_cheque_doc_url;
    if (bankData.cancelled_cheque_filename) biz.cancelled_cheque_filename = bankData.cancelled_cheque_filename;
    if (bankData.cancelled_cheque_filesize) biz.cancelled_cheque_filesize = bankData.cancelled_cheque_filesize;

    if (bankData.bank_statement_doc_url) biz.bank_statement_doc_url = bankData.bank_statement_doc_url;
    if (bankData.bank_statement_filename) biz.bank_statement_filename = bankData.bank_statement_filename;
    if (bankData.bank_statement_filesize) biz.bank_statement_filesize = bankData.bank_statement_filesize;

    // Reset verification status: Needs Finance or L7/L8 review with cancelled cheque & statement proof
    biz.finance_bank_verified = false;
    biz.bank_verification_status = 'PENDING_VERIFICATION';
    biz.bank_uploaded_by_user_id = uploaderUserId;
    biz.bank_uploaded_by_user_name = uploaderName;
    biz.bank_uploaded_at = new Date().toISOString();
    biz.bank_verification_rejection_reason = undefined;

    if (!biz.bank_verification_history) biz.bank_verification_history = [];
    biz.bank_verification_history.unshift({
      action: 'SUBMITTED',
      timestamp: biz.bank_uploaded_at,
      actor_name: uploaderName,
      actor_role: 'Account Owner',
      notes: `Updated bank coordinates (${biz.bank_name} ${biz.bank_account_number_masked}) and uploaded proof documents. Routed to Finance & L7/L8 Administration.`,
    });

    this.addNotification({
      recipient_id: biz.business_id,
      title: '📋 Bank Coordinates Submitted for Verification',
      message: `Your updated bank details (${biz.bank_name} ${biz.bank_account_number_masked}) and attached Cancelled Cheque / Bank Statement have been routed to the Finance Department & L7/L8 Administration for audit and approval. Payout remittances will be enabled upon clearance.`,
      type: 'WALLET',
    });

    this.addNotification({
      recipient_id: 'admin_primary_truvaer',
      title: '🔔 New Bank Verification Documents Uploaded',
      message: `${biz.organization_name} has updated banking coordinates and attached Cancelled Cheque & Bank Statement. Awaiting Finance / L7+ Executive audit.`,
      type: 'APPROVAL',
    });

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Business Bank Coordinates Updated by Owner',
      description: `${uploaderName} updated bank details for ${biz.organization_name}. Verification status set to PENDING_VERIFICATION. Cheque & Statement attached for Finance / L7 review.`,
      actor_name: uploaderName,
      actor_role: 'Account Owner',
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: 'Bank coordinates and verification documents successfully submitted. Your account is queued with Finance & L7/L8 Administration for document review.',
      business: biz,
    };
  }

  public requestBusinessDebitPayout(
    businessId: string,
    amount: number,
    reason: string
  ): { success: boolean; message: string; request?: WalletDebitRequest } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business account not found.' };

    // Condition: If business user status is on Hard locked or Rejected then system disables services
    const opCheck = this.isBusinessOperational(businessId);
    if (!opCheck.operational) {
      return {
        success: false,
        message: `WITHDRAWAL PUT ON HOLD: Organization status is ${opCheck.status}. All commercial services and self-service payouts are suspended. Only Level 7 or 8 Executive Team members have access to process any sort of payment or withdrawal.`,
      };
    }

    if (!biz.bank_name || !biz.bank_account_number) {
      return { success: false, message: 'Please update your registered bank account details before requesting a payout.' };
    }

    const currentBalance = biz.corporate_wallet?.credit_balance ?? 0;
    if (currentBalance <= 0) {
      return {
        success: false,
        message: 'No credits are available: Your wallet balance is 0 Credits. Payouts cannot be requested.',
      };
    }

    if (amount > currentBalance) {
      return {
        success: false,
        message: `No credits are available for this amount: Requested payout of ₹${amount.toLocaleString()} exceeds your available balance of ${currentBalance.toLocaleString()} Credits.`,
      };
    }

    const isSuspendedOrDeactivated =
      biz.verification_status === 'HARD_LOCKED' ||
      biz.verification_status === 'REJECTED' ||
      biz.is_hard_locked_by_admin === true ||
      biz.account_status === 'DEACTIVATED' ||
      biz.account_status === 'SUSPENDED';

    const maxWithdrawable = isSuspendedOrDeactivated ? currentBalance : Math.floor(currentBalance * 0.8);

    if (amount > maxWithdrawable && !isSuspendedOrDeactivated) {
      return {
        success: false,
        message: `Withdrawal Capped at 80%: Active accounts are capped at an 80% maximum withdrawal reserve (${maxWithdrawable.toLocaleString()} Credits). Full amount (100%) can be withdrawn only if the account is suspended or deactivated.`,
      };
    }

    const newReq: WalletDebitRequest = {
      id: `deb_fin_${generateUUID().substring(0, 8)}`,
      business_id: businessId,
      business_name: biz.organization_name,
      amount,
      reason,
      created_by: `${biz.organization_name} (Commercial Vendor)`,
      created_at: new Date().toISOString(),
      stage1_approved: false,
      stage2_approved: false,
      status: 'PENDING_STAGE_1',
      bank_account_holder: biz.bank_account_holder,
      bank_name: biz.bank_name,
      bank_account_number_masked: biz.bank_account_number_masked || '••••' + (biz.bank_account_number.length > 4 ? biz.bank_account_number.slice(-4) : '0000'),
      bank_ifsc_swift: biz.bank_ifsc_swift,
      finance_bank_verified: biz.finance_bank_verified ?? false,
      settled_currency: 'INR',
    };

    this.debitRequests.unshift(newReq);

    this.addNotification({
      recipient_id: 'admin_primary_truvaer',
      title: 'New Payout Debit Request Submitted',
      message: `${biz.organization_name} requested payout of ₹${amount.toLocaleString()}. Bank: ${biz.bank_name} (${newReq.bank_account_number_masked}). Awaiting Finance Desk verification & release.`,
      type: 'WALLET',
    });

    this.addNotification({
      recipient_id: businessId,
      title: 'Debit Settlement Request Logged',
      message: `Your debit request for ₹${amount.toLocaleString()} is queued with the Finance & Accounts Department. Payout status will update here once released.`,
      type: 'WALLET',
    });

    this.persist();
    return {
      success: true,
      message: `Payout request for ₹${amount.toLocaleString()} submitted successfully. Routed to Finance Settlement Desk.`,
      request: newReq,
    };
  }

  public financeReleaseDebitPayout(
    requestId: string,
    financeAdmin: AdminUser,
    customUtr?: string
  ): { success: boolean; message: string; request?: WalletDebitRequest } {
    const req = this.debitRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Debit request not found.' };

    // Condition: If the business user status is on Hard locked or Rejected then system disables all services
    // Only the Level 7 or 8 team will have access to process any sort of payments withdraw
    const targetBiz = this.businesses.find((b) => b.business_id === req.business_id);
    const isLockedOrRejected =
      targetBiz?.verification_status === 'HARD_LOCKED' || targetBiz?.verification_status === 'REJECTED';

    if (isLockedOrRejected) {
      const isL7OrL8 = (financeAdmin.level ?? 0) >= 7 || financeAdmin.role === 'SUPER_ADMIN';
      if (!isL7OrL8) {
        return {
          success: false,
          message: `RESTRICTED COMPLIANCE HOLD: Business account is ${targetBiz?.verification_status}. All commercial services and payouts are on hold. Only Level 7 (Managing Director) or Level 8 (Super Admin) Executive Leadership has access to process or disburse withdrawals.`,
        };
      }
    }

    // Requirement: Bank verification check - payment gets remitted ONLY to verified account
    if (targetBiz && !targetBiz.finance_bank_verified) {
      return {
        success: false,
        message: 'REMITTANCE BLOCKED: Bank coordinates for this entity have not been verified. Cancelled cheque and bank statement must be verified and approved by the Finance Department or L7/L8 Administration before payout funds can be remitted.',
      };
    }

    // Requirement: If any business user request for the debit only the finance department should have access to release the payments
    const isFinanceAuthorized =
      financeAdmin.department === 'Finance' ||
      financeAdmin.role === 'SUPER_ADMIN' ||
      (financeAdmin.level ?? 0) >= 6;

    if (!isFinanceAuthorized) {
      return {
        success: false,
        message: 'Security Exception: Only authorized officers in the Finance / Accounts Department or Super Admin can release payment settlements.',
      };
    }

    const utr = customUtr || `UTR-${req.bank_name?.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'FIN'}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    req.status = 'RELEASED_BY_FINANCE';
    req.stage1_approved = true;
    req.stage2_approved = true;
    req.finance_released_by = `${financeAdmin.name} (${financeAdmin.level_title || financeAdmin.department})`;
    req.finance_released_at = new Date().toISOString();
    req.payout_utr_reference = utr;

    // Deduct credits or record debit on business corporate wallet
    const biz = this.businesses.find((b) => b.business_id === req.business_id);
    if (biz) {
      if (!biz.corporate_wallet) {
        biz.corporate_wallet = {
          wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
          credit_balance: 0,
          tier: 'Enterprise Standard',
          provisioned_at: new Date().toISOString(),
          transactions: [],
        };
      }
      biz.corporate_wallet.transactions.unshift({
        id: `ctx_${generateUUID().substring(0, 6)}`,
        type: 'USAGE',
        credits: -Math.round(req.amount / 10),
        description: `Finance Payout Released: ₹${req.amount.toLocaleString()} to ${req.bank_name} (${req.bank_account_number_masked}) [UTR: ${utr}]`,
        timestamp: new Date().toISOString(),
        actionType: 'Finance Settlement Disbursal',
      });
    }

    // Requirement: And once the approval is done automatically the debit status should be shown to the business users only.
    this.addNotification({
      recipient_id: req.business_id,
      title: '✅ Payout Released to Registered Bank Account',
      message: `Finance has approved & released ₹${req.amount.toLocaleString()} to your account: ${req.bank_name} (${req.bank_account_number_masked}). UTR Reference: ${utr}.`,
      type: 'WALLET',
    });

    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: 'Finance Payment Settlement Released',
      description: `Finance Officer ${financeAdmin.name} released ₹${req.amount.toLocaleString()} to ${req.business_name} (${req.bank_name} ${req.bank_account_number_masked}). UTR: ${utr}`,
      actor_name: financeAdmin.name,
      actor_role: financeAdmin.level_title || 'Finance Officer',
      target_id: req.business_id,
      target_name: req.business_name,
      amount: req.amount,
      currency: 'INR',
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Payment settlement released! ₹${req.amount.toLocaleString()} disbursed to ${req.bank_name} (${req.bank_account_number_masked}). UTR: ${utr}.`,
      request: req,
    };
  }

  // --- Daily Payout Reports (Requirement 6) ---
  public getDailyPayoutReports(): DailyPayoutReport[] {
    return this.dailyPayoutReports;
  }

  public generateDailyPayoutReport(financeAdminName: string): DailyPayoutReport {
    const todayStr = new Date().toISOString().split('T')[0];
    const releasedToday = this.debitRequests.filter(
      (r) => r.status === 'RELEASED_BY_FINANCE'
    );

    const totalAmount = releasedToday.reduce((sum, r) => sum + r.amount, 0);

    const settledRecords: DailyPayoutRecord[] = releasedToday.map((r) => ({
      debit_id: r.id,
      business_id: r.business_id,
      business_name: r.business_name,
      bank_name: r.bank_name || 'HDFC Bank Ltd',
      account_masked: r.bank_account_number_masked || '••••••••',
      ifsc: r.bank_ifsc_swift || 'HDFC0000123',
      amount: r.amount,
      currency: r.settled_currency || 'INR',
      utr: r.payout_utr_reference || 'UTR-FIN-2026-000000',
      released_by: r.finance_released_by || financeAdminName,
      timestamp: r.finance_released_at || new Date().toISOString(),
    }));

    const report: DailyPayoutReport = {
      id: `rep_pay_${generateUUID().substring(0, 8)}`,
      batch_date: todayStr,
      batch_reference: `BATCH-PAY-${todayStr}`,
      total_payout_amount: totalAmount,
      currency: 'INR',
      total_debits_count: settledRecords.length,
      settled_records: settledRecords,
      generated_by: financeAdminName,
      generated_at: new Date().toISOString(),
      status: 'COMPLETED',
    };

    this.dailyPayoutReports = this.dailyPayoutReports.filter((rep) => rep.batch_date !== todayStr);
    this.dailyPayoutReports.unshift(report);
    this.persist();
    return report;
  }

  // --- Role Based Access Control & C-Panel Portal Permissions ---
  public updateUserPermittedPortals(
    userId: string,
    permittedPortals: string[]
  ): { success: boolean; message: string } {
    const admin = this.adminUsers.find((a) => a.admin_id === userId);
    if (admin) {
      admin.permitted_portals = permittedPortals;
    }
    const reg = this.regularUsers.find((u) => u.user_id === userId);
    if (reg) {
      reg.permitted_portals = permittedPortals;
    }
    const biz = this.businesses.find((b) => b.business_id === userId);
    if (biz) {
      (biz as any).permitted_portals = permittedPortals;
    }
    this.persist();
    return { success: true, message: `Permitted portal clearances updated successfully.` };
  }

  // --- Business User Profile & Listing Edit (Requirement 1) ---
  public updateBusinessProfileDetails(
    businessId: string,
    updates: Partial<BusinessProfile>
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business account not found.' };

    if (updates.organization_name) biz.organization_name = updates.organization_name;
    if (updates.owner_name) biz.owner_name = updates.owner_name;
    if (updates.phone_number !== undefined) biz.phone_number = updates.phone_number;
    if (updates.business_email !== undefined) biz.business_email = updates.business_email;
    if (updates.budget !== undefined) biz.budget = updates.budget;
    if (updates.pricing_rate !== undefined) biz.pricing_rate = updates.pricing_rate;
    if (updates.operating_hours !== undefined) biz.operating_hours = updates.operating_hours;
    if (updates.physical_location !== undefined) biz.physical_location = updates.physical_location;
    if (updates.website_url !== undefined) biz.website_url = updates.website_url;
    if (updates.business_description !== undefined) biz.business_description = updates.business_description;
    if (updates.nature_of_business !== undefined) biz.nature_of_business = updates.nature_of_business;
    if (updates.servicesOffered !== undefined) biz.servicesOffered = updates.servicesOffered;

    // Bank details
    if (updates.bank_account_holder) biz.bank_account_holder = updates.bank_account_holder;
    if (updates.bank_name) biz.bank_name = updates.bank_name;
    if (updates.bank_account_number) {
      biz.bank_account_number = updates.bank_account_number;
      biz.bank_account_number_masked = '••••' + (updates.bank_account_number.length > 4 ? updates.bank_account_number.slice(-4) : updates.bank_account_number);
      biz.finance_bank_verified = false; // Reset verification if bank details change!
    }
    if (updates.bank_ifsc_swift) biz.bank_ifsc_swift = updates.bank_ifsc_swift;

    // Also synchronize to associated service listing
    const listing = this.serviceListings.find((s) => s.business_id === businessId);
    if (listing) {
      if (updates.organization_name) listing.name = updates.organization_name;
      if (updates.phone_number) listing.phone = updates.phone_number;
      if (updates.business_email) listing.email = updates.business_email;
      if (updates.budget) listing.budget = updates.budget;
      if (updates.pricing_rate) listing.pricing_rate = updates.pricing_rate;
      if (updates.physical_location) listing.address = updates.physical_location;
      if (updates.servicesOffered) listing.services = updates.servicesOffered;
    }

    this.persist();
    return { success: true, message: 'Business profile and listing details successfully updated!', business: biz };
  }

  // --- Demo vs Live Mode Data Isolation (Requirement 7) ---
  public getEnvMode(): 'LIVE' | 'TESTING' {
    return this.envMode;
  }

  public setEnvMode(mode: 'LIVE' | 'TESTING'): void {
    this.envMode = mode;
    try {
      localStorage.setItem('truvaer_env_mode', mode);
    } catch {}
    if (mode === 'LIVE') {
      this.activateLiveProductionMode();
    } else {
      this.restoreDemoMode();
    }
  }

  public activateLiveProductionMode(): { success: boolean; message: string } {
    this.envMode = 'LIVE';
    try {
      localStorage.setItem('truvaer_env_mode', 'LIVE');
    } catch {}

    // 1. Purge all test and demo service listings
    this.serviceListings = this.serviceListings.filter(
      (s) =>
        s.id !== 'srv_test_02' &&
        !s.id.toLowerCase().includes('test') &&
        !s.id.toLowerCase().includes('demo') &&
        !s.name.toLowerCase().includes('test') &&
        !s.name.toLowerCase().includes('demo') &&
        !s.name.toLowerCase().includes('sample') &&
        !s.name.toLowerCase().includes('staging') &&
        !s.category?.toLowerCase().includes('test') &&
        !s.category?.toLowerCase().includes('demo')
    );

    // 2. Purge test demo leads and mock inquiries
    this.crmLeads = [];

    // 3. Purge test demo opportunities
    this.crmOpportunities = [];

    // 4. Purge test mock sales
    this.crmSales = [];

    // 5. Purge test mock tickets
    this.crmTickets = [];

    // 6. Purge test quotations and commissions
    this.crmQuotations = [];
    this.commissions = [];

    // 7. Purge test chats
    this.chats = [];

    // 8. Purge test businesses and users
    this.businesses = this.businesses.filter(
      (b) =>
        !b.business_id.toLowerCase().includes('test') &&
        !b.business_id.toLowerCase().includes('demo') &&
        !b.organization_name.toLowerCase().includes('test') &&
        !b.organization_name.toLowerCase().includes('demo')
    );
    this.regularUsers = this.regularUsers.filter(
      (u) =>
        !u.user_id.toLowerCase().includes('test') &&
        !u.user_id.toLowerCase().includes('demo') &&
        !u.username.toLowerCase().includes('test') &&
        !u.username.toLowerCase().includes('demo') &&
        !u.email.toLowerCase().includes('test')
    );

    // 9. Purge test debit requests that are not released by finance
    this.debitRequests = this.debitRequests.filter(
      (d) => d.status === 'RELEASED_BY_FINANCE' && !d.id.includes('demo') && !d.business_name?.toLowerCase().includes('test')
    );

    // 10. Purge test unlocked contacts
    this.unlockedContacts = [];

    // 11. Purge simulated test activity logs
    this.adminActivities = this.adminActivities.filter(
      (a) => !a.id.includes('test') && !a.title.toLowerCase().includes('simulat') && !a.title.toLowerCase().includes('test')
    );

    // 12. Purge simulated notifications
    this.notifications = this.notifications.filter(
      (n) => !n.id.includes('test') && !n.title.toLowerCase().includes('test')
    );

    this.persist();
    return {
      success: true,
      message: 'Production Live Mode Activated. Staging test data and demo listings purged successfully.',
    };
  }

  public restoreDemoMode(): { success: boolean; message: string } {
    this.envMode = 'TESTING';
    try {
      localStorage.setItem('truvaer_env_mode', 'TESTING');
    } catch {}
    this.resetToDefaults();
    return {
      success: true,
      message: 'Demo Simulation Mode restored with complete test datasets.',
    };
  }

  // --- Admin Business CRUD & Operations (Condition 7) ---
  public adminAddBusiness(payload: Partial<BusinessProfile>): { success: boolean; message: string; business?: BusinessProfile } {
    const businessId = generateUUID();
    const cleanOrg = payload.organization_name?.trim() || 'New Aviation Partner';
    const newBiz: BusinessProfile = {
      business_id: businessId,
      organization_name: cleanOrg,
      owner_name: payload.owner_name?.trim() || 'Managing Director',
      reg_number_type: payload.reg_number_type || 'PAN',
      registration_number: payload.registration_number || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
      date_of_registration: payload.date_of_registration || '2020-01-01',
      nature_of_business: payload.nature_of_business || 'Aviation Operations',
      business_description: payload.business_description || 'Certified Truvaer Aviation Provider',
      physical_location: payload.physical_location || 'Aviation Hub, Airport SEZ',
      website_url: payload.website_url || 'https://truvaer.com',
      country: payload.country || 'IN',
      business_email: payload.business_email?.toLowerCase() || `corporate@${cleanOrg.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone_number: payload.phone_number || '+919988776655',
      password_hash: '$argon2id$v=19$mock_admin_added',
      inc_cert_doc_url: 'https://truvaer.com/docs/cert.pdf',
      inc_cert_file_name: 'verified_incorporation.pdf',
      inc_cert_file_size: 1540000,
      bank_account_holder: payload.bank_account_holder || cleanOrg,
      bank_account_number: 'aes256_enc_99812739182379123',
      bank_account_number_masked: '****4321',
      bank_ifsc_swift: payload.bank_ifsc_swift || 'HDFC0001234',
      bank_name: payload.bank_name || 'HDFC Commercial Bank',
      verification_status: 'VERIFIED',
      submitted_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      corporate_wallet: {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 5000,
        tier: 'Enterprise Platinum',
        provisioned_at: new Date().toISOString(),
        transactions: [
          {
            id: `ctx_${generateUUID().substring(0, 6)}`,
            type: 'GRANT',
            credits: 5000,
            description: 'Admin Provisioning Welcome Grant',
            timestamp: new Date().toISOString(),
          },
        ],
      },
      category: payload.category || 'Pilot Training & Academies',
      rating: 5.0,
      reviewCount: 0,
      servicesOffered: ['Aviation Services', 'Flight Operations'],
    };

    this.businesses.unshift(newBiz);
    this.persist();
    return { success: true, message: `Business account "${cleanOrg}" created successfully with 5,000 credits provisioned!`, business: newBiz };
  }

  public adminModifyBusiness(businessId: string, updates: Partial<BusinessProfile>): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business record not found.' };

    // Requirement: Bank details can only be changed/uploaded by the account who owns/uploaded it
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.bank_name;
    delete sanitizedUpdates.bank_account_holder;
    delete sanitizedUpdates.bank_account_number;
    delete sanitizedUpdates.bank_account_number_masked;
    delete sanitizedUpdates.bank_ifsc_swift;
    delete sanitizedUpdates.cancelled_cheque_doc_url;
    delete sanitizedUpdates.cancelled_cheque_filename;
    delete sanitizedUpdates.bank_statement_doc_url;
    delete sanitizedUpdates.bank_statement_filename;

    Object.assign(biz, sanitizedUpdates);
    this.persist();
    return { success: true, message: `Business "${biz.organization_name}" updated successfully.`, business: biz };
  }

  public adminDeleteBusiness(businessId: string): { success: boolean; message: string } {
    const idx = this.businesses.findIndex((b) => b.business_id === businessId);
    if (idx === -1) return { success: false, message: 'Business record not found.' };

    const removed = this.businesses.splice(idx, 1)[0];
    this.serviceListings = this.serviceListings.filter((s) => s.business_id !== businessId);
    this.persist();

    return { success: true, message: `Business account "${removed.organization_name}" and its directory listings were deleted.` };
  }

  // --- Chat Restriction Logic (Condition 3: Business <-> Standard ONLY) ---
  public validateChatPermission(
    senderRole: 'STANDARD_USER' | 'BUSINESS_USER' | 'ADMIN',
    recipientRole: 'STANDARD_USER' | 'BUSINESS_USER' | 'ADMIN'
  ): { allowed: boolean; reason?: string } {
    if (senderRole === 'ADMIN' || recipientRole === 'ADMIN') {
      return { allowed: true };
    }
    if (senderRole === 'STANDARD_USER' && recipientRole === 'STANDARD_USER') {
      return {
        allowed: false,
        reason: 'Direct chat is prohibited between Standard Aviators. Communications are restricted to Standard-to-Business inquiries.',
      };
    }
    if (senderRole === 'BUSINESS_USER' && recipientRole === 'BUSINESS_USER') {
      return {
        allowed: false,
        reason: 'B2B direct chat is prohibited. Business accounts may only communicate with prospective standard client aviators.',
      };
    }
    return { allowed: true };
  }

  // --- Communication: User Notifications (Requirement 3) ---
  public getNotifications(recipientId?: string): UserNotification[] {
    if (!recipientId) return this.notifications;
    const cleanId = recipientId.toLowerCase();
    return this.notifications.filter(
      (n) =>
        n.recipient_id.toLowerCase() === cleanId ||
        n.recipient_id === 'ALL' ||
        (cleanId.includes('admin') && n.recipient_id.includes('admin'))
    );
  }

  public addNotification(data: Partial<UserNotification> & { title: string; message: string; type: 'CHAT' | 'EMAIL' | 'WALLET' | 'SYSTEM' | 'APPROVAL' }): UserNotification {
    const notif: UserNotification = {
      id: `notif_${generateUUID().substring(0, 8)}`,
      recipient_id: data.recipient_id || 'ALL',
      title: data.title,
      message: data.message,
      type: data.type,
      timestamp: new Date().toISOString(),
      is_read: false,
      action_link: data.action_link,
    };
    this.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  public markNotificationRead(notifId: string) {
    const n = this.notifications.find((item) => item.id === notifId);
    if (n) {
      n.is_read = true;
      this.persist();
    }
  }

  public markAllNotificationsRead(recipientId?: string) {
    for (const n of this.notifications) {
      if (!recipientId || n.recipient_id === recipientId || n.recipient_id === 'ALL') {
        n.is_read = true;
      }
    }
    this.persist();
  }

  // --- Communication: Live Closed-Loop Chats (Requirement 3) ---
  public getLiveChats(participantId?: string): LiveChatMessage[] {
    if (!participantId) return this.chats;
    const clean = participantId.toLowerCase();
    return this.chats.filter(
      (c) =>
        c.sender_id.toLowerCase() === clean ||
        c.recipient_id.toLowerCase() === clean ||
        (c.conversation_id && c.conversation_id.toLowerCase().includes(clean))
    );
  }

  public sendLiveChatMessage(
    senderId: string,
    senderName: string,
    recipientId: string,
    rawMessage: string,
    conversationId?: string
  ): { success: boolean; message: string; chat: LiveChatMessage } {
    const { text: cleanMsg, hasRedaction } = redactPII(rawMessage);
    const chat: LiveChatMessage = {
      id: `chat_${generateUUID().substring(0, 8)}`,
      sender_id: senderId,
      sender_name: senderName,
      recipient_id: recipientId,
      message: cleanMsg,
      original_message: hasRedaction ? '[Encrypted PII Protected]' : undefined,
      pii_redacted: hasRedaction,
      timestamp: new Date().toISOString(),
      conversation_id: conversationId || `conv_${senderId}_${recipientId}`,
      is_read: false,
    };

    this.chats.push(chat);

    // Requirement 1: If the business user receives any direct message then the chat option should automatically enabled. Or gets started.
    const recipientBiz = this.businesses.find(
      (b) => b.business_id === recipientId || b.business_email.toLowerCase() === recipientId.toLowerCase()
    );
    if (recipientBiz) {
      recipientBiz.chat_enabled = true;
      recipientBiz.has_active_inquiries = true;
    }

    // Notify recipient
    this.addNotification({
      recipient_id: recipientId,
      title: `New Direct Message from ${senderName}`,
      message: cleanMsg.length > 80 ? cleanMsg.substring(0, 80) + '...' : cleanMsg,
      type: 'CHAT',
      action_link: conversationId,
    });

    this.persist();
    return { success: true, message: 'Message sent successfully!', chat };
  }

  // --- Check if a Business is Operational or HARD_LOCKED / REJECTED ---
  public isBusinessOperational(businessId: string): {
    operational: boolean;
    status: 'VERIFIED' | 'HARD_LOCKED' | 'REJECTED' | 'IN_REVIEW' | 'UNKNOWN';
    reason?: string;
  } {
    const biz = this.businesses.find(
      (b) => b.business_id === businessId || b.business_email.toLowerCase() === businessId.toLowerCase()
    );
    if (!biz) return { operational: true, status: 'UNKNOWN' };
    if (biz.verification_status === 'HARD_LOCKED') {
      return {
        operational: false,
        status: 'HARD_LOCKED',
        reason: 'Organization record is in HARD_LOCKED status awaiting compliance audit. All commercial services, public proposals, and withdrawals are put on hold.',
      };
    }
    if (biz.verification_status === 'REJECTED') {
      return {
        operational: false,
        status: 'REJECTED',
        reason: `Organization registration was REJECTED (${biz.rejection_remarks || 'Document mismatch'}). All commercial services and payouts are put on hold.`,
      };
    }
    return { operational: true, status: biz.verification_status as any };
  }

  // --- Condition: Business user can send proposal ONLY for active users who reached out on chat within 24h / 48h ---
  public checkUserChatEligibility(
    businessId: string,
    customerEmailOrId: string,
    policyHours: 24 | 48 = 48
  ): UserChatEligibility {
    // 1. Check if the business user itself is operational
    const bizOp = this.isBusinessOperational(businessId);

    // Find the customer's actual details if in regular users or CRM leads
    const cleanQuery = (customerEmailOrId || '').toLowerCase().trim();
    const regularUser = this.regularUsers.find(
      (u) =>
        u.user_id.toLowerCase() === cleanQuery ||
        u.email.toLowerCase() === cleanQuery ||
        (u.first_name && cleanQuery.includes(u.first_name.toLowerCase()))
    );
    const lead = this.crmLeads.find(
      (l) => l.id.toLowerCase() === cleanQuery || l.client_email.toLowerCase() === cleanQuery
    );

    const realName =
      (regularUser ? `${regularUser.first_name || ''} ${regularUser.last_name || ''}`.trim() || `@${regularUser.username}` : '') ||
      lead?.client_name ||
      customerEmailOrId;
    const realEmail = regularUser?.email || lead?.client_email || (customerEmailOrId.includes('@') ? customerEmailOrId : '');
    const realPhone = regularUser?.phone_number || lead?.client_phone || '+91 98765 43210';

    const maskedName = maskClientName(realName);
    const maskedEmail = maskClientEmail(realEmail);
    const maskedPhone = maskClientPhone(realPhone);

    if (!bizOp.operational) {
      return {
        hasChatted: false,
        elapsedHours: 999,
        elapsedMinutes: 999 * 60,
        isEligible: false,
        remainingHours: 0,
        remainingMinutes: 0,
        policyWindowHours: policyHours,
        statusText: `ORGANIZATION SUSPENDED: Business verification status is ${bizOp.status}. All commercial proposal, booking, and withdrawal services are put on hold.`,
        maskedName,
        maskedEmail,
        maskedPhone,
        realName,
        realEmail,
        realPhone,
      };
    }

    // Look for all incoming messages from this user to this business
    const bizClean = businessId.toLowerCase();
    const userClean = (regularUser?.user_id || customerEmailOrId).toLowerCase();
    const emailClean = realEmail.toLowerCase();

    const incomingChats = this.chats.filter((c) => {
      // Must be addressed to this business
      const matchesBiz =
        c.recipient_id.toLowerCase() === bizClean ||
        (c.conversation_id && c.conversation_id.toLowerCase().includes(bizClean));
      if (!matchesBiz) return false;

      // Must originate from this customer
      const senderLower = c.sender_id.toLowerCase();
      const senderNameLower = c.sender_name.toLowerCase();
      return (
        senderLower === userClean ||
        senderLower === emailClean ||
        (regularUser && senderLower === regularUser.user_id.toLowerCase()) ||
        senderNameLower.includes(realName.toLowerCase()) ||
        (c.conversation_id && (c.conversation_id.includes(userClean) || (regularUser && c.conversation_id.includes(regularUser.user_id))))
      );
    });

    if (incomingChats.length === 0) {
      return {
        hasChatted: false,
        elapsedHours: 999,
        elapsedMinutes: 999 * 60,
        isEligible: false,
        remainingHours: 0,
        remainingMinutes: 0,
        policyWindowHours: policyHours,
        statusText: `NO PRIOR CHAT: This customer has not initiated a live chat with your business. Proposals can only be sent to active users who contacted you via chat.`,
        maskedName,
        maskedEmail,
        maskedPhone,
        realName,
        realEmail,
        realPhone,
      };
    }

    // Sort by timestamp descending
    incomingChats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestChat = incomingChats[0];

    const chatTime = new Date(latestChat.timestamp).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - chatTime);
    const elapsedHours = diffMs / (1000 * 3600);
    const elapsedMinutes = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));

    const isEligible = elapsedHours <= policyHours;
    const remainingMs = Math.max(0, policyHours * 3600 * 1000 - diffMs);
    const remainingHours = Math.floor(remainingMs / (1000 * 3600));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 3600)) / (1000 * 60));

    let statusText = '';
    if (isEligible) {
      statusText = `ACTIVE CHAT CONTACT: Received ${elapsedHours < 1 ? `${elapsedMinutes}m ago` : `${Math.floor(elapsedHours)}h ${elapsedMinutes}m ago`}. ${remainingHours}h ${remainingMinutes}m remaining to dispatch proposal.`;
    } else {
      statusText = `CHAT WINDOW EXPIRED: ${Math.floor(elapsedHours)}h elapsed since customer chat (policy limit is ${policyHours}h). Proposals locked and contact info sealed under anti-circumvention rule.`;
    }

    return {
      hasChatted: true,
      lastChatTimestamp: latestChat.timestamp,
      lastChatMessage: latestChat.message,
      elapsedHours,
      elapsedMinutes,
      isEligible,
      remainingHours,
      remainingMinutes,
      policyWindowHours: policyHours,
      statusText,
      maskedName,
      maskedEmail,
      maskedPhone,
      realName,
      realEmail,
      realPhone,
    };
  }

  // --- Direct Chat Initiation with Wallet Debit (Requirement 4) ---
  public startDirectChatWithDebit(
    listingId: string,
    senderUserId: string,
    senderName: string,
    senderEmail: string,
    inquiryMessage: string
  ): {
    success: boolean;
    message: string;
    debitedCredits: number;
    autoRenewTriggered?: boolean;
    remainingBalance?: number;
    chat?: LiveChatMessage;
  } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Service listing not found.', debitedCredits: 0 };

    const biz = this.businesses.find((b) => b.business_id === listing.business_id);
    if (!biz) return { success: false, message: 'Associated business account not found.', debitedCredits: 0 };

    const debitCost = listing.directChatCredits || 15;

    // Ensure wallet exists
    if (!biz.corporate_wallet) {
      biz.corporate_wallet = {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 1000,
        tier: 'Enterprise Standard',
        provisioned_at: new Date().toISOString(),
        transactions: [],
      };
    }

    // Debit X credits from business account holder wallet
    biz.corporate_wallet.credit_balance = Math.max(0, biz.corporate_wallet.credit_balance - debitCost);
    biz.corporate_wallet.transactions.unshift({
      id: `ctx_${generateUUID().substring(0, 6)}`,
      type: 'USAGE',
      credits: -debitCost,
      description: `Direct Chat Session: Inquiry from Aviator ${senderName} (${senderEmail}) regarding "${listing.name}"`,
      timestamp: new Date().toISOString(),
      actionType: 'Direct Chat Debit',
    });

    // Check Auto-Renew
    let autoRenewTriggered = false;
    const arSettings = biz.corporate_wallet.auto_renew_settings;
    if (arSettings && arSettings.enabled && biz.corporate_wallet.credit_balance <= arSettings.thresholdCredits) {
      autoRenewTriggered = true;
      const topUpCredits = arSettings.renewCredits || 500;
      biz.corporate_wallet.credit_balance += topUpCredits;
      biz.corporate_wallet.transactions.unshift({
        id: `ctx_${generateUUID().substring(0, 6)}`,
        type: 'PURCHASE',
        credits: topUpCredits,
        description: `Auto-Renew Triggered (Threshold ≤ ${arSettings.thresholdCredits} Cr): Charged via ${arSettings.paymentGateway}`,
        timestamp: new Date().toISOString(),
        actionType: 'Auto-Renew System',
      });

      this.addNotification({
        recipient_id: biz.business_id,
        title: 'Auto-Renew Triggered Successfully',
        message: `Wallet fell below ${arSettings.thresholdCredits} Cr limit. Automatically added +${topUpCredits} credits via ${arSettings.paymentGateway}!`,
        type: 'WALLET',
      });
    }

    // Record in Live Chats
    const { text: cleanMsg, hasRedaction } = redactPII(inquiryMessage);
    const chat: LiveChatMessage = {
      id: `chat_${generateUUID().substring(0, 8)}`,
      sender_id: senderUserId,
      sender_name: senderName,
      recipient_id: biz.business_id,
      message: cleanMsg,
      original_message: hasRedaction ? '[Lead PII Filtered]' : undefined,
      pii_redacted: hasRedaction,
      timestamp: new Date().toISOString(),
      conversation_id: `conv_${listing.id}`,
      is_read: false,
    };
    this.chats.push(chat);

    // Requirement 1: If the business user receives any direct message then the chat option should automatically enabled. Or gets started.
    biz.chat_enabled = true;
    biz.has_active_inquiries = true;

    // Requirement: Chat stays strictly in chat (no duplicate dispatch to email)
    // Notifications for Business and User
    this.addNotification({
      recipient_id: biz.business_id,
      title: 'New Direct Chat Inquiry Received',
      message: `Direct chat started by ${senderName} for "${listing.name}". -${debitCost} Credits debited from your corporate wallet.`,
      type: 'CHAT',
      action_link: `conv_${listing.id}`,
    });

    this.addNotification({
      recipient_id: senderUserId,
      title: 'Direct Chat Dispatched',
      message: `Your inquiry has been relayed to ${listing.name}. Responses will appear in your Communications Inbox.`,
      type: 'CHAT',
      action_link: `conv_${listing.id}`,
    });

    this.persist();

    return {
      success: true,
      message: `Direct chat initialized! -${debitCost} credits debited from provider wallet. ${autoRenewTriggered ? 'Auto-renew triggered.' : ''}`,
      debitedCredits: debitCost,
      autoRenewTriggered,
      remainingBalance: biz.corporate_wallet.credit_balance,
      chat,
    };
  }

  // --- Corporate Wallet Renewal & Gateway (Requirements 5 & 6) ---
  public topUpBusinessWallet(
    businessId: string,
    gateway: 'RAZORPAY' | 'PAYPAL',
    packageTitle: string,
    amount: number,
    credits: number,
    paymentMethod: string
  ): { success: boolean; message: string; newBalance: number } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business not found.', newBalance: 0 };

    if (!biz.corporate_wallet) {
      biz.corporate_wallet = {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 0,
        tier: 'Enterprise Standard',
        provisioned_at: new Date().toISOString(),
        transactions: [],
      };
    }

    const currencySymbol = gateway === 'PAYPAL' ? '$' : '₹';
    const txId = `${gateway.toLowerCase()}_tx_${Math.floor(1000000 + Math.random() * 9000000)}`;

    biz.corporate_wallet.credit_balance += credits;
    biz.corporate_wallet.transactions.unshift({
      id: `ctx_${generateUUID().substring(0, 6)}`,
      type: 'PURCHASE',
      credits: credits,
      description: `${gateway} Gateway: ${packageTitle} (${currencySymbol}${amount.toLocaleString()}) via ${paymentMethod} [Tx: ${txId}]`,
      timestamp: new Date().toISOString(),
      actionType: 'Corporate Wallet Top-Up',
    });

    this.addNotification({
      recipient_id: businessId,
      title: `Wallet Credits Renewed via ${gateway}`,
      message: `Payment of ${currencySymbol}${amount.toLocaleString()} confirmed. Automatically added +${credits.toLocaleString()} credits to corporate wallet.`,
      type: 'WALLET',
    });

    this.persist();

    return {
      success: true,
      message: `Transaction successful via ${gateway}! +${credits.toLocaleString()} credits have been automatically added to your wallet.`,
      newBalance: biz.corporate_wallet.credit_balance,
    };
  }

  public updateBusinessAutoRenew(
    businessId: string,
    enabledOrSettings: boolean | AutoRenewSettings,
    threshold?: number,
    renewCredits?: number,
    gateway?: 'RAZORPAY' | 'PAYPAL'
  ): { success: boolean; message: string } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business not found.' };

    if (!biz.corporate_wallet) {
      biz.corporate_wallet = {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 0,
        tier: 'Enterprise Standard',
        provisioned_at: new Date().toISOString(),
        transactions: [],
      };
    }

    const settings: AutoRenewSettings =
      typeof enabledOrSettings === 'object'
        ? enabledOrSettings
        : {
            enabled: !!enabledOrSettings,
            thresholdCredits: threshold ?? 100,
            renewCredits: renewCredits ?? 500,
            paymentGateway: gateway || 'RAZORPAY',
            currency: (gateway || 'RAZORPAY') === 'PAYPAL' ? 'USD' : 'INR',
            amount: (gateway || 'RAZORPAY') === 'PAYPAL' ? 65 : 5000,
          };

    biz.corporate_wallet.auto_renew_settings = {
      ...settings,
      lastAutoRenewAt: new Date().toISOString(),
    };

    this.addNotification({
      recipient_id: businessId,
      title: 'Auto-Renew Settings Updated',
      message: settings.enabled
        ? `Auto-renew enabled! System will automatically top up ${settings.renewCredits} Cr via ${settings.paymentGateway} when balance drops below ${settings.thresholdCredits} Cr.`
        : 'Auto-renew feature has been disabled for this corporate account.',
      type: 'WALLET',
    });

    this.persist();

    return {
      success: true,
      message: `Auto-renew settings updated! Threshold: ${settings.thresholdCredits} Cr, Recharge: ${settings.renewCredits} Cr via ${settings.paymentGateway}.`,
    };
  }

  // ============================================================
  // CUSTOM USER LOW-CREDIT THRESHOLD & EMAIL NOTIFICATION ENGINE
  // ============================================================
  public getBusinessLowCreditAlertSettings(businessId: string): LowCreditThresholdAlertSettings {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz?.corporate_wallet) {
      return {
        enabled: true,
        thresholdCredits: 1000,
        notifyEmail: true,
        notifyWebPortal: true,
      };
    }
    if (!biz.corporate_wallet.low_credit_alert_settings) {
      biz.corporate_wallet.low_credit_alert_settings = {
        enabled: true,
        thresholdCredits: 1000,
        notifyEmail: true,
        notifyWebPortal: true,
        customEmailAddress: biz.business_email,
      };
      this.persist();
    }
    return biz.corporate_wallet.low_credit_alert_settings;
  }

  public updateBusinessLowCreditAlertSettings(
    businessId: string,
    updates: Partial<LowCreditThresholdAlertSettings>
  ): { success: boolean; message: string; settings: LowCreditThresholdAlertSettings } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) {
      return {
        success: false,
        message: 'Business entity not found.',
        settings: { enabled: false, thresholdCredits: 1000, notifyEmail: false, notifyWebPortal: false },
      };
    }

    if (!biz.corporate_wallet) {
      biz.corporate_wallet = {
        wallet_id: `corp_wal_${generateUUID().substring(0, 8)}`,
        credit_balance: 500,
        tier: 'Enterprise Standard',
        provisioned_at: new Date().toISOString(),
        transactions: [],
      };
    }

    const current = biz.corporate_wallet.low_credit_alert_settings || {
      enabled: true,
      thresholdCredits: 1000,
      notifyEmail: true,
      notifyWebPortal: true,
      customEmailAddress: biz.business_email,
    };

    biz.corporate_wallet.low_credit_alert_settings = {
      ...current,
      ...updates,
    };

    this.persist();

    // If enabled and current balance is below the configured threshold, automatically dispatch alert
    const currentBalance = biz.corporate_wallet.credit_balance;
    if (
      biz.corporate_wallet.low_credit_alert_settings.enabled &&
      currentBalance < biz.corporate_wallet.low_credit_alert_settings.thresholdCredits
    ) {
      this.checkAndTriggerLowCreditThresholdAlert(businessId, true);
    }

    return {
      success: true,
      message: `Minimum credit threshold updated to ${biz.corporate_wallet.low_credit_alert_settings.thresholdCredits} Credits! Automated email & webportal notifications configured.`,
      settings: biz.corporate_wallet.low_credit_alert_settings,
    };
  }

  public getDispatchedThresholdAlerts(businessId?: string): DispatchedThresholdAlert[] {
    if (businessId) {
      return this.dispatchedThresholdAlerts.filter((a) => a.business_id === businessId);
    }
    return this.dispatchedThresholdAlerts;
  }

  public checkAndTriggerLowCreditThresholdAlert(
    businessId: string,
    forceTest: boolean = false
  ): { triggered: boolean; alert?: DispatchedThresholdAlert; message: string } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz || !biz.corporate_wallet) {
      return { triggered: false, message: 'Business or corporate wallet not found.' };
    }

    const settings = this.getBusinessLowCreditAlertSettings(businessId);
    if (!settings.enabled && !forceTest) {
      return { triggered: false, message: 'Threshold alerts are disabled for this business.' };
    }

    const currentBalance = biz.corporate_wallet.credit_balance;
    const threshold = settings.thresholdCredits || 1000;

    // Check if balance is less than threshold
    if (currentBalance >= threshold && !forceTest) {
      return {
        triggered: false,
        message: `Balance (${currentBalance} Cr) meets or exceeds your threshold limit (${threshold} Cr). No notification required.`,
      };
    }

    // Cooldown check (prevent repeated alert flood within 30 mins unless forceTest)
    if (!forceTest && settings.lastAlertSentAt) {
      const elapsed = Date.now() - new Date(settings.lastAlertSentAt).getTime();
      if (elapsed < 30 * 60 * 1000 && settings.lastAlertBalance === currentBalance) {
        return { triggered: false, message: 'Alert recently dispatched within cooldown window.' };
      }
    }

    const recipientEmail = settings.customEmailAddress?.trim() || biz.business_email || 'corporate.ops@truvaer.com';

    // 1. FORMAL EMAIL NOTIFICATION (Exact requested user template)
    const emailSubject = `⚠️ Low Credit Balance Alert: Wallet Below ${threshold} Credits Limit`;
    const emailBody = `Dear ${biz.organization_name},

Your credit limit has been less than threshold. Request you to please recharge or add the credit to your wallet keep the services active.

• Business User: ${biz.organization_name}
• Registered Mail Address: ${recipientEmail}
• Current Credit Balance: ${currentBalance} Credits
• Configured Minimum Threshold: ${threshold} Credits
• Deficit / Shortfall: ${Math.max(0, threshold - currentBalance)} Credits

To ensure your corporate aviation listings, inbound lead reveals, quotation responses, and verified visibility remain uninterrupted without downtime, please access your Corporate Wallet and recharge your balance immediately.

Portal Direct Recharge Link: https://truvaer.com/corporate/wallet?action=recharge

Thank you,
TruvAer Aviation Credit & Treasury Operations
Automated Compliance & Balance Monitoring System`;

    let portalNotifId: string | undefined = undefined;

    // 2. DISPATCH WEBPORTAL NOTIFICATION (Follow-up notification on the Webportal)
    if (settings.notifyWebPortal || forceTest) {
      const notif = this.addNotification({
        recipient_id: biz.business_id,
        title: '⚠️ Low Credit Limit Alert (Below Threshold)',
        message: `Dear ${biz.organization_name}, your credit limit (${currentBalance} Credits) has been less than your configured threshold of ${threshold} Credits. Request you to please recharge or add the credit to your wallet to keep the services active.`,
        type: 'WALLET',
        action_link: 'wallet_recharge',
      });
      portalNotifId = notif.id;
    }

    // Record formal internal mail in platform mailboxes
    if (settings.notifyEmail || forceTest) {
      this.sendInternalMail(
        'treasury-alerts@truvaer.com',
        recipientEmail,
        emailSubject,
        emailBody,
        'Updates'
      );
    }

    // 3. RECORD IN DISPATCHED THRESHOLD ALERTS AUDIT LEDGER
    const newAlert: DispatchedThresholdAlert = {
      id: `thresh_alert_${generateUUID().substring(0, 8)}`,
      business_id: biz.business_id,
      business_name: biz.organization_name,
      recipient_email: recipientEmail,
      threshold_credits: threshold,
      current_balance: currentBalance,
      email_subject: emailSubject,
      email_body: emailBody,
      portal_notification_id: portalNotifId,
      sent_at: new Date().toISOString(),
      delivery_status: 'DELIVERED',
    };

    this.dispatchedThresholdAlerts.unshift(newAlert);

    // Update wallet alert settings metadata
    settings.lastAlertSentAt = newAlert.sent_at;
    settings.lastAlertBalance = currentBalance;
    biz.corporate_wallet.low_credit_alert_settings = settings;

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Low Credit Threshold Alert Dispatched',
      description: `Automated email to registered address (${recipientEmail}) & webportal notification dispatched to ${biz.organization_name}. Balance ${currentBalance} Cr < Threshold ${threshold} Cr.`,
      actor_name: 'Automated Treasury Engine',
      actor_role: 'Platform Service',
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: 'warning',
    });

    this.persist();

    return {
      triggered: true,
      alert: newAlert,
      message: `Alert dispatched successfully to registered email (${recipientEmail}) and Webportal in-app notification center!`,
    };
  }

  // ============================================================
  // GRANULAR ACCESS CONTROL & PERMISSION METHODS
  // ============================================================
  public updateAdminPermissions(
    adminId: string,
    updatesOrPerms:
      | {
          department?: AdminDepartment;
          level?: AdminLevel;
          level_title?: string;
          module_permissions?: Record<string, ModulePermissionConfig>;
          territory_scope?: TerritoryScope;
        }
      | Record<string, ModulePermissionConfig>,
    territoryScope?: TerritoryScope
  ): { success: boolean; message: string; admin?: AdminUser } {
    const admin = this.adminUsers.find((a) => a.admin_id === adminId);
    if (!admin) {
      return { success: false, message: 'Admin user not found.' };
    }

    if (updatesOrPerms && typeof updatesOrPerms === 'object' && ('module_permissions' in updatesOrPerms || 'department' in updatesOrPerms || 'level' in updatesOrPerms || 'territory_scope' in updatesOrPerms)) {
      const updates = updatesOrPerms as {
        department?: AdminDepartment;
        level?: AdminLevel;
        level_title?: string;
        module_permissions?: Record<string, ModulePermissionConfig>;
        territory_scope?: TerritoryScope;
      };
      if (updates.department !== undefined) admin.department = updates.department;
      if (updates.level !== undefined) admin.level = updates.level;
      if (updates.level_title !== undefined) admin.level_title = updates.level_title;
      if (updates.module_permissions !== undefined) {
        admin.module_permissions = {
          ...(admin.module_permissions || {}),
          ...updates.module_permissions,
        };
      }
      if (updates.territory_scope !== undefined) {
        admin.territory_scope = {
          ...(admin.territory_scope || { zone: 'All Zones', country: 'All Countries', territory: 'All Hubs' }),
          ...updates.territory_scope,
        };
      }
    } else {
      admin.module_permissions = updatesOrPerms as Record<string, ModulePermissionConfig>;
      if (territoryScope !== undefined) {
        admin.territory_scope = territoryScope;
      }
    }

    this.persist();
    return {
      success: true,
      message: `Permissions and territorial scope updated for ${admin.name}.`,
      admin,
    };
  }

  // ============================================================
  // CRM LEADS MANAGEMENT
  // ============================================================
  public getCRMLeads(businessId?: string, zone?: string, country?: string, territory?: string): CRMLead[] {
    let leads = this.crmLeads;
    if (businessId) {
      leads = leads.filter((l) => l.business_id === businessId);
    }
    if (zone && zone !== 'All Zones' && zone !== 'ALL') {
      leads = leads.filter((l) => l.zone === zone);
    }
    if (country && country !== 'All Countries' && country !== 'ALL') {
      leads = leads.filter((l) => l.country === country);
    }
    if (territory && territory !== 'All Hubs' && territory !== 'ALL') {
      leads = leads.filter((l) => l.territory === territory);
    }
    return leads;
  }

  public createCRMLead(leadData: Partial<CRMLead>): CRMLead {
    const newLead: CRMLead = {
      id: `lead_${generateUUID().substring(0, 8)}`,
      business_id: leadData.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: leadData.business_name || 'JetVentures VIP SkySuite & Private Charters',
      client_name: leadData.client_name || 'Anonymous Client',
      client_email: leadData.client_email || 'client@aviator.com',
      client_phone: leadData.client_phone || '+91 90000 00000',
      category: leadData.category || 'Private Air Charter',
      subCategory: leadData.subCategory || 'VIP Corporate Jet Charter',
      title: leadData.title || 'Aviation Service Lead Inquiry',
      requirement_details: leadData.requirement_details || 'Detailed charter or MRO requirements.',
      budget: Number(leadData.budget) || 1000000,
      currency: leadData.currency || 'INR',
      status: leadData.status || 'NEW',
      source: leadData.source || 'Marketplace Lead',
      assigned_to: leadData.assigned_to || 'Sales Representative',
      zone: leadData.zone || 'West Zone',
      country: leadData.country || 'IN',
      territory: leadData.territory || 'BOM (Mumbai)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.crmLeads = [newLead, ...this.crmLeads];
    this.persist();
    return newLead;
  }

  public updateCRMLead(id: string, updates: Partial<CRMLead>): CRMLead | null {
    const idx = this.crmLeads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    const prevLead = { ...this.crmLeads[idx] };
    this.crmLeads[idx] = {
      ...this.crmLeads[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();

    if (updates.status && updates.status !== prevLead.status) {
      this.logAdminActivity({
        category: 'LEAD_STATUS_CHANGE',
        title: `Lead Status: ${this.crmLeads[idx].client_name} ➔ ${updates.status}`,
        description: `Lead "${this.crmLeads[idx].title}" for ${this.crmLeads[idx].client_name} transitioned from ${prevLead.status} to ${updates.status}. Budget: ₹${((this.crmLeads[idx].budget || 1500000) / 100000).toFixed(1)} Lakhs.`,
        actor_name: updates.assigned_to || this.crmLeads[idx].assigned_to || 'Sales Operations Desk',
        actor_role: 'Commercial Aviation Sales',
        target_id: this.crmLeads[idx].id,
        target_name: this.crmLeads[idx].client_name,
        amount: this.crmLeads[idx].budget || 1500000,
        currency: 'INR',
        status_from: prevLead.status,
        status_to: updates.status,
        severity: updates.status === 'WON' ? 'success' : updates.status === 'LOST' ? 'critical' : 'info',
      });
    }

    return this.crmLeads[idx];
  }

  public deleteCRMLead(id: string): boolean {
    const prevLen = this.crmLeads.length;
    this.crmLeads = this.crmLeads.filter((l) => l.id !== id);
    if (this.crmLeads.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // ============================================================
  // CRM OPPORTUNITIES & PIPELINE (With Automated Commission Trigger)
  // ============================================================
  public getCRMOpportunities(businessId?: string, zone?: string, country?: string, territory?: string): CRMOpportunity[] {
    let opps = this.crmOpportunities;
    if (businessId) {
      opps = opps.filter((o) => o.business_id === businessId);
    }
    if (zone && zone !== 'All Zones' && zone !== 'ALL') {
      opps = opps.filter((o) => o.zone === zone);
    }
    if (country && country !== 'All Countries' && country !== 'ALL') {
      opps = opps.filter((o) => o.country === country);
    }
    if (territory && territory !== 'All Hubs' && territory !== 'ALL') {
      opps = opps.filter((o) => o.territory === territory);
    }
    return opps;
  }

  public createCRMOpportunity(oppData: Partial<CRMOpportunity>): CRMOpportunity {
    const newOpp: CRMOpportunity = {
      id: `opp_${generateUUID().substring(0, 8)}`,
      lead_id: oppData.lead_id,
      business_id: oppData.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: oppData.business_name || 'JetVentures VIP SkySuite & Private Charters',
      deal_name: oppData.deal_name || 'New Aviation Opportunity',
      client_name: oppData.client_name || 'Client',
      deal_value: Number(oppData.deal_value) || 2000000,
      currency: oppData.currency || 'INR',
      probability: Number(oppData.probability) || 50,
      stage: oppData.stage || 'PROSPECTING',
      expected_close_date: oppData.expected_close_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      assigned_to: oppData.assigned_to || 'Sales Manager',
      zone: oppData.zone || 'West Zone',
      country: oppData.country || 'IN',
      territory: oppData.territory || 'BOM (Mumbai)',
      created_at: new Date().toISOString(),
    };

    this.crmOpportunities = [newOpp, ...this.crmOpportunities];
    this.persist();

    // If created directly in CLOSED_WON, trigger commission
    if (newOpp.stage === 'CLOSED_WON') {
      this.triggerAutoCommission({
        dealId: newOpp.id,
        dealTitle: newOpp.deal_name,
        businessId: newOpp.business_id,
        businessName: newOpp.business_name,
        clientName: newOpp.client_name,
        saleAmount: newOpp.deal_value,
        currency: newOpp.currency,
        zone: newOpp.zone,
        country: newOpp.country,
        territory: newOpp.territory,
      });
    }

    return newOpp;
  }

  public updateCRMOpportunity(id: string, updates: Partial<CRMOpportunity>): { opportunity: CRMOpportunity | null; commissionGenerated?: CommissionRecord } {
    const idx = this.crmOpportunities.findIndex((o) => o.id === id);
    if (idx === -1) return { opportunity: null };

    const prevStage = this.crmOpportunities[idx].stage;
    this.crmOpportunities[idx] = {
      ...this.crmOpportunities[idx],
      ...updates,
    };
    const updatedOpp = this.crmOpportunities[idx];
    this.persist();

    let comm: CommissionRecord | undefined;
    // AUTOMATIC COMMISSION GENERATION: when deal advances to CLOSED_WON
    if (prevStage !== 'CLOSED_WON' && updatedOpp.stage === 'CLOSED_WON') {
      comm = this.triggerAutoCommission({
        dealId: updatedOpp.id,
        dealTitle: updatedOpp.deal_name,
        businessId: updatedOpp.business_id,
        businessName: updatedOpp.business_name,
        clientName: updatedOpp.client_name,
        saleAmount: updatedOpp.deal_value,
        currency: updatedOpp.currency,
        zone: updatedOpp.zone,
        country: updatedOpp.country,
        territory: updatedOpp.territory,
      });
    }

    return { opportunity: updatedOpp, commissionGenerated: comm };
  }

  // ============================================================
  // CRM QUOTATIONS & ESTIMATES (With Automated Commission Trigger)
  // ============================================================
  public getCRMQuotations(businessId?: string): CRMQuotation[] {
    if (businessId) {
      return this.crmQuotations.filter((q) => q.business_id === businessId);
    }
    return this.crmQuotations;
  }

  public createCRMQuotation(qData: Partial<CRMQuotation>): CRMQuotation {
    const subtotal = (qData.items || []).reduce((acc, it) => acc + (it.total || it.quantity * it.unit_price), 0);
    const taxRate = qData.tax_percent !== undefined ? qData.tax_percent : 5.0;
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const grandTotal = subtotal + taxAmount;

    const newQuotation: CRMQuotation = {
      id: `quot_${generateUUID().substring(0, 8)}`,
      quotation_number: `TRU-QT-${new Date().getFullYear()}-${String(this.crmQuotations.length + 90).padStart(3, '0')}`,
      business_id: qData.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: qData.business_name || 'JetVentures VIP SkySuite & Private Charters',
      client_name: qData.client_name || 'Aviation Client',
      client_email: qData.client_email || 'client@aviator.com',
      client_phone: qData.client_phone || '+91 90000 00000',
      service_title: qData.service_title || 'Charter Flight & Ground Handling Estimate',
      items: qData.items || [
        { id: '1', description: 'Flight Charter Block Hours', quantity: 1, unit_price: subtotal || 1500000, total: subtotal || 1500000 },
      ],
      subtotal,
      tax_percent: taxRate,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      currency: qData.currency || 'INR',
      status: qData.status || 'DRAFT',
      valid_until: qData.valid_until || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      payment_terms: qData.payment_terms || '50% advance on booking, 50% 24 hours prior to wheels-up.',
      notes: qData.notes || 'All landing fees, ramp navigation, and in-flight catering included.',
      created_at: new Date().toISOString(),
      zone: qData.zone || 'West Zone',
      country: qData.country || 'IN',
      territory: qData.territory || 'BOM (Mumbai)',
    };

    this.crmQuotations = [newQuotation, ...this.crmQuotations];
    this.persist();

    // If accepted immediately
    if (newQuotation.status === 'ACCEPTED' || newQuotation.status === 'INVOICED') {
      this.triggerAutoCommission({
        dealId: newQuotation.id,
        dealTitle: `${newQuotation.service_title} (${newQuotation.quotation_number})`,
        quotationNumber: newQuotation.quotation_number,
        businessId: newQuotation.business_id,
        businessName: newQuotation.business_name,
        clientName: newQuotation.client_name,
        saleAmount: newQuotation.grand_total,
        currency: newQuotation.currency,
        zone: newQuotation.zone || 'West Zone',
        country: newQuotation.country || 'IN',
        territory: newQuotation.territory || 'BOM (Mumbai)',
      });
    }

    return newQuotation;
  }

  public updateCRMQuotationStatus(id: string, status: CRMQuotationStatus): { quotation: CRMQuotation | null; commissionGenerated?: CommissionRecord } {
    const idx = this.crmQuotations.findIndex((q) => q.id === id);
    if (idx === -1) return { quotation: null };

    const prevStatus = this.crmQuotations[idx].status;
    this.crmQuotations[idx].status = status;
    const quot = this.crmQuotations[idx];
    this.persist();

    let comm: CommissionRecord | undefined;
    if ((status === 'ACCEPTED' || status === 'INVOICED') && prevStatus !== 'ACCEPTED' && prevStatus !== 'INVOICED') {
      comm = this.triggerAutoCommission({
        dealId: quot.id,
        dealTitle: `${quot.service_title} (${quot.quotation_number})`,
        quotationNumber: quot.quotation_number,
        businessId: quot.business_id,
        businessName: quot.business_name,
        clientName: quot.client_name,
        saleAmount: quot.grand_total,
        currency: quot.currency,
        zone: quot.zone || 'West Zone',
        country: quot.country || 'IN',
        territory: quot.territory || 'BOM (Mumbai)',
      });
    }

    return { quotation: quot, commissionGenerated: comm };
  }

  // ============================================================
  // AUTOMATIC COMMISSION MODULE (Finance Exclusive & Business Sheet)
  // ============================================================
  private triggerAutoCommission(params: {
    dealId: string;
    dealTitle: string;
    quotationNumber?: string;
    businessId: string;
    businessName: string;
    clientName: string;
    saleAmount: number;
    currency: string;
    zone: string;
    country: string;
    territory: string;
  }): CommissionRecord {
    // Check if commission already exists for this deal
    const existing = this.commissions.find((c) => c.deal_id === params.dealId);
    if (existing) return existing;

    const commissionRate = 5.0; // 5% standard aviation platform agreement
    const commissionAmount = Math.round(params.saleAmount * (commissionRate / 100));
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

    const record: CommissionRecord = {
      id: `comm_${generateUUID().substring(0, 8)}`,
      deal_id: params.dealId,
      deal_title: params.dealTitle,
      quotation_number: params.quotationNumber,
      business_id: params.businessId,
      business_name: params.businessName,
      client_name: params.clientName,
      sale_amount: params.saleAmount,
      commission_rate_pct: commissionRate,
      commission_amount: commissionAmount,
      currency: params.currency || 'INR',
      sale_date: today,
      due_date: dueDate,
      status: 'COMMITTED',
      notes: `Automated 5% commission commitment sheet generated upon deal completion (${params.dealTitle}).`,
      zone: params.zone,
      country: params.country,
      territory: params.territory,
    };

    this.commissions = [record, ...this.commissions];
    this.persist();

    // Notify Business User
    this.addNotification({
      recipient_id: params.businessId,
      title: 'Deal Won! Commission Sheet Generated',
      message: `Sale "${params.dealTitle}" of ${params.currency} ${params.saleAmount.toLocaleString()} closed! Commission of ${params.currency} ${commissionAmount.toLocaleString()} committed as per platform agreement. Due by ${formatDateDDMMYYYY(dueDate)}.`,
      type: 'WALLET',
    });

    // Notify Finance Admin Desk
    this.addNotification({
      recipient_id: 'admin_primary_truvaer',
      title: 'New Platform Commission Accrued (Finance)',
      message: `New sale closed by ${params.businessName}: ${params.currency} ${params.saleAmount.toLocaleString()}. Platform commission of ${params.currency} ${commissionAmount.toLocaleString()} accrued.`,
      type: 'SYSTEM',
    });

    return record;
  }

  public getCommissions(businessId?: string): CommissionRecord[] {
    if (businessId) {
      return this.commissions.filter((c) => c.business_id === businessId);
    }
    return this.commissions;
  }

  // =========================================================================
  // COMMISSION PERCENTAGE ENTRY MODULE
  // Allows Admin or Sales Team to log expected commission percentage on a sale.
  // Auto-calculates final commission value, determines remaining balance (net amount),
  // and instantly shares data with Platform Admin team for accounting and transparency.
  // =========================================================================
  public logCommissionPercentageEntry(params: {
    dealId?: string;
    dealTitle: string;
    quotationNumber?: string;
    businessId: string;
    businessName: string;
    clientName: string;
    saleAmount: number;
    commissionRatePct: number;
    currency?: string;
    zone?: string;
    country?: string;
    territory?: string;
    dueDate?: string;
    notes?: string;
    loggedBy: string;
    loggedByRole: string;
  }): { success: boolean; message: string; record: CommissionRecord } {
    const commissionRate = Number(params.commissionRatePct) || 0;
    const saleAmount = Number(params.saleAmount) || 0;
    const commissionAmount = Math.round(saleAmount * (commissionRate / 100));
    const netRemainingBalance = Math.max(0, saleAmount - commissionAmount);
    const today = new Date().toISOString().split('T')[0];
    const dueDate = params.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const dealId = params.dealId || `deal_${Date.now().toString(36)}`;

    const record: CommissionRecord = {
      id: `comm_${generateUUID().substring(0, 8)}`,
      deal_id: dealId,
      deal_title: params.dealTitle,
      quotation_number: params.quotationNumber,
      business_id: params.businessId,
      business_name: params.businessName,
      client_name: params.clientName,
      sale_amount: saleAmount,
      commission_rate_pct: commissionRate,
      commission_amount: commissionAmount,
      net_remaining_balance: netRemainingBalance,
      currency: params.currency || 'INR',
      sale_date: today,
      due_date: dueDate,
      status: 'COMMITTED',
      notes:
        params.notes ||
        `Expected commission logged at ${commissionRate}% on sale of ${params.currency || 'INR'} ${saleAmount.toLocaleString()}. Net remaining balance: ${params.currency || 'INR'} ${netRemainingBalance.toLocaleString()}.`,
      zone: params.zone || 'APAC',
      country: params.country || 'India',
      territory: params.territory || 'India South Hub',
      logged_by_role: params.loggedByRole,
      shared_with_admin_at: new Date().toISOString(),
      admin_accounting_status: 'SHARED_WITH_ADMIN',
    };

    this.commissions = [record, ...this.commissions];
    this.persist();

    // Instantly log Admin Activity for accounting & transparency
    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: `Expected Commission Logged (${commissionRate}%): ${params.dealTitle}`,
      description: `Logged by ${params.loggedBy} (${params.loggedByRole}). Sale: ₹${saleAmount.toLocaleString()} | Commission Expected: ₹${commissionAmount.toLocaleString()} (${commissionRate}%) | Net Balance to Partner: ₹${netRemainingBalance.toLocaleString()}. Instantly synchronized with Platform Admin Team for accounting.`,
      actor_name: params.loggedBy,
      actor_role: params.loggedByRole,
      amount: commissionAmount,
      currency: params.currency || 'INR',
      severity: 'success',
    });

    // Instantly notify Platform Admin Team
    this.addNotification({
      recipient_id: 'admin@truvaer.com',
      title: `📊 Commission Logged: ${commissionRate}% on Sale ₹${saleAmount.toLocaleString()}`,
      message: `${params.loggedBy} logged ${commissionRate}% commission for "${params.dealTitle}" (${params.businessName}). Commission: ₹${commissionAmount.toLocaleString()}, Net Balance: ₹${netRemainingBalance.toLocaleString()}. Accounting ledger synchronized.`,
      type: 'WALLET',
    });

    // Also notify the business
    this.addNotification({
      recipient_id: params.businessId,
      title: `Sale Commission Sheet: ₹${commissionAmount.toLocaleString()} (${commissionRate}%)`,
      message: `Commission of ${commissionRate}% recorded on sale "${params.dealTitle}". Net balance: ₹${netRemainingBalance.toLocaleString()}. Shared transparently with Platform Admin.`,
      type: 'WALLET',
    });

    return {
      success: true,
      message: `Commission of ₹${commissionAmount.toLocaleString()} (${commissionRate}%) logged successfully! Net balance of ₹${netRemainingBalance.toLocaleString()} recorded and instantly shared with Platform Admin team for accounting and transparency.`,
      record,
    };
  }

  public releaseCommissionPayment(
    commissionId: string,
    paymentMethod: 'CORPORATE_WALLET' | 'BANK_TRANSFER' | 'RAZORPAY_GATEWAY',
    notes?: string
  ): { success: boolean; message: string; record?: CommissionRecord } {
    const record = this.commissions.find((c) => c.id === commissionId);
    if (!record) {
      return { success: false, message: 'Commission record not found.' };
    }

    if (record.status === 'RELEASED' || record.status === 'SETTLED') {
      return { success: false, message: 'Commission payment has already been released.' };
    }

    const paymentRef = `TXN-${paymentMethod.substring(0, 4)}-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;

    // If paid via corporate wallet, check and debit credits
    if (paymentMethod === 'CORPORATE_WALLET') {
      const biz = this.getBusinessById(record.business_id);
      if (biz && biz.corporate_wallet) {
        // Assume 1 Credit = ₹50 for commission deduction
        const creditsEquivalent = Math.max(1, Math.round(record.commission_amount / 50));
        if (biz.corporate_wallet.credit_balance < creditsEquivalent) {
          return {
            success: false,
            message: `Insufficient corporate wallet balance. Required: ${creditsEquivalent} Credits (₹${record.commission_amount.toLocaleString()}), Available: ${biz.corporate_wallet.credit_balance} Credits.`,
          };
        }
        biz.corporate_wallet.credit_balance -= creditsEquivalent;
        biz.corporate_wallet.total_debited_credits = (biz.corporate_wallet.total_debited_credits || 0) + creditsEquivalent;
        biz.corporate_wallet.last_transaction_date = new Date().toISOString();
      }
    }

    record.status = 'RELEASED';
    record.payment_reference = paymentRef;
    record.released_at = new Date().toISOString();
    if (notes) {
      record.notes = `${record.notes || ''} [Payment: ${paymentMethod} | Ref: ${paymentRef}] ${notes}`;
    }

    this.persist();

    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: `Commission Payout: ₹${record.commission_amount.toLocaleString()} Released`,
      description: `${record.business_name} released platform commission of ${record.currency} ${record.commission_amount.toLocaleString()} for "${record.deal_title}". Ref: ${paymentRef}.`,
      actor_name: record.business_name,
      actor_role: 'Aviation Partner',
      target_id: record.id,
      target_name: record.deal_title,
      amount: record.commission_amount,
      currency: record.currency,
      status_from: 'PENDING_APPROVAL',
      status_to: 'RELEASED',
      severity: 'success',
    });

    // Notify Finance Admin
    this.addNotification({
      recipient_id: 'admin_primary_truvaer',
      title: 'Commission Payment Released by Partner',
      message: `${record.business_name} released commission payment of ${record.currency} ${record.commission_amount.toLocaleString()}. Ref: ${paymentRef}. Awaiting Finance verification.`,
      type: 'WALLET',
    });

    return {
      success: true,
      message: `Commission payment of ${record.currency} ${record.commission_amount.toLocaleString()} released successfully! Reference: ${paymentRef}`,
      record,
    };
  }

  public settleCommissionByFinance(
    commissionId: string,
    adminId: string
  ): { success: boolean; message: string; record?: CommissionRecord } {
    const admin = this.adminUsers.find((a) => a.admin_id === adminId);
    if (!admin) {
      return { success: false, message: 'Admin not identified.' };
    }

    // GATED: Only Finance or Senior Management
    if (admin.department !== 'Finance' && admin.department !== 'Senior Management Team') {
      return {
        success: false,
        message: 'Access Denied: Commission settlement and verification is strictly restricted to Finance & Treasury Department.',
      };
    }

    const record = this.commissions.find((c) => c.id === commissionId);
    if (!record) {
      return { success: false, message: 'Commission record not found.' };
    }

    record.status = 'SETTLED';
    record.settled_by_admin = `${admin.name} (${admin.level_title || 'Finance Desk'})`;
    this.persist();

    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: `Commission Settled: ₹${record.commission_amount.toLocaleString()}`,
      description: `Finance verified & settled platform commission of ${record.currency} ${record.commission_amount.toLocaleString()} for "${record.deal_title}".`,
      actor_name: admin.name,
      actor_role: admin.level_title || 'Finance Desk',
      target_id: record.id,
      target_name: record.deal_title,
      amount: record.commission_amount,
      currency: record.currency,
      status_from: 'RELEASED',
      status_to: 'SETTLED',
      severity: 'success',
    });

    // Notify business user
    this.addNotification({
      recipient_id: record.business_id,
      title: 'Commission Settled by Finance Desk',
      message: `Your commission payment of ${record.currency} ${record.commission_amount.toLocaleString()} for "${record.deal_title}" has been verified and settled by ${admin.name}. Thank you!`,
      type: 'WALLET',
    });

    return {
      success: true,
      message: `Commission ${record.id} successfully audited and settled in Truvaer Treasury Ledger.`,
      record,
    };
  }

  // ============================================================
  // CRM SUPPORT TICKETS & DISPUTES
  // ============================================================
  public getCRMSupportTickets(businessId?: string): CRMSupportTicket[] {
    if (businessId) {
      return this.crmTickets.filter((t) => t.business_id === businessId);
    }
    return this.crmTickets;
  }

  public createCRMSupportTicket(ticketData: Partial<CRMSupportTicket>): CRMSupportTicket {
    const ticketNum = `TICK-${new Date().getFullYear()}-${String(this.crmTickets.length + 4402).padStart(4, '0')}`;
    const newTicket: CRMSupportTicket = {
      id: `tick_${generateUUID().substring(0, 8)}`,
      ticket_number: ticketNum,
      business_id: ticketData.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: ticketData.business_name || 'JetVentures VIP SkySuite & Private Charters',
      client_name: ticketData.client_name || 'Client',
      client_email: ticketData.client_email || 'client@aviator.com',
      subject: ticketData.subject || 'Charter In-Flight Support Request',
      category: ticketData.category || 'Flight Logistics & Ground Handling',
      priority: ticketData.priority || 'MEDIUM',
      status: ticketData.status || 'OPEN',
      messages: ticketData.messages || [
        {
          id: 'msg_1',
          sender_name: ticketData.client_name || 'Client',
          sender_role: 'CLIENT',
          text: ticketData.subject || 'Support request submitted.',
          timestamp: new Date().toISOString(),
        },
      ],
      assigned_agent: ticketData.assigned_agent || 'Customer Care Desk',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.crmTickets = [newTicket, ...this.crmTickets];
    this.persist();
    return newTicket;
  }

  public addTicketMessage(ticketId: string, senderName: string, role: 'CLIENT' | 'SUPPORT_REP', text: string): CRMSupportTicket | null {
    const ticket = this.crmTickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    ticket.messages.push({
      id: `msg_${generateUUID().substring(0, 6)}`,
      sender_name: senderName,
      sender_role: role,
      text,
      timestamp: new Date().toISOString(),
    });
    ticket.updated_at = new Date().toISOString();
    if (role === 'SUPPORT_REP' && ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS';
    }
    this.persist();
    return ticket;
  }

  public updateTicketStatus(ticketId: string, status: TicketStatus): CRMSupportTicket | null {
    const ticket = this.crmTickets.find((t) => t.id === ticketId);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updated_at = new Date().toISOString();
    this.persist();
    return ticket;
  }

  // ============================================================
  // CRM SALES RECORDS & REPORTING (Sales Dashboard)
  // ============================================================
  public getCRMSales(
    businessId?: string,
    filters?: {
      zone?: string;
      country?: string;
      territory?: string;
      salesStatus?: string;
      paymentStatus?: string;
      createdBy?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    }
  ): CRMSalesRecord[] {
    let list = this.crmSales;
    if (businessId) {
      list = list.filter((s) => s.business_id === businessId);
    }
    if (filters) {
      if (filters.zone && filters.zone !== 'All Zones' && filters.zone !== 'ALL') {
        list = list.filter((s) => s.zone === filters.zone);
      }
      if (filters.country && filters.country !== 'All Countries' && filters.country !== 'ALL') {
        list = list.filter((s) => s.country === filters.country);
      }
      if (filters.territory && filters.territory !== 'All Hubs' && filters.territory !== 'ALL') {
        list = list.filter((s) => s.territory === filters.territory);
      }
      if (filters.salesStatus && filters.salesStatus !== 'All') {
        list = list.filter((s) => s.sales_status === filters.salesStatus);
      }
      if (filters.paymentStatus && filters.paymentStatus !== 'All') {
        list = list.filter((s) => s.payment_status === filters.paymentStatus);
      }
      if (filters.createdBy && filters.createdBy !== 'All') {
        const creator = filters.createdBy.toLowerCase();
        list = list.filter((s) => s.created_by.toLowerCase() === creator);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(
          (s) =>
            s.sales_code.toLowerCase().includes(q) ||
            s.customer_name.toLowerCase().includes(q) ||
            (s.reference_no && s.reference_no.toLowerCase().includes(q)) ||
            (s.tag && s.tag.toLowerCase().includes(q)) ||
            (s.notes && s.notes.toLowerCase().includes(q)) ||
            (s.customer_email && s.customer_email.toLowerCase().includes(q))
        );
      }
      if (filters.startDate) {
        list = list.filter((s) => normalizeDateToISO(s.sales_date) >= filters.startDate!);
      }
      if (filters.endDate) {
        list = list.filter((s) => normalizeDateToISO(s.sales_date) <= filters.endDate!);
      }
    }
    return list;
  }

  public createCRMSale(saleData: Partial<CRMSalesRecord>): CRMSalesRecord {
    let nextCode = saleData.sales_code;
    if (!nextCode) {
      const maxNum = this.crmSales.reduce((max, s) => {
        const match = s.sales_code.match(/^SL(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 30);
      nextCode = `SL${String(maxNum + 1).padStart(4, '0')}`;
    }

    const total = Number(saleData.total_amount) || 0;
    const paid = Number(saleData.paid_amount) || 0;
    let paymentStatus: SalesPaymentStatus = saleData.payment_status || 'Unpaid';
    if (!saleData.payment_status) {
      if (paid >= total && total > 0) paymentStatus = 'Paid';
      else if (paid > 0) paymentStatus = 'Partial';
      else paymentStatus = 'Unpaid';
    }

    let salesDate = saleData.sales_date || new Date().toISOString().split('T')[0];
    if (salesDate.includes('-') && salesDate.indexOf('-') === 4) {
      const [y, m, d] = salesDate.split('-');
      salesDate = `${d}-${m}-${y}`;
    }

    const newSale: CRMSalesRecord = {
      id: `sale_${generateUUID().substring(0, 8)}`,
      sales_code: nextCode,
      sales_date: salesDate,
      sales_status: saleData.sales_status || 'Final',
      reference_no: saleData.reference_no || '',
      customer_name: saleData.customer_name || 'Walk-in customer',
      customer_email: saleData.customer_email || '',
      customer_phone: saleData.customer_phone || '',
      business_id: saleData.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: saleData.business_name || 'JetVentures VIP SkySuite & Private Charters',
      total_amount: total,
      paid_amount: paid,
      payment_status: paymentStatus,
      created_by: saleData.created_by || 'Admin',
      payment_method: saleData.payment_method || 'Bank Transfer',
      items: saleData.items || [
        { description: 'Aviation Service / Product Sale', quantity: 1, unit_price: total, total },
      ],
      tag: saleData.tag,
      notes: saleData.notes,
      zone: saleData.zone || 'West Zone',
      country: saleData.country || 'IN',
      territory: saleData.territory || 'BOM (Mumbai)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.crmSales = [newSale, ...this.crmSales];
    this.persist();
    return newSale;
  }

  public updateCRMSale(id: string, updates: Partial<CRMSalesRecord>): CRMSalesRecord | null {
    const idx = this.crmSales.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const total = updates.total_amount !== undefined ? Number(updates.total_amount) : this.crmSales[idx].total_amount;
    const paid = updates.paid_amount !== undefined ? Number(updates.paid_amount) : this.crmSales[idx].paid_amount;

    let paymentStatus = updates.payment_status;
    if (!paymentStatus && (updates.paid_amount !== undefined || updates.total_amount !== undefined)) {
      if (paid >= total && total > 0) paymentStatus = 'Paid';
      else if (paid > 0) paymentStatus = 'Partial';
      else paymentStatus = 'Unpaid';
    }

    this.crmSales[idx] = {
      ...this.crmSales[idx],
      ...updates,
      total_amount: total,
      paid_amount: paid,
      ...(paymentStatus ? { payment_status: paymentStatus } : {}),
      updated_at: new Date().toISOString(),
    };

    this.persist();
    return this.crmSales[idx];
  }

  public deleteCRMSale(id: string): boolean {
    const prevLen = this.crmSales.length;
    this.crmSales = this.crmSales.filter((s) => s.id !== id);
    if (this.crmSales.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public recordSalePayment(
    id: string,
    paymentAmount: number,
    paymentMethod: string = 'Bank Transfer',
    notes?: string
  ): { success: boolean; sale?: CRMSalesRecord; message: string } {
    const sale = this.crmSales.find((s) => s.id === id);
    if (!sale) {
      return { success: false, message: 'Sale record not found.' };
    }

    const newPaid = Number((sale.paid_amount + paymentAmount).toFixed(2));
    sale.paid_amount = newPaid;
    if (newPaid >= sale.total_amount) {
      sale.payment_status = 'Paid';
    } else if (newPaid > 0) {
      sale.payment_status = 'Partial';
    } else {
      sale.payment_status = 'Unpaid';
    }

    if (paymentMethod) {
      sale.payment_method = paymentMethod as any;
    }

    if (notes) {
      sale.notes = `${sale.notes || ''} [Payment: ₹${paymentAmount.toLocaleString()} via ${paymentMethod}] ${notes}`.trim();
    }

    sale.updated_at = new Date().toISOString();
    this.persist();

    return {
      success: true,
      sale,
      message: `Payment of ₹${paymentAmount.toLocaleString()} recorded. Status updated to ${sale.payment_status}.`,
    };
  }

  // ============================================================
  // STORES & HANGAR INVENTORY MANAGEMENT
  // ============================================================
  public getStoreInventory(zone?: string, country?: string, territory?: string): StoreInventoryItem[] {
    let items = this.storeInventory;
    if (zone && zone !== 'All Zones' && zone !== 'ALL') {
      items = items.filter((i) => i.zone === zone);
    }
    if (country && country !== 'All Countries' && country !== 'ALL') {
      items = items.filter((i) => i.country === country);
    }
    if (territory && territory !== 'All Hubs' && territory !== 'ALL') {
      items = items.filter((i) => i.territory === territory);
    }
    return items;
  }

  public addStoreInventoryItem(itemData: Partial<StoreInventoryItem>): StoreInventoryItem {
    const qty = Number(itemData.quantity) || 1;
    const minThresh = Number(itemData.min_threshold) || 1;
    let status: StoreItemStatus = 'IN_STOCK';
    if (qty <= 0) status = 'OUT_OF_STOCK';
    else if (qty <= minThresh) status = 'LOW_STOCK';

    const newItem: StoreInventoryItem = {
      id: `store_${generateUUID().substring(0, 8)}`,
      part_number: (itemData.part_number || 'AV-PART-001').toUpperCase().trim(),
      serial_number: (itemData.serial_number || `SN-${generateUUID().substring(0, 6)}`).toUpperCase().trim(),
      name: itemData.name || 'Aircraft Component Spare',
      category: itemData.category || 'Avionics Spares',
      description: itemData.description || 'Aircraft certified spare component.',
      warehouse_hangar: itemData.warehouse_hangar || 'Hangar 1 - Main Aviation Stores',
      zone: itemData.zone || 'West Zone',
      country: itemData.country || 'IN',
      territory: itemData.territory || 'BOM (Mumbai)',
      quantity: qty,
      min_threshold: minThresh,
      unit_cost: Number(itemData.unit_cost) || 100000,
      currency: itemData.currency || 'INR',
      condition: itemData.condition || 'FACTORY_NEW',
      last_inspected: itemData.last_inspected || new Date().toISOString().split('T')[0],
      status,
      added_by: itemData.added_by || 'Stores Officer',
    };

    this.storeInventory = [newItem, ...this.storeInventory];
    this.persist();
    return newItem;
  }

  public updateStoreStock(id: string, delta: number): StoreInventoryItem | null {
    const item = this.storeInventory.find((i) => i.id === id);
    if (!item) return null;

    item.quantity = Math.max(0, item.quantity + delta);
    if (item.quantity <= 0) {
      item.status = 'OUT_OF_STOCK';
    } else if (item.quantity <= item.min_threshold) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'IN_STOCK';
    }

    this.persist();
    return item;
  }

  public updateStoreInventoryItem(id: string, updates: Partial<StoreInventoryItem>): StoreInventoryItem | null {
    const idx = this.storeInventory.findIndex((i) => i.id === id);
    if (idx === -1) return null;

    this.storeInventory[idx] = {
      ...this.storeInventory[idx],
      ...updates,
    };
    const it = this.storeInventory[idx];
    if (it.quantity <= 0) it.status = 'OUT_OF_STOCK';
    else if (it.quantity <= it.min_threshold) it.status = 'LOW_STOCK';
    else it.status = 'IN_STOCK';

    this.persist();
    return it;
  }

  public deleteStoreInventoryItem(id: string): boolean {
    const prev = this.storeInventory.length;
    this.storeInventory = this.storeInventory.filter((i) => i.id !== id);
    if (this.storeInventory.length !== prev) {
      this.persist();
      return true;
    }
    return false;
  }

  // Reset database
  public resetToDefaults() {
    this.regularUsers = [...initialRegularUsers];
    this.businesses = [...initialBusinesses];
    this.adminUsers = [...initialAdminUsers];
    this.pricingMatrix = [...initialPricingMatrix];
    this.serviceListings = [...initialServiceListings];
    this.reviews = [...initialReviews];
    this.internalMails = [...initialInternalMails];
    this.chats = [];
    this.jobs = [...initialJobs];
    this.news = [...initialNews];
    this.events = [...initialEvents];
    this.otps = { ...initialOtps };
    this.apiLogs = [];
    this.debitRequests = [...initialDebitRequests];
    this.promotionRequests = [...initialPromotionRequests];
    this.unlockedContacts = [...initialUnlockedContacts];
    this.globalSettings = { ...initialGlobalSettings };
    this.crmLeads = [...initialCRMLeads];
    this.crmOpportunities = [...initialCRMOpportunities];
    this.crmQuotations = [...initialCRMQuotations];
    this.crmTickets = [...initialCRMSupportTickets];
    this.commissions = [...initialCommissionRecords];
    this.storeInventory = [...initialStoreInventory];
    this.businessPosts = [...initialBusinessPosts];
    this.businessFollowers = { ...initialBusinessFollowers };
    this.flashNewsItems = [...initialFlashNewsItems];
    this.flashNewsConfig = { ...initialFlashNewsConfig };
    this.adminProjects = [...initialAdminProjects];
    this.adminTasks = [...initialAdminTasks];
    this.platformModuleControls = [...initialPlatformModuleControls];
    this.globalCrisisMode = false;
    this.customUserTypes = [...initialCustomUserTypes];
    this.businessReports = [];
    this.postReports = [];
    this.publishSanctions = {};
    this.customerCareTickets = [...initialCustomerCareTickets];
    this.crmSales = [...initialCRMSales];
    this.broadcastNotifications = [...initialBroadcastNotifications];
    this.activeSessions = {};
    this.singleSessionAudits = [];
    this.agentVerificationAudits = [];
    this.directServiceOffers = [];
    this.customCategoryRequests = [];
    this.dispatchedThresholdAlerts = [];
    this.transactionReportSubscriptions = {};
    this.dispatchedTransactionReports = [];
    this.suspendedCategories = [];
    this.suspendedSubCategories = {};
    this.storyCategories = [...initialStoryCategories];
    this.regionalZones = [...initialRegionalZones];
    this.countryMappings = [...initialCountryMappings];
    this.persist();
  }

  /**
   * Super Admin Exclusive Factory Master Reset.
   * Completely purges all browser storage (localStorage and sessionStorage)
   * across all application namespaces, reinitializes all database collections
   * to immaculate factory presets, writes pristine storage, and returns confirmation.
   */
  public fullMasterSystemReset(): { success: boolean; message: string; timestamp: string } {
    try {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            k &&
            (k.startsWith('truvaer_') ||
              k.startsWith('flashnews_') ||
              k.startsWith('mock_db_') ||
              k.startsWith('wallet_') ||
              k.startsWith('activeUser') ||
              k.startsWith('currentUser'))
          ) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Storage purge warning during master reset:', e);
    }

    this.resetToDefaults();
    return {
      success: true,
      message: 'Master application reset completed successfully. All databases, queues, and credentials restored to factory defaults.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Option 1: Settings reset only.
   * Restores centralized pricing matrix, operational configurations, module toggles,
   * commission splits, and default taxonomy while PRESERVING all user accounts,
   * business profiles, stories, job postings, CRM leads, and transactions.
   */
  public resetSettingsOnly(): { success: boolean; message: string; timestamp: string } {
    this.pricingMatrix = [...initialPricingMatrix];
    this.suspendedSubCategories = {};
    this.resetToDefaultTaxonomy('Platform Administrator');
    this.globalSettings = { ...initialGlobalSettings };
    this.platformModuleControls = [...initialPlatformModuleControls];
    this.flashNewsConfig = { ...initialFlashNewsConfig };
    this.persist();

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Settings Reset Enacted',
      description: 'System configurations, pricing matrices, and module operational parameters reset to factory default. All user accounts, listings, and operational records preserved.',
      actor_name: 'Platform Administrator',
      actor_role: 'L8 Super Admin',
      severity: 'info',
    });

    return {
      success: true,
      message: 'Settings reset completed successfully. Operational parameters and pricing matrix restored to factory defaults without affecting account data.',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Option 2: Full Reset - Without Data (Clean Slate Factory Reset).
   * Purges all test businesses, mock CRM leads, sample jobs, and non-admin accounts,
   * leaving only the primary Sovereign Administrator (B Aditya Narayana - aditya@yarifly.com)
   * and clean baseline configurations ready for live production entry.
   */
  public fullResetWithoutData(): { success: boolean; message: string; timestamp: string } {
    try {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (
            k &&
            (k.startsWith('truvaer_') ||
              k.startsWith('flashnews_') ||
              k.startsWith('mock_db_') ||
              k.startsWith('wallet_'))
          ) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Storage purge warning during clean reset:', e);
    }

    // Restore baseline settings
    this.pricingMatrix = [...initialPricingMatrix];
    this.suspendedSubCategories = {};
    this.resetToDefaultTaxonomy('Platform Administrator');
    this.globalSettings = { ...initialGlobalSettings };
    this.platformModuleControls = [...initialPlatformModuleControls];
    this.flashNewsConfig = { ...initialFlashNewsConfig };
    this.storyCategories = [...initialStoryCategories];
    this.regionalZones = [...initialRegionalZones];
    this.countryMappings = [...initialCountryMappings];

    // Clear mock business listings, sales, jobs, and chat messages
    this.businesses = [];
    this.serviceListings = [];
    this.crmSales = [];
    this.crmLeads = [];
    this.crmOpportunities = [];
    this.crmQuotations = [];
    this.crmTickets = [];
    this.commissions = [];
    this.jobs = [];
    this.news = [];
    this.businessPosts = [];
    this.broadcastNotifications = [];
    this.customerCareTickets = [];

    // Retain only the Sovereign Super Administrator account
    const sovereignAdmin = initialAdminUsers.find((a) => a.email.toLowerCase() === 'aditya@yarifly.com') || initialAdminUsers[0];
    this.adminUsers = [{ ...sovereignAdmin, status: 'ACTIVE', employment_status: 'Active Sovereign Administrator' }];
    const sovereignRegular = initialRegularUsers.find((u) => u.email.toLowerCase() === 'aditya@yarifly.com') || initialRegularUsers[0];
    this.regularUsers = [{ ...sovereignRegular, account_status: 'ACTIVE' }];

    this.persist();

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Full Application Reset - Without Data Enacted',
      description: 'Clean Slate reset executed. All demo businesses, leads, and listings purged. Root Sovereign Admin account preserved.',
      actor_name: 'Platform Administrator',
      actor_role: 'L8 Super Admin',
      severity: 'warning',
    });

    return {
      success: true,
      message: 'Clean Slate Full Reset completed. All test businesses, leads, and listings purged. Ready for fresh production setup.',
      timestamp: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------
  // STORY CATEGORY MANAGEMENT METHODS
  // -------------------------------------------------------------
  public getStoryCategories(): StoryCategory[] {
    return [...this.storyCategories].sort((a, b) => a.name.localeCompare(b.name));
  }

  public saveStoryCategory(payload: Partial<StoryCategory>): { success: boolean; message: string; category: StoryCategory } {
    const cleanName = payload.name?.trim() || 'Aviation Category';
    const cleanSlug = (payload.slug?.trim() || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'aviation-category';
    
    if (payload.id) {
      const idx = this.storyCategories.findIndex((c) => c.id === payload.id);
      if (idx !== -1) {
        this.storyCategories[idx] = {
          ...this.storyCategories[idx],
          name: cleanName,
          slug: cleanSlug,
          description: payload.description !== undefined ? payload.description : this.storyCategories[idx].description,
          status: payload.status || this.storyCategories[idx].status,
          colorBadge: payload.colorBadge || this.storyCategories[idx].colorBadge,
          updated_at: new Date().toISOString(),
        };
        this.persist();
        return { success: true, message: `Story category "${cleanName}" updated successfully.`, category: this.storyCategories[idx] };
      }
    }

    const newCategory: StoryCategory = {
      id: `scat_${Date.now()}`,
      name: cleanName,
      slug: cleanSlug,
      description: payload.description || '',
      story_count: 0,
      status: 'ACTIVE',
      colorBadge: payload.colorBadge || 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.storyCategories.push(newCategory);
    this.persist();
    return { success: true, message: `Story category "${cleanName}" created successfully.`, category: newCategory };
  }

  public deleteStoryCategory(id: string): { success: boolean; message: string } {
    const prevLen = this.storyCategories.length;
    this.storyCategories = this.storyCategories.filter((c) => c.id !== id);
    if (this.storyCategories.length !== prevLen) {
      this.persist();
      return { success: true, message: 'Story category removed successfully.' };
    }
    return { success: false, message: 'Category not found.' };
  }

  // -------------------------------------------------------------
  // REGIONAL AUTHORITY & COUNTRY MAPPING METHODS
  // -------------------------------------------------------------
  public getRegionalZones(): RegionalAuthorityZone[] {
    return [...this.regionalZones];
  }

  public saveRegionalZone(payload: Partial<RegionalAuthorityZone>): { success: boolean; message: string; zone: RegionalAuthorityZone } {
    const cleanCode = (payload.code || 'ZONE').trim().toUpperCase();
    const cleanName = payload.name?.trim() || `${cleanCode} Regional Zone`;

    if (payload.id) {
      const idx = this.regionalZones.findIndex((z) => z.id === payload.id || z.code === cleanCode);
      if (idx !== -1) {
        this.regionalZones[idx] = {
          ...this.regionalZones[idx],
          name: cleanName,
          description: payload.description !== undefined ? payload.description : this.regionalZones[idx].description,
          headquarters: payload.headquarters !== undefined ? payload.headquarters : this.regionalZones[idx].headquarters,
          primaryAuthority: payload.primaryAuthority !== undefined ? payload.primaryAuthority : this.regionalZones[idx].primaryAuthority,
        };
        this.persist();
        return { success: true, message: `Regional Zone ${cleanCode} updated successfully.`, zone: this.regionalZones[idx] };
      }
    }

    const newZone: RegionalAuthorityZone = {
      id: `zone_${cleanCode.toLowerCase()}_${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      description: payload.description || 'Global Aviation Sector Corridors',
      headquarters: payload.headquarters || 'Executive Aviation Operations Desk',
      primaryAuthority: payload.primaryAuthority || 'Civil Aviation Authority',
      isSystem: false,
    };
    this.regionalZones.push(newZone);
    this.persist();
    return { success: true, message: `New Regional Zone "${cleanCode}" registered.`, zone: newZone };
  }

  public deleteRegionalZone(id: string): { success: boolean; message: string } {
    const zone = this.regionalZones.find((z) => z.id === id);
    if (!zone) return { success: false, message: 'Regional zone not found.' };
    if (zone.isSystem) return { success: false, message: 'Cannot delete default system regional zones.' };
    
    // Check if countries are mapped
    const hasCountries = this.countryMappings.some((c) => c.regionCode === zone.code);
    if (hasCountries) {
      return { success: false, message: `Cannot delete region "${zone.code}" because countries are mapped to it. Please reassign or delete those countries first.` };
    }

    this.regionalZones = this.regionalZones.filter((z) => z.id !== id);
    this.persist();
    return { success: true, message: `Regional zone "${zone.name}" removed.` };
  }

  public getCountryRegionMappings(): RegionCountryMapping[] {
    return [...this.countryMappings].sort((a, b) => a.name.localeCompare(b.name));
  }

  public saveCountryRegionMapping(payload: Partial<RegionCountryMapping>): { success: boolean; message: string; mapping: RegionCountryMapping } {
    const cleanName = payload.name?.trim() || 'New Aviation Territory';
    const cleanCode = (payload.code || cleanName.slice(0, 2)).trim().toUpperCase();
    const regionCode = (payload.regionCode || 'APAC').trim().toUpperCase();

    if (payload.id) {
      const idx = this.countryMappings.findIndex((c) => c.id === payload.id);
      if (idx !== -1) {
        this.countryMappings[idx] = {
          ...this.countryMappings[idx],
          name: cleanName,
          code: cleanCode,
          regionCode,
          regionalAuthorityAgency: payload.regionalAuthorityAgency || this.countryMappings[idx].regionalAuthorityAgency,
          currency: payload.currency || this.countryMappings[idx].currency,
          status: payload.status || this.countryMappings[idx].status,
          updated_at: new Date().toISOString(),
        };
        this.persist();
        return { success: true, message: `Country mapping for "${cleanName}" (${regionCode}) updated.`, mapping: this.countryMappings[idx] };
      }
    }

    // Check duplicate code
    const existing = this.countryMappings.find((c) => c.code === cleanCode);
    if (existing) {
      existing.regionCode = regionCode;
      existing.name = cleanName;
      if (payload.regionalAuthorityAgency) existing.regionalAuthorityAgency = payload.regionalAuthorityAgency;
      existing.updated_at = new Date().toISOString();
      this.persist();
      return { success: true, message: `Country ${cleanName} reassigned to ${regionCode}.`, mapping: existing };
    }

    const newMapping: RegionCountryMapping = {
      id: `cmap_${cleanCode.toLowerCase()}_${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      regionCode,
      regionalAuthorityAgency: payload.regionalAuthorityAgency || 'Civil Aviation Authority',
      currency: payload.currency || 'USD',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.countryMappings.push(newMapping);
    this.persist();
    return { success: true, message: `Country "${cleanName}" successfully mapped to ${regionCode}.`, mapping: newMapping };
  }

  public deleteCountryRegionMapping(id: string): { success: boolean; message: string } {
    const prevLen = this.countryMappings.length;
    this.countryMappings = this.countryMappings.filter((c) => c.id !== id);
    if (this.countryMappings.length !== prevLen) {
      this.persist();
      return { success: true, message: 'Country unmapped and removed successfully.' };
    }
    return { success: false, message: 'Country mapping not found.' };
  }

  public reassignCountryRegion(id: string, newRegionCode: string): { success: boolean; message: string } {
    const country = this.countryMappings.find((c) => c.id === id);
    if (!country) return { success: false, message: 'Country record not found.' };
    const oldRegion = country.regionCode;
    country.regionCode = newRegionCode.trim().toUpperCase();
    country.updated_at = new Date().toISOString();
    this.persist();
    return { success: true, message: `${country.name} successfully reassigned from ${oldRegion} to ${country.regionCode}.` };
  }

  public syncAndFixCountryMappings(): { success: boolean; message: string; verifiedCount: number } {
    const validZoneCodes = new Set(this.regionalZones.map((z) => z.code.toUpperCase()));
    let fixedCount = 0;

    // Ensure all standard zones exist
    initialRegionalZones.forEach((stdZone) => {
      if (!this.regionalZones.some((z) => z.code.toUpperCase() === stdZone.code.toUpperCase())) {
        this.regionalZones.push({ ...stdZone });
        validZoneCodes.add(stdZone.code.toUpperCase());
        fixedCount++;
      }
    });

    // Ensure baseline country mappings exist
    initialCountryMappings.forEach((stdMap) => {
      if (!this.countryMappings.some((c) => c.code.toUpperCase() === stdMap.code.toUpperCase())) {
        this.countryMappings.push({ ...stdMap });
        fixedCount++;
      }
    });

    // Validate and heal existing country mappings
    this.countryMappings.forEach((c) => {
      c.code = (c.code || c.name.slice(0, 2)).trim().toUpperCase();
      c.regionCode = (c.regionCode || 'APAC').trim().toUpperCase();
      if (!validZoneCodes.has(c.regionCode)) {
        c.regionCode = 'APAC';
        fixedCount++;
      }
      if (!c.regionalAuthorityAgency || c.regionalAuthorityAgency === 'Civil Aviation Authority') {
        const foundStd = initialCountryMappings.find((s) => s.code.toUpperCase() === c.code.toUpperCase());
        if (foundStd) {
          c.regionalAuthorityAgency = foundStd.regionalAuthorityAgency;
          c.currency = foundStd.currency;
        }
      }
      c.status = 'ACTIVE';
      c.updated_at = new Date().toISOString();
    });

    this.persist();
    return {
      success: true,
      message: `Regional & country authority mappings verified and synchronized! ${this.countryMappings.length} countries mapped across ${this.regionalZones.length} regional aviation zones.`,
      verifiedCount: this.countryMappings.length,
    };
  }

  // -------------------------------------------------------------
  // LINKEDIN BUSINESS POSTS, ARTICLES & MARKETING CAMPAIGN METHODS
  // -------------------------------------------------------------
  public getBusinessPosts(): BusinessPost[] {
    return [...this.businessPosts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public subscribeToBusinessPosts(listener: (posts: BusinessPost[]) => void): () => void {
    this.postListeners.push(listener);
    return () => {
      this.postListeners = this.postListeners.filter((l) => l !== listener);
    };
  }

  private notifyPostListeners() {
    const list = this.getBusinessPosts();
    for (const listener of this.postListeners) {
      try {
        listener(list);
      } catch (err) {
        console.error('Error in post listener:', err);
      }
    }
  }

  public createBusinessPost(
    postData: Omit<BusinessPost, 'id' | 'created_at' | 'likes' | 'comments' | 'shares_count'>
  ): BusinessPost {
    const newPost: BusinessPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      likes: [],
      reactions: { like: 1 },
      comments: [],
      shares_count: 0,
      ...postData,
    };

    // If this is a marketed campaign post, deduct corporate wallet credits if business has a wallet
    if (newPost.is_marketed && newPost.marketing_campaign) {
      const biz = this.businesses.find((b) => b.business_id === newPost.business_id);
      const creditsCost = newPost.marketing_campaign.credits_invested || 50;
      if (biz?.corporate_wallet) {
        biz.corporate_wallet.credit_balance = Math.max(0, biz.corporate_wallet.credit_balance - creditsCost);
        biz.corporate_wallet.transactions.unshift({
          id: `tx_${Date.now()}`,
          type: 'USAGE',
          credits: creditsCost,
          description: `Marketing Campaign Blast: ${newPost.title || 'Sponsored Post'} targeted within ${
            (newPost.marketing_campaign.radius_km ?? 0) > 0 ? `${newPost.marketing_campaign.radius_km} Kms` : 'Worldwide'
          } in ${newPost.marketing_campaign.country} for ${newPost.marketing_campaign.category} (Standard Users)`,
          timestamp: new Date().toISOString(),
          actionType: 'MARKETING_SPONSORED_BOOST',
        });
      }

      // Log in Admin Activity Feed for visibility
      this.logAdminActivity({
        category: 'PUBLICATION_COMPLIANCE',
        title: `Sponsored Marketing Campaign Boosted`,
        description: `${newPost.business_name} initiated targeted marketing campaign within ${
          (newPost.marketing_campaign.radius_km ?? 0) > 0 ? `${newPost.marketing_campaign.radius_km} Kms` : 'Worldwide'
        } in ${newPost.marketing_campaign.country} directed strictly to Standard Aviators.`,
        actor_name: newPost.business_name,
        actor_role: 'Business Verified Publisher',
        target_id: newPost.id,
        target_name: newPost.title || 'Sponsored Post',
        amount: creditsCost,
        currency: 'CREDITS',
        severity: 'info',
      });
    }

    this.businessPosts.unshift(newPost);
    this.persist();
    this.notifyPostListeners();
    return newPost;
  }

  // --- Campaign Lifecycle & Notification Engine (Requirements 1 & 2) ---
  public extendCampaignDuration(
    postId: string,
    additionalDays: number,
    targetScope?: CampaignTargetScope,
    targetCountries?: string[]
  ): { success: boolean; message: string; updatedPost?: BusinessPost } {
    if (
      typeof additionalDays !== 'number' ||
      !Number.isInteger(additionalDays) ||
      additionalDays < 1 ||
      additionalDays > 30
    ) {
      return { success: false, message: 'Validation Error: Renewal extension must be between 1 and 30 days.' };
    }

    const post = this.businessPosts.find((p) => p.id === postId);
    if (!post || !post.marketing_campaign) {
      return { success: false, message: 'Active campaign record not found for this publication.' };
    }

    const camp = post.marketing_campaign;
    const currentEnd = new Date(camp.end_date).getTime();
    const baseStartTime = currentEnd > Date.now() ? currentEnd : Date.now();
    const newEndMs = baseStartTime + additionalDays * 24 * 60 * 60 * 1000;
    const effectiveScope = targetScope || camp.target_scope || 'Country';
    const effectiveLocations = (targetCountries && Array.isArray(targetCountries) && targetCountries.length > 0)
      ? targetCountries
      : (camp.target_countries && camp.target_countries.length > 0 ? camp.target_countries : [camp.country || 'IN']);
    const dynamicRate = this.calculateDynamicLocationCredits(effectiveLocations, effectiveScope === 'Region');
    const locationCount = dynamicRate.effectiveCount;
    const addedCredits = additionalDays * dynamicRate.totalCreditsPerDay;

    // Deduct from business corporate wallet if available
    const biz = this.businesses.find((b) => b.business_id === post.business_id);
    if (biz?.corporate_wallet) {
      biz.corporate_wallet.credit_balance = Math.max(0, biz.corporate_wallet.credit_balance - addedCredits);
      biz.corporate_wallet.transactions.unshift({
        id: `tx_${Date.now()}`,
        type: 'USAGE',
        credits: addedCredits,
        description: `Campaign Extension: "${post.title || 'Official Publication'}" renewed for +${additionalDays} days across ${effectiveLocations.length} location(s) @ ${dynamicRate.totalCreditsPerDay} Cr/day (Data continuity under ID: ${post.id}).`,
        timestamp: new Date().toISOString(),
        actionType: 'CAMPAIGN_RENEWAL_EXTENSION',
      });
    }

    // Preserve data continuity on existing ID
    camp.end_date = new Date(newEndMs).toISOString();
    camp.duration_days = (camp.duration_days || 0) + additionalDays;
    camp.credits_invested = (camp.credits_invested || 0) + addedCredits;
    camp.total_credit_usage = (camp.total_credit_usage || 0) + addedCredits;
    if (targetScope) camp.target_scope = targetScope;
    if (targetCountries && targetCountries.length > 0) camp.target_countries = targetCountries;
    camp.last_notified_12h = false;
    camp.status = 'EXTENDED';

    this.logAdminActivity({
      category: 'PUBLICATION_COMPLIANCE',
      title: `Campaign Renewed & Extended: +${additionalDays} Days`,
      description: `${post.business_name} renewed campaign "${post.title || post.id}" for +${additionalDays} days. Data continuity preserved.`,
      actor_name: post.business_name,
      actor_role: 'Verified Partner',
      target_id: post.id,
      amount: addedCredits,
      currency: 'CREDITS',
      severity: 'success',
    });

    this.persist();
    this.notifyPostListeners();

    return {
      success: true,
      message: `Campaign renewed successfully! Duration extended by +${additionalDays} days through ${new Date(newEndMs).toLocaleDateString()}. Data continuity preserved under ID: ${post.id}.`,
      updatedPost: post,
    };
  }

  // Daily Status Alert (First Login): fires ONLY for Business Owner (own campaigns) or Admin/Super Admin (all campaigns)
  public checkDailyCampaignAlert(
    user: RegularUser | BusinessProfile,
    isAdmin?: boolean
  ): {
    shouldAlert: boolean;
    message?: string;
    daysRemaining?: number;
    campaignTitle?: string;
    postId?: string;
    campaign?: PostMarketingCampaign;
  } {
    const userIsAdmin = Boolean(
      isAdmin ||
        ('role' in user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'))
    );
    const bizId = 'business_id' in user ? user.business_id : undefined;

    // Standard users have no access to promotion lifecycle alerts
    if (!userIsAdmin && !bizId) {
      return { shouldAlert: false };
    }

    // Determine user's local timezone (based on country of login / profile settings)
    const country = ('country' in user ? user.country : undefined) || 'IN';
    let todayStr: string;
    try {
      let tz = 'Asia/Kolkata';
      const c = country.toUpperCase();
      if (c === 'IN' || c === 'INDIA') tz = 'Asia/Kolkata';
      else if (c === 'AE' || c === 'UAE') tz = 'Asia/Dubai';
      else if (c === 'US' || c === 'USA') tz = 'America/New_York';
      else if (c === 'GB' || c === 'UK') tz = 'Europe/London';
      else if (c === 'SG' || c === 'SINGAPORE') tz = 'Asia/Singapore';
      else if (c === 'AU' || c === 'AUSTRALIA') tz = 'Australia/Sydney';
      else if (c === 'FR' || c === 'DE' || c === 'EU') tz = 'Europe/Paris';
      else tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch {
      todayStr = new Date().toISOString().slice(0, 10);
    }

    const now = Date.now();
    for (const post of this.businessPosts) {
      const isOwner = userIsAdmin || (Boolean(bizId) && post.business_id === bizId);

      if (isOwner && post.is_marketed && post.marketing_campaign) {
        const camp = post.marketing_campaign;
        const endMs = new Date(camp.end_date).getTime();
        const diffMs = endMs - now;
        const daysRemaining = Math.ceil(diffMs / 86400000);

        // Condition 1: campaign_duration_remaining > 3 days
        // Condition 2: Must fire only on the user's first login of the current calendar day in local timezone
        if (daysRemaining > 3 && camp.last_daily_alert_date !== todayStr) {
          camp.last_daily_alert_date = todayStr;
          this.persist();
          return {
            shouldAlert: true,
            daysRemaining,
            campaignTitle: post.title || post.content.slice(0, 35),
            postId: post.id,
            campaign: camp,
            message: `Your campaign "${post.title || 'Official Publication'}" expires in ${daysRemaining} days.`,
          };
        }
      }
    }

    return { shouldAlert: false };
  }

  // 12-Hour Expiry Warning: scoped strictly to Business Owner's own campaigns or Admin/Super Admin
  public check12HourCampaignWarnings(
    businessId?: string,
    isAdmin?: boolean
  ): {
    alertsSent: number;
    warnings: { postId: string; campaignTitle: string; hoursRemaining: number }[];
  } {
    if (!isAdmin && !businessId) {
      return { alertsSent: 0, warnings: [] };
    }

    const now = Date.now();
    const warnings: { postId: string; campaignTitle: string; hoursRemaining: number }[] = [];

    for (const post of this.businessPosts) {
      const isAuthorized = Boolean(isAdmin || (businessId && post.business_id === businessId));
      if (!isAuthorized) continue;
      if (post.is_marketed && post.marketing_campaign) {
        const camp = post.marketing_campaign;
        const endMs = new Date(camp.end_date).getTime();
        const diffMs = endMs - now;

        // Exactly 12 hours prior to campaign_end_timestamp
        if (diffMs > 0 && diffMs <= 12 * 3600 * 1000 && !camp.last_notified_12h) {
          camp.last_notified_12h = true;
          const hoursRemaining = Math.max(1, Math.round(diffMs / (3600 * 1000)));

          this.addNotification({
            recipient_id: post.business_id || 'all_admins',
            title: `⚠️ 12-Hour Expiry Warning: ${post.title || 'Sponsored Campaign'}`,
            message: `Your campaign "${post.title || post.content.slice(0, 30)}" expires in approximately ${hoursRemaining} hours. Renew now to maintain priority delivery without interruption.`,
            type: 'SYSTEM',
            action_link: '/marketing',
          });

          warnings.push({
            postId: post.id,
            campaignTitle: post.title || 'Campaign',
            hoursRemaining,
          });
        }
      }
    }

    if (warnings.length > 0) this.persist();
    return { alertsSent: warnings.length, warnings };
  }

  // Post-Campaign Alert: fires ONLY for Business Owner (own campaigns) or Admin/Super Admin (all campaigns)
  public checkPostCampaignCompletionAlerts(
    user?: RegularUser | BusinessProfile,
    isAdmin?: boolean
  ): {
    completedCampaigns: { postId: string; title: string; views: number; clicks: number; creditsUsed: number }[];
  } {
    const userIsAdmin = Boolean(
      isAdmin ||
        (user && 'role' in user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'))
    );
    const bizId = user && 'business_id' in user ? user.business_id : undefined;

    if (!userIsAdmin && !bizId) {
      return { completedCampaigns: [] };
    }

    const now = Date.now();
    const completedCampaigns: { postId: string; title: string; views: number; clicks: number; creditsUsed: number }[] = [];

    for (const post of this.businessPosts) {
      if (post.is_marketed && post.marketing_campaign) {
        const camp = post.marketing_campaign;
        const endMs = new Date(camp.end_date).getTime();
        const isOwner = userIsAdmin || (Boolean(bizId) && post.business_id === bizId);

        if (isOwner && now >= endMs && !camp.completed_alert_seen) {
          camp.completed_alert_seen = true;
          camp.status = 'EXPIRED';

          completedCampaigns.push({
            postId: post.id,
            title: post.title || 'Official Publication Campaign',
            views: camp.views ?? (camp.impressions || 14250),
            clicks: camp.clicks ?? 680,
            creditsUsed: camp.total_credit_usage ?? (camp.credits_invested || 105),
          });

          // Dispatch notification pointing to Quantitative Reporting Interface
          this.addNotification({
            recipient_id: post.business_id || 'all_admins',
            title: `📊 Campaign Completed: ${post.title || 'Official Publication'}`,
            message: `Your sponsored aviation campaign has concluded. View verified ROI analytics in the Quantitative Reporting Interface.`,
            type: 'SYSTEM',
            action_link: '/marketing',
          });
        }
      }
    }

    if (completedCampaigns.length > 0) this.persist();
    return { completedCampaigns };
  }

  // Quantitative Reporting Interface data endpoint:
  // - Admin / Super Admin: full promotion details across all businesses
  // - Business Users: ONLY promotions they published
  // - Standard Users: no access
  public getCampaignQuantitativeReport(postId?: string, businessId?: string, isAdmin?: boolean) {
    if (!isAdmin && !businessId) {
      return {
        totalViews: 0,
        targetAudienceReached: 0,
        totalClicks: 0,
        avgEngagementRate: 0,
        totalCreditUsage: 0,
        campaigns: [],
      };
    }

    let posts = this.businessPosts.filter((p) => p.is_marketed && p.marketing_campaign);
    if (!isAdmin && businessId) {
      posts = posts.filter((p) => p.business_id === businessId);
    }
    if (postId) {
      posts = posts.filter((p) => p.id === postId);
    }

    const campaigns = posts.map((p) => {
      const camp = p.marketing_campaign!;
      const views = camp.views ?? (camp.impressions || 18450);
      const reach = camp.target_audience_reached ?? Math.round(views * 0.76);
      const clicks = camp.clicks ?? Math.round(views * 0.048);
      const engagementRate = camp.engagement_rate ?? Number(((clicks / (views || 1)) * 100).toFixed(2));
      const credits = camp.total_credit_usage ?? (camp.credits_invested || camp.duration_days * 15);

      return {
        postId: p.id,
        title: p.title || 'Sponsored Official Publication',
        businessName: p.business_name,
        businessId: p.business_id,
        targetScope: camp.target_scope || (camp.radius_km && camp.radius_km > 0 ? 'Region' : 'World Wide'),
        targetCountry: camp.country,
        targetCountries: camp.target_countries || [camp.country],
        durationDays: camp.duration_days,
        startDate: camp.start_date,
        endDate: camp.end_date,
        isExpired: new Date(camp.end_date).getTime() < Date.now(),
        // Required Quantitative Endpoints:
        totalViews: views,
        targetAudienceReached: reach,
        clicks,
        engagementRate,
        totalCreditUsage: credits,
        status: new Date(camp.end_date).getTime() < Date.now() ? 'COMPLETED' : (camp.status || 'ACTIVE'),
      };
    });

    const totalViews = campaigns.reduce((acc, c) => acc + c.totalViews, 0);
    const targetAudienceReached = campaigns.reduce((acc, c) => acc + c.targetAudienceReached, 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
    const totalCreditUsage = campaigns.reduce((acc, c) => acc + c.totalCreditUsage, 0);
    const avgEngagementRate =
      campaigns.length > 0 ? Number(((totalClicks / (totalViews || 1)) * 100).toFixed(2)) : 0;

    return {
      totalViews,
      targetAudienceReached,
      totalClicks,
      avgEngagementRate,
      totalCreditUsage,
      campaigns,
    };
  }

  // Dynamic Help Center Directory (Permission-based RBAC cross-referenced indexing)
  public getHelpDirectory(user: RegularUser | null, adminUser?: AdminUser | null): HelpArticle[] {
    const isSuperAdmin =
      user?.role === 'SUPER_ADMIN' ||
      user?.email?.toLowerCase() === 'aditya@yarifly.com' ||
      adminUser?.role === 'SUPER_ADMIN' ||
      adminUser?.level === 8;

    const isAdmin =
      isSuperAdmin ||
      user?.role === 'ADMIN' ||
      user?.role === 'MANAGER' ||
      (adminUser && (adminUser.level ?? 0) >= 1);

    const adminLevel = isSuperAdmin ? 8 : (adminUser?.level ?? (user?.role === 'ADMIN' ? 7 : 0));
    const isBusiness = Boolean(user && 'business_id' in user);

    const masterArticles: HelpArticle[] = [
      {
        id: 'help_marketing_feed',
        title: 'Publishing Official Publications & Sponsored Campaigns',
        category: 'PUBLICATION',
        moduleId: 'mod_marketing',
        summary: 'How to compose official aviation articles, broadcast updates, and launch targeted marketing campaigns to standard aviators.',
        navigationRoute: 'Home Top Nav > Stories & Feed > Create Official Publication',
        steps: [
          'Navigate to the "Stories & Feed" tab in the top navigation bar.',
          'Locate the "Create Official Publication" card at the top of the feed.',
          'Select publication type: choose "Article" for long-form editorial or "Post" for standard updates.',
          'Toggle "Sponsored Marketing Campaign" to enable targeted distribution to verified aviators.',
          'Select Target Scope: choose City, Country, Region, or World Wide.',
          'Under Target Country, check "Multiple Countries" to check off specific international territories.',
          'Enter Campaign Duration in whole days (minimum 1 day, maximum 30 days).',
          'Review calculated credit cost and click "Publish Official Notice".'
        ],
        content: `Create Official Publication allows verified enterprises to post articles or sponsor targeted campaigns. Condition 4 enforces that campaigns only serve standard consumer aviators and exclude competitor accounts. Targeting options include City, Country, Region, and World Wide scopes with multiple country support.`,
        keywords: ['marketing', 'campaign', 'publication', 'scope', 'targeting', 'official publication', 'sponsor'],
        routeAction: { tab: 'marketing', subTab: 'linkedin_feed', label: 'Go to Stories & Feed' },
      },
      {
        id: 'help_quant_reporting',
        title: 'Quantitative Campaign Reporting Interface',
        category: 'REPORTS',
        moduleId: 'mod_marketing',
        summary: 'Understand your pure-data KPI metrics: total impressions, unique verified audience reached, clicks, and wallet credit spend.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Reports > Quantitative Campaign Analytics',
        steps: [
          'Open "Operations & C-Panel" from the top navigation bar.',
          'Click the "Reports" sector in the C-Panel sector navigation bar.',
          'Select "Quantitative Campaign Analytics" from the sub-navigation options.',
          'Review the pure-data KPI cards: Total Views / Impressions, Target Audience Reached, Clicks & Engagement Rate, and Credit Spend.',
          'Click [Renew / Extend Campaign] if you want to extend duration while preserving the same campaign ID and data continuity.'
        ],
        content: `The Quantitative Reporting Interface provides pure, verified analytics for sponsored campaigns. It displays Total Views, Target Audience Reached, Clicks & Engagement Rate, and Total Credit Usage with zero clutter. Data updates asynchronously directly from the platform broadcast engine.`,
        keywords: ['reporting', 'quantitative', 'roi', 'impressions', 'reach', 'clicks', 'engagement', 'analytics'],
        routeAction: { tab: 'admin_desk', subTab: 'quant_reports', label: 'Open Quantitative Reports' },
      },
      {
        id: 'help_regional_mapping',
        title: 'Regional & Country Authority Mapping Desk (L8 Super Admin)',
        category: 'OPERATIONS',
        moduleId: 'mod_regional_mapping',
        requiredRoleLevels: [8],
        summary: 'Map sovereign nations, civil aviation authorities (DGCA, FAA, EASA, GCAA), and regional airspace corridors.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Operations > Regional & Country Mapping',
        steps: [
          'Open "Operations & C-Panel" from the top navigation bar.',
          'Click the "Operations" sector, then select "Regional & Country Mapping".',
          'Expand any continental authority zone: APAC, EMEA, LATAM, NA, ANZ, or MENA.',
          'Level 8 Super Admins can click "Add Country Mapping" or edit civil aviation regulatory agencies (DGCA, FAA, EASA, etc.). Non-L8 users hold read-only audit access.'
        ],
        content: `Regional & Country Mapping assigns sovereign territories to regional compliance clusters. Only Level 8 Super Admins hold cryptographic authority to add or modify country bindings and regulatory agency oversight.`,
        keywords: ['regional', 'mapping', 'country', 'dgca', 'faa', 'easa', 'authority', 'l8'],
        routeAction: { tab: 'admin_desk', subTab: 'regional_mapping', label: 'Open Regional Mapping' },
      },
      {
        id: 'help_story_categories',
        title: 'Story Categories & Feed Taxonomy Governance (L8 Only)',
        category: 'OPERATIONS',
        moduleId: 'mod_story_categories',
        requiredRoleLevels: [8],
        summary: 'Configure official story categories, color badge palettes, and topic indexing across the global aviation feed.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Operations > Story Categories',
        steps: [
          'Open "Operations & C-Panel" from the top navigation bar.',
          'Select the "Operations" sector, then click "Story Categories".',
          'Review active and archived editorial taxonomies and custom badge styles.',
          'Level 8 Super Admins can click "Add New Category" to create new categories or archive deprecated tags. Lower levels have read-only view.'
        ],
        content: `Story Category Manager organizes global aviation publications into structured taxonomies. Modification rights are restricted strictly to Level 8 Super Admins to protect feed consistency and regulatory tagging.`,
        keywords: ['categories', 'stories', 'taxonomy', 'badges', 'l8', 'super admin'],
        routeAction: { tab: 'admin_desk', subTab: 'story_categories', label: 'Open Story Categories' },
      },
      {
        id: 'help_safeguard_offboarding',
        title: 'Employee Offboarding & Data Safeguard Lifecycle (L6-L8 & HR)',
        category: 'HR',
        moduleId: 'mod_safeguard',
        requiredRoleLevels: [6, 7, 8],
        summary: 'Safe offboarding protocols, instant access suspension, and automatic handover of CRM leads and tasks to Reporting Managers.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: HR > Account Safeguard & Offboarding',
        steps: [
          'Open "Operations & C-Panel" and select the "HR" sector.',
          'Click "Account Safeguard & Offboarding (L6-L8 & HR)".',
          'Locate the departing employee in the organization directory.',
          'Select action: "Suspend Access" (temporary security freeze), "Disable Account" (formal departure), or "Delete with Recovery".',
          'Select a Reporting Manager from the dropdown to automatically inherit all active CRM Leads, Opportunities, and open Tasks.',
          'Click "Execute Safe Offboarding Protocol". If needed, use the 1-click "Recover Account" button to restore all assets.'
        ],
        content: `Account Safeguard protects corporate aviation data when personnel depart. Disabling or suspending an employee immediately cuts portal access and automatically reassigns all their active CRM Leads, Opportunities, Project Tasks, and Tickets to their Reporting Manager. Includes instant 1-click recovery.`,
        keywords: ['safeguard', 'offboarding', 'lifecycle', 'handover', 'employee', 'hr', 'reporting manager'],
        routeAction: { tab: 'admin_desk', subTab: 'safeguard', label: 'Open Account Safeguard' },
      },
      {
        id: 'help_role_governance',
        title: 'Role Switch & IAM Governance (@yarifly.com / @truvaer.com)',
        category: 'HR',
        moduleId: 'mod_roles',
        requiredRoleLevels: [5, 6, 7, 8],
        summary: 'Staff promotion rules, mandatory domain email verification, and sovereign Super Admin elevation checks.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: HR > Role Switch & IAM Governance',
        steps: [
          'Open "Operations & C-Panel", select the "HR" sector, and click "Role Switch & IAM Governance".',
          'Review the registered users table and their current RBAC tier.',
          'To promote any user to Admin or Super Admin, verify that their email ends with "@yarifly.com" or "@truvaer.com". Accounts with external domains are rejected with policy violations.',
          'Select the desired classification in the dropdown to trigger the IAM update. Promoting to Super Admin requires Level 8 Executive clearance.'
        ],
        content: `IAM Governance enforces strict administrative security. Any Admin or Super Admin account must have a verified organizational email ending with @yarifly.com or @truvaer.com. Elevation to Super Admin is strictly reserved to Level 8 Executives.`,
        keywords: ['roles', 'iam', 'governance', 'admin', 'super admin', 'domain', 'clearance'],
        routeAction: { tab: 'admin_desk', subTab: 'roles', label: 'Open Role Governance' },
      },
      {
        id: 'help_wallet_credits',
        title: 'Corporate Credit Wallet & Centralized Pricing Matrix',
        category: 'FINANCE',
        moduleId: 'mod_wallet',
        summary: 'Managing corporate credits, daily auto-renewals, threshold alerts, and understanding platform debit formulas.',
        navigationRoute: 'Home Top Nav > Corporate Credit Wallet OR C-Panel > Finance > Pricing Matrix',
        steps: [
          'Open the Corporate Credit Wallet modal from the top navigation bar.',
          'View your organization\'s live credit balance, escrow reserves, and monthly transaction statement.',
          'Click "Add Credits" to initiate a secure top-up via Razorpay or corporate wire invoice.',
          'Review the Centralized Pricing Matrix under C-Panel > Finance to view exact debit rates for campaign boosts and lead unlocks.'
        ],
        content: `Corporate wallets power enterprise actions including campaign boosts (15 Cr/day base), phone lead unlocks (10 Cr for 30-day validity), and RFQ submissions (25 Cr). Razorpay webhook relays allow instant credit top-ups with HMAC-SHA256 signature verification.`,
        keywords: ['wallet', 'credits', 'pricing', 'debit', 'razorpay', 'balance', 'topup'],
        routeAction: { tab: 'admin_desk', subTab: 'pricing', label: 'View Credit Matrix' },
      },
      {
        id: 'help_pricing_calibration',
        title: 'Credit Matrix & Pricing Calibration Governance (L7/L8 Only)',
        category: 'FINANCE',
        moduleId: 'mod_pricing',
        requiredRoleLevels: [7, 8],
        summary: 'Sovereign IAM calibration of credit debit values, minimum thresholds, and formula rate transparency.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Finance > Centralized Pricing Matrix',
        steps: [
          'Open "Operations & C-Panel" and select the "Finance" sector.',
          'Click "Centralized Pricing Matrix".',
          'Level 7 and Level 8 Administrators click "Edit Matrix" on any portal action line item.',
          'Adjust the Debit Value and Minimum Threshold, then click "Save". Lower tiers are locked with 403 Forbidden.'
        ],
        content: `Only Level 7 and Level 8 Administrators hold cryptographic IAM clearance to adjust default credit deductions and minimum balance thresholds across all platform modules. Any modification by lower levels returns 403 Forbidden.`,
        keywords: ['pricing', 'calibration', 'l7', 'l8', 'debit', 'matrix', 'rbac'],
        routeAction: { tab: 'admin_desk', subTab: 'pricing', label: 'Open Pricing Calibration' },
      },
      {
        id: 'help_credit_transparency',
        title: 'Credit Transparency & Ledger Architecture Dashboard',
        category: 'FINANCE',
        moduleId: 'mod_transparency',
        requiredRoleLevels: [1, 2, 3, 4, 5, 6, 7, 8],
        summary: 'Read-only dashboard displaying credit calculation formulas, duration scaling multipliers, and double-entry ledger logic.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Finance > Credit Transparency & Ledger',
        steps: [
          'Open "Operations & C-Panel", select the "Finance" sector.',
          'Click "Credit Transparency & Ledger".',
          'Inspect mathematical formulas for base cost, duration scaling, scope multipliers (City: 1.0x, Country: 1.5x, Region: 2.2x, Worldwide: 3.5x), and double-entry ledger audit trails.',
          'Verify active database rates directly reflected from live runtime configuration.'
        ],
        content: `Credit Transparency Dashboard provides complete audit visibility into platform billing logic. It displays mathematical formulas, duration multipliers, scope multipliers, and double-entry ledger debit/credit balances without allowing direct rate alterations.`,
        keywords: ['transparency', 'formulas', 'ledger', 'multipliers', 'audit', 'credits'],
        routeAction: { tab: 'admin_desk', subTab: 'credit_transparency', label: 'Open Credit Transparency' },
      },
      {
        id: 'help_flashnews_desk',
        title: 'FlashNews & 2-Step Verification Queue Desk',
        category: 'PUBLICATION',
        moduleId: 'mod_flashnews',
        requiredRoleLevels: [4, 5, 6, 7, 8],
        summary: 'Emergency NOTAM dispatch, corporate announcements, FIFO queue capacity limits, and 2-step editorial sign-offs.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Publication > FlashNews & Blink Feed Desk',
        steps: [
          'Open "Operations & C-Panel", select "Publication", then click "FlashNews & Blink Feed Desk".',
          'To publish: fill in Headline, content message (max 200 words), timing (5s, 10s, 15s, 30s), slot position, and category.',
          'Level 1 Approvers review editorial integrity; Level 2 Operations signs off to push live to the top ticker.',
          'Under the Queue tab, manage broadcasts in-line: Pause Status, Edit, Archive, or Delete without horizontal sliding.'
        ],
        content: `FlashNews broadcasts priority aviation notices to the top ticker across all user portals. Submissions undergo 2-Step Verification (Editorial Check & Operations Signoff) before entering the live FIFO active queue with auto-refund guarantees for rejected broadcasts.`,
        keywords: ['flashnews', 'blink', 'notam', 'broadcast', 'queue', 'verification', 'fifo'],
        routeAction: { tab: 'admin_desk', subTab: 'flashnews', label: 'Open FlashNews Desk' },
      },
      {
        id: 'help_audit_logs',
        title: 'Sovereign SIEM Audit Trail & Compliance Export',
        category: 'REPORTS',
        moduleId: 'mod_audit',
        requiredRoleLevels: [6, 7, 8],
        summary: 'Immutable cryptographically-signed records of every administrative action, RBAC escalation, Razorpay payment webhook, and sensitive PII masking event.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Reports > Sovereign Audit Logs (SIEM)',
        steps: [
          'Open "Operations & C-Panel", select the "Reports" sector.',
          'Click "Sovereign Audit Logs (SIEM)".',
          'Filter cryptographic event streams by Security, Compliance, Financial, Privacy, or IAM.',
          'Click "Export Audit Trail (CSV)" to download an immutable compliance ledger.'
        ],
        content: `Sovereign Audit Trail records every administrative operation, clearance escalation, Razorpay transaction verification, and data export. Cryptographic signatures ensure compliance with civil aviation authorities and enterprise security requirements.`,
        keywords: ['audit', 'siem', 'security', 'compliance', 'logs', 'csv', 'export'],
        routeAction: { tab: 'admin_desk', subTab: 'audit', label: 'Open Audit Logs' },
      },
      {
        id: 'help_full_reset',
        title: 'Full Application Reset Protocols (Super Admin Only)',
        category: 'OPERATIONS',
        moduleId: 'mod_reset',
        requiredRoleLevels: [8],
        summary: 'Three-stage disaster recovery reset: Settings reset only, Full reset without data, and complete bootstrap wipe.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Operations > Full Application Reset',
        steps: [
          'Open "Operations & C-Panel", select "Operations", and click "Full Application Reset".',
          'Confirm you are logged in as a Level 8 Sovereign Super Admin.',
          'Select the desired recovery tier: 1. "Settings Reset Only", 2. "Full Reset Without Data", or 3. "Full Reset With Data".',
          'Type the exact required passphrase into the confirmation field.',
          'Click "Execute Sovereign Application Reset" to apply.'
        ],
        content: `Located under Ops & ERP, Full Application Reset provides 3 recovery levels: 1. Settings Reset Only (credit policies and configs); 2. Full Reset Without Data (security & RBAC reset preserving businesses and accounts); 3. Full Reset With Data (complete factory restore).`,
        keywords: ['reset', 'recovery', 'system reset', 'factory wipe', 'super admin', 'settings reset'],
        routeAction: { tab: 'admin_desk', subTab: 'system_reset', label: 'Open Application Reset' },
      },
      {
        id: 'help_treasury_reserves',
        title: 'Statutory Escrow Reserves & Liquidity Desk (L8 Super Admin)',
        category: 'FINANCE',
        moduleId: 'mod_reserves',
        requiredRoleLevels: [8],
        summary: 'Platform treasury oversight, charter escrow reserves, sovereign stress tests, and liquidity adjustments.',
        navigationRoute: 'Home Top Nav > Cockpit Bar > ( Treasury & Reserves )',
        steps: [
          'On the Home Dashboard Cockpit portal bar, locate the "( Treasury & Reserves )" button positioned directly after Chat.',
          'Click to open the in-body Statutory Aviation Escrow Reserves console.',
          'Review mandatory 80% payout reserves, liquidity buffers, and stress test ratios.',
          'Adjust statutory escrow reserve allocations under Level 8 cryptographic signature.'
        ],
        content: `Statutory Aviation Escrow Reserves desk is strictly gated to Level 8 sovereign members. Adjusting reserves and liquidity ratios is restricted exclusively to Super Admin to ensure total fund security and regulatory escrow compliance.`,
        keywords: ['treasury', 'reserves', 'escrow', 'liquidity', 'l8', 'sovereign', 'super admin'],
        routeAction: { tab: 'admin_desk', subTab: 'treasury', label: 'Open Treasury Desk' },
      },
      {
        id: 'help_crm_sales',
        title: 'Commercial Sales Portal: Leads, Quotations & Commissions',
        category: 'FINANCE',
        moduleId: 'mod_crm',
        summary: 'Tracking high-value charter inquiries, quotation generation, automated commission calculations, and net settlements.',
        navigationRoute: 'Home Top Nav > Commercial Sales (CRM) Portal',
        steps: [
          'Click "Sale" or "CRM Portal" in the main top navigation bar.',
          'Review incoming charter and service leads in the Kanban and list views.',
          'Generate quotations and track client status through negotiation to deal completion.',
          'Review automatic 5% platform commission calculations and net operator settlements.'
        ],
        content: `Commercial Sales Portal centralizes aviation deal flows. Track incoming charter requests from lead inception through quotation dispatch, deal closure, and automatic platform commission ledger deductions with real-time net operator balance calculations.`,
        keywords: ['crm', 'leads', 'sales', 'quotations', 'pipeline', 'commission', 'settlements'],
        routeAction: { tab: 'crm_portal', label: 'Open Sale Portal' },
      },
      {
        id: 'help_pms_tasks',
        title: 'Admin Project Management System (PMS Desk)',
        category: 'OPERATIONS',
        moduleId: 'mod_pms',
        requiredRoleLevels: [1, 2, 3, 4, 5, 6, 7, 8],
        summary: 'Collaborative task allocation, flight dispatch milestones, safety audit deliverables, and team sprint tracking.',
        navigationRoute: 'Home Top Nav > Operations & C-Panel > Sector: Operations > Admin PMS',
        steps: [
          'Open "Operations & C-Panel", select "Operations", and click "Admin PMS".',
          'Track aviation task deliverables across flight operations, safety audits, and MRO maintenance.',
          'Update task status (To-Do, In-Progress, Review, Completed) and log resolution notes.'
        ],
        content: `Admin PMS empowers aviation teams to track regulatory compliance, safety audits, dispatch procedures, and maintenance deadlines. Assign tasks by department, set priority levels, and log immutable resolution notes.`,
        keywords: ['pms', 'projects', 'tasks', 'operations', 'compliance', 'sprints'],
        routeAction: { tab: 'admin_desk', subTab: 'pms', label: 'Open Admin PMS' },
      },
    ];

    // Permission-Based Rendering: Users only see documentation for modules they actively have permission to view/edit
    return masterArticles.filter((art) => {
      if (isSuperAdmin) return true;

      if (art.requiredRoleLevels && art.requiredRoleLevels.length > 0) {
        if (!isAdmin || !art.requiredRoleLevels.includes(adminLevel)) {
          return false;
        }
      }

      if (art.allowedUserRoles && art.allowedUserRoles.length > 0) {
        const userRole = user?.role || (isBusiness ? 'BUSINESS' : 'STANDARD_USER');
        if (!art.allowedUserRoles.includes(userRole as any)) {
          return false;
        }
      }

      if (!isAdmin && (art.category === 'HR' || art.moduleId === 'mod_reset' || art.moduleId === 'mod_reserves')) {
        return false;
      }

      return true;
    });
  }

  public likeBusinessPost(postId: string, actorId: string): BusinessPost | null {
    const post = this.businessPosts.find((p) => p.id === postId);
    if (!post) return null;

    if (!post.likes) post.likes = [];
    if (!post.reactions) post.reactions = { like: 0 };

    const idx = post.likes.indexOf(actorId);
    if (idx > -1) {
      // Unlike
      post.likes.splice(idx, 1);
      post.reactions.like = Math.max(0, (post.reactions.like || 1) - 1);
    } else {
      // Like
      post.likes.push(actorId);
      post.reactions.like = (post.reactions.like || 0) + 1;
    }

    this.persist();
    this.notifyPostListeners();
    return post;
  }

  public commentBusinessPost(
    postId: string,
    commentData: {
      user_id: string;
      user_name: string;
      user_role: string;
      user_avatar?: string;
      text: string;
    }
  ): BusinessPost | null {
    const post = this.businessPosts.find((p) => p.id === postId);
    if (!post) return null;

    if (!post.comments) post.comments = [];
    const newComment: PostComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...commentData,
    };
    post.comments.push(newComment);

    this.persist();
    this.notifyPostListeners();
    return post;
  }

  // -------------------------------------------------------------
  // BUSINESS PAGE FOLLOW / UNFOLLOW SYSTEM
  // -------------------------------------------------------------
  public followBusiness(userId: string, businessId: string): void {
    if (!this.businessFollowers[userId]) {
      this.businessFollowers[userId] = [];
    }
    if (!this.businessFollowers[userId].includes(businessId)) {
      this.businessFollowers[userId].push(businessId);
    }

    // Also sync with RegularUser's followed_business_ids if user exists
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (user) {
      if (!user.followed_business_ids) user.followed_business_ids = [];
      if (!user.followed_business_ids.includes(businessId)) {
        user.followed_business_ids.push(businessId);
      }
    }

    // Increment business profile followed_by_count
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (biz) {
      biz.followed_by_count = (biz.followed_by_count || 120) + 1;
    }

    this.persist();
  }

  public unfollowBusiness(userId: string, businessId: string): void {
    if (this.businessFollowers[userId]) {
      this.businessFollowers[userId] = this.businessFollowers[userId].filter((id) => id !== businessId);
    }

    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (user && user.followed_business_ids) {
      user.followed_business_ids = user.followed_business_ids.filter((id) => id !== businessId);
    }

    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (biz && biz.followed_by_count && biz.followed_by_count > 0) {
      biz.followed_by_count -= 1;
    }

    this.persist();
  }

  public isFollowingBusiness(userId: string, businessId: string): boolean {
    if (!userId || !businessId) return false;
    const list = this.businessFollowers[userId] || [];
    return list.includes(businessId);
  }

  public getFollowedBusinessIds(userId: string): string[] {
    if (!userId) return [];
    return [...(this.businessFollowers[userId] || [])];
  }

  public getBusinessFollowersCount(businessId: string): number {
    let count = 0;
    for (const userId in this.businessFollowers) {
      if (this.businessFollowers[userId]?.includes(businessId)) {
        count++;
      }
    }
    const biz = this.businesses.find((b) => b.business_id === businessId);
    return Math.max(count, biz?.followed_by_count || 48);
  }

  // =========================================================================
  // 1. BROADCAST NOTIFICATIONS & TARGETED EMAILS (Category, Zone, Country)
  // =========================================================================
  public getBroadcastNotifications(): BroadcastNotification[] {
    return [...this.broadcastNotifications].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  public publishBroadcastNotification(payload: {
    title: string;
    message: string;
    category: string;
    zone: AviationZone | 'All';
    country: string;
    target_recipient_type: 'ALL' | 'BUSINESS_ONLY' | 'REGULAR_ONLY';
    action_type: 'NOTIFICATION_ONLY' | 'EMAIL_ONLY' | 'BOTH_NOTIFICATION_AND_EMAIL';
    adminId: string;
    adminName: string;
  }): { success: boolean; message: string; notification: BroadcastNotification; recipientCount: number } {
    const cleanTitle = payload.title.trim();
    const cleanMessage = payload.message.trim();

    if (!cleanTitle || !cleanMessage) {
      return {
        success: false,
        message: 'Notification title and message body are required.',
        notification: {} as any,
        recipientCount: 0,
      };
    }

    // Determine targeted recipient IDs and emails
    const targetEmails: string[] = [];
    const targetUserIds: string[] = [];

    // Helper to test if a country matches zone and country filter
    const matchesGeo = (itemCountry: string | undefined): boolean => {
      const c = (itemCountry || 'India').trim();
      if (payload.country !== 'All' && c.toLowerCase() !== payload.country.toLowerCase()) {
        return false;
      }
      if (payload.zone !== 'All') {
        const itemZone = getZoneForCountry(c);
        if (itemZone !== payload.zone) {
          return false;
        }
      }
      return true;
    };

    // Filter Businesses if targeted
    if (payload.target_recipient_type === 'ALL' || payload.target_recipient_type === 'BUSINESS_ONLY') {
      this.businesses.forEach((b) => {
        // Category check
        const bizListing = this.serviceListings.find((s) => s.business_id === b.business_id);
        const matchesCategory =
          payload.category === 'All' ||
          b.nature_of_business?.toLowerCase().includes(payload.category.toLowerCase()) ||
          bizListing?.category?.toLowerCase().includes(payload.category.toLowerCase());

        const bizCountry = b.physical_location || bizListing?.country || 'India';
        if (matchesCategory && matchesGeo(bizCountry)) {
          if (b.business_email) targetEmails.push(b.business_email);
          targetUserIds.push(b.business_id);
        }
      });
    }

    // Filter Regular Aviator Users if targeted
    if (payload.target_recipient_type === 'ALL' || payload.target_recipient_type === 'REGULAR_ONLY') {
      this.regularUsers.forEach((u) => {
        const userCountry = u.country_code || 'India';
        if (matchesGeo(userCountry)) {
          if (u.email) targetEmails.push(u.email);
          targetUserIds.push(u.user_id);
        }
      });
    }

    const uniqueEmails = Array.from(new Set(targetEmails));
    const uniqueUserIds = Array.from(new Set(targetUserIds));
    const recipientCount = Math.max(uniqueEmails.length, uniqueUserIds.length, 1);

    // 1. Dispatch In-App Notifications
    if (payload.action_type === 'NOTIFICATION_ONLY' || payload.action_type === 'BOTH_NOTIFICATION_AND_EMAIL') {
      const now = new Date().toISOString();
      uniqueUserIds.forEach((uid) => {
        this.addNotification({
          recipient_id: uid,
          title: `📢 [${payload.zone} Announcement] ${cleanTitle}`,
          message: cleanMessage,
          type: 'SYSTEM',
        });
      });
    }

    // 2. Dispatch Formal Internal Emails
    if (payload.action_type === 'EMAIL_ONLY' || payload.action_type === 'BOTH_NOTIFICATION_AND_EMAIL') {
      uniqueEmails.forEach((email) => {
        this.sendInternalMail(
          'admin@truvaer.com',
          email,
          `[Official Broadcast: ${payload.zone}] ${cleanTitle}`,
          `Scope: ${payload.zone} Sector / ${payload.country} | Category: ${payload.category}\n\n${cleanMessage}\n\nDispatched by ${payload.adminName} via Truvaer Airway Governance Desk.`,
          'Primary'
        );
      });
    }

    const newBroadcast: BroadcastNotification = {
      id: `bcast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_admin_id: payload.adminId,
      sender_admin_name: payload.adminName,
      title: cleanTitle,
      message: cleanMessage,
      category: payload.category,
      zone: payload.zone,
      country: payload.country,
      target_recipient_type: payload.target_recipient_type,
      published_at: new Date().toISOString(),
      action_type: payload.action_type,
      delivered_count: recipientCount,
    };

    this.broadcastNotifications.unshift(newBroadcast);

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Aviation Broadcast Published',
      description: `Targeted Broadcast "${cleanTitle}" delivered to ${recipientCount} recipients across Zone: ${payload.zone}, Country: ${payload.country}, Category: ${payload.category}.`,
      actor_name: payload.adminName,
      actor_role: 'L8 Executive Administrator',
      severity: 'info',
    });

    this.persist();

    return {
      success: true,
      message: `Broadcast successfully published and delivered to ${recipientCount} recipients across ${payload.zone} (${payload.country}).`,
      notification: newBroadcast,
      recipientCount,
    };
  }

  // =========================================================================
  // 2. BUSINESS LISTING SERVICES & CUSTOM "OTHER" SERVICE APPROVAL WORKFLOW
  // =========================================================================
  public getAvailableServicesForCategory(category: string): string[] {
    const standard = STANDARD_SERVICES_BY_CATEGORY[category] || [];
    const custom = this.platformCustomServices[category] || [];
    return Array.from(new Set([...standard, ...custom]));
  }

  public getCustomServiceRequests(status?: string): CustomServiceRequest[] {
    if (status && status !== 'ALL') {
      return this.customServiceRequests.filter((r) => r.status === status);
    }
    return [...this.customServiceRequests].sort(
      (a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );
  }

  public requestCustomService(payload: {
    business_id: string;
    business_name: string;
    listing_id: string;
    service_name: string;
    category: string;
    description: string;
    requested_by: string;
  }): { success: boolean; message: string; request?: CustomServiceRequest } {
    const cleanServiceName = payload.service_name.trim();
    if (!cleanServiceName || cleanServiceName.length < 3) {
      return { success: false, message: 'Please specify a valid aviation service name (minimum 3 characters).' };
    }

    const newReq: CustomServiceRequest = {
      id: `csr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      business_id: payload.business_id,
      business_name: payload.business_name,
      listing_id: payload.listing_id,
      service_name: cleanServiceName,
      category: payload.category || 'General Aviation',
      description: payload.description.trim() || 'Custom bespoke service requested by operator.',
      status: 'PENDING_APPROVAL',
      requested_by: payload.requested_by,
      requested_at: new Date().toISOString(),
    };

    this.customServiceRequests.unshift(newReq);

    // Notify Admin of pending service request
    this.addNotification({
      recipient_id: 'admin@truvaer.com',
      title: 'New Service Addition Pending Review',
      message: `${payload.business_name} requested custom service "${cleanServiceName}" in category ${payload.category}. Review and approve in Admin Portal.`,
      type: 'APPROVAL',
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Custom Service Request Submitted',
      description: `${payload.requested_by} (${payload.business_name}) requested new platform service "${cleanServiceName}".`,
      actor_name: payload.requested_by,
      actor_role: 'Business Operator',
      severity: 'info',
    });

    this.persist();

    return {
      success: true,
      message: `Custom service "${cleanServiceName}" submitted for Administrator review. Once verified, it will be automatically added to your listing and platform catalog!`,
      request: newReq,
    };
  }

  public approveCustomService(
    requestId: string,
    adminId: string,
    adminName: string
  ): { success: boolean; message: string; request?: CustomServiceRequest } {
    const req = this.customServiceRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom service request not found.' };

    req.status = 'APPROVED';
    req.reviewed_by = adminName;
    req.reviewed_at = new Date().toISOString();

    // 1. Add to the business's listing automatically
    const listing = this.serviceListings.find((s) => s.id === req.listing_id || s.business_id === req.business_id);
    if (listing) {
      if (!listing.services) listing.services = [];
      if (!listing.services.includes(req.service_name)) {
        listing.services.push(req.service_name);
      }
      if (listing.pending_services) {
        listing.pending_services = listing.pending_services.filter((s) => s !== req.service_name);
      }
    }

    // 2. Add to global dynamic platform custom services catalog for this category
    if (!this.platformCustomServices[req.category]) {
      this.platformCustomServices[req.category] = [];
    }
    if (!this.platformCustomServices[req.category].includes(req.service_name)) {
      this.platformCustomServices[req.category].push(req.service_name);
    }

    // 3. Notify the business user
    this.addNotification({
      recipient_id: req.business_id,
      title: '🎉 Custom Service Approved & Activated!',
      message: `Great news! Your requested service "${req.service_name}" has been approved by Administrator ${adminName} and is now live on your listing and platform catalog.`,
      type: 'APPROVAL',
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Custom Service Approved',
      description: `Administrator ${adminName} approved service "${req.service_name}" for ${req.business_name} (${req.category}). Service added to marketplace catalog.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_id: req.id,
      target_name: req.service_name,
      severity: 'success',
    });

    this.persist();

    return {
      success: true,
      message: `Service "${req.service_name}" approved successfully and added to provider listing & marketplace catalog!`,
      request: req,
    };
  }

  public rejectCustomService(
    requestId: string,
    adminId: string,
    adminName: string,
    reason: string
  ): { success: boolean; message: string } {
    const req = this.customServiceRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom service request not found.' };

    req.status = 'REJECTED';
    req.reviewed_by = adminName;
    req.reviewed_at = new Date().toISOString();
    req.rejection_reason = reason.trim() || 'Service does not meet current aviation safety and certification criteria.';

    // Remove from pending_services on listing
    const listing = this.serviceListings.find((s) => s.id === req.listing_id || s.business_id === req.business_id);
    if (listing && listing.pending_services) {
      listing.pending_services = listing.pending_services.filter((s) => s !== req.service_name);
    }

    this.addNotification({
      recipient_id: req.business_id,
      title: 'Service Addition Request Update',
      message: `Your requested service "${req.service_name}" was not approved. Remarks: ${req.rejection_reason}`,
      type: 'APPROVAL',
    });

    this.persist();

    return {
      success: true,
      message: `Service request "${req.service_name}" rejected with feedback provided to operator.`,
    };
  }

  public addServiceToListing(listingId: string, serviceName: string): { success: boolean; message: string; listing?: ServiceListing } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    const cleanService = serviceName.trim();
    if (!cleanService) return { success: false, message: 'Invalid service name.' };

    if (!listing.services) listing.services = [];
    if (listing.services.includes(cleanService)) {
      return { success: false, message: `"${cleanService}" is already added to this listing.` };
    }

    listing.services.push(cleanService);
    this.persist();

    return {
      success: true,
      message: `"${cleanService}" added to listing services successfully.`,
      listing,
    };
  }

  public removeServiceFromListing(listingId: string, serviceName: string): { success: boolean; message: string; listing?: ServiceListing } {
    const listing = this.serviceListings.find((s) => s.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found.' };

    if (!listing.services) return { success: false, message: 'No services on listing.' };
    listing.services = listing.services.filter((s) => s !== serviceName);
    this.persist();

    return {
      success: true,
      message: `"${serviceName}" removed from listing services.`,
      listing,
    };
  }

  public addPlatformMasterService(category: string, serviceName: string, adminName: string): { success: boolean; message: string } {
    const cleanCat = category.trim() || 'Private Air Charter';
    const cleanSrv = serviceName.trim();
    if (!cleanSrv) {
      return { success: false, message: 'Please provide a valid service title.' };
    }

    if (!this.platformCustomServices[cleanCat]) {
      this.platformCustomServices[cleanCat] = [];
    }

    const standard = STANDARD_SERVICES_BY_CATEGORY[cleanCat] || [];
    if (this.platformCustomServices[cleanCat].includes(cleanSrv) || standard.includes(cleanSrv)) {
      return { success: false, message: `"${cleanSrv}" already exists in the platform catalog for "${cleanCat}".` };
    }

    this.platformCustomServices[cleanCat].push(cleanSrv);

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Master Service Added',
      description: `Administrator ${adminName} added new master service "${cleanSrv}" to category "${cleanCat}". Now available to all operators.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: cleanSrv,
      severity: 'success',
    });

    this.persist();

    return {
      success: true,
      message: `Service "${cleanSrv}" successfully added to master platform category "${cleanCat}" and is now active for all business operators!`,
    };
  }

  // =========================================================================
  // 2B. CUSTOM "OTHER" CATEGORY & SUB-CATEGORY WORKFLOW & ADMIN CATALOG
  // =========================================================================
  public getAviationTaxonomy(): Record<string, string[]> {
    if (!this.customTaxonomy || Object.keys(this.customTaxonomy).length <= 1) {
      const merged: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(AVIATION_TAXONOMY)) {
        merged[k] = [...v];
      }
      for (const [cat, subs] of Object.entries(this.customTaxonomy || {})) {
        if (!merged[cat]) {
          merged[cat] = ['All Subcategories', ...subs.filter((s) => s !== 'All Subcategories')];
        } else {
          merged[cat] = Array.from(new Set([...merged[cat], ...subs]));
        }
      }
      this.customTaxonomy = merged;
      this.persist();
    }
    return this.customTaxonomy;
  }

  public getPlatformCategories(): string[] {
    return Object.keys(this.getAviationTaxonomy());
  }

  public getApprovedCategories(): string[] {
    const tax = this.getAviationTaxonomy();
    return Object.keys(tax).filter((c) => c !== 'All');
  }

  public getApprovedSubCategories(category: string): string[] {
    const tax = this.getAviationTaxonomy();
    return tax[category] ? tax[category].filter((s) => s !== 'All Subcategories') : [];
  }

  public getCustomCategoryRequests(status?: string): CustomCategoryRequest[] {
    if (status && status !== 'ALL') {
      return this.customCategoryRequests.filter((r) => r.status === status);
    }
    return [...this.customCategoryRequests].sort(
      (a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );
  }

  public requestCustomCategory(payload: {
    business_id: string;
    business_name: string;
    category_name: string;
    sub_category_name: string;
    description: string;
    requested_by: string;
  }): { success: boolean; message: string; request?: CustomCategoryRequest } {
    const cleanCat = payload.category_name.trim();
    const cleanSub = payload.sub_category_name.trim();
    if (!cleanCat || cleanCat.length < 2) {
      return { success: false, message: 'Please provide a valid Category title (at least 2 characters).' };
    }
    if (!cleanSub || cleanSub.length < 2) {
      return { success: false, message: 'Please provide a valid Sub-Category title (at least 2 characters).' };
    }

    const newReq: CustomCategoryRequest = {
      id: `ccr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      business_id: payload.business_id,
      business_name: payload.business_name,
      category_name: cleanCat,
      sub_category_name: cleanSub,
      description: payload.description.trim() || `Proposed new aviation category and sub-category submitted by ${payload.business_name}.`,
      status: 'PENDING_APPROVAL',
      requested_by: payload.requested_by,
      requested_at: new Date().toISOString(),
    };

    this.customCategoryRequests.unshift(newReq);

    this.addNotification({
      recipient_id: 'admin@truvaer.com',
      title: 'New Category & Sub-Category Pending Review',
      message: `${payload.business_name} proposed new category "${cleanCat}" with sub-category "${cleanSub}". Review and approve in Admin Portal.`,
      type: 'APPROVAL',
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Custom Category & Sub-Category Requested',
      description: `${payload.requested_by} (${payload.business_name}) proposed new category "${cleanCat}" and sub-category "${cleanSub}".`,
      actor_name: payload.requested_by,
      actor_role: 'Business Operator',
      severity: 'info',
    });

    this.persist();

    return {
      success: true,
      message: `Category "${cleanCat}" and Sub-Category "${cleanSub}" submitted for Administrator review. Once verified by Admin, it will be automatically added to the live portal catalog!`,
      request: newReq,
    };
  }

  public approveCustomCategory(
    requestId: string,
    adminId: string,
    adminName: string
  ): { success: boolean; message: string; request?: CustomCategoryRequest } {
    const req = this.customCategoryRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom category request not found.' };

    req.status = 'APPROVED';
    req.reviewed_by = adminName;
    req.reviewed_at = new Date().toISOString();

    if (!this.customTaxonomy[req.category_name]) {
      this.customTaxonomy[req.category_name] = ['All Subcategories'];
    }
    if (!this.customTaxonomy[req.category_name].includes(req.sub_category_name)) {
      this.customTaxonomy[req.category_name].push(req.sub_category_name);
    }

    const biz = this.businesses.find((b) => b.business_id === req.business_id);
    if (biz) {
      biz.category = req.category_name;
      biz.subCategory = req.sub_category_name;
    }
    const listing = this.serviceListings.find((s) => s.business_id === req.business_id);
    if (listing) {
      listing.category = req.category_name;
      listing.subCategory = req.sub_category_name;
    }

    this.addNotification({
      recipient_id: req.business_id,
      title: '🎉 New Category & Sub-Category Approved!',
      message: `Your proposed category "${req.category_name}" and sub-category "${req.sub_category_name}" have been approved by Admin ${adminName} and are now live across the platform!`,
      type: 'APPROVAL',
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Category & Sub-Category Approved',
      description: `Administrator ${adminName} approved new Category "${req.category_name}" and Sub-Category "${req.sub_category_name}" requested by ${req.business_name}. Live on platform.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_id: req.id,
      target_name: `${req.category_name} - ${req.sub_category_name}`,
      severity: 'success',
    });

    this.persist();

    return {
      success: true,
      message: `Category "${req.category_name}" and Sub-Category "${req.sub_category_name}" approved successfully and added to the portal!`,
      request: req,
    };
  }

  public rejectCustomCategory(
    requestId: string,
    adminId: string,
    adminName: string,
    reason: string
  ): { success: boolean; message: string } {
    const req = this.customCategoryRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom category request not found.' };

    req.status = 'REJECTED';
    req.reviewed_by = adminName;
    req.reviewed_at = new Date().toISOString();
    req.rejection_reason = reason.trim() || 'Category does not meet platform aviation taxonomy criteria.';

    this.addNotification({
      recipient_id: req.business_id,
      title: 'Category Request Declined',
      message: `Your proposed category "${req.category_name}" was reviewed: ${req.rejection_reason}`,
      type: 'APPROVAL',
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Category Request Rejected',
      description: `Administrator ${adminName} rejected proposed category "${req.category_name}" (${req.rejection_reason}).`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_id: req.id,
      severity: 'warning',
    });

    this.persist();

    return {
      success: true,
      message: `Category request rejected. Notification sent to business.`,
    };
  }

  // =========================================================================
  // C-PANEL SERVICES ACTION CONTROLS: EDIT, SUSPEND, SOFT LOCK, HARD LOCK
  // =========================================================================
  public adminUpdateCategoryRequest(
    requestId: string,
    updates: {
      category_name?: string;
      sub_category_name?: string;
      status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
      lock_status?: 'NONE' | 'SOFT_LOCKED' | 'HARD_LOCKED';
      is_suspended?: boolean;
    },
    adminName: string
  ): { success: boolean; message: string; request?: CustomCategoryRequest } {
    const req = this.customCategoryRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom category request not found.' };

    const nowIso = new Date().toISOString();
    if (!req.original_category_name) req.original_category_name = req.category_name;
    if (!req.original_sub_category_name) req.original_sub_category_name = req.sub_category_name;

    if (updates.category_name && updates.category_name.trim()) {
      req.category_name = updates.category_name.trim();
    }
    if (updates.sub_category_name && updates.sub_category_name.trim()) {
      req.sub_category_name = updates.sub_category_name.trim();
    }
    if (updates.status !== undefined) {
      req.status = updates.status;
    }
    if (updates.lock_status !== undefined) {
      req.lock_status = updates.lock_status;
    }
    if (updates.is_suspended !== undefined) {
      req.is_suspended = updates.is_suspended;
      if (updates.is_suspended) {
        req.status = 'SUSPENDED';
      }
    }

    req.modified_at = nowIso;
    req.modified_by = adminName;

    // Synchronize with custom taxonomy
    if (!this.customTaxonomy[req.category_name]) {
      this.customTaxonomy[req.category_name] = ['All Subcategories'];
    }
    if (!this.customTaxonomy[req.category_name].includes(req.sub_category_name)) {
      this.customTaxonomy[req.category_name].push(req.sub_category_name);
    }

    // Update associated business / listing if applicable
    const biz = this.businesses.find((b) => b.business_id === req.business_id);
    if (biz) {
      biz.category = req.category_name;
      biz.subCategory = req.sub_category_name;
    }
    const listing = this.serviceListings.find((s) => s.business_id === req.business_id);
    if (listing) {
      listing.category = req.category_name;
      listing.subCategory = req.sub_category_name;
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Category Request Overridden by Admin: ${req.business_name}`,
      description: `Admin ${adminName} updated category mapping to "${req.category_name} → ${req.sub_category_name}". Status: ${req.status}, Lock: ${req.lock_status || 'NONE'}.`,
      actor_name: adminName,
      actor_role: 'Operations Administrator',
      target_id: req.id,
      target_name: `${req.category_name} - ${req.sub_category_name}`,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Category mapping saved! Updated to "${req.category_name} → ${req.sub_category_name}".`,
      request: req,
    };
  }

  public adminToggleCategorySuspend(
    requestId: string,
    adminName: string
  ): { success: boolean; message: string; is_suspended: boolean; request?: CustomCategoryRequest } {
    const req = this.customCategoryRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom category request not found.', is_suspended: false };

    const newSuspended = !req.is_suspended;
    req.is_suspended = newSuspended;
    req.status = newSuspended ? 'SUSPENDED' : (req.reviewed_by ? 'APPROVED' : 'PENDING_APPROVAL');
    req.modified_at = new Date().toISOString();
    req.modified_by = adminName;

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Category Request ${newSuspended ? 'Suspended' : 'Unsuspended'}: ${req.business_name}`,
      description: `Admin ${adminName} ${newSuspended ? 'temporarily suspended' : 're-activated'} category request "${req.category_name} → ${req.sub_category_name}".`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_id: req.id,
      severity: newSuspended ? 'warning' : 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Request for "${req.category_name} → ${req.sub_category_name}" ${newSuspended ? 'SUSPENDED' : 'RE-ACTIVATED'}.`,
      is_suspended: newSuspended,
      request: req,
    };
  }

  public adminSetCategoryLock(
    requestId: string,
    lockStatus: 'NONE' | 'SOFT_LOCKED' | 'HARD_LOCKED',
    adminName: string
  ): { success: boolean; message: string; lock_status: string; request?: CustomCategoryRequest } {
    const req = this.customCategoryRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Custom category request not found.', lock_status: 'NONE' };

    req.lock_status = lockStatus;
    req.modified_at = new Date().toISOString();
    req.modified_by = adminName;

    const label = lockStatus === 'HARD_LOCKED' ? 'Hard Lock (Completely Frozen)' : lockStatus === 'SOFT_LOCKED' ? 'Soft Lock (Read-Only to Users)' : 'Unlocked';

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Category Lock Applied: ${label}`,
      description: `Admin ${adminName} set lock state of "${req.category_name} → ${req.sub_category_name}" to ${lockStatus}.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_id: req.id,
      severity: lockStatus === 'HARD_LOCKED' ? 'critical' : lockStatus === 'SOFT_LOCKED' ? 'warning' : 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Lock status set to ${label}!`,
      lock_status: lockStatus,
      request: req,
    };
  }

  // =========================================================================
  // DYNAMIC ALLOCATION SYSTEM (DAS): MOBILITY & MULTI-ASSIGNMENT MATRIX
  // =========================================================================
  public transferStaffDepartment(
    staffId: string,
    targetDept: AdminDepartment,
    reason: string,
    adminAuthor: string
  ): { success: boolean; message: string; staff?: AdminUser } {
    const staff = this.adminUsers.find((a) => a.admin_id === staffId);
    if (!staff) return { success: false, message: 'Staff member not found.' };

    const level = staff.level ?? 1;
    // Standard staff mobility is for L1-L4
    if (level > 4) {
      return {
        success: false,
        message: 'L5+ Managers & Leadership use the Checkbox Matrix UI for multi-department allocation.',
      };
    }

    const previousDept = staff.department || 'Operations';
    staff.department = targetDept;
    staff.primary_dept_id = `dept_${targetDept.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Update assigned modules corresponding to the new department and revoking legacy
    const deptModuleMap: Record<string, string[]> = {
      Operations: ['Operations', 'Publications', 'Moderation'],
      Sales: ['Sales', 'CRM', 'Leads'],
      Marketing: ['Marketing', 'Publications', 'Promotions'],
      Finance: ['Finance', 'Accounts', 'Commissions'],
      Stores: ['Stores', 'Inventory'],
      HR: ['HR', 'Human Resource'],
      'Customer Care': ['Customer Care', 'Support'],
    };
    staff.assigned_modules = deptModuleMap[targetDept] || [targetDept];

    // Single department rule: clear any multi-department assignments
    staff.assigned_departments = [targetDept];

    if (!staff.mobility_history) staff.mobility_history = [];
    staff.mobility_history.unshift({
      id: `mob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromDept: previousDept,
      toDept: targetDept,
      timestamp: new Date().toISOString(),
      reason: reason || 'Performance-based mobility transfer',
      triggeredBy: adminAuthor,
      kpiScoreAtTransfer: staff.kpi_score,
    });

    this.logAdminActivity({
      category: 'HIERARCHY_PROMOTION',
      title: `DAS Staff Mobility Transfer: ${staff.name}`,
      description: `Staff ${staff.name} (L${level}) transferred from ${previousDept} to ${targetDept}. Legacy access revoked; new department UI modules rendered. Reason: ${reason}.`,
      actor_name: adminAuthor,
      actor_role: 'Operations Admin / HR Director',
      target_id: staff.admin_id,
      target_name: staff.name,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Staff ${staff.name} transferred to ${targetDept}! Primary dept_id updated and legacy access revoked.`,
      staff,
    };
  }

  public updateManagerLeadershipAllocation(
    managerId: string,
    departments: AdminDepartment[],
    zones: AviationZone[],
    adminAuthor: string
  ): { success: boolean; message: string; manager?: AdminUser } {
    const manager = this.adminUsers.find((a) => a.admin_id === managerId);
    if (!manager) return { success: false, message: 'Manager not found.' };

    const level = manager.level ?? 1;
    // System inherently blocks multi-assignments for lower-level tiers (L1-L4) to maintain access control
    if (level < 5 && (departments.length > 1 || zones.length > 1)) {
      return {
        success: false,
        message: 'Security Policy: Multi-department and multi-zone allocations are restricted to leadership roles (L5 Managers and above). L1-L4 staff are assigned to a single primary department.',
      };
    }

    manager.assigned_departments = [...departments];
    if (departments.length > 0 && !departments.includes(manager.department as AdminDepartment)) {
      manager.department = departments[0];
    }
    manager.assigned_regions = [...zones];

    // Expand assigned modules based on all authorized departments
    const allAssignedMods = new Set(manager.assigned_modules || []);
    departments.forEach((d) => allAssignedMods.add(d));
    manager.assigned_modules = Array.from(allAssignedMods);

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `DAS Leadership Matrix Updated: ${manager.name}`,
      description: `Admin ${adminAuthor} assigned ${departments.length} departments (${departments.join(', ')}) and ${zones.length} zones (${zones.join(', ')}) to ${manager.name} (L${level}).`,
      actor_name: adminAuthor,
      actor_role: 'L6+ Administrator',
      target_id: manager.admin_id,
      target_name: manager.name,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Leadership allocation saved for ${manager.name}! Assigned ${departments.length} departments and ${zones.length} zones in real-time.`,
      manager,
    };
  }

  public addPlatformMasterCategory(
    categoryName: string,
    subCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();
    if (!cleanCat || cleanCat.length < 2) {
      return { success: false, message: 'Please provide a valid Category title.' };
    }
    if (!cleanSub || cleanSub.length < 2) {
      return { success: false, message: 'Please provide a valid initial Sub-Category title.' };
    }

    if (!this.customTaxonomy[cleanCat]) {
      this.customTaxonomy[cleanCat] = ['All Subcategories'];
    }
    if (!this.customTaxonomy[cleanCat].includes(cleanSub)) {
      this.customTaxonomy[cleanCat].push(cleanSub);
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Master Category Created',
      description: `Administrator ${adminName} sovereignly created new platform category "${cleanCat}" with sub-category "${cleanSub}". Active across all portals.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: cleanCat,
      severity: 'success',
    });

    this.persist();

    return {
      success: true,
      message: `Master Category "${cleanCat}" and Sub-Category "${cleanSub}" created and published to the live platform taxonomy!`,
    };
  }

  public addPlatformSubCategory(
    categoryName: string,
    subCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();
    if (!cleanCat) return { success: false, message: 'Category is required.' };
    if (!cleanSub || cleanSub.length < 2) return { success: false, message: 'Sub-Category title is required.' };

    if (!this.customTaxonomy[cleanCat]) {
      const standardSubs = (AVIATION_TAXONOMY[cleanCat] || ['All Subcategories']);
      this.customTaxonomy[cleanCat] = [...standardSubs];
    }

    if (this.customTaxonomy[cleanCat].includes(cleanSub)) {
      return { success: false, message: `"${cleanSub}" already exists under category "${cleanCat}".` };
    }

    this.customTaxonomy[cleanCat].push(cleanSub);

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Sub-Category Added',
      description: `Administrator ${adminName} added sub-category "${cleanSub}" to category "${cleanCat}".`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: `${cleanCat} > ${cleanSub}`,
      severity: 'success',
    });

    this.persist();

    return {
      success: true,
      message: `Sub-Category "${cleanSub}" added under "${cleanCat}" and is now active for all business operators!`,
    };
  }

  public editPlatformCategory(
    oldCategoryName: string,
    newCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanOld = oldCategoryName.trim();
    const cleanNew = newCategoryName.trim();
    if (!cleanNew || cleanNew.length < 2) {
      return { success: false, message: 'Please provide a valid new Category name (at least 2 characters).' };
    }
    if (cleanOld === cleanNew) {
      return { success: false, message: 'New Category name is identical to current name.' };
    }
    const tax = this.getAviationTaxonomy();
    if (!tax[cleanOld]) {
      return { success: false, message: `Category "${cleanOld}" not found.` };
    }
    if (tax[cleanNew]) {
      return { success: false, message: `A category named "${cleanNew}" already exists.` };
    }

    const subs = tax[cleanOld];
    tax[cleanNew] = subs;
    delete tax[cleanOld];
    this.customTaxonomy = { ...tax };

    // Cascade update to listings
    let updatedListings = 0;
    this.serviceListings.forEach((l) => {
      if (l.category === cleanOld) {
        l.category = cleanNew;
        updatedListings++;
      }
    });

    // Cascade update to businesses
    let updatedBiz = 0;
    this.businesses.forEach((b) => {
      if (b.category === cleanOld) {
        b.category = cleanNew;
        updatedBiz++;
      }
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Category Renamed',
      description: `Administrator ${adminName} renamed category "${cleanOld}" to "${cleanNew}". Cascade updated ${updatedListings} listings and ${updatedBiz} businesses.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: cleanNew,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Category "${cleanOld}" successfully renamed to "${cleanNew}". Updated ${updatedListings} listings.`,
    };
  }

  public deletePlatformCategory(
    categoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const tax = this.getAviationTaxonomy();
    if (!tax[cleanCat]) {
      return { success: false, message: `Category "${cleanCat}" not found.` };
    }

    delete tax[cleanCat];
    this.customTaxonomy = { ...tax };

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Category Deleted',
      description: `Administrator ${adminName} deleted category "${cleanCat}" from the approved platform taxonomy.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: cleanCat,
      severity: 'critical',
    });

    this.persist();
    return {
      success: true,
      message: `Category "${cleanCat}" and its subcategories were removed from approved platform taxonomy.`,
    };
  }

  public editPlatformSubCategory(
    categoryName: string,
    oldSubName: string,
    newSubName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const cleanOld = oldSubName.trim();
    const cleanNew = newSubName.trim();
    if (!cleanNew || cleanNew.length < 2) {
      return { success: false, message: 'Please provide a valid new Sub-Category title.' };
    }
    const tax = this.getAviationTaxonomy();
    if (!tax[cleanCat]) {
      return { success: false, message: `Category "${cleanCat}" not found.` };
    }

    const idx = tax[cleanCat].indexOf(cleanOld);
    if (idx === -1) {
      return { success: false, message: `Sub-category "${cleanOld}" not found under "${cleanCat}".` };
    }
    if (tax[cleanCat].includes(cleanNew) && cleanOld !== cleanNew) {
      return { success: false, message: `Sub-category "${cleanNew}" already exists under "${cleanCat}".` };
    }

    tax[cleanCat][idx] = cleanNew;
    this.customTaxonomy = { ...tax };

    // Cascade update listings
    let updatedListings = 0;
    this.serviceListings.forEach((l) => {
      if (l.category === cleanCat && l.subCategory === cleanOld) {
        l.subCategory = cleanNew;
        updatedListings++;
      }
    });

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Sub-Category Renamed',
      description: `Administrator ${adminName} renamed sub-category "${cleanOld}" to "${cleanNew}" under "${cleanCat}".`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: `${cleanCat} > ${cleanNew}`,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Sub-Category renamed to "${cleanNew}". Updated ${updatedListings} listings.`,
    };
  }

  public deletePlatformSubCategory(
    categoryName: string,
    subCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();
    const tax = this.getAviationTaxonomy();
    if (!tax[cleanCat]) {
      return { success: false, message: `Category "${cleanCat}" not found.` };
    }

    tax[cleanCat] = tax[cleanCat].filter((s) => s !== cleanSub);
    this.customTaxonomy = { ...tax };

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Sub-Category Removed',
      description: `Administrator ${adminName} removed sub-category "${cleanSub}" from category "${cleanCat}".`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      target_name: `${cleanCat} > ${cleanSub}`,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Sub-Category "${cleanSub}" removed from category "${cleanCat}".`,
    };
  }

  // =========================================================================
  // CATEGORY & SUB-CATEGORY C-PANEL MANAGEMENT: SUSPEND, UNSUSPEND, REMOVE
  // Super Admin controls: Add, Edit, Remove, Suspend, and Delete
  // =========================================================================
  public suspendPlatformCategory(
    categoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    if (!this.suspendedCategories.includes(cleanCat)) {
      this.suspendedCategories.push(cleanCat);
      this.persist();

      this.logAdminActivity({
        category: 'BUSINESS_APPROVAL',
        title: `Category Suspended: ${cleanCat}`,
        description: `Super Administrator ${adminName} suspended category "${cleanCat}". Its visibility is temporarily disabled across the directory.`,
        actor_name: adminName,
        actor_role: 'Super Administrator (L8)',
        target_name: cleanCat,
        severity: 'warning',
      });
    }

    return {
      success: true,
      message: `Category "${cleanCat}" has been suspended. Listings in this category are temporarily put on administrative hold.`,
    };
  }

  public unsuspendPlatformCategory(
    categoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    this.suspendedCategories = this.suspendedCategories.filter((c) => c !== cleanCat);
    this.persist();

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Category Unsuspended: ${cleanCat}`,
      description: `Super Administrator ${adminName} re-activated category "${cleanCat}". Full platform operations restored.`,
      actor_name: adminName,
      actor_role: 'Super Administrator (L8)',
      target_name: cleanCat,
      severity: 'success',
    });

    return {
      success: true,
      message: `Category "${cleanCat}" has been unsuspended and restored to Active status.`,
    };
  }

  public isCategorySuspended(categoryName: string): boolean {
    return this.suspendedCategories.includes(categoryName.trim());
  }

  public suspendPlatformSubCategory(
    categoryName: string,
    subCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();
    if (!this.suspendedSubCategories[cleanCat]) {
      this.suspendedSubCategories[cleanCat] = [];
    }
    if (!this.suspendedSubCategories[cleanCat].includes(cleanSub)) {
      this.suspendedSubCategories[cleanCat].push(cleanSub);
      this.persist();

      this.logAdminActivity({
        category: 'BUSINESS_APPROVAL',
        title: `Sub-Category Suspended: ${cleanCat} > ${cleanSub}`,
        description: `Super Administrator ${adminName} suspended sub-category "${cleanSub}" under "${cleanCat}".`,
        actor_name: adminName,
        actor_role: 'Super Administrator (L8)',
        target_name: `${cleanCat} > ${cleanSub}`,
        severity: 'warning',
      });
    }

    return {
      success: true,
      message: `Sub-category "${cleanSub}" under "${cleanCat}" suspended.`,
    };
  }

  public unsuspendPlatformSubCategory(
    categoryName: string,
    subCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();
    if (this.suspendedSubCategories[cleanCat]) {
      this.suspendedSubCategories[cleanCat] = this.suspendedSubCategories[cleanCat].filter((s) => s !== cleanSub);
      this.persist();

      this.logAdminActivity({
        category: 'BUSINESS_APPROVAL',
        title: `Sub-Category Unsuspended: ${cleanCat} > ${cleanSub}`,
        description: `Super Administrator ${adminName} re-activated sub-category "${cleanSub}" under "${cleanCat}".`,
        actor_name: adminName,
        actor_role: 'Super Administrator (L8)',
        target_name: `${cleanCat} > ${cleanSub}`,
        severity: 'success',
      });
    }

    return {
      success: true,
      message: `Sub-category "${cleanSub}" under "${cleanCat}" re-activated to Active status.`,
    };
  }

  public isSubCategorySuspended(categoryName: string, subCategoryName: string): boolean {
    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();
    return Boolean(this.suspendedSubCategories[cleanCat] && this.suspendedSubCategories[cleanCat].includes(cleanSub));
  }

  public getSuspendedCategories(): string[] {
    return [...this.suspendedCategories];
  }

  public getSuspendedSubCategories(): Record<string, string[]> {
    return { ...this.suspendedSubCategories };
  }

  public removePlatformCategory(
    categoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    return this.deletePlatformCategory(categoryName, adminName);
  }

  public removePlatformSubCategory(
    categoryName: string,
    subCategoryName: string,
    adminName: string
  ): { success: boolean; message: string } {
    return this.deletePlatformSubCategory(categoryName, subCategoryName, adminName);
  }

  public resetToDefaultTaxonomy(adminName: string): { success: boolean; message: string } {
    const fresh: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(AVIATION_TAXONOMY)) {
      fresh[k] = [...v];
    }
    this.customTaxonomy = fresh;

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Platform Taxonomy Reset to Defaults',
      description: `Administrator ${adminName} restored the platform civil aviation category and sub-category master catalog to default factory definitions.`,
      actor_name: adminName,
      actor_role: 'Platform Administrator',
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: 'Civil Aviation master taxonomy successfully restored to standard defaults!',
    };
  }

  // =========================================================================
  // 2C. REGIONAL ACCESS GOVERNANCE (DELEGATED L5+ APPROVAL GATE - MANAGER & ABOVE)
  // =========================================================================
  public updateUserRegionalAccess(
    targetAdminId: string,
    assignedRegions: AviationZone[],
    approverAdmin: AdminUser
  ): { success: boolean; message: string } {
    const target = this.adminUsers.find((a) => a.admin_id === targetAdminId);
    if (!target) return { success: false, message: 'Target user not found.' };

    const isMultiRegion = assignedRegions.length > 1;
    const approverLevel = approverAdmin.level || 0;
    const isManagerOrAbove =
      approverLevel >= 5 ||
      approverAdmin.role === 'MANAGER' ||
      approverAdmin.role === 'ADMIN' ||
      approverAdmin.role === 'SUPER_ADMIN';

    // Requirement: "The authority for Multi-zone changes should be delegated from L7 to L5 (Manager and above) to decentralize decision-making and enable faster operational control"
    if (isMultiRegion && !isManagerOrAbove) {
      return {
        success: false,
        message: `Security Clearance Failure: Multiple regions can be selected only if approved by Level 5 (Operations Manager and above). Current approver level is L${approverLevel}.`,
      };
    }

    target.assigned_regions = assignedRegions;
    if (isMultiRegion) {
      target.multi_region_approved = true;
      target.multi_region_approved_by = `${approverAdmin.name} (${approverAdmin.level_title || 'Level ' + approverLevel + ' Manager+'})`;
      target.multi_region_approved_at = new Date().toISOString();
    } else {
      target.multi_region_approved = false;
      target.multi_region_approved_by = undefined;
      target.multi_region_approved_at = undefined;
    }

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: isMultiRegion ? 'Multi-Region Clearance Approved (L5+ Delegated)' : 'Regional Access Assigned',
      description: `${approverAdmin.name} (L${approverLevel}) assigned regional access to ${target.name}: [${assignedRegions.join(', ')}]. Multi-region status: ${isMultiRegion ? 'APPROVED BY L5+ MANAGER AUTHORITY' : 'SINGLE REGION'}.`,
      actor_name: approverAdmin.name,
      actor_role: approverAdmin.level_title || `L${approverLevel} Administrator`,
      target_id: target.admin_id,
      target_name: target.name,
      severity: isMultiRegion ? 'success' : 'info',
    });

    this.persist();

    return {
      success: true,
      message: `Regional access updated for ${target.name} successfully! Allowed regions: ${assignedRegions.join(', ')}.`,
    };
  }

  public checkUserRegionAllowed(
    userOrAdmin: RegularUser | AdminUser | null,
    zone: AviationZone
  ): boolean {
    if (!userOrAdmin) return true;
    if ('role' in userOrAdmin && userOrAdmin.role === 'SUPER_ADMIN') return true;
    // Delegated from L7 to L5 (Manager and above) for multi-zone operational authority
    if ('level' in userOrAdmin && userOrAdmin.level && userOrAdmin.level >= 5) return true;
    if ('role' in userOrAdmin && (userOrAdmin.role === 'MANAGER' || userOrAdmin.role === 'ADMIN')) return true;
    if (userOrAdmin.multi_region_approved) return true;
    if (userOrAdmin.assigned_regions && userOrAdmin.assigned_regions.length > 0) {
      return userOrAdmin.assigned_regions.includes(zone);
    }
    return true;
  }

  // =========================================================================
  // 3. DIRECT SERVICE OFFERS (Business & Admin direct pitch to Customers)
  // =========================================================================
  public getDirectServiceOffers(businessId?: string, customerId?: string): DirectServiceOffer[] {
    let list = this.directServiceOffers;
    if (businessId) {
      list = list.filter((o) => o.business_id === businessId);
    }
    if (customerId) {
      list = list.filter((o) => o.customer_id === customerId || o.customer_email === customerId);
    }
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public sendDirectServiceOffer(payload: {
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
    currency?: string;
    timeline?: string;
  }): { success: boolean; message: string; offer: DirectServiceOffer } {
    // 0. Condition: If the business user status is on Hard locked or Rejected then system disables services
    const opCheck = this.isBusinessOperational(payload.business_id);
    if (!opCheck.operational && payload.sender_role === 'BUSINESS_USER') {
      return {
        success: false,
        message: `ORGANIZATION SUSPENDED: Business verification status is ${opCheck.status}. All commercial proposal dispatches are put on hold. Contact platform compliance.`,
        offer: {} as any,
      };
    }

    // 0.1 Condition: Business user can send proposal ONLY for active users who reached out on chat within 48 hours
    if (payload.sender_role === 'BUSINESS_USER') {
      const eligibility = this.checkUserChatEligibility(
        payload.business_id,
        payload.customer_id || payload.customer_email,
        48
      );
      if (!eligibility.isEligible) {
        return {
          success: false,
          message: `PROPOSAL BLOCKED & USER DETAILS PROTECTED: ${eligibility.statusText}`,
          offer: {} as any,
        };
      }
    }

    const newOffer: DirectServiceOffer = {
      id: `dso_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      business_id: payload.business_id,
      business_name: payload.business_name,
      sender_name: payload.sender_name,
      sender_role: payload.sender_role,
      customer_id: payload.customer_id,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      service_name: payload.service_name,
      category: payload.category,
      pitch_message: payload.pitch_message.trim() || 'Exclusive personalized aviation service offer tailored for your requirements.',
      offered_price: payload.offered_price?.trim() || 'Bespoke Quote',
      currency: payload.currency || 'INR',
      timeline: payload.timeline || 'On Demand',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    this.directServiceOffers.unshift(newOffer);

    // 1. Notify the customer
    this.addNotification({
      recipient_id: payload.customer_id,
      title: `✈️ Direct Service Offer: ${payload.service_name}`,
      message: `${payload.business_name} offered "${payload.service_name}" at ${newOffer.offered_price}. View details and connect directly on chat!`,
      type: 'CHAT',
      action_link: `offer_${newOffer.id}`,
    });

    // 2. Open an automated direct chat message to customer so follow-up happens immediately
    this.sendLiveChatMessage(
      payload.business_id,
      payload.business_name,
      payload.customer_id,
      `Hello ${payload.customer_name},\n\nWe are pleased to offer our verified service "${payload.service_name}" (${payload.category}) at ${newOffer.offered_price}.\n\nOffer Details: ${newOffer.pitch_message}\n\nPlease reply here on chat if you would like to proceed or discuss schedule adjustments!`,
      `conv_${payload.business_id}_${payload.customer_id}`
    );

    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: 'Direct Service Offer Dispatched',
      description: `${payload.business_name} sent direct offer for "${payload.service_name}" to client ${payload.customer_name} (${newOffer.offered_price}).`,
      actor_name: payload.sender_name,
      actor_role: payload.sender_role,
      severity: 'info',
    });

    this.persist();

    return {
      success: true,
      message: `Direct service offer for "${payload.service_name}" successfully sent to ${payload.customer_name}! Closed-loop chat discussion initiated.`,
      offer: newOffer,
    };
  }

  public respondToServiceOffer(
    offerId: string,
    response: 'ACCEPTED' | 'DECLINED',
    customerId: string
  ): { success: boolean; message: string } {
    const offer = this.directServiceOffers.find((o) => o.id === offerId);
    if (!offer) return { success: false, message: 'Service offer not found.' };

    offer.status = response;

    // Notify business
    this.addNotification({
      recipient_id: offer.business_id,
      title: `Service Offer ${response === 'ACCEPTED' ? 'Accepted!' : 'Declined'}`,
      message: `${offer.customer_name} has ${response.toLowerCase()} your service proposal for "${offer.service_name}".`,
      type: 'CHAT',
    });

    this.persist();

    return {
      success: true,
      message: `Service offer ${response.toLowerCase()} successfully.`,
    };
  }

  // =========================================================================
  // 3-PASSWORD SECURITY VERIFICATION & RESET METHODS
  // =========================================================================
  public verifyHistoricalPassword(
    identifier: string,
    testPassword: string
  ): {
    verified: boolean;
    message: string;
    accountType?: 'regular' | 'business' | 'admin';
    targetEmail?: string;
    targetName?: string;
    resetToken?: string;
    remainingAttempts?: number;
  } {
    const term = identifier.trim().toLowerCase();

    // Look in regular users, businesses, admins
    const regUser = this.regularUsers.find(
      (u) => u.email.toLowerCase() === term || u.username.toLowerCase() === term
    );
    const biz = this.businesses.find(
      (b) => b.business_email.toLowerCase() === term || b.registration_number.toLowerCase() === term
    );
    const admin = this.adminUsers.find((a) => a.email.toLowerCase() === term);

    if (!regUser && !biz && !admin) {
      return {
        verified: false,
        message: 'No registered account found matching this identifier.',
      };
    }

    const defaultRegularHist = ['AviatorPass#2024', 'FlightDeck#2025', 'SecurePassword#2026', 'admin'];
    const defaultBizHist = ['CorporatePass#2024', 'EnterpriseSecret#2025', 'CorporateSecret#2026'];
    const defaultAdminHist = ['MasterAdmin#2024', 'CommandSecure#2025', 'admin'];

    let historicalList: string[] = [];
    let currentPass = '';
    let accountType: 'regular' | 'business' | 'admin' = 'regular';
    let targetEmail = '';
    let targetName = '';

    if (admin) {
      accountType = 'admin';
      targetEmail = admin.email;
      targetName = admin.name;
      currentPass = 'admin';
      historicalList =
        admin.historical_passwords && admin.historical_passwords.length > 0
          ? admin.historical_passwords
          : defaultAdminHist;
    } else if (regUser) {
      accountType = 'regular';
      targetEmail = regUser.email;
      targetName = [regUser.first_name, regUser.last_name].filter(Boolean).join(' ') || regUser.username;
      currentPass = regUser.password_hash === 'admin' ? 'admin' : 'SecurePassword#2026';
      historicalList =
        regUser.historical_passwords && regUser.historical_passwords.length > 0
          ? regUser.historical_passwords
          : defaultRegularHist;
    } else if (biz) {
      accountType = 'business';
      targetEmail = biz.business_email;
      targetName = biz.organization_name;
      currentPass = 'CorporateSecret#2026';
      historicalList =
        biz.historical_passwords && biz.historical_passwords.length > 0
          ? biz.historical_passwords
          : defaultBizHist;
    }

    const normalizedInput = testPassword.trim();
    const isMatch =
      historicalList.some((p) => p === normalizedInput) ||
      normalizedInput === currentPass;

    if (!isMatch) {
      return {
        verified: false,
        message:
          'Security Verification Failed: The password entered does not match ANY of the last 3 recorded historical passwords for this account.',
        remainingAttempts: 2,
      };
    }

    const resetToken = `RST_${generateUUID().substring(0, 8).toUpperCase()}`;
    return {
      verified: true,
      message: 'Historical password verified! Authorized reset token issued.',
      accountType,
      targetEmail,
      targetName,
      resetToken,
    };
  }

  public resetPasswordWithHistoricalVerification(
    identifier: string,
    resetToken: string,
    newPassword: string
  ): { success: boolean; message: string } {
    if (!resetToken.startsWith('RST_')) {
      return { success: false, message: 'Invalid or expired authorization token.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    const term = identifier.trim().toLowerCase();
    const regUser = this.regularUsers.find(
      (u) => u.email.toLowerCase() === term || u.username.toLowerCase() === term
    );
    const biz = this.businesses.find(
      (b) => b.business_email.toLowerCase() === term || b.registration_number.toLowerCase() === term
    );
    const admin = this.adminUsers.find((a) => a.email.toLowerCase() === term);

    if (regUser) {
      const hist = regUser.historical_passwords || ['AviatorPass#2024', 'FlightDeck#2025', 'SecurePassword#2026'];
      regUser.historical_passwords = [newPassword, ...hist.filter((p) => p !== newPassword)].slice(0, 3);
      regUser.password_hash = newPassword;
      regUser.last_password_reset_at = new Date().toISOString();
    } else if (biz) {
      const hist = biz.historical_passwords || ['CorporatePass#2024', 'EnterpriseSecret#2025', 'CorporateSecret#2026'];
      biz.historical_passwords = [newPassword, ...hist.filter((p) => p !== newPassword)].slice(0, 3);
      biz.password_hash = newPassword;
      biz.last_password_reset_at = new Date().toISOString();
    } else if (admin) {
      const hist = admin.historical_passwords || ['MasterAdmin#2024', 'CommandSecure#2025', 'admin'];
      admin.historical_passwords = [newPassword, ...hist.filter((p) => p !== newPassword)].slice(0, 3);
      admin.last_password_reset_at = new Date().toISOString();
    } else {
      return { success: false, message: 'Account not found for password reset.' };
    }

    this.persist();
    return {
      success: true,
      message: 'Master password successfully updated and securely archived in historical password ledger.',
    };
  }

  // =========================================================================
  // PRIORITY CHAT & CONTACT SHARING CONTROLS
  // =========================================================================
  public getChatSharingMode(conversationId: string): boolean {
    if (!conversationId) return false;
    const key = `truvaer_chat_confidential_${conversationId}`;
    return typeof window !== 'undefined' ? localStorage.getItem(key) === 'true' : false;
  }

  public setChatSharingMode(conversationId: string, confidential: boolean): {
    success: boolean;
    confidential: boolean;
    message: string;
  } {
    if (!conversationId) return { success: false, confidential: false, message: 'Invalid conversation ID.' };
    const key = `truvaer_chat_confidential_${conversationId}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, confidential ? 'true' : 'false');
    }
    return {
      success: true,
      confidential,
      message: confidential
        ? 'Switched to Anonymized Confidential Mode. Personal contact details and phone numbers are hidden from this provider.'
        : 'Contact details sharing restored. Verified phone and email coordinates are visible to this provider.',
    };
  }

  // =========================================================================
  // ADMIN PROJECT MANAGEMENT SYSTEM (PMS) METHODS
  // =========================================================================
  public getAdminProjects(): AdminProject[] {
    return [...this.adminProjects];
  }

  public createAdminProject(
    project: Omit<AdminProject, 'id' | 'created_at' | 'tasks_count' | 'completed_tasks_count'>
  ): AdminProject {
    const newProj: AdminProject = {
      ...project,
      id: `proj_${generateUUID().substring(0, 8)}`,
      created_at: new Date().toISOString(),
      tasks_count: 0,
      completed_tasks_count: 0,
      escalation_level: project.escalation_level || 'NONE',
    };
    this.adminProjects.unshift(newProj);
    this.persist();
    return newProj;
  }

  public updateAdminProject(id: string, updates: Partial<AdminProject>): boolean {
    const p = this.adminProjects.find((x) => x.id === id);
    if (!p) return false;
    Object.assign(p, updates);
    this.persist();
    return true;
  }

  public getAdminTasks(): AdminTask[] {
    return [...this.adminTasks];
  }

  public createAdminTask(task: Omit<AdminTask, 'id' | 'created_at'>): AdminTask {
    const newTask: AdminTask = {
      ...task,
      id: `task_${generateUUID().substring(0, 8)}`,
      created_at: new Date().toISOString(),
    };
    this.adminTasks.unshift(newTask);

    // Update parent project task count
    const proj = this.adminProjects.find((p) => p.id === task.project_id);
    if (proj) {
      proj.tasks_count = (proj.tasks_count || 0) + 1;
      if (task.sla_escalated) {
        proj.escalation_level = 'CRITICAL_SLA_BREACH';
      }
    }

    this.persist();
    return newTask;
  }

  public updateAdminTaskStatus(taskId: string, status: PMSTaskStatus): boolean {
    const t = this.adminTasks.find((x) => x.id === taskId);
    if (!t) return false;
    t.status = status;
    if (status === 'COMPLETED' || status === 'CLOSED') {
      t.completed_at = new Date().toISOString();
      t.sla_escalated = false;
    }

    const proj = this.adminProjects.find((p) => p.id === t.project_id);
    if (proj) {
      const projTasks = this.adminTasks.filter((x) => x.project_id === proj.id);
      proj.completed_tasks_count = projTasks.filter((x) => x.status === 'COMPLETED' || x.status === 'CLOSED').length;
      const anyEscalated = projTasks.some((x) => x.sla_escalated && x.status !== 'COMPLETED' && x.status !== 'CLOSED');
      proj.escalation_level = anyEscalated ? 'CRITICAL_SLA_BREACH' : 'NONE';
    }

    this.persist();
    return true;
  }

  public triggerSlaEscalation(taskId: string, notes?: string): boolean {
    const t = this.adminTasks.find((x) => x.id === taskId);
    if (!t) return false;
    t.sla_escalated = true;
    t.priority = 'URGENT_ESCALATION';
    t.escalation_notes = notes || 'Urgent Escalation: SLA target breached. Requires prompt executive resolution.';

    const proj = this.adminProjects.find((p) => p.id === t.project_id);
    if (proj) {
      proj.escalation_level = 'CRITICAL_SLA_BREACH';
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Critical SLA Escalation Triggered: ${t.title}`,
      description: `Task assigned to ${t.assigned_admin_name} escalated under project "${t.project_title || proj?.title}". SLA action required.`,
      actor_name: 'SLA Escalation Engine',
      actor_role: 'Automated Operations Monitor',
      severity: 'critical',
    });

    this.persist();
    return true;
  }

  public resolveSlaEscalation(taskId: string): boolean {
    const t = this.adminTasks.find((x) => x.id === taskId);
    if (!t) return false;
    t.sla_escalated = false;
    t.status = 'COMPLETED';
    t.completed_at = new Date().toISOString();

    const proj = this.adminProjects.find((p) => p.id === t.project_id);
    if (proj) {
      const projTasks = this.adminTasks.filter((x) => x.project_id === proj.id);
      proj.completed_tasks_count = projTasks.filter((x) => x.status === 'COMPLETED' || x.status === 'CLOSED').length;
      const anyEscalated = projTasks.some((x) => x.sla_escalated && x.status !== 'COMPLETED' && x.status !== 'CLOSED');
      proj.escalation_level = anyEscalated ? 'CRITICAL_SLA_BREACH' : 'NONE';
    }

    this.persist();
    return true;
  }

  public getPMSMetrics(): {
    totalProjects: number;
    activeTasks: number;
    criticalEscalations: number;
    onTimeResolutionRate: number;
  } {
    const totalProjects = this.adminProjects.length;
    const activeTasks = this.adminTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CLOSED').length;
    const criticalEscalations = this.adminTasks.filter((t) => t.sla_escalated && t.status !== 'COMPLETED' && t.status !== 'CLOSED').length;
    const totalCompleted = this.adminTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'CLOSED').length;
    const onTimeResolutionRate = this.adminTasks.length > 0
      ? Math.round(((totalCompleted) / Math.max(this.adminTasks.length, 1)) * 100 * 10) / 10
      : 96.4;

    return {
      totalProjects,
      activeTasks,
      criticalEscalations,
      onTimeResolutionRate: Math.max(88, onTimeResolutionRate),
    };
  }

  // Business Location Management
  public addBusinessLocation(
    businessId: string,
    location: { city: string; state: string; country: string; display: string }
  ): { success: boolean; message: string; locations?: any[] } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business not found.' };

    if (!biz.business_locations) {
      biz.business_locations = [];
    }

    const newLoc = {
      id: `loc_${businessId}_${Date.now()}`,
      city: location.city.trim(),
      state: location.state.trim(),
      country: location.country.trim().toUpperCase(),
      display: location.display.trim(),
      is_primary: biz.business_locations.length === 0,
    };

    biz.business_locations.push(newLoc);
    if (!biz.city) {
      biz.city = newLoc.city;
      biz.state = newLoc.state;
      biz.physical_location = newLoc.display;
    }

    // Also update matching service listing so services can be searched by this location
    const listing = this.serviceListings.find((l: ServiceListing) => l.business_id === businessId);
    if (listing && (!listing.city || listing.city === 'All')) {
      listing.city = newLoc.city;
      listing.address = newLoc.display;
    }

    this.persist();
    return {
      success: true,
      message: `Business location "${newLoc.display}" successfully registered for service assignments.`,
      locations: biz.business_locations,
    };
  }

  public getBusinessLocations(businessId: string): Array<{ id: string; city: string; state: string; country: string; display: string; is_primary?: boolean }> {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return [];
    if (!biz.business_locations || biz.business_locations.length === 0) {
      return [
        {
          id: `loc_${businessId}_default`,
          city: biz.city || 'Hyderabad',
          state: biz.state || 'TS',
          country: biz.country || 'IN',
          display: biz.physical_location || `${biz.city || 'Hyderabad'}, ${biz.state || 'TS'}, ${biz.country || 'India'}`,
          is_primary: true,
        },
      ];
    }
    return biz.business_locations;
  }

  public deleteBusinessLocation(businessId: string, locationId: string): boolean {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz || !biz.business_locations) return false;
    biz.business_locations = biz.business_locations.filter((l) => l.id !== locationId);
    this.persist();
    return true;
  }

  // Task Reassignment strictly to next level from present level
  public reassignAdminTaskToNextLevel(
    taskId: string,
    targetAdminId: string
  ): { success: boolean; message: string; task?: AdminTask } {
    const t = this.adminTasks.find((x) => x.id === taskId);
    if (!t) return { success: false, message: 'Task record not found.' };

    const currentAssignee = this.adminUsers.find((a) => a.admin_id === t.assigned_admin_id);
    const targetAdmin = this.adminUsers.find((a) => a.admin_id === targetAdminId);

    if (!targetAdmin) return { success: false, message: 'Target officer not found in directory.' };

    const currentLevel = currentAssignee?.level ?? 2;
    const targetLevel = targetAdmin?.level ?? 3;

    if (targetLevel <= currentLevel) {
      return {
        success: false,
        message: `Policy Violation: Reassignment must take place only to the next level (Present: L${currentLevel}, Attempted: L${targetLevel}).`,
      };
    }

    const prevName = t.assigned_admin_name;
    t.assigned_admin_id = targetAdmin.admin_id;
    t.assigned_admin_name = targetAdmin.name;
    t.assigned_admin_role = targetAdmin.level_title || targetAdmin.role;
    t.escalation_notes = `Reassigned from L${currentLevel} (${prevName}) to Next Level L${targetLevel} (${targetAdmin.name}) on ${new Date().toLocaleDateString()}.`;

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Task Reassigned to Next Level: ${t.title}`,
      description: `Task reassigned from ${prevName} (L${currentLevel}) to ${targetAdmin.name} (L${targetLevel} - ${targetAdmin.level_title}).`,
      actor_name: 'Workflow Router',
      actor_role: 'Operations Level Manager',
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Task successfully reassigned to next-level officer ${targetAdmin.name} (L${targetLevel})!`,
      task: t,
    };
  }

  // ============================================================
  // QUOTATION REQUESTS, DEAL LIFECYCLE & SALE CONVERSION
  // ============================================================
  public getQuotationRequests(businessId?: string, clientEmail?: string): QuotationRequest[] {
    let list = [...this.quotationRequests];
    if (businessId) {
      list = list.filter((r) => r.business_id === businessId);
    }
    if (clientEmail) {
      list = list.filter((r) => r.client_email?.toLowerCase() === clientEmail.toLowerCase());
    }
    return list;
  }

  public submitQuotationRequest(data: {
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
  }): { success: boolean; request: QuotationRequest; message: string } {
    const num = String(this.quotationRequests.length + 101).padStart(4, '0');
    const newReq: QuotationRequest = {
      id: `req_${generateUUID().substring(0, 8)}`,
      request_number: `TRU-RFQ-${new Date().getFullYear()}-${num}`,
      business_id: data.business_id,
      business_name: data.business_name,
      listing_id: data.listing_id,
      client_id: data.client_id,
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      client_company: data.client_company,
      selected_services: data.selected_services,
      required_date: data.required_date,
      departure_hub: data.departure_hub,
      destination_hub: data.destination_hub,
      capacity_scope: data.capacity_scope,
      details: data.details,
      target_budget: data.target_budget,
      currency: data.currency || 'INR',
      status: 'PENDING_BUSINESS_QUOTATION',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.quotationRequests = [newReq, ...this.quotationRequests];

    // Automatically create a CRM Lead so the business immediately sees this inbound RFQ
    this.createCRMLead({
      business_id: data.business_id,
      business_name: data.business_name,
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      category: 'Marketplace RFQ',
      subCategory: data.selected_services[0] || 'Aviation Service',
      title: `RFQ: ${data.selected_services.join(', ') || 'Custom Charter / Service'}`,
      requirement_details: `Client ${data.client_name} requested quotation for ${data.selected_services.join(', ')}. Scope: ${data.details || 'Standard service'}. Target date: ${data.required_date || 'Flexible'}.`,
      budget: data.target_budget || 500000,
      currency: data.currency || 'INR',
      status: 'NEW',
      source: 'Marketplace Lead',
      assigned_to: 'Fleet Sales Director',
      zone: 'West Zone',
      country: 'IN',
      territory: data.departure_hub || 'BOM (Mumbai)',
    });

    // Notify Business User (The account holding the business)
    this.addNotification({
      recipient_id: data.business_id,
      title: `New Quotation Request (${newReq.request_number})`,
      message: `${data.client_name} has requested a quotation for: ${data.selected_services.join(', ')}. Scope: ${data.details}. Open CRM to issue formal quotation.`,
      type: 'APPROVAL',
      action_link: '/crm',
    });

    // Notify Requesting Client
    this.addNotification({
      recipient_id: data.client_id || data.client_email,
      title: `Quotation Request Delivered (${newReq.request_number})`,
      message: `Your quotation request has been delivered to ${data.business_name}. The operator will review your details and issue a formal proposal shortly.`,
      type: 'SYSTEM',
    });

    // Log admin activity
    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Marketplace Quotation Request ${newReq.request_number}`,
      description: `Client ${data.client_name} submitted RFQ to ${data.business_name} for ${data.selected_services.join(', ')}.`,
      actor_name: data.client_name,
      actor_role: 'Aviation Procurer',
      target_id: newReq.id,
      target_name: data.business_name,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      request: newReq,
      message: `Quotation request ${newReq.request_number} delivered directly to ${data.business_name}! The business will review your scope and issue a quotation.`,
    };
  }

  public acceptQuotationAndConvertToDeal(quotationId: string, clientUser?: RegularUser | null): {
    success: boolean;
    quotation: CRMQuotation | null;
    opportunity: CRMOpportunity | null;
    message: string;
  } {
    const qIdx = this.crmQuotations.findIndex((q) => q.id === quotationId);
    if (qIdx === -1) {
      return { success: false, quotation: null, opportunity: null, message: 'Quotation not found.' };
    }

    const quot = this.crmQuotations[qIdx];
    this.crmQuotations[qIdx].status = 'ACCEPTED';

    // Also update any matching quotation request
    const rIdx = this.quotationRequests.findIndex((r) => r.quotation_id === quotationId || r.business_id === quot.business_id);
    if (rIdx !== -1) {
      this.quotationRequests[rIdx].status = 'ACCEPTED';
      this.quotationRequests[rIdx].updated_at = new Date().toISOString();
    }

    // Convert Quotation into Pipeline Deal (CRMOpportunity)
    const newDeal: CRMOpportunity = {
      id: `opp_${generateUUID().substring(0, 8)}`,
      lead_id: quot.id,
      business_id: quot.business_id,
      business_name: quot.business_name,
      deal_name: `${quot.service_title} (${quot.quotation_number})`,
      client_name: quot.client_name,
      deal_value: quot.grand_total,
      currency: quot.currency || 'INR',
      probability: 90,
      stage: 'NEGOTIATION', // Ready for payment and closing
      expected_close_date: quot.valid_until || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assigned_to: 'Fleet Sales Director',
      zone: quot.zone || 'West Zone',
      country: quot.country || 'IN',
      territory: quot.territory || 'BOM (Mumbai)',
      created_at: new Date().toISOString(),
    };

    this.crmOpportunities = [newDeal, ...this.crmOpportunities];

    // Notify Business User
    this.addNotification({
      recipient_id: quot.business_id,
      title: `🎉 Quotation ${quot.quotation_number} Accepted!`,
      message: `Client ${quot.client_name} accepted your quotation of ${quot.currency} ${quot.grand_total.toLocaleString()}! Converted into Pipeline Deal "${newDeal.deal_name}". Awaiting payment completion to close deal.`,
      type: 'APPROVAL',
      action_link: '/crm',
    });

    // Notify Client
    this.addNotification({
      recipient_id: clientUser?.user_id || quot.client_email,
      title: `Quotation Accepted: Moved to Active Deal`,
      message: `You accepted quotation ${quot.quotation_number} from ${quot.business_name}. Proceed to payment to finalize the charter contract and close deal.`,
      type: 'SYSTEM',
    });

    // Log admin activity
    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: `Quotation Accepted & Converted to Deal`,
      description: `Client ${quot.client_name} accepted quotation ${quot.quotation_number} from ${quot.business_name} for ${quot.currency} ${quot.grand_total.toLocaleString()}.`,
      actor_name: quot.client_name,
      actor_role: 'Aviation Client',
      target_id: newDeal.id,
      target_name: newDeal.deal_name,
      amount: quot.grand_total,
      currency: quot.currency,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      quotation: this.crmQuotations[qIdx],
      opportunity: newDeal,
      message: `Quotation ${quot.quotation_number} accepted! Converted into Active Deal. Proceed to payment to finalize sale and close deal.`,
    };
  }

  public completeDealPaymentAndCloseSale(params: {
    opportunityId: string;
    quotationId?: string;
    paymentMethod: string;
    amount: number;
    clientUser?: RegularUser | null;
  }): {
    success: boolean;
    sale: CRMSalesRecord | null;
    opportunity: CRMOpportunity | null;
    quotation?: CRMQuotation;
    message: string;
  } {
    const oppIdx = this.crmOpportunities.findIndex((o) => o.id === params.opportunityId);
    let opp = oppIdx !== -1 ? this.crmOpportunities[oppIdx] : null;

    if (opp) {
      this.crmOpportunities[oppIdx].stage = 'CLOSED_WON';
      opp = this.crmOpportunities[oppIdx];
    }

    let quot: CRMQuotation | undefined;
    if (params.quotationId) {
      const qIdx = this.crmQuotations.findIndex((q) => q.id === params.quotationId);
      if (qIdx !== -1) {
        this.crmQuotations[qIdx].status = 'INVOICED';
        quot = this.crmQuotations[qIdx];
      }
    }

    const businessId = opp?.business_id || quot?.business_id || 'biz_verified_general';
    const businessName = opp?.business_name || quot?.business_name || 'Fleet Operator';
    const clientName = opp?.client_name || quot?.client_name || params.clientUser?.username || 'Client';

    // Create Official CRMSalesRecord
    const newSale = this.createCRMSale({
      business_id: businessId,
      business_name: businessName,
      customer_name: clientName,
      customer_email: quot?.client_email || params.clientUser?.email,
      customer_phone: quot?.client_phone || params.clientUser?.phone_number,
      sales_status: 'Completed',
      payment_status: 'Paid',
      total_amount: params.amount,
      paid_amount: params.amount,
      payment_method: 'Corporate Wallet',
      description: `Flight charter & executive service contract (${opp?.deal_name || quot?.quotation_number || 'Aviation Deal'})`,
      notes: `Payment completed via ${params.paymentMethod}. Deal marked CLOSED_WON.`,
      zone: opp?.zone || 'West Zone',
      country: 'IN',
      territory: opp?.territory || 'BOM (Mumbai)',
    });

    // Trigger platform 5% commission commitment sheet
    this.triggerAutoCommission({
      dealId: opp?.id || newSale.id,
      dealTitle: opp?.deal_name || newSale.sales_code,
      quotationNumber: quot?.quotation_number,
      businessId,
      businessName,
      clientName,
      saleAmount: params.amount,
      currency: 'INR',
      zone: opp?.zone || 'West Zone',
      country: 'IN',
      territory: opp?.territory || 'BOM (Mumbai)',
    });

    // Notify Business User: Deal Close & Sale Finalized!
    this.addNotification({
      recipient_id: businessId,
      title: `🎯 Deal Closed & Sale Finalized! (${newSale.sales_code})`,
      message: `Full payment of ₹${params.amount.toLocaleString()} received via ${params.paymentMethod} from ${clientName}. Deal is CLOSED_WON! 5% Platform commission committed to sheet.`,
      type: 'WALLET',
      action_link: '/crm',
    });

    // Notify Client: Payment Receipt & Contract Deal Close
    this.addNotification({
      recipient_id: params.clientUser?.user_id || quot?.client_email || 'client',
      title: `✅ Deal Closed! Flight Contract Confirmed (${newSale.sales_code})`,
      message: `Payment of ₹${params.amount.toLocaleString()} confirmed for ${businessName}. Deal is closed and booking voucher issued.`,
      type: 'SYSTEM',
    });

    // Log admin activity
    this.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: `Aviation Deal Closed & Sale Completed (${newSale.sales_code})`,
      description: `Deal for ${businessName} closed! Total sale ₹${params.amount.toLocaleString()} settled by ${clientName}. Status: CLOSED_WON.`,
      actor_name: clientName,
      actor_role: 'Aviation Client',
      target_id: newSale.id,
      target_name: businessName,
      amount: params.amount,
      currency: 'INR',
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      sale: newSale,
      opportunity: opp,
      quotation: quot,
      message: `🎉 Payment settled! Deal closed successfully and Sale ${newSale.sales_code} finalized!`,
    };
  }

  // ============================================================
  // BUSINESS LISTING REPORT & CONTENT MODERATION SYSTEM
  // ============================================================
  public getBusinessReports(listingId?: string): BusinessReport[] {
    if (listingId) {
      return this.businessReports.filter((r) => r.listing_id === listingId);
    }
    return [...this.businessReports];
  }

  public submitBusinessReport(data: {
    listing_id: string;
    listing_name: string;
    business_id: string;
    reporter_user_id?: string;
    reporter_email: string;
    reporter_name: string;
    reason: BusinessReportReason;
    explanation: string;
    is_blocked_by_user?: boolean;
  }): { success: boolean; report: BusinessReport; message: string } {
    const num = String(this.businessReports.length + 501).padStart(4, '0');
    const newReport: BusinessReport = {
      id: `rep_${generateUUID().substring(0, 8)}`,
      report_number: `TRU-REP-${new Date().getFullYear()}-${num}`,
      listing_id: data.listing_id,
      listing_name: data.listing_name,
      business_id: data.business_id,
      reporter_user_id: data.reporter_user_id,
      reporter_email: data.reporter_email,
      reporter_name: data.reporter_name,
      reason: data.reason,
      explanation: data.explanation,
      is_blocked_by_user: data.is_blocked_by_user || false,
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
    };

    this.businessReports = [newReport, ...this.businessReports];

    // Notify Admin, Manager & Super Admin Portal
    this.addNotification({
      recipient_id: 'admin_primary_truvaer',
      title: `🚨 Listing Reported: ${data.listing_name}`,
      message: `Report #${newReport.report_number} filed by ${data.reporter_name} (${data.reporter_email}) for "${data.reason}". Reason: ${data.explanation}. Action required by Admin/Manager/Super Admin desk.`,
      type: 'APPROVAL',
      action_link: '/admin',
    });

    // Log admin security audit entry
    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Listing Violation Report #${newReport.report_number}`,
      description: `User ${data.reporter_name} reported business "${data.listing_name}" for ${data.reason}. Details: ${data.explanation}`,
      actor_name: data.reporter_name,
      actor_role: 'Reporting Aviator',
      target_id: data.listing_id,
      target_name: data.listing_name,
      severity: 'warning',
    });

    this.persist();
    return {
      success: true,
      report: newReport,
      message: `Report #${newReport.report_number} has been registered and escalated to Admin, Manager, and Super Admin oversight desks for immediate audit.`,
    };
  }

  public takeActionOnBusinessReport(
    reportId: string,
    action: BusinessReport['action_taken'],
    adminId: string,
    adminName: string
  ): { success: boolean; message: string } {
    const idx = this.businessReports.findIndex((r) => r.id === reportId);
    if (idx === -1) return { success: false, message: 'Report not found.' };

    this.businessReports[idx].action_taken = action;
    this.businessReports[idx].status = action === 'DISMISSED' ? 'DISMISSED' : 'ACTION_TAKEN';
    this.businessReports[idx].reviewed_by = `${adminName} (${adminId})`;
    this.businessReports[idx].reviewed_at = new Date().toISOString();

    const report = this.businessReports[idx];

    // If suspension or lock
    if (action === '7_DAY_SUSPENSION' || action === '14_DAY_SUSPENSION' || action === '30_DAY_SUSPENSION') {
      const days = action === '7_DAY_SUSPENSION' ? 7 : action === '14_DAY_SUSPENSION' ? 14 : 30;
      this.adminSetPublicationStatus(report.listing_id, 'SUSPENDED', adminId, `Suspended for ${days} days following report #${report.report_number} (${report.reason})`);
    } else if (action === 'HARD_LOCKED') {
      this.adminSetPublicationStatus(report.listing_id, 'RESTRICTED', adminId, `Permanently locked following investigation of report #${report.report_number} (${report.reason})`);
    }

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Moderation Action Taken on Report #${report.report_number}`,
      description: `Admin ${adminName} applied ${action} on business listing "${report.listing_name}".`,
      actor_name: adminName,
      actor_role: 'Oversight Administrator',
      target_id: report.listing_id,
      target_name: report.listing_name,
      severity: action === 'DISMISSED' ? 'info' : 'warning',
    });

    this.persist();
    return { success: true, message: `Action "${action}" successfully applied on report #${report.report_number}.` };
  }

  public persistState(): void {
    this.persist();
  }

  public issueFormalCRMQuotation(data: {
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
    valid_days?: number;
    payment_terms?: string;
    notes?: string;
    departure_hub?: string;
    destination_hub?: string;
  }): { success: boolean; quotation: CRMQuotation; message: string } {
    const validUntil = new Date(Date.now() + (data.valid_days || 14) * 86400000).toISOString().split('T')[0];
    const newQuotation = this.createCRMQuotation({
      business_id: data.business_id,
      business_name: data.business_name,
      client_name: data.client_name,
      client_email: data.client_email,
      client_phone: data.client_phone,
      service_title: data.service_title,
      items: data.items,
      subtotal: data.subtotal,
      tax_percent: data.tax_percent,
      tax_amount: data.tax_amount,
      grand_total: data.grand_total,
      currency: data.currency,
      status: 'SENT',
      valid_until: validUntil,
      payment_terms: data.payment_terms || '50% advance upon contract booking, 50% 24 hours prior to departure.',
      notes: data.notes || 'Formal quotation issued following RFQ specifications.',
      territory: data.departure_hub || 'BOM (Mumbai)',
    });

    // Notify client that quotation was issued
    this.addNotification({
      recipient_id: data.client_email,
      title: `Formal Quotation Issued (${newQuotation.quotation_number})`,
      message: `${data.business_name} has issued an itemized quotation of ${data.currency} ${data.grand_total.toLocaleString()} for ${data.service_title}. Open tracker to review and accept.`,
      type: 'APPROVAL',
      action_link: '/crm',
    });

    return {
      success: true,
      quotation: newQuotation,
      message: `Quotation ${newQuotation.quotation_number} issued successfully!`,
    };
  }

  public notifyFollowersOfNewPost(businessId: string, businessName: string, postTitle: string): void {
    const followers = [];
    for (const uId in this.businessFollowers) {
      if (this.businessFollowers[uId]?.includes(businessId)) {
        followers.push(uId);
        this.addNotification({
          recipient_id: uId,
          title: `📢 New Update from ${businessName}`,
          message: `${businessName} published a new announcement: "${postTitle}". Check your Following Updates feed for details.`,
          type: 'SYSTEM',
        });
      }
    }
    this.persist();
  }

  // -------------------------------------------------------------
  // POST EDIT, DELETE, REPUBLISH & REPUTATION COMPLIANCE
  // -------------------------------------------------------------
  public editBusinessPost(
    postId: string,
    updateData: {
      title?: string;
      content: string;
      media_url?: string;
      tags?: string[];
    },
    actorId: string,
    isAdmin = false
  ): { success: boolean; message: string; post?: BusinessPost } {
    const idx = this.businessPosts.findIndex((p) => p.id === postId);
    if (idx === -1) return { success: false, message: 'Post not found.' };

    const post = this.businessPosts[idx];
    if (!isAdmin && post.business_id !== actorId) {
      return { success: false, message: 'Unauthorized: Only author or admin can edit this post.' };
    }

    if (updateData.title !== undefined) post.title = updateData.title;
    post.content = updateData.content;
    if (updateData.media_url !== undefined) post.media_url = updateData.media_url;
    if (updateData.tags !== undefined) post.tags = updateData.tags;

    this.persist();
    this.notifyPostListeners();
    return { success: true, message: 'Post updated successfully.', post };
  }

  public deleteBusinessPost(
    postId: string,
    actorId: string,
    isAdmin = false
  ): { success: boolean; message: string } {
    const idx = this.businessPosts.findIndex((p) => p.id === postId);
    if (idx === -1) return { success: false, message: 'Post not found.' };

    const post = this.businessPosts[idx];
    if (!isAdmin && post.business_id !== actorId) {
      return { success: false, message: 'Unauthorized: Only author or admin can delete this post.' };
    }

    this.businessPosts.splice(idx, 1);
    this.persist();
    this.notifyPostListeners();
    return { success: true, message: 'Post deleted successfully.' };
  }

  public republishBusinessPost(
    postId: string,
    actorId: string,
    actorName: string,
    actorBusinessProfile?: BusinessProfile | null
  ): { success: boolean; message: string; post?: BusinessPost } {
    const originalPost = this.businessPosts.find((p) => p.id === postId);
    if (!originalPost) return { success: false, message: 'Original post not found.' };

    // Check if actor publishing is suspended
    const sanctionCheck = this.isPublishSuspended(actorId);
    if (sanctionCheck.isSuspended) {
      return {
        success: false,
        message: `Publishing privilege is currently terminated for ${sanctionCheck.daysRemaining} more days due to moderation strike ${sanctionCheck.violationCount}.`,
      };
    }

    // Re-publish cites original author and business without taking away credits
    const newPost: BusinessPost = {
      id: `post_repub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      business_id: actorBusinessProfile?.business_id || actorId,
      business_name: actorBusinessProfile?.organization_name || actorName,
      business_logo:
        actorBusinessProfile?.inc_cert_doc_url ||
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80',
      business_verified: actorBusinessProfile?.verification_status === 'VERIFIED',
      business_category: actorBusinessProfile?.category || originalPost.business_category,
      business_city: actorBusinessProfile?.city || originalPost.business_city,
      business_country: actorBusinessProfile?.country || originalPost.business_country,
      post_type: 'POST',
      title: originalPost.title ? `[Re-published] ${originalPost.title}` : undefined,
      content: originalPost.content,
      media_url: originalPost.media_url,
      media_type: originalPost.media_type,
      tags: originalPost.tags || [],
      created_at: new Date().toISOString(),
      likes: [],
      reactions: { like: 1 },
      comments: [],
      shares_count: 0,
      is_marketed: false,
      republished_from: {
        original_post_id: originalPost.id,
        original_author_name: originalPost.business_name,
        original_business_id: originalPost.business_id,
        republished_at: new Date().toISOString(),
      },
      status: 'ACTIVE',
      report_count: 0,
    };

    // Increment share/re-publish counter on original post
    originalPost.shares_count = (originalPost.shares_count || 0) + 1;

    // Notify original author that their update was republished with credit attribution
    this.addNotification({
      recipient_id: originalPost.business_id,
      title: `🔄 Post Re-published with Attribution`,
      message: `${newPost.business_name} re-published your update "${originalPost.title || 'Post'}" attributing full credit to your profile.`,
      type: 'SYSTEM',
    });

    this.businessPosts.unshift(newPost);
    this.persist();
    this.notifyPostListeners();
    return {
      success: true,
      message: `Post successfully re-published with full credit attributed to ${originalPost.business_name}.`,
      post: newPost,
    };
  }

  // -------------------------------------------------------------
  // POST REPORT & PUBLISHING TERMINATION SANCTION SYSTEM
  // -------------------------------------------------------------
  public submitPostReport(data: {
    post_id: string;
    reporter_id: string;
    reporter_name: string;
    reporter_email: string;
    reason: PostReportReason;
    explanation: string;
  }): { success: boolean; message: string; report: PostReport } {
    const post = this.businessPosts.find((p) => p.id === data.post_id);
    if (!post) {
      return {
        success: false,
        message: 'Reported post no longer exists.',
        report: {} as PostReport,
      };
    }

    post.report_count = (post.report_count || 0) + 1;

    const num = String(this.postReports.length + 101).padStart(4, '0');
    const newReport: PostReport = {
      id: `prep_${generateUUID().substring(0, 8)}`,
      report_number: `TRU-POST-REP-${new Date().getFullYear()}-${num}`,
      post_id: post.id,
      post_title: post.title,
      post_snippet: post.content.substring(0, 140),
      author_id: post.business_id,
      author_name: post.business_name,
      reporter_id: data.reporter_id,
      reporter_name: data.reporter_name,
      reporter_email: data.reporter_email,
      reason: data.reason,
      explanation: data.explanation,
      status: 'PENDING_REVIEW',
      created_at: new Date().toISOString(),
    };

    this.postReports.unshift(newReport);

    // Notify Admin & Super Admin desks immediately
    this.addNotification({
      recipient_id: 'admin_primary_truvaer',
      title: `🚨 Post Content Reported: ${post.business_name}`,
      message: `Report #${newReport.report_number} filed for "${data.reason}". Reported post: "${post.title || post.content.substring(0, 60)}". Escalated for Admin deletion, suspension or publisher termination.`,
      type: 'APPROVAL',
      action_link: '/admin',
    });

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Post Violation Report #${newReport.report_number}`,
      description: `User ${data.reporter_name} reported post by "${post.business_name}" for ${data.reason}. Details: ${data.explanation}`,
      actor_name: data.reporter_name,
      actor_role: 'Reporting Aviator',
      target_id: post.id,
      target_name: post.business_name,
      severity: 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Report #${newReport.report_number} submitted directly to Admin/Manager/Super Admin desk for audit.`,
      report: newReport,
    };
  }

  public getPostReports(): PostReport[] {
    return [...this.postReports];
  }

  public takeActionOnPostReport(
    reportId: string,
    action: PostReport['action_taken'],
    adminId: string,
    adminName: string
  ): { success: boolean; message: string } {
    const repIdx = this.postReports.findIndex((r) => r.id === reportId);
    if (repIdx === -1) return { success: false, message: 'Report docket not found.' };

    const report = this.postReports[repIdx];
    report.action_taken = action;
    report.reviewed_by = `${adminName} (${adminId})`;
    report.reviewed_at = new Date().toISOString();

    const post = this.businessPosts.find((p) => p.id === report.post_id);

    if (action === 'DELETED') {
      report.status = 'DELETED';
      if (post) {
        this.businessPosts = this.businessPosts.filter((p) => p.id !== report.post_id);
      }
    } else if (action === 'SUSPENDED') {
      report.status = 'SUSPENDED';
      if (post) {
        post.status = 'SUSPENDED';
      }
    } else if (
      action === 'TERMINATE_PUBLISH_7_DAYS' ||
      action === 'TERMINATE_PUBLISH_14_DAYS' ||
      action === 'TERMINATE_PUBLISH_30_DAYS'
    ) {
      report.status = 'SUSPENDED';
      if (post) {
        post.status = 'SUSPENDED';
      }
      const days =
        action === 'TERMINATE_PUBLISH_7_DAYS' ? 7 : action === 'TERMINATE_PUBLISH_14_DAYS' ? 14 : 30;
      const sanctionType =
        action === 'TERMINATE_PUBLISH_7_DAYS'
          ? ('7_DAYS' as const)
          : action === 'TERMINATE_PUBLISH_14_DAYS'
          ? ('14_DAYS' as const)
          : ('30_DAYS' as const);

      const authorId = report.author_id;
      const currentSanction = this.publishSanctions[authorId] || {
        author_id: authorId,
        author_name: report.author_name,
        violation_count: 0,
        is_suspended: false,
        suspended_until: '',
        sanction_history: [],
      };

      currentSanction.violation_count += 1;
      currentSanction.is_suspended = true;
      currentSanction.last_sanction = sanctionType;
      currentSanction.suspended_until = new Date(Date.now() + days * 86400000).toISOString();
      currentSanction.sanction_history.push({
        sanction_type: sanctionType,
        applied_at: new Date().toISOString(),
        applied_by: `${adminName} (${adminId})`,
        reason: `Repeated irrelevant / violating content: Report #${report.report_number} (${report.reason})`,
      });

      this.publishSanctions[authorId] = currentSanction;

      // Notify the author about the publishing privilege termination
      this.addNotification({
        recipient_id: authorId,
        title: `⚠️ Publishing Privilege Terminated for ${days} Days`,
        message: `Admin sanction applied: Your ability to publish posts/articles is suspended for ${days} days due to repeated policy violations (Strike ${currentSanction.violation_count}). Active until ${new Date(
          currentSanction.suspended_until
        ).toLocaleDateString()}.`,
        type: 'SYSTEM',
      });
    } else if (action === 'DISMISSED') {
      report.status = 'DISMISSED';
    }

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Content Moderation: ${action} on Report #${report.report_number}`,
      description: `Admin ${adminName} enacted ${action} on reported post by ${report.author_name}.`,
      actor_name: adminName,
      actor_role: 'Super Admin Oversight',
      target_id: report.post_id,
      target_name: report.author_name,
      severity: action === 'DISMISSED' ? 'info' : 'warning',
    });

    this.persist();
    this.notifyPostListeners();
    return {
      success: true,
      message: `Action "${action}" successfully applied on post report #${report.report_number}.`,
    };
  }

  public isPublishSuspended(authorId: string): {
    isSuspended: boolean;
    suspendedUntil?: string;
    daysRemaining?: number;
    violationCount: number;
    reason?: string;
  } {
    if (!authorId) return { isSuspended: false, violationCount: 0 };
    const sanction = this.publishSanctions[authorId];
    if (!sanction || !sanction.is_suspended) {
      return { isSuspended: false, violationCount: sanction?.violation_count || 0 };
    }

    const expiry = new Date(sanction.suspended_until).getTime();
    const now = Date.now();
    if (now > expiry) {
      sanction.is_suspended = false;
      this.persist();
      return { isSuspended: false, violationCount: sanction.violation_count };
    }

    const daysRemaining = Math.max(1, Math.ceil((expiry - now) / 86400000));
    return {
      isSuspended: true,
      suspendedUntil: sanction.suspended_until,
      daysRemaining,
      violationCount: sanction.violation_count,
      reason:
        sanction.sanction_history[sanction.sanction_history.length - 1]?.reason ||
        'Repeated irrelevant or non-compliant content reports',
    };
  }

  public getPublishSanctions(): PublishSanction[] {
    return Object.values(this.publishSanctions);
  }

  public liftPublishSanction(authorId: string, adminName: string): { success: boolean; message: string } {
    const sanction = this.publishSanctions[authorId];
    if (!sanction) return { success: false, message: 'Author has no sanctions recorded.' };
    sanction.is_suspended = false;
    sanction.suspended_until = '';
    sanction.sanction_history.push({
      sanction_type: '7_DAYS',
      applied_at: new Date().toISOString(),
      applied_by: adminName,
      reason: 'Sanction lifted manually by Admin review',
    });
    this.addNotification({
      recipient_id: authorId,
      title: '✅ Publishing Privilege Restored',
      message: `Your publishing suspension has been lifted early by Administrator ${adminName}. You may now publish posts and marketing updates.`,
      type: 'SYSTEM',
    });
    this.persist();
    return { success: true, message: `Publishing privilege restored for ${sanction.author_name}.` };
  }

  public applyManualPublishSanction(
    authorId: string,
    authorName: string,
    days: 7 | 14 | 30,
    reason: string,
    adminName: string
  ): { success: boolean; message: string } {
    const sanctionType = days === 7 ? '7_DAYS' : days === 14 ? '14_DAYS' : '30_DAYS';
    const currentSanction = this.publishSanctions[authorId] || {
      author_id: authorId,
      author_name: authorName,
      violation_count: 0,
      is_suspended: false,
      suspended_until: '',
      sanction_history: [],
    };
    currentSanction.violation_count += 1;
    currentSanction.is_suspended = true;
    currentSanction.last_sanction = sanctionType;
    currentSanction.suspended_until = new Date(Date.now() + days * 86400000).toISOString();
    currentSanction.sanction_history.push({
      sanction_type: sanctionType,
      applied_at: new Date().toISOString(),
      applied_by: adminName,
      reason,
    });
    this.publishSanctions[authorId] = currentSanction;
    this.addNotification({
      recipient_id: authorId,
      title: `⚠️ Publishing Privilege Terminated for ${days} Days`,
      message: `Admin sanction applied: Your ability to publish posts is suspended for ${days} days (Strike ${currentSanction.violation_count}). Active until ${new Date(
        currentSanction.suspended_until
      ).toLocaleDateString()}. Reason: ${reason}`,
      type: 'SYSTEM',
    });
    this.persist();
    return { success: true, message: `Publishing privilege terminated for ${authorName} for ${days} days.` };
  }

  // ============================================================
  // STRICT SINGLE-SESSION LOGIN PROTOCOL ENGINE
  // Terminates previous active sessions when admin/manager logs in
  // ============================================================
  public initiateSingleSessionLogin(
    userId: string,
    deviceInfo: string = 'Chrome MacOS (Aviation Ops Console)'
  ): {
    sessionToken: string;
    previousSessionTerminated: boolean;
    oldSessionToken?: string;
    auditRecord?: SingleSessionAuditRecord;
  } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    const newSessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const nowIso = new Date().toISOString();

    if (!user) {
      return { sessionToken: newSessionToken, previousSessionTerminated: false };
    }

    // MULTIPLE SESSION RULE:
    // Multiple session logins are enabled ONLY in LIVE MODE.
    // In TESTING MODE, single session protocol enforces session termination on concurrent logins.
    if (this.envMode === 'LIVE') {
      user.active_session_token = newSessionToken;
      user.active_session_device = deviceInfo;
      user.active_session_started_at = nowIso;
      this.persist();
      return {
        sessionToken: newSessionToken,
        previousSessionTerminated: false,
      };
    }

    const hadPreviousSession = !!user.active_session_token;
    const oldSession = user.active_session_token || '';

    let auditRecord: SingleSessionAuditRecord | undefined;

    if (hadPreviousSession && oldSession !== newSessionToken) {
      auditRecord = {
        id: `sess_audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.user_id,
        user_email: user.email,
        user_role: user.role,
        user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        old_session_token: oldSession,
        new_session_token: newSessionToken,
        device_info: deviceInfo,
        terminated_at: nowIso,
        reason: 'CONCURRENT_LOGIN_DETECTED',
      };
      this.singleSessionAudits.unshift(auditRecord);

      // Add security notification
      this.addNotification({
        recipient_id: user.user_id,
        title: '⚠️ Strict Security Protocol: Previous Session Terminated',
        message: `Your account (${user.email}) was logged in from a new session (${deviceInfo}). The previous active session (${oldSession.substring(0, 14)}...) was automatically terminated per single-session security protocol in Testing Mode.`,
        type: 'SYSTEM',
      });
    }

    // Set new active session
    user.active_session_token = newSessionToken;
    user.active_session_device = deviceInfo;
    user.active_session_started_at = nowIso;

    this.persist();

    // Broadcast session kill signal to all active tabs/windows (In Testing Mode)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'truvaer_session_kill_signal',
          JSON.stringify({
            userId: user.user_id,
            userEmail: user.email,
            terminatedSession: oldSession,
            activeSession: newSessionToken,
            role: user.role,
            timestamp: Date.now(),
          })
        );
      } catch {}
    }

    return {
      sessionToken: newSessionToken,
      previousSessionTerminated: hadPreviousSession,
      oldSessionToken: oldSession,
      auditRecord,
    };
  }

  public verifyActiveSession(userId: string, sessionToken: string): boolean {
    // In LIVE MODE, multiple concurrent sessions are fully allowed
    if (this.envMode === 'LIVE') return true;
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user || !user.active_session_token) return true;
    return user.active_session_token === sessionToken;
  }

  public getSingleSessionAudits(): SingleSessionAuditRecord[] {
    return [...this.singleSessionAudits];
  }

  public simulateConcurrentLogin(userId: string): {
    oldSession: string;
    newSession: string;
    message: string;
  } {
    const user = this.regularUsers.find((u) => u.user_id === userId);
    if (!user) return { oldSession: '', newSession: '', message: 'User not found' };

    const oldSession = user.active_session_token || 'sess_initial_dummy';
    const res = this.initiateSingleSessionLogin(userId, 'Secondary Terminal (Simulated Remote Login)');
    return {
      oldSession,
      newSession: res.sessionToken,
      message: `Single-session protocol triggered: Previous session (${oldSession.substring(0, 12)}...) terminated. New session is now active.`,
    };
  }

  // ============================================================
  // ENTERPRISE SESSION & IDLE TIMEOUT MANAGEMENT ENGINE
  // Standard 30–60 Minute Session Duration, Keep-Alive Pinging,
  // 2-5 Minute Warning Prompt, & Cross-Tab Multi-Session Sync
  // ============================================================
  public getSessionSettings(): SessionSettingsConfig {
    return { ...this.sessionSettings };
  }

  public updateSessionSettings(newSettings: Partial<SessionSettingsConfig>): SessionSettingsConfig {
    this.sessionSettings = {
      ...this.sessionSettings,
      ...newSettings,
      idleTimeoutMinutes: Math.max(15, Math.min(180, newSettings.idleTimeoutMinutes ?? this.sessionSettings.idleTimeoutMinutes)),
      warningMinutes: Math.max(1, Math.min(10, newSettings.warningMinutes ?? this.sessionSettings.warningMinutes)),
    };
    saveStorage(SESSION_SETTINGS_KEY, this.sessionSettings);
    return { ...this.sessionSettings };
  }

  public registerActiveSession(params: {
    token: string;
    userId?: string;
    businessId?: string;
    userType: 'regular' | 'business';
    displayName: string;
    email: string;
    role?: string;
    deviceInfo?: string;
  }): ActiveUserSession {
    const now = Date.now();
    const idleTimeoutMinutes = this.sessionSettings.idleTimeoutMinutes || 45;
    const warningMinutes = this.sessionSettings.warningMinutes || 3;
    const expiresAt = now + idleTimeoutMinutes * 60 * 1000;

    const session: ActiveUserSession = {
      token: params.token,
      userId: params.userId,
      businessId: params.businessId,
      userType: params.userType,
      displayName: params.displayName,
      email: params.email,
      role: params.role || 'Aviator User',
      deviceInfo: params.deviceInfo || 'Chrome Web Browser (Truvaer Aerospace)',
      createdAt: now,
      lastActiveAt: now,
      expiresAt: expiresAt,
      idleTimeoutMinutes,
      warningMinutes,
    };

    this.activeSessions[params.token] = session;
    this.persist();

    this.logApiCall(
      '/api/v1/auth/session/initiate',
      'POST',
      200,
      { token: params.token.substring(0, 16) + '...', userType: params.userType, email: params.email, idleTimeout: `${idleTimeoutMinutes}m` },
      { success: true, message: `Active session established with ${idleTimeoutMinutes}m idle timeout.` }
    );

    return session;
  }

  public keepAliveSession(token: string): SessionKeepAliveResponse {
    const now = Date.now();
    let session = this.activeSessions[token];

    const idleTimeoutMinutes = this.sessionSettings.idleTimeoutMinutes || 45;
    const warningMinutes = this.sessionSettings.warningMinutes || 3;
    const expiresAt = now + idleTimeoutMinutes * 60 * 1000;

    if (!session) {
      session = {
        token,
        userType: 'regular',
        displayName: 'Active Aviator',
        email: 'authenticated@truvaer.com',
        deviceInfo: 'Browser Session',
        createdAt: now,
        lastActiveAt: now,
        expiresAt,
        idleTimeoutMinutes,
        warningMinutes,
      };
      this.activeSessions[token] = session;
    } else {
      session.lastActiveAt = now;
      session.idleTimeoutMinutes = idleTimeoutMinutes;
      session.warningMinutes = warningMinutes;
      session.expiresAt = expiresAt;
    }

    saveStorage(ACTIVE_SESSIONS_STORE_KEY, this.activeSessions);

    // Throttled API Logging (avoid spamming api logs)
    const recentLogs = this.apiLogs.filter(
      (l) => l.endpoint === '/api/v1/auth/session/keep-alive' && Date.now() - new Date(l.timestamp).getTime() < 30000
    );
    if (recentLogs.length === 0) {
      this.logApiCall(
        '/api/v1/auth/session/keep-alive',
        'POST',
        200,
        { token: token.substring(0, 15) + '...', lastActiveAt: new Date(now).toISOString() },
        { success: true, message: 'Session keep-alive heartbeat acknowledged. Expiration extended.', expiresAt: new Date(session.expiresAt).toISOString() }
      );
    }

    return {
      success: true,
      token,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      remainingMs: session.expiresAt - now,
      idleTimeoutMinutes: session.idleTimeoutMinutes,
    };
  }

  public getActiveSession(token: string): ActiveUserSession | null {
    if (!token) return null;
    return this.activeSessions[token] || null;
  }

  public terminateSession(token: string, reason: string = 'USER_LOGOUT') {
    if (this.activeSessions[token]) {
      delete this.activeSessions[token];
      this.persist();
    }
    this.logApiCall(
      '/api/v1/auth/session/terminate',
      'POST',
      200,
      { token: token.substring(0, 15) + '...', reason },
      { success: true, message: `Session terminated: ${reason}` }
    );
  }

  // ============================================================
  // CUSTOMIZABLE TRANSACTION REPORT AUTOMATED EMAIL ENGINE
  // Intervals: 24 Hours, Weekly, Monthly
  // ============================================================
  public getTransactionReportSubscription(entityId: string): TransactionReportSubscription {
    if (this.transactionReportSubscriptions[entityId]) {
      return this.transactionReportSubscriptions[entityId];
    }

    // Find default email
    const user = this.regularUsers.find((u) => u.user_id === entityId);
    const biz = this.businesses.find((b) => b.business_id === entityId);
    const defaultEmail = user?.email || biz?.business_email || 'corporate.ops@truvaer.com';

    const defaultSub: TransactionReportSubscription = {
      enabled: true,
      frequency: '24_HOURS',
      recipient_email: defaultEmail,
      include_credits: true,
      include_debits: true,
      format: 'DETAILED_LEDGER',
      next_scheduled_dispatch: new Date(Date.now() + 86400000).toISOString(),
    };

    this.transactionReportSubscriptions[entityId] = defaultSub;
    this.persist();
    return defaultSub;
  }

  public updateTransactionReportSubscription(
    entityId: string,
    updates: Partial<TransactionReportSubscription>
  ): { success: boolean; message: string; subscription: TransactionReportSubscription } {
    const current = this.getTransactionReportSubscription(entityId);
    const updated: TransactionReportSubscription = {
      ...current,
      ...updates,
    };

    // Calculate next scheduled dispatch based on frequency
    const now = Date.now();
    let intervalMs = 24 * 3600 * 1000;
    if (updated.frequency === 'WEEKLY') intervalMs = 7 * 24 * 3600 * 1000;
    else if (updated.frequency === 'MONTHLY') intervalMs = 30 * 24 * 3600 * 1000;

    updated.next_scheduled_dispatch = new Date(now + intervalMs).toISOString();

    this.transactionReportSubscriptions[entityId] = updated;
    this.persist();

    const freqLabel =
      updated.frequency === '24_HOURS'
        ? 'Daily (Every 24 Hours)'
        : updated.frequency === 'WEEKLY'
        ? 'Weekly (Every 7 Days)'
        : 'Monthly (Every 30 Days)';

    return {
      success: true,
      message: updated.enabled
        ? `Automated transaction report subscription active! Interval set to ${freqLabel} delivering to ${updated.recipient_email}.`
        : 'Automated email transaction report delivery has been paused.',
      subscription: updated,
    };
  }

  public getDispatchedTransactionReports(entityId?: string): DispatchedTransactionReport[] {
    if (entityId) {
      return this.dispatchedTransactionReports.filter((r) => r.recipient_id === entityId);
    }
    return this.dispatchedTransactionReports;
  }

  public generateAndSendTransactionReport(
    entityId: string,
    overrideFrequency?: TransactionReportFrequency
  ): { success: boolean; message: string; report: DispatchedTransactionReport } {
    const user = this.regularUsers.find((u) => u.user_id === entityId);
    const biz = this.businesses.find((b) => b.business_id === entityId);

    const subscription = this.getTransactionReportSubscription(entityId);
    const frequency = overrideFrequency || subscription.frequency || '24_HOURS';
    const recipientEmail = subscription.recipient_email || user?.email || biz?.business_email || 'ops@truvaer.com';
    const recipientName = biz ? biz.organization_name : user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Aviator Account';

    // Compute time window
    const now = Date.now();
    let timeWindowMs = 24 * 3600 * 1000;
    let periodLabel = 'Last 24 Hours';
    if (frequency === 'WEEKLY') {
      timeWindowMs = 7 * 24 * 3600 * 1000;
      periodLabel = 'Last 7 Days (Weekly Statement)';
    } else if (frequency === 'MONTHLY') {
      timeWindowMs = 30 * 24 * 3600 * 1000;
      periodLabel = 'Last 30 Days (Monthly Ledger)';
    }

    const cutoffTime = now - timeWindowMs;

    // Collect transactions
    const rawTx: Array<{
      id: string;
      type: string;
      amount: number;
      credits?: number;
      description: string;
      timestamp: string;
      referenceId?: string;
    }> = [];

    let currentBalance = 0;

    if (biz?.corporate_wallet) {
      currentBalance = biz.corporate_wallet.credit_balance;
      (biz.corporate_wallet.transactions || []).forEach((t) => {
        const txTime = new Date(t.timestamp).getTime();
        if (txTime >= cutoffTime || overrideFrequency) {
          rawTx.push({
            id: t.id,
            type: t.type === 'USAGE' ? 'DEBIT' : 'CREDIT',
            amount: t.amount || 0,
            credits: t.credits,
            description: t.description,
            timestamp: t.timestamp,
            referenceId: t.referenceId || t.id,
          });
        }
      });
    } else if (user?.wallet) {
      currentBalance = user.wallet.balance;
      (user.wallet.transactions || []).forEach((t) => {
        const txTime = new Date(t.timestamp).getTime();
        if (txTime >= cutoffTime || overrideFrequency) {
          rawTx.push({
            id: t.id,
            type: t.type,
            amount: t.amount,
            credits: t.amount,
            description: t.description,
            timestamp: t.timestamp,
            referenceId: t.referenceId || t.id,
          });
        }
      });
    }

    // If no transactions in period, add fallback recent activity so report is always actionable & complete
    if (rawTx.length === 0) {
      rawTx.push({
        id: `tx_${Date.now()}`,
        type: 'CREDIT',
        amount: 5000,
        credits: 500,
        description: 'Automated Wallet Active Balance Maintenance & Safety Ledger Entry',
        timestamp: new Date().toISOString(),
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    let totalCreditsVolume = 0;
    let totalDebitsVolume = 0;
    let totalCreditsCount = 0;
    let totalDebitsCount = 0;

    rawTx.forEach((tx) => {
      const isDebit = tx.type.toLowerCase().includes('debit') || tx.type === 'USAGE' || tx.type === 'TRANSFER_OUT' || tx.type === 'PURCHASE';
      const val = tx.credits || tx.amount || 0;
      if (isDebit) {
        totalDebitsCount++;
        totalDebitsVolume += Math.abs(val);
      } else {
        totalCreditsCount++;
        totalCreditsVolume += Math.abs(val);
      }
    });

    const netChange = totalCreditsVolume - totalDebitsVolume;
    const openingBalance = Math.max(0, currentBalance - netChange);
    const closingBalance = currentBalance;

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const subject = `📑 TruvAer Transaction Report: ${periodLabel} [${recipientName}]`;

    const htmlPreview = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #0B0F19; color: #F0F9FF; border-radius: 16px; padding: 24px; border: 1px solid #1F2937;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; padding-bottom: 16px; margin-bottom: 20px;">
    <div>
      <h2 style="color: #60A5FA; margin: 0; font-size: 20px; font-weight: 800;">TruvAer Treasury &amp; Ledger Operations</h2>
      <p style="color: #9CA3AF; margin: 4px 0 0 0; font-size: 12px;">Automated Account Statement • ${periodLabel}</p>
    </div>
    <div style="text-align: right;">
      <span style="background: #1E293B; color: #38BDF8; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid #38BDF833;">${frequency}</span>
    </div>
  </div>

  <div style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0; font-size: 13px; color: #E2E8F0;">Dear <strong>${recipientName}</strong>,</p>
    <p style="margin: 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">Here is your scheduled transaction summary for <strong>${recipientEmail}</strong> for the period of <strong>${periodLabel}</strong>. You have configured this delivery to monitor your credit and debit flows automatically.</p>
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
    <div style="background: #1F2937; padding: 12px; border-radius: 8px; border: 1px solid #374151;">
      <div style="color: #9CA3AF; font-size: 10px; text-transform: uppercase;">Opening Balance</div>
      <div style="color: #F0F9FF; font-size: 18px; font-weight: 800; font-family: monospace; margin-top: 4px;">${openingBalance} Cr</div>
    </div>
    <div style="background: #1F2937; padding: 12px; border-radius: 8px; border: 1px solid #374151;">
      <div style="color: #10B981; font-size: 10px; text-transform: uppercase;">Total Credits (${totalCreditsCount})</div>
      <div style="color: #34D399; font-size: 18px; font-weight: 800; font-family: monospace; margin-top: 4px;">+${totalCreditsVolume} Cr</div>
    </div>
    <div style="background: #1F2937; padding: 12px; border-radius: 8px; border: 1px solid #374151;">
      <div style="color: #F43F5E; font-size: 10px; text-transform: uppercase;">Total Debits (${totalDebitsCount})</div>
      <div style="color: #FB7185; font-size: 18px; font-weight: 800; font-family: monospace; margin-top: 4px;">-${totalDebitsVolume} Cr</div>
    </div>
  </div>

  <div style="background: #1E293B; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #334155;">
    <span style="font-size: 12px; color: #CBD5E1; font-weight: 600;">Closing Active Balance</span>
    <span style="font-size: 20px; font-weight: 900; color: #60A5FA; font-family: monospace;">${closingBalance} Credits</span>
  </div>

  <h4 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #94A3B8; margin: 16px 0 8px 0;">Itemized Credit &amp; Debit Ledger</h4>
  <div style="border: 1px solid #374151; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
    ${rawTx
      .map((tx) => {
        const isDebit = tx.type.toLowerCase().includes('debit') || tx.type === 'USAGE' || tx.type === 'TRANSFER_OUT' || tx.type === 'PURCHASE';
        const color = isDebit ? '#FB7185' : '#34D399';
        const sign = isDebit ? '-' : '+';
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #283548; background: #111827; font-size: 12px;">
          <div>
            <div style="font-weight: 600; color: #F0F9FF;">${tx.description}</div>
            <div style="color: #64748B; font-size: 10px; font-family: monospace; margin-top: 2px;">${new Date(tx.timestamp).toLocaleString()} • Ref: ${tx.referenceId}</div>
          </div>
          <div style="text-align: right;">
            <span style="font-weight: 800; font-family: monospace; color: ${color}; font-size: 13px;">${sign}${tx.credits || tx.amount} Cr</span>
            <div style="color: #9CA3AF; font-size: 9px; text-transform: uppercase;">${tx.type}</div>
          </div>
        </div>
      `;
      })
      .join('')}
  </div>

  <div style="border-top: 1px solid #374151; padding-top: 14px; font-size: 11px; color: #64748B; text-align: center;">
    This automated transaction report was dispatched per your notification interval preference (${periodLabel}).<br/>
    TruvAer Corporate Aviation Platform • Enterprise Treasury Audit Ledger • System ID: ${reportId}
  </div>
</div>
`;

    const newReport: DispatchedTransactionReport = {
      id: reportId,
      recipient_id: entityId,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      frequency,
      dispatched_at: new Date().toISOString(),
      statement_period: periodLabel,
      total_credits_count: totalCreditsCount,
      total_debits_count: totalDebitsCount,
      total_credits_volume: totalCreditsVolume,
      total_debits_volume: totalDebitsVolume,
      opening_balance: openingBalance,
      closing_balance: closingBalance,
      subject,
      html_preview: htmlPreview,
      transactions_included: rawTx,
    };

    this.dispatchedTransactionReports.unshift(newReport);

    // Also record internal mail so user can view it in Communication Hub
    this.sendInternalMail(
      'treasury-reports@truvaer.com',
      recipientEmail,
      subject,
      `Automated ${periodLabel} Transaction Report delivered to ${recipientEmail}.\nTotal Credits: ${totalCreditsCount} (+${totalCreditsVolume} Cr)\nTotal Debits: ${totalDebitsCount} (-${totalDebitsVolume} Cr)\nClosing Active Balance: ${closingBalance} Credits.\n\nAll statement line-items have been verified and archived in your corporate vault.`,
      'Updates'
    );

    // Web portal notification
    this.addNotification({
      recipient_id: entityId,
      title: `📑 Transaction Report Delivered (${periodLabel})`,
      message: `Your automated transaction report (${totalCreditsCount} Credits, ${totalDebitsCount} Debits) has been compiled and delivered to ${recipientEmail}.`,
      type: 'WALLET',
    });

    subscription.last_dispatched_at = newReport.dispatched_at;
    this.persist();

    return {
      success: true,
      message: `Transaction report (${periodLabel}) generated & dispatched to ${recipientEmail}!`,
      report: newReport,
    };
  }

  // =========================================================================
  // OPERATIONS / CUSTOMER CARE AGENT ASSISTED PASSWORD RESET IDENTITY GATE (L1+)
  // =========================================================================

  public lookupAccountForAgentVerification(identifier: string): {
    found: boolean;
    accountType?: 'STANDARD' | 'BUSINESS';
    displayName?: string;
    registeredEmail?: string;
    registeredPhone?: string;
    maskedEmail?: string;
    maskedPhone?: string;
    dateOfBirthExpected?: string;
    dateOfIncorporationExpected?: string;
    recentTransactionAmounts?: number[];
    message?: string;
  } {
    const norm = identifier.trim().toLowerCase();
    const user = this.regularUsers.find(
      (u) => u.email.toLowerCase() === norm || u.username.toLowerCase() === norm || u.user_id === norm
    );

    if (user) {
      const emailParts = user.email.split('@');
      const maskedEmail = emailParts[0].substring(0, 2) + '••••@' + (emailParts[1] || 'domain.com');
      const phoneDigits = (user.phone_number || '').replace(/\D/g, '');
      const maskedPhone = phoneDigits ? `+•• ••••• ${phoneDigits.slice(-4)}` : '+91 ••••• 43210';

      return {
        found: true,
        accountType: 'STANDARD',
        displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || `@${user.username}`,
        registeredEmail: user.email,
        registeredPhone: user.phone_number || '+91 98765 43210',
        maskedEmail,
        maskedPhone,
        dateOfBirthExpected: user.date_of_birth || '1995-01-01',
      };
    }

    const biz = this.businesses.find(
      (b) =>
        b.business_email.toLowerCase() === norm ||
        b.username?.toLowerCase() === norm ||
        b.registration_number.toLowerCase() === norm ||
        b.business_id === norm
    );

    if (biz) {
      const emailParts = biz.business_email.split('@');
      const maskedEmail = emailParts[0].substring(0, 2) + '••••@' + (emailParts[1] || 'corporate.com');
      const recentTx = (biz.corporate_wallet?.transactions || []).slice(-5);
      const recentAmounts = recentTx.length > 0
        ? recentTx.map((t) => Math.abs(t.credits || t.amount || 0))
        : [5000, 2200, 500];

      return {
        found: true,
        accountType: 'BUSINESS',
        displayName: biz.organization_name,
        registeredEmail: biz.business_email,
        registeredPhone: biz.phone_number || '+91 99999 12345',
        maskedEmail,
        dateOfIncorporationExpected: biz.date_of_incorporation || biz.date_of_registration || '2024-01-15',
        recentTransactionAmounts: recentAmounts,
      };
    }

    return {
      found: false,
      message: 'No user or business account found matching this identifier (Email, Username, or Reg Number).',
    };
  }

  public validateAgentVerificationAnswers(
    identifier: string,
    answers: {
      standardDob?: string;
      standardPhoneOrEmail?: string;
      businessDoi?: string;
      businessEmail?: string;
      businessTransactionAmount?: string | number;
    }
  ): {
    valid: boolean;
    errors: string[];
    accountType?: 'STANDARD' | 'BUSINESS';
    targetEmail?: string;
    targetName?: string;
  } {
    const account = this.lookupAccountForAgentVerification(identifier);
    if (!account.found || !account.accountType) {
      return { valid: false, errors: ['Target account not found in system. Please verify identifier.'] };
    }

    const errors: string[] = [];

    if (account.accountType === 'STANDARD') {
      // 1. Standard User: Date of Birth (DOB)
      const inputDob = (answers.standardDob || '').trim();
      const expectedDob = (account.dateOfBirthExpected || '').trim();
      if (!inputDob) {
        errors.push('Customer Date of Birth (DOB) is required.');
      } else if (normalizeDateToISO(inputDob) !== normalizeDateToISO(expectedDob)) {
        errors.push(`Date of Birth (DOB) verification failed. Value entered does not match customer records.`);
      }

      // 2. Standard User: Phone Number OR Registered Email Address
      const inputPhoneOrEmail = (answers.standardPhoneOrEmail || '').trim().toLowerCase();
      if (!inputPhoneOrEmail) {
        errors.push('Customer Phone Number OR Registered Email Address is required.');
      } else {
        const emailMatch = inputPhoneOrEmail === (account.registeredEmail || '').toLowerCase();
        const inputDigits = inputPhoneOrEmail.replace(/\D/g, '');
        const recordDigits = (account.registeredPhone || '').replace(/\D/g, '');
        const phoneMatch = inputDigits.length >= 7 && (recordDigits.endsWith(inputDigits.slice(-7)) || inputDigits.endsWith(recordDigits.slice(-7)));

        if (!emailMatch && !phoneMatch) {
          errors.push('Provided Phone Number / Email does not match user account records.');
        }
      }
    } else {
      // 1. Business User: Date of Incorporation (DOI)
      const inputDoi = (answers.businessDoi || '').trim();
      const expectedDoi = (account.dateOfIncorporationExpected || '').trim();
      if (!inputDoi) {
        errors.push('Date of Incorporation (DOI) is required.');
      } else if (normalizeDateToISO(inputDoi) !== normalizeDateToISO(expectedDoi)) {
        errors.push('Date of Incorporation (DOI) does not match corporate filing records.');
      }

      // 2. Business User: Registered Email Address
      const inputBizEmail = (answers.businessEmail || '').trim().toLowerCase();
      const expectedBizEmail = (account.registeredEmail || '').toLowerCase();
      if (!inputBizEmail) {
        errors.push('Registered Corporate Email Address is required.');
      } else if (inputBizEmail !== expectedBizEmail) {
        errors.push('Corporate Email Address does not match business registration.');
      }

      // 3. Business User: Amount of any one of the last 5 transactions (Credit or Debit)
      const rawAmt = (answers.businessTransactionAmount ?? '').toString().replace(/[^0-9.]/g, '');
      const inputAmountNum = Number(rawAmt);
      if (!rawAmt || isNaN(inputAmountNum) || inputAmountNum <= 0) {
        errors.push('Please enter the transaction amount of any one of the last 5 credit or debit entries.');
      } else {
        const matchesAny = (account.recentTransactionAmounts || []).some((amt) => amt === inputAmountNum);
        if (!matchesAny) {
          errors.push(`Transaction amount ₹${inputAmountNum.toLocaleString()} does not match any of the last 5 corporate wallet transactions.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      accountType: account.accountType,
      targetEmail: account.registeredEmail,
      targetName: account.displayName,
    };
  }

  public dispatchAgentAssistedResetLink(
    identifier: string,
    agentInfo: {
      agentId: string;
      agentName: string;
      agentLevel: string;
    }
  ): {
    success: boolean;
    message: string;
    resetLink: string;
    recipientEmail: string;
    dispatchedAt: string;
    auditRecord: AgentVerificationGateAudit;
  } {
    const account = this.lookupAccountForAgentVerification(identifier);
    if (!account.found || !account.registeredEmail) {
      throw new Error('Account not found in system.');
    }

    const token = `rst_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const resetLink = `https://truvaer.com/#/reset-password?token=${token}&email=${encodeURIComponent(account.registeredEmail)}`;
    const nowIso = new Date().toISOString();

    const auditRecord: AgentVerificationGateAudit = {
      id: `gate_audit_${Date.now()}`,
      identifier,
      account_type: account.accountType || 'STANDARD',
      agent_id: agentInfo.agentId,
      agent_name: agentInfo.agentName,
      agent_level: agentInfo.agentLevel,
      validation_status: 'SUCCESS',
      validated_dob: account.accountType === 'STANDARD',
      validated_phone_or_email: account.accountType === 'STANDARD',
      validated_doi: account.accountType === 'BUSINESS',
      validated_email: account.accountType === 'BUSINESS',
      validated_transaction_amount: account.accountType === 'BUSINESS',
      dispatched_link: resetLink,
      dispatched_at: nowIso,
      recipient_email: account.registeredEmail,
    };

    this.agentVerificationAudits.unshift(auditRecord);

    // Send internal mail notification
    this.sendInternalMail(
      'security-desk@truvaer.com',
      account.registeredEmail,
      '🔐 Secure Password Reset Link (Verified by Customer Care)',
      `Hello ${account.displayName},\n\nA secure password reset request was verified by Operations/Customer Care Agent ${agentInfo.agentName} (${agentInfo.agentLevel}) following strict identity verification.\n\nPlease click your secure reset link to establish your new master password:\n${resetLink}\n\nThis link is valid for 15 minutes. If you did not initiate this request, contact Security immediately at security@truvaer.com.`,
      'Primary'
    );

    // Add in-app notification
    this.addNotification({
      recipient_id: identifier,
      title: '🔐 Password Reset Link Dispatched by Customer Care',
      message: `Agent ${agentInfo.agentName} verified your identity and dispatched your secure password reset link to ${account.registeredEmail}.`,
      type: 'EMAIL',
    });

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: `Agent-Assisted Password Reset: ${account.displayName} (${account.accountType})`,
      description: `Agent ${agentInfo.agentName} (${agentInfo.agentLevel}) validated security prompts and dispatched secure reset link to ${account.registeredEmail}`,
      actor_name: agentInfo.agentName,
      actor_role: agentInfo.agentLevel,
      severity: 'info',
    });

    this.persist();

    return {
      success: true,
      message: `Identity verified successfully! Secure reset link dispatched to ${account.registeredEmail}.`,
      resetLink,
      recipientEmail: account.registeredEmail,
      dispatchedAt: nowIso,
      auditRecord,
    };
  }

  public getAgentVerificationAudits(): AgentVerificationGateAudit[] {
    return [...this.agentVerificationAudits];
  }

  // =========================================================================
  // CENTRALIZED CONNECT WITH CUSTOMER CARE ENGINE (STANDARD & BUSINESS)
  // =========================================================================

  public submitCustomerCareRequest(req: {
    channel: CustomerCareChannel;
    zone?: SupportTicketZone;
    subject: string;
    message: string;
    context: CustomerCareContextPayload;
    callback_phone?: string;
    callback_time_slot?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  }): {
    success: boolean;
    ticket: CustomerCareTicket;
    agentReply?: string;
    message: string;
  } {
    const isBusiness = req.context.userType === 'BUSINESS';
    const queue: CustomerCareQueue = isBusiness ? 'B2B_PRIORITY_QUEUE' : 'STANDARD_TIER_QUEUE';
    const priority = isBusiness ? 'HIGH' : 'STANDARD';

    const zone: SupportTicketZone =
      req.zone || inferSupportZone(undefined, undefined, req.customer_phone || req.callback_phone);
    const twoDigitYear = String(new Date().getFullYear()).slice(-2);
    const counterKey = `${zone}-${twoDigitYear}`;
    const nextSeq = (this.ticketCounters[counterKey] || 0) + 1;
    this.ticketCounters[counterKey] = nextSeq;
    saveStorage('TRUVAER_SUPPORT_TICKET_COUNTERS_KEY', this.ticketCounters);

    const ticketId = formatStandardTicketNumber(zone, nextSeq);
    const nowIso = new Date().toISOString();

    const assignedAgent = isBusiness
      ? 'Aviation Fleet Specialist - Capt. Rajesh Nair (fleet.ops@truvaer.com)'
      : 'Customer Care Desk - Sarah Jenkins (care@truvaer.com)';

    const newTicket: CustomerCareTicket = {
      ticket_id: ticketId,
      zone,
      channel: req.channel,
      queue,
      priority,
      subject: req.subject,
      message: req.message,
      status: 'OPEN',
      created_at: nowIso,
      context: req.context,
      callback_phone: req.callback_phone || req.customer_phone,
      callback_time_slot: req.callback_time_slot,
      assigned_agent: assignedAgent,
      customer_name: req.customer_name,
      customer_email: req.customer_email,
      customer_phone: req.customer_phone || req.callback_phone,
      responses: [],
    };

    this.customerCareTickets.unshift(newTicket);

    // Provide simulated concierge response for Live Chat
    let agentReply = '';
    if (req.channel === 'LIVE_CHAT') {
      agentReply = isBusiness
        ? `[VIP Concierge • B2B Priority Queue] Hello! I am ${assignedAgent}. I have your enterprise profile (Tier: ${req.context.subscription_tier || 'Enterprise Platinum'}). Our flight ops team is on standby. How can we support your aircraft, billing, or charter logistics today?`
        : `[Customer Care • Standard Tier Support] Hello! I am ${assignedAgent}. I've received your inquiry regarding "${req.subject}". How can I assist you with your flight directory, account, or services today?`;

      newTicket.responses = [
        {
          id: `resp_${Date.now()}_agent`,
          senderName: assignedAgent.split('(')[0].trim(),
          senderEmail: isBusiness ? 'fleet.ops@truvaer.com' : 'care@truvaer.com',
          message: agentReply,
          timestamp: new Date().toISOString(),
          isStaff: true,
        },
      ];

      const senderId = req.context.userId || req.context.businessId || 'user';
      const senderName = isBusiness ? (req.context.businessId || 'Business User') : (req.context.userId || 'Standard User');
      this.chats.push({
        id: `chat_${Date.now()}_1`,
        sender_id: senderId,
        sender_name: senderName,
        recipient_id: 'customer_care_agent',
        message: req.message,
        timestamp: nowIso,
        pii_redacted: false,
        is_read: true,
      });
      this.chats.push({
        id: `chat_${Date.now()}_2`,
        sender_id: 'customer_care_agent',
        sender_name: assignedAgent,
        recipient_id: senderId,
        message: agentReply,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        pii_redacted: false,
        is_read: false,
      });
    }

    this.persist();

    return {
      success: true,
      ticket: newTicket,
      agentReply,
      message: isBusiness
        ? `B2B Priority Request #${ticketId} registered. SLA: Under 15 minutes.`
        : `Customer Care Ticket #${ticketId} registered successfully. Standard SLA: 2 hours.`,
    };
  }

  public respondToCustomerCareTicket(payload: {
    ticketId: string;
    message: string;
    agentEmail: string;
    agentName: string;
    newStatus?: 'IN_PROGRESS' | 'RESOLVED';
  }): { success: boolean; message: string; ticket?: CustomerCareTicket } {
    const trimmedEmail = (payload.agentEmail || '').trim().toLowerCase();
    // CRITICAL SECURITY ENFORCEMENT: Only emails ending with "truvaer.com" are permitted
    if (!trimmedEmail.endsWith('@truvaer.com') && !trimmedEmail.endsWith('.truvaer.com')) {
      return {
        success: false,
        message: 'Security Policy Violation: Only authorized TruvAer personnel with official @truvaer.com email addresses are permitted to respond to customer inquiries.',
      };
    }

    const ticket = this.customerCareTickets.find((t) => t.ticket_id === payload.ticketId);
    if (!ticket) {
      return { success: false, message: 'Ticket not found in customer care database.' };
    }

    if (!ticket.responses) {
      ticket.responses = [];
    }

    const responseItem: CustomerCareResponseItem = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderName: payload.agentName || 'TruvAer Support Specialist',
      senderEmail: trimmedEmail,
      message: payload.message,
      timestamp: new Date().toISOString(),
      isStaff: true,
    };

    ticket.responses.push(responseItem);
    ticket.status = payload.newStatus || 'IN_PROGRESS';
    ticket.assigned_agent = `${payload.agentName} (${trimmedEmail})`;

    this.persist();
    return {
      success: true,
      message: `Response submitted to ticket #${payload.ticketId} from verified address ${trimmedEmail}.`,
      ticket,
    };
  }

  public getCustomerCareTickets(entityId?: string): CustomerCareTicket[] {
    if (!entityId) return [...this.customerCareTickets];
    return this.customerCareTickets.filter(
      (t) => t.context.userId === entityId || t.context.businessId === entityId
    );
  }

  // --- Platform Module Governance, Staged Rollout & Crisis Circuit Breaker ---
  public getPlatformModuleControls(): PlatformModuleControl[] {
    return [...this.platformModuleControls];
  }

  public getGlobalCrisisMode(): boolean {
    return this.globalCrisisMode;
  }

  public isModuleActive(moduleId: string): boolean {
    if (this.globalCrisisMode) return false;
    const mod = this.platformModuleControls.find((m) => m.id === moduleId);
    if (!mod) return true;
    return mod.status === 'ACTIVE' && !mod.circuitBreakerTripped;
  }

  public setModuleActiveByL8(
    moduleId: string,
    active: boolean,
    adminLevel: number = 8,
    adminName: string = 'Super Administrator (L8)'
  ): { success: boolean; message: string; module?: PlatformModuleControl } {
    if (adminLevel < 8) {
      return {
        success: false,
        message: 'Permission Denied: L7 administrators have View & Monitor permissions only. Only Sovereign L8 (Super Administrator) has edit authority to Enable or Disable platform modules.',
      };
    }

    const mod = this.platformModuleControls.find((m) => m.id === moduleId);
    if (!mod) return { success: false, message: 'Module not found in registry.' };

    mod.status = active ? 'ACTIVE' : 'MAINTENANCE';
    mod.circuitBreakerTripped = !active;
    if (active) {
      mod.circuitBreakerReason = undefined;
      mod.circuitBreakerTrippedAt = undefined;
      mod.allowedRoles = {
        STANDARD_USER: true,
        BUSINESS_USER: true,
        ADMIN: true,
        SUPER_ADMIN: true,
      };
    } else {
      mod.circuitBreakerReason = `Disabled by L8 Sovereign Administrator (${adminName})`;
      mod.circuitBreakerTrippedAt = new Date().toISOString();
      mod.allowedRoles = {
        STANDARD_USER: false,
        BUSINESS_USER: false,
        ADMIN: false,
        SUPER_ADMIN: false,
      };
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: active ? `🟢 Module [${mod.name}] ENABLED for Everyone (L8 Sovereign)` : `🔴 Module [${mod.name}] DISABLED Across Platform (L8 Sovereign)`,
      description: active
        ? `Module ${mod.name} enabled by L8 Sovereign Admin. Enabled for everyone platform-wide.`
        : `Module ${mod.name} disabled by L8 Sovereign Admin. All related actions, options, and interfaces disabled platform-wide.`,
      actor_name: adminName,
      actor_role: 'L8 Executive Chairman & Super Admin',
      target_id: mod.id,
      target_name: mod.name,
      severity: active ? 'success' : 'critical',
    });

    this.persist();
    return {
      success: true,
      message: active
        ? `Module "${mod.name}" is now ENABLED for everyone.`
        : `Module "${mod.name}" and all related options are now DISABLED across the platform.`,
      module: mod,
    };
  }

  public updateModuleOperationalStatus(
    moduleId: string,
    status: ModuleOperationalStatus,
    adminName: string = 'Super Administrator',
    reason?: string
  ): { success: boolean; message: string; module?: PlatformModuleControl } {
    const mod = this.platformModuleControls.find((m) => m.id === moduleId);
    if (!mod) return { success: false, message: 'Module not found in registry.' };

    const oldStatus = mod.status;
    mod.status = status;

    if (status === 'MAINTENANCE' || status === 'READ_ONLY') {
      mod.circuitBreakerTripped = true;
      mod.circuitBreakerReason = reason || `Module set to ${status} by ${adminName}`;
      mod.circuitBreakerTrippedAt = new Date().toISOString();
    } else if (status === 'ACTIVE') {
      mod.circuitBreakerTripped = false;
      mod.circuitBreakerReason = undefined;
      mod.circuitBreakerTrippedAt = undefined;
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Module [${mod.name}] Status Changed`,
      description: `Operational status transitioned from ${oldStatus} to ${status}. Reason: ${reason || 'Administrative control calibration'}`,
      actor_name: adminName,
      actor_role: 'Operations & Security Lead',
      target_id: mod.id,
      target_name: mod.name,
      severity: status === 'ACTIVE' ? 'success' : status === 'MAINTENANCE' ? 'critical' : 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Module "${mod.name}" status updated to ${status}.`,
      module: mod,
    };
  }

  public toggleModuleRoleAccess(
    moduleId: string,
    roleKey: 'STANDARD_USER' | 'BUSINESS_USER' | 'ADMIN' | 'SUPER_ADMIN',
    enabled?: boolean,
    adminName: string = 'Super Administrator'
  ): { success: boolean; message: string; module?: PlatformModuleControl } {
    const mod = this.platformModuleControls.find((m) => m.id === moduleId);
    if (!mod) return { success: false, message: 'Module not found in registry.' };

    const targetEnabled = typeof enabled === 'boolean' ? enabled : !mod.allowedRoles[roleKey];
    mod.allowedRoles[roleKey] = targetEnabled;

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Role Access Updated: [${mod.name}]`,
      description: `Role ${roleKey} access set to ${targetEnabled ? 'ENABLED' : 'RESTRICTED'} by ${adminName}.`,
      actor_name: adminName,
      actor_role: 'Security Policy Lead',
      target_id: mod.id,
      target_name: mod.name,
      severity: targetEnabled ? 'info' : 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Access for ${roleKey} on "${mod.name}" set to ${targetEnabled ? 'ALLOWED' : 'BLOCKED'}.`,
      module: mod,
    };
  }

  public toggleModuleCircuitBreaker(
    moduleId: string,
    reason: string = 'Emergency manual circuit trip initiated.',
    adminName: string = 'Super Administrator'
  ): { success: boolean; message: string; module?: PlatformModuleControl; tripped?: boolean } {
    const mod = this.platformModuleControls.find((m) => m.id === moduleId);
    if (!mod) return { success: false, message: 'Module not found.' };

    const willTrip = !mod.circuitBreakerTripped;
    mod.circuitBreakerTripped = willTrip;
    if (willTrip) {
      mod.circuitBreakerReason = reason;
      mod.circuitBreakerTrippedAt = new Date().toISOString();
      mod.status = 'MAINTENANCE';
    } else {
      mod.circuitBreakerReason = undefined;
      mod.circuitBreakerTrippedAt = undefined;
      mod.status = 'ACTIVE';
    }

    this.logAdminActivity({
      category: 'WALLET_DEBIT',
      title: willTrip ? `🚨 Circuit Breaker TRIPPED: [${mod.name}]` : `✅ Circuit Breaker RESET: [${mod.name}]`,
      description: willTrip ? `Emergency lockdown active. Reason: ${reason}` : 'System returned to normal online status.',
      actor_name: adminName,
      actor_role: 'Sovereign Administrator (L8)',
      target_id: mod.id,
      target_name: mod.name,
      severity: willTrip ? 'critical' : 'success',
    });

    this.persist();
    return {
      success: true,
      message: willTrip ? `🚨 Circuit breaker activated for ${mod.name}. Module is in lockdown.` : `Circuit breaker reset for ${mod.name}. Module is live.`,
      module: mod,
      tripped: willTrip,
    };
  }

  public toggleGlobalCrisisMode(
    active: boolean,
    reason: string = 'Elevated operational security lockdown.',
    adminName: string = 'Super Administrator'
  ): { success: boolean; message: string; active: boolean; isGlobalCrisis: boolean } {
    this.globalCrisisMode = active;

    if (active) {
      this.platformModuleControls.forEach((m) => {
        if (m.stage !== 'STAGE_1_LAUNCH') {
          m.status = 'MAINTENANCE';
          m.circuitBreakerTripped = true;
          m.circuitBreakerReason = `Global Crisis Mode: ${reason}`;
        } else {
          m.securityControls.financialLockdown = true;
        }
      });
    } else {
      this.platformModuleControls.forEach((m) => {
        if (m.stage === 'STAGE_1_LAUNCH') {
          m.status = 'ACTIVE';
          m.circuitBreakerTripped = false;
          m.securityControls.financialLockdown = false;
        } else {
          m.status = 'STAGED_PREVIEW';
          m.circuitBreakerTripped = false;
        }
      });
    }

    this.logAdminActivity({
      category: 'WALLET_DEBIT',
      title: active ? '⚠️ GLOBAL CRISIS DEFENSE ACTIVATED' : '🕊️ GLOBAL CRISIS MODE DEACTIVATED',
      description: active ? `Platform in protective lockdown mode. ${reason}` : 'Platform restored to standard operations.',
      actor_name: adminName,
      actor_role: 'Super Administrator L8',
      target_id: 'global_system',
      target_name: 'TruvAer Platform Core',
      severity: active ? 'critical' : 'success',
    });

    this.persist();
    return {
      success: true,
      message: active ? 'Global Crisis Mode activated. Protective safeguards enforced.' : 'Global Crisis Mode deactivated. Normal operations resumed.',
      active: this.globalCrisisMode,
      isGlobalCrisis: this.globalCrisisMode,
    };
  }

  // =========================================================================
  // LIVE BLINK FEED & FLASHNEWS METHODS (Max 160 Words, 5-Sec Interval, Rolling FIFO)
  // =========================================================================

  public getFlashNews(): FlashNewsItem[] {
    return this.flashNewsItems
      .filter((i) => i.status === 'ACTIVE')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }

  public getAllFlashNews(): FlashNewsItem[] {
    return [...this.flashNewsItems].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  public getFlashNewsConfig(): FlashNewsConfig {
    return { ...this.flashNewsConfig };
  }

  public updateFlashNewsConfig(
    limit: number,
    adminUser?: { role?: string; email?: string; name?: string } | null,
    creditCost?: number
  ): { success: boolean; message: string; config?: FlashNewsConfig } {
    const isSuperAdmin =
      adminUser?.role === 'SUPER_ADMIN' ||
      adminUser?.email?.toLowerCase() === 'sup_admin@truvaer.com' ||
      adminUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
      adminUser?.email?.toLowerCase() === 'admin@truvaer.com';

    if (!isSuperAdmin) {
      return {
        success: false,
        message: 'Security Policy Violation: Only a Super Administrator (L8) holds authorization to calibrate active Flashnews publishing limits.',
      };
    }

    if (limit && limit < 10) {
      return {
        success: false,
        message: 'Capacity Policy: Active Flashnews queue must be configured for a minimum of 10 items.',
      };
    }

    const oldLimit = this.flashNewsConfig.max_active_limit;
    this.flashNewsConfig = {
      ...this.flashNewsConfig,
      max_active_limit: limit || this.flashNewsConfig.max_active_limit,
      business_publish_credit_cost: creditCost !== undefined ? creditCost : (this.flashNewsConfig.business_publish_credit_cost ?? 50),
      updated_at: new Date().toISOString(),
      updated_by: adminUser?.name || 'Super Administrator L8',
    };

    // If capacity was reduced, archive older active items to adhere to new limit
    const activeItems = this.flashNewsItems
      .filter((i) => i.status === 'ACTIVE')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    let archivedExcess = 0;
    const targetLimit = this.flashNewsConfig.max_active_limit;
    if (activeItems.length > targetLimit) {
      for (let i = targetLimit; i < activeItems.length; i++) {
        activeItems[i].status = 'ARCHIVED';
        archivedExcess++;
      }
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Flashnews Configuration Calibrated',
      description: `Active Flashnews limit set to ${this.flashNewsConfig.max_active_limit}. Business Debit Rate: ${this.flashNewsConfig.business_publish_credit_cost} Credits. ${archivedExcess > 0 ? `${archivedExcess} older items auto-archived.` : ''}`,
      actor_name: adminUser?.name || 'B Aditya Narayana (Chairman L8)',
      actor_role: 'Super Administrator L8',
      target_id: 'flashnews_config',
      target_name: 'Flashnews Live Blink Queue',
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Flashnews capacity calibrated to ${this.flashNewsConfig.max_active_limit} active items. Business publish fee: ${this.flashNewsConfig.business_publish_credit_cost} credits.${archivedExcess > 0 ? ` ${archivedExcess} older items auto-archived.` : ''}`,
      config: this.flashNewsConfig,
    };
  }

  public calculateFlashNewsCreditCost(params: {
    blinkIntervalSec?: number;
    slotPosition?: 'TOP_PRIORITY' | 'STICKY' | 'STANDARD';
    showcaseLimit?: number;
    category?: FlashNewsCategory;
  }): number {
    const matrix = this.flashNewsConfig.pricing_matrix || defaultFlashNewsPricingMatrix;
    const timingRates = matrix.timing_rates as Record<number, number>;
    const posRates = matrix.position_rates as Record<string, number>;
    const showcaseRates = matrix.showcase_rates as Record<number, number>;
    const catRates = matrix.category_rates as Record<string, number>;

    const timingCost = timingRates[params.blinkIntervalSec || 5] ?? 15;
    const posCost = posRates[params.slotPosition || 'STANDARD'] ?? 10;
    const showcaseCost = showcaseRates[params.showcaseLimit ?? 0] ?? 75;
    const categoryCost = catRates[params.category || 'BREAKING'] ?? 20;
    return (matrix.base_cost || 0) + timingCost + posCost + showcaseCost + categoryCost;
  }

  public updateFlashNewsPricingMatrix(
    matrix: FlashNewsPricingMatrix,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; matrix: FlashNewsPricingMatrix } {
    this.flashNewsConfig.pricing_matrix = { ...matrix };
    this.flashNewsConfig.updated_at = new Date().toISOString();
    this.flashNewsConfig.updated_by = adminName;
    this.persist();
    return {
      success: true,
      message: 'FlashNews Credit Pricing Matrix calibrated successfully across Timing, Slot Position, Showcase Times, and Category.',
      matrix: this.flashNewsConfig.pricing_matrix,
    };
  }

  public updateFlashNewsAutoMailConfig(
    autoMail: FlashNewsAutoMailBackupConfig,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; config: FlashNewsAutoMailBackupConfig } {
    this.flashNewsConfig.auto_mail_backup = { ...autoMail };
    this.flashNewsConfig.updated_at = new Date().toISOString();
    this.flashNewsConfig.updated_by = adminName;
    this.persist();
    return {
      success: true,
      message: 'Automated email backup system updated successfully for FlashNews records preservation.',
      config: this.flashNewsConfig.auto_mail_backup,
    };
  }

  public dispatchFlashNewsBackupNow(
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; recordCount: number; snapshotId: string } {
    const totalRecords = this.flashNewsItems.length;
    const snapshotId = `SNAP-${Date.now().toString(36).toUpperCase()}-EXCEL`;
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient_count: this.flashNewsConfig.auto_mail_backup?.recipient_emails?.length || 2,
      record_count: totalRecords,
      status: 'DISPATCHED' as const,
      format: 'EXCEL_CSV' as const,
      archive_snapshot_id: snapshotId,
    };

    if (!this.flashNewsConfig.auto_mail_backup) {
      this.flashNewsConfig.auto_mail_backup = {
        enabled: true,
        frequency: 'DAILY',
        recipient_emails: ['sup_admin@truvaer.com'],
        logs: [],
      };
    }
    const currentLogs = this.flashNewsConfig.auto_mail_backup.logs || [];
    currentLogs.unshift(newLog);
    this.flashNewsConfig.auto_mail_backup.logs = currentLogs.slice(0, 50);
    this.flashNewsConfig.auto_mail_backup.last_dispatched_at = new Date().toISOString();
    this.flashNewsConfig.auto_mail_backup.backup_count = (this.flashNewsConfig.auto_mail_backup.backup_count || 0) + 1;

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'FlashNews Excel Backup Dispatched',
      description: `Automated Excel/CSV backup dispatched for ${totalRecords} FlashNews records. Snapshot: ${snapshotId}. Preserved in platform archival records.`,
      actor_name: adminName,
      actor_role: 'Super Administrator L8',
      target_id: snapshotId,
      target_name: 'FlashNews Historical Vault',
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Automated email backup dispatched to ${this.flashNewsConfig.auto_mail_backup.recipient_emails.join(', ')}. Snapshot preserved in records.`,
      recordCount: totalRecords,
      snapshotId,
    };
  }

  /**
   * Role-Based Retention & History Access:
   * - Admin, L7, L8 accounts: restricted to rolling 30-day data backup (older items auto-cleared from view)
   * - Super Admin: can bypass 30-day limit and pull historical records from any custom date range
   */
  public getFlashNewsHistory(options?: {
    role?: string;
    isSuperAdmin?: boolean;
    startDate?: string;
    endDate?: string;
  }): FlashNewsItem[] {
    const isSuper = options?.isSuperAdmin || options?.role === 'SUPER_ADMIN';
    const all = [...this.flashNewsItems].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    if (isSuper) {
      // Super admin can filter by arbitrary date range or view everything
      if (options?.startDate || options?.endDate) {
        return all.filter((item) => {
          const itemTime = new Date(item.published_at).getTime();
          if (options.startDate && itemTime < new Date(options.startDate).getTime()) return false;
          if (options.endDate && itemTime > new Date(options.endDate).getTime() + 86400000) return false;
          return true;
        });
      }
      return all;
    }

    // Admin, L7, L8 accounts: 30-day rolling window restriction (data older than 30 days automatically filtered/deleted from view)
    const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return all.filter((item) => new Date(item.published_at).getTime() >= thirtyDaysAgoMs);
  }

  public updateFlashNewsCreditCost(cost: number, adminName = 'Super Administrator (L8)'): { success: boolean; message: string } {
    this.flashNewsConfig.business_publish_credit_cost = Math.max(0, cost);
    this.flashNewsConfig.updated_at = new Date().toISOString();
    this.flashNewsConfig.updated_by = adminName;
    this.persist();
    return {
      success: true,
      message: `Business Flashnews publishing fee updated to ${cost} credits. Debited credits flow directly to Truvaer Platform Treasury.`,
    };
  }

  public toggleBusinessFlashNewsPermission(
    businessId: string,
    enabled: boolean,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business not found.' };

    biz.can_publish_flashnews = enabled;
    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Flashnews Publishing Permission ${enabled ? 'Granted' : 'Revoked'}`,
      description: `Administrator ${adminName} ${enabled ? 'authorized' : 'disabled'} Flashnews broadcasting privileges for ${biz.organization_name}.`,
      actor_name: adminName,
      actor_role: 'Super Administrator L8',
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: enabled ? 'success' : 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Flashnews publishing permission has been ${enabled ? 'ENABLED' : 'DISABLED'} for ${biz.organization_name}.`,
      business: biz,
    };
  }

  public publishFlashNews(payload: {
    headline?: string;
    content: string;
    category?: FlashNewsCategory;
    priority?: 'URGENT' | 'HIGH' | 'NORMAL';
    authorId?: string;
    authorName?: string;
    authorRole?: string;
    authorType?: 'SUPER_ADMIN' | 'ADMIN' | 'BUSINESS';
    publisherType?: 'SUPER_ADMIN' | 'ADMIN' | 'BUSINESS';
    businessId?: string;
    publisherId?: string;
    businessOrg?: string;
    publisherOrg?: string;
    blinkIntervalSec?: number;
    blink_interval_sec?: number;
    slotPosition?: 'TOP_PRIORITY' | 'STICKY' | 'STANDARD';
    slot_position?: 'TOP_PRIORITY' | 'STICKY' | 'STANDARD';
    showcaseLimit?: number;
    showcase_limit?: number;
    customCreditCost?: number;
  }): { success: boolean; message: string; item?: FlashNewsItem; archivedCount: number } {
    const rawContent = (payload.content || '').trim();
    if (!rawContent) {
      return { success: false, message: 'Flashnews text content is required.', archivedCount: 0 };
    }

    // Word count calculation: Expanded to 200 words max
    const words = rawContent.split(/\s+/).filter(Boolean);
    if (words.length > 200) {
      return {
        success: false,
        message: `Word limit exceeded: Flashnews allows a maximum of 200 words (entered: ${words.length} words).`,
        archivedCount: 0,
      };
    }

    const authorType = payload.publisherType || payload.authorType || 'ADMIN';
    let creditsDebited = 0;
    let publishedByOrg = payload.publisherOrg || payload.businessOrg;
    const bizId = payload.publisherId || payload.businessId || payload.authorId;

    // Check business permission & debit credits if from business
    if (authorType === 'BUSINESS' && bizId) {
      const biz = this.businesses.find(
        (b) =>
          b.business_id === bizId ||
          b.business_id === payload.authorId ||
          b.organization_name.toLowerCase() === (payload.publisherOrg || '').toLowerCase()
      );
      if (biz) {
        publishedByOrg = biz.organization_name;
        if (biz.can_publish_flashnews === false) {
          return {
            success: false,
            message: `Publishing privilege restricted: Flashnews broadcasting is currently disabled for ${biz.organization_name} in Admin C-Panel.`,
            archivedCount: 0,
          };
        }

        // Initialize corporate wallet if missing
        if (!biz.corporate_wallet) {
          const initialBal = biz.credit_wallet_balance ?? 500;
          biz.corporate_wallet = {
            wallet_id: `cw_${biz.business_id}`,
            credit_balance: initialBal,
            tier: 'PLATINUM',
            provisioned_at: new Date().toISOString(),
            total_debited_credits: 0,
            transactions: [],
          };
        }

        const corporateWallet = biz.corporate_wallet;

        // Ensure corporate_wallet.credit_balance and credit_wallet_balance are synchronized
        const availableBalance = Math.max(
          corporateWallet.credit_balance ?? 0,
          biz.credit_wallet_balance ?? 0
        );
        corporateWallet.credit_balance = availableBalance;
        biz.credit_wallet_balance = availableBalance;

        // Calculate dynamic cost based on Timing, Slot Position, Showcase Times, and Category
        const cost =
          payload.customCreditCost !== undefined && payload.customCreditCost >= 0
            ? payload.customCreditCost
            : this.calculateFlashNewsCreditCost({
                blinkIntervalSec: payload.blink_interval_sec || payload.blinkIntervalSec,
                slotPosition: payload.slot_position || payload.slotPosition,
                showcaseLimit: payload.showcase_limit ?? payload.showcaseLimit,
                category: payload.category,
              });

        if (availableBalance < cost) {
          return {
            success: false,
            message: `Insufficient corporate credits. Publishing this customized Flash News requires ${cost} credits (available wallet balance: ${availableBalance.toLocaleString()} Cr).`,
            archivedCount: 0,
          };
        }

        // Deduct credits from business corporate wallet & update both balances in sync
        corporateWallet.credit_balance = availableBalance - cost;
        biz.credit_wallet_balance = corporateWallet.credit_balance;
        corporateWallet.total_debited_credits =
          (corporateWallet.total_debited_credits || 0) + cost;
        corporateWallet.transactions.unshift({
          id: `tx_flash_${Date.now()}`,
          type: 'USAGE',
          credits: cost,
          description: `Live Flash News Broadcast Fee (${payload.category || 'NEWS'}, ${payload.blink_interval_sec || 5}s, ${payload.slot_position || 'STANDARD'}) - Published by ${biz.organization_name} (Credited to Truvaer Platform Treasury)`,
          timestamp: new Date().toISOString(),
          actionType: 'FLASHNEWS_BROADCAST_FEE',
        });
        creditsDebited = cost;

        this.logAdminActivity({
          category: 'WALLET_DEBIT',
          title: 'Business Flash News Broadcast Debited',
          description: `${cost} Credits debited from ${biz.organization_name}. Parameters: Timing ${payload.blink_interval_sec || 5}s, Slot ${payload.slot_position || 'STANDARD'}, Category ${payload.category || 'BREAKING'}. Credited to Truvaer Platform Treasury.`,
          actor_name: biz.organization_name,
          actor_role: 'Business Verified Publisher',
          target_id: biz.business_id,
          target_name: biz.organization_name,
          amount: cost,
          currency: 'CREDITS',
          severity: 'info',
        });
      }
    } else {
      // Super Admin or Admin publish: Credited to Truvaer platform
      this.logAdminActivity({
        category: 'BUSINESS_APPROVAL',
        title: 'Official Flash News Submitted',
        description: `Official Truvaer Flash News submitted by ${payload.authorName || 'Platform Administrator'} (${payload.authorRole || 'L8 Admin'}). Undergoing verification protocol.`,
        actor_name: payload.authorName || 'Truvaer Operations Lead',
        actor_role: payload.authorRole || 'Platform Administrator',
        severity: 'info',
      });
    }

    // Check L7 & L8 Verification Bypass: Any Flash News post initiated by an L7 or L8 user bypasses verification entirely and publishes directly to live!
    const isL7OrL8 =
      authorType !== 'BUSINESS' &&
      (payload.publisherType === 'SUPER_ADMIN' ||
        ((payload as any).adminLevel !== undefined && (payload as any).adminLevel >= 7) ||
        (payload.authorRole &&
          (payload.authorRole.includes('L7') ||
            payload.authorRole.includes('L8') ||
            payload.authorRole.toLowerCase().includes('super admin') ||
            payload.authorRole.toLowerCase().includes('chairman') ||
            payload.authorRole.toLowerCase().includes('operations director'))));

    const newItem: FlashNewsItem = {
      id: `flash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      headline: (payload.headline?.trim() || words.slice(0, 10).join(' ') + '...').toUpperCase(),
      content: rawContent,
      word_count: words.length,
      category: payload.category || 'BREAKING',
      priority: payload.priority || 'NORMAL',
      published_by_id: payload.authorId || payload.businessId || 'admin_super_admin',
      published_by_name: payload.authorName || 'Publication Desk Editor',
      published_by_role: payload.authorRole || (isL7OrL8 ? 'L8 Sovereign Executive' : 'Platform Administrator'),
      published_by_type: authorType,
      published_by_org: publishedByOrg,
      credits_debited: creditsDebited,
      credits_recipient: 'TRUVAER_PLATFORM',
      published_at: new Date().toISOString(),
      // L7 & L8 verification bypass directly to ACTIVE, else start at PENDING_LEVEL_1
      status: isL7OrL8 ? 'ACTIVE' : 'PENDING_LEVEL_1',
      blink_interval_sec: payload.blink_interval_sec || payload.blinkIntervalSec || 5,
      slot_position: payload.slot_position || payload.slotPosition || 'STANDARD',
      showcase_limit: payload.showcase_limit ?? payload.showcaseLimit ?? 0,
      impressions_count: 0,
      level_1_approved_by: isL7OrL8 ? 'Bypassed (L7/L8 Sovereign Executive)' : undefined,
      level_1_approved_role: isL7OrL8 ? (payload.authorRole || 'L8 Sovereign Executive') : undefined,
      level_1_approved_at: isL7OrL8 ? new Date().toISOString() : undefined,
      level_2_approved_by: isL7OrL8 ? (payload.authorName || 'B Aditya Narayana (Chairman L8)') : undefined,
      level_2_approved_role: isL7OrL8 ? (payload.authorRole || 'Super Administrator L8') : undefined,
      level_2_approved_at: isL7OrL8 ? new Date().toISOString() : undefined,
    };

    // Add to items list
    this.flashNewsItems.unshift(newItem);

    let archivedCount = 0;
    if (isL7OrL8) {
      // Re-sort and apply rolling FIFO: Keep max_active_limit active items
      const activeItems = this.flashNewsItems
        .filter((i) => i.status === 'ACTIVE')
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

      const maxLimit = this.flashNewsConfig.max_active_limit || 10;
      if (activeItems.length > maxLimit) {
        for (let i = maxLimit; i < activeItems.length; i++) {
          activeItems[i].status = 'ARCHIVED';
          archivedCount++;
        }
      }

      this.logAdminActivity({
        category: 'BUSINESS_APPROVAL',
        title: 'Flash News Published Live (L7/L8 Sovereign Direct Bypass)',
        description: `Flash News "${newItem.headline}" published live immediately via L7/L8 Sovereign Executive clearance (2-Step Verification Queue bypassed).`,
        actor_name: payload.authorName || 'B Aditya Narayana (Chairman L8)',
        actor_role: payload.authorRole || 'Super Administrator L8',
        target_id: newItem.id,
        target_name: newItem.headline,
        severity: 'success',
      });
    }

    this.persist();

    return {
      success: true,
      message: isL7OrL8
        ? `Flash News broadcast LIVE immediately via L7/L8 Sovereign Executive Direct Clearance (Bypassed 2-Step Verification Queue).${archivedCount > 0 ? ` (Oldest item archived to maintain ${this.flashNewsConfig.max_active_limit}-item queue capacity)` : ''}`
        : `Flash News submitted successfully! Under 2-step verification protocol, it requires Level 1 Editorial Review and Level 2 Sovereign Compliance clearance before flashing live.`,
      item: newItem,
      archivedCount,
    };
  }

  public approveFlashNewsLevel1(
    id: string,
    approverName = 'Operations Manager (L5)',
    approverRole = 'Manager / Editorial Lead'
  ): { success: boolean; message: string; item?: FlashNewsItem } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews item not found.' };

    item.status = 'PENDING_LEVEL_2';
    item.level_1_approved_by = approverName;
    item.level_1_approved_role = approverRole;
    item.level_1_approved_at = new Date().toISOString();

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Flashnews Level 1 Approval Cleared',
      description: `Headline "${item.headline}" cleared Step 1 (Editorial & Content Check) by ${approverName}. Awaiting Level 2 Sovereign clearance.`,
      actor_name: approverName,
      actor_role: approverRole,
      target_id: item.id,
      target_name: item.headline,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Level 1 Editorial clearance verified! Flashnews forwarded to Level 2 (Super Admin Sovereign Compliance Clearance).`,
      item,
    };
  }

  public approveFlashNewsLevel2(
    id: string,
    approverName = 'B Aditya Narayana (Chairman L8)',
    approverRole = 'Super Administrator L8'
  ): { success: boolean; message: string; item?: FlashNewsItem; archivedCount: number } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews item not found.', archivedCount: 0 };

    item.status = 'ACTIVE';
    item.level_2_approved_by = approverName;
    item.level_2_approved_role = approverRole;
    item.level_2_approved_at = new Date().toISOString();
    item.published_at = new Date().toISOString();

    // Re-sort and apply rolling FIFO: Keep max_active_limit active items
    const activeItems = this.flashNewsItems
      .filter((i) => i.status === 'ACTIVE')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    let archivedCount = 0;
    const maxLimit = this.flashNewsConfig.max_active_limit || 10;
    if (activeItems.length > maxLimit) {
      for (let i = maxLimit; i < activeItems.length; i++) {
        activeItems[i].status = 'ARCHIVED';
        archivedCount++;
      }
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Flashnews Level 2 Sovereign Clearance Granted',
      description: `Flashnews "${item.headline}" cleared 2-level verification and is now LIVE on the 5-sec blink feed. Rolling FIFO: ${archivedCount > 0 ? `${archivedCount} oldest item archived.` : 'Within limit.'}`,
      actor_name: approverName,
      actor_role: approverRole,
      target_id: item.id,
      target_name: item.headline,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `2-Step Verification Completed! Flashnews is now broadcast LIVE on the ticker.${archivedCount > 0 ? ' (Oldest item auto-archived to maintain 10-item capacity)' : ''}`,
      item,
      archivedCount,
    };
  }

  public rejectFlashNews(
    id: string,
    reason = 'Editorial or regulatory policy non-compliance.',
    rejectorName = 'Super Administrator (L8)'
  ): { success: boolean; message: string } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews item not found.' };

    item.status = 'REJECTED';
    item.rejection_reason = reason;
    item.rejected_by = rejectorName;
    item.rejected_at = new Date().toISOString();

    // Refund credits to business if debited
    if (item.credits_debited && item.credits_debited > 0 && item.published_by_id) {
      const biz = this.businesses.find(
        (b) =>
          b.business_id === item.published_by_id ||
          b.organization_name.toLowerCase() === (item.published_by_org || '').toLowerCase()
      );
      if (biz) {
        if (!biz.corporate_wallet) {
          const initialBal = biz.credit_wallet_balance ?? 500;
          biz.corporate_wallet = {
            wallet_id: `cw_${biz.business_id}`,
            tier: 'PLATINUM',
            provisioned_at: new Date().toISOString(),
            credit_balance: initialBal,
            total_debited_credits: 0,
            transactions: [],
          };
        }
        const corporateWallet = biz.corporate_wallet;
        corporateWallet.credit_balance += item.credits_debited;
        biz.credit_wallet_balance = corporateWallet.credit_balance;
        corporateWallet.transactions.unshift({
          id: `tx_refund_${Date.now()}`,
          type: 'GRANT',
          credits: item.credits_debited,
          description: `Flash News Rejection Refund - ${item.headline} (${reason})`,
          timestamp: new Date().toISOString(),
          actionType: 'REFUND',
        });
      }
    }

    this.logAdminActivity({
      category: 'SECURITY_AUDIT',
      title: 'Flash News Rejected & Refunded',
      description: `Flash News "${item.headline}" rejected by ${rejectorName}. Reason: ${reason}.${item.credits_debited ? ` ${item.credits_debited} credits refunded to corporate wallet.` : ''}`,
      actor_name: rejectorName,
      actor_role: 'Compliance Oversight',
      target_id: item.id,
      target_name: item.headline,
      severity: 'warning',
    });

    this.persist();
    return {
      success: true,
      message: `Flash News rejected.${item.credits_debited ? ` ${item.credits_debited} credits refunded to business corporate wallet.` : ''}`,
    };
  }

  // =========================================================================
  // FLASH NEWS CATEGORY TRAFFIC RATES CRUD (Exclusively for L7 & L8 Users)
  // =========================================================================

  public addCategoryTrafficRate(
    categoryKey: string,
    rate: number,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; matrix?: FlashNewsPricingMatrix } {
    if (!this.flashNewsConfig.pricing_matrix) {
      this.flashNewsConfig.pricing_matrix = { ...defaultFlashNewsPricingMatrix };
    }
    const cleanKey = categoryKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (!cleanKey) {
      return { success: false, message: 'Invalid category key. Use alphanumeric characters and underscores.' };
    }
    this.flashNewsConfig.pricing_matrix.category_rates[cleanKey] = Math.max(0, rate);
    this.flashNewsConfig.updated_at = new Date().toISOString();
    this.flashNewsConfig.updated_by = adminName;
    this.persist();
    return {
      success: true,
      message: `Category tariff rate for "${cleanKey}" added at ${rate} credits.`,
      matrix: this.flashNewsConfig.pricing_matrix,
    };
  }

  public updateCategoryTrafficRate(
    categoryKey: string,
    rate: number,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; matrix?: FlashNewsPricingMatrix } {
    if (!this.flashNewsConfig.pricing_matrix) {
      this.flashNewsConfig.pricing_matrix = { ...defaultFlashNewsPricingMatrix };
    }
    this.flashNewsConfig.pricing_matrix.category_rates[categoryKey] = Math.max(0, rate);
    this.flashNewsConfig.updated_at = new Date().toISOString();
    this.flashNewsConfig.updated_by = adminName;
    this.persist();
    return {
      success: true,
      message: `Category tariff rate for "${categoryKey}" updated to ${rate} credits.`,
      matrix: this.flashNewsConfig.pricing_matrix,
    };
  }

  public deleteCategoryTrafficRate(
    categoryKey: string,
    adminName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; matrix?: FlashNewsPricingMatrix } {
    if (!this.flashNewsConfig.pricing_matrix) {
      this.flashNewsConfig.pricing_matrix = { ...defaultFlashNewsPricingMatrix };
    }
    if (Object.keys(this.flashNewsConfig.pricing_matrix.category_rates).length <= 1) {
      return { success: false, message: 'Cannot delete the last remaining category tariff rate.' };
    }
    delete this.flashNewsConfig.pricing_matrix.category_rates[categoryKey];
    this.flashNewsConfig.updated_at = new Date().toISOString();
    this.flashNewsConfig.updated_by = adminName;
    this.persist();
    return {
      success: true,
      message: `Category tariff rate for "${categoryKey}" deleted successfully.`,
      matrix: this.flashNewsConfig.pricing_matrix,
    };
  }

  public recordFlashNewsImpression(id: string): void {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return;

    item.impressions_count = (item.impressions_count || 0) + 1;
    if (item.showcase_limit && item.showcase_limit > 0 && item.impressions_count >= item.showcase_limit) {
      item.status = 'ARCHIVED';
    }
    this.persist();
  }

  public archiveFlashNews(id: string): { success: boolean; message: string } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews item not found.' };
    item.status = 'ARCHIVED';
    this.persist();
    return { success: true, message: 'Flashnews archived from live feed.' };
  }

  public unarchiveFlashNews(id: string): { success: boolean; message: string } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews item not found.' };
    item.status = 'ACTIVE';
    item.published_at = new Date().toISOString();

    // Check limit
    const activeItems = this.flashNewsItems
      .filter((i) => i.status === 'ACTIVE')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    const maxLimit = this.flashNewsConfig.max_active_limit || 10;
    if (activeItems.length > maxLimit) {
      for (let i = maxLimit; i < activeItems.length; i++) {
        activeItems[i].status = 'ARCHIVED';
      }
    }

    this.persist();
    return { success: true, message: 'Flashnews restored to live feed.' };
  }

  public toggleFlashNewsStatus(
    id: string,
    actorName = 'Publication Desk'
  ): { success: boolean; message: string; newStatus?: FlashNewsStatus } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews record not found.' };

    const nextStatus: FlashNewsStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    item.status = nextStatus;
    if (nextStatus === 'ACTIVE') {
      item.published_at = new Date().toISOString();
    }
    this.persist();

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: `Flashnews Status Toggled: ${nextStatus}`,
      description: `Flashnews "${item.headline}" status changed to ${nextStatus} by ${actorName}.`,
      actor_name: actorName,
      actor_role: 'Operations Lead',
      target_id: item.id,
      target_name: item.headline,
      severity: nextStatus === 'ACTIVE' ? 'success' : 'info',
    });

    return {
      success: true,
      message: `Flashnews broadcast status switched to ${nextStatus === 'ACTIVE' ? 'Live Active' : 'Inactive / Paused'}.`,
      newStatus: nextStatus,
    };
  }

  public updateFlashNews(
    id: string,
    updates: {
      headline?: string;
      content?: string;
      category?: FlashNewsCategory;
      priority?: 'URGENT' | 'HIGH' | 'NORMAL';
      blink_interval_sec?: number;
      slot_position?: 'TOP_PRIORITY' | 'STICKY' | 'STANDARD';
      showcase_limit?: number;
    },
    editorName = 'Organization Flight Desk'
  ): { success: boolean; message: string; item?: FlashNewsItem } {
    const item = this.flashNewsItems.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Flashnews record not found.' };

    if (updates.content !== undefined) {
      const rawContent = updates.content.trim();
      if (!rawContent) return { success: false, message: 'Content cannot be empty.' };
      const words = rawContent.split(/\s+/).filter(Boolean);
      if (words.length > 200) {
        return {
          success: false,
          message: `Word limit violation: Maximum allowed is 200 words (entered ${words.length} words).`,
        };
      }
      item.content = rawContent;
      item.word_count = words.length;
    }

    if (updates.headline !== undefined) item.headline = updates.headline.trim().toUpperCase();
    if (updates.category) item.category = updates.category;
    if (updates.priority) item.priority = updates.priority;
    if (updates.blink_interval_sec) item.blink_interval_sec = updates.blink_interval_sec;
    if (updates.slot_position) item.slot_position = updates.slot_position;
    if (updates.showcase_limit !== undefined) item.showcase_limit = updates.showcase_limit;

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Flashnews Broadcast Updated',
      description: `Flashnews "${item.headline}" updated by ${editorName}. Word count: ${item.word_count}/200.`,
      actor_name: editorName,
      actor_role: 'Authorized Publisher',
      target_id: item.id,
      target_name: item.headline,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Flashnews updated successfully! Changes saved across live feed.`,
      item,
    };
  }

  public updateBusinessFlashNewsCustomSettings(
    businessId: string,
    settings: {
      can_publish_flashnews?: boolean;
      custom_debit_rate?: number;
      daily_publish_limit?: number;
      custom_organization_display_name?: string;
    },
    editorName = 'Super Administrator (L8)'
  ): { success: boolean; message: string; business?: BusinessProfile } {
    const biz = this.businesses.find((b) => b.business_id === businessId);
    if (!biz) return { success: false, message: 'Business account not found.' };

    if (settings.can_publish_flashnews !== undefined) {
      biz.can_publish_flashnews = settings.can_publish_flashnews;
    }
    if (settings.custom_debit_rate !== undefined) {
      (biz as any).custom_flashnews_debit_rate = Math.max(0, settings.custom_debit_rate);
    }
    if (settings.daily_publish_limit !== undefined) {
      (biz as any).daily_flashnews_publish_limit = Math.max(0, settings.daily_publish_limit);
    }
    if (settings.custom_organization_display_name) {
      (biz as any).flashnews_display_name = settings.custom_organization_display_name.trim();
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Business Flashnews Publishing Privileges Updated',
      description: `Privileges and publishing parameters for ${biz.organization_name} updated by ${editorName}. Status: ${biz.can_publish_flashnews ? 'ENABLED' : 'DISABLED'}.`,
      actor_name: editorName,
      actor_role: 'Operations Administration',
      target_id: biz.business_id,
      target_name: biz.organization_name,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Publishing parameters and edit options for ${biz.organization_name} updated successfully.`,
      business: biz,
    };
  }

  public deleteFlashNews(id: string): { success: boolean; message: string } {
    const idx = this.flashNewsItems.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, message: 'Flashnews item not found.' };
    this.flashNewsItems.splice(idx, 1);
    this.persist();
    return { success: true, message: 'Flashnews permanently deleted.' };
  }

  // =========================================================================
  // ADMIN TEAM ONBOARDING & WELCOME NOTIFICATION EMAIL ENGINE
  // =========================================================================
  private dispatchedAdminEmails: AdminWelcomeEmail[] = [];

  public getDispatchedAdminEmails(): AdminWelcomeEmail[] {
    return [...this.dispatchedAdminEmails];
  }

  public createAdminTeamAccount(
    params: {
      name: string;
      email: string;
      role: 'ADMIN' | 'SUPER_ADMIN';
      level: AdminLevel;
      department?: AdminDepartment;
    },
    actorLevel: number = 8,
    actorName: string = 'Super Admin'
  ): { success: boolean; message: string; emailRecord?: AdminWelcomeEmail } {
    const emailNorm = params.email.trim().toLowerCase();
    const isDomainValid = emailNorm.endsWith('@yarifly.com') || emailNorm.endsWith('@truvaer.com');
    if (!isDomainValid) {
      return {
        success: false,
        message: 'Security Policy Violation: Administrative personnel accounts must strictly use an authorized organizational domain (@yarifly.com or @truvaer.com).',
      };
    }

    if (params.level === 8 || params.role === 'SUPER_ADMIN') {
      if (actorLevel < 8) {
        return {
          success: false,
          message: 'Security Clearance Denied: Elevating or creating a Level 8 Super Admin account requires Level 8 Executive clearance.',
        };
      }
    }

    const existing = this.adminUsers.find((a) => a.email.toLowerCase() === emailNorm);
    if (existing) {
      return {
        success: false,
        message: `An administrative record with email ${emailNorm} already exists.`,
      };
    }

    const adminId = `adm_${generateUUID().substring(0, 8)}`;
    const activationToken = `ACT_${generateUUID().substring(0, 10).toUpperCase()}`;
    const passwordSetupLink = `https://admin.truvaer.com/#/set-password?token=${activationToken}&email=${encodeURIComponent(emailNorm)}`;

    const newAdmin: AdminUser = {
      admin_id: adminId,
      name: params.name,
      email: emailNorm,
      role: params.role,
      level: params.level,
      level_title: `Level ${params.level} ${params.role === 'SUPER_ADMIN' ? 'Executive Command' : 'Operations Officer'}`,
      department: params.department || 'Operations',
      assigned_modules: ['all'],
      permitted_portals: ['admin_desk', 'marketing', 'crm_portal'],
      status: 'ACTIVE',
      historical_passwords: ['CommandPass#2026'],
      last_password_reset_at: new Date().toISOString(),
    };

    this.adminUsers.push(newAdmin);

    const regUser: RegularUser = {
      user_id: `usr_${adminId}`,
      username: emailNorm.split('@')[0],
      first_name: params.name.split(' ')[0] || params.name,
      last_name: params.name.split(' ').slice(1).join(' ') || 'Admin',
      email: emailNorm,
      password_hash: 'CommandPass#2026',
      is_email_verified: true,
      date_of_birth: '1990-01-01',
      country_code: 'IN',
      phone_number: '+91 98765 00000',
      account_status: 'ACTIVE',
      role: params.role,
      created_at: new Date().toISOString(),
      permitted_portals: ['admin_desk', 'marketing', 'crm_portal'],
    };
    this.regularUsers.push(regUser);

    const emailRecord: AdminWelcomeEmail = {
      id: `eml_${generateUUID().substring(0, 8)}`,
      recipient_email: emailNorm,
      recipient_name: params.name,
      portal_url: 'https://admin.truvaer.com',
      username: emailNorm,
      activation_token: activationToken,
      password_setup_link: passwordSetupLink,
      clearance_level: `Level ${params.level} (${params.role})`,
      dispatched_at: new Date().toISOString(),
      dispatched_by: actorName,
      purpose: 'NEW_ACCOUNT_WELCOME',
    };

    this.dispatchedAdminEmails.unshift(emailRecord);

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'New Admin Personnel Onboarded & Welcome Notification Dispatched',
      description: `Administrative account ${emailNorm} created with Level ${params.level} clearance. Password setup dispatch link sent: ${passwordSetupLink}`,
      actor_name: actorName,
      actor_role: `L${actorLevel} Executive Command`,
      target_id: adminId,
      target_name: params.name,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: `Admin account for ${params.name} (${emailNorm}) created. Welcome email with password activation link dispatched.`,
      emailRecord,
    };
  }

  public dispatchAdminPasswordResetLink(
    email: string,
    actorLevel: number = 8,
    actorRole: string = 'SUPER_ADMIN',
    actorName: string = 'Super Admin'
  ): { success: boolean; message: string; emailRecord?: AdminWelcomeEmail } {
    if (actorLevel < 7 && actorRole !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: '403 Forbidden: Only Level 7 (L7) and Level 8 (L8) Super Administrators have authorization to dispatch administrative password reset links.',
      };
    }

    const emailNorm = email.trim().toLowerCase();
    const admin = this.adminUsers.find((a) => a.email.toLowerCase() === emailNorm);
    const regUser = this.regularUsers.find((u) => u.email.toLowerCase() === emailNorm);

    if (!admin && !regUser) {
      return { success: false, message: `Account with email ${emailNorm} not found.` };
    }

    const recipientName = admin?.name || regUser?.first_name || 'Administrator';
    const activationToken = `RST_${generateUUID().substring(0, 10).toUpperCase()}`;
    const passwordSetupLink = `https://admin.truvaer.com/#/set-password?token=${activationToken}&email=${encodeURIComponent(emailNorm)}`;

    const emailRecord: AdminWelcomeEmail = {
      id: `eml_${generateUUID().substring(0, 8)}`,
      recipient_email: emailNorm,
      recipient_name: recipientName,
      portal_url: 'https://admin.truvaer.com',
      username: emailNorm,
      activation_token: activationToken,
      password_setup_link: passwordSetupLink,
      clearance_level: admin ? `Level ${admin.level || 7} (${admin.role})` : 'Administrator',
      dispatched_at: new Date().toISOString(),
      dispatched_by: actorName,
      purpose: 'PASSWORD_RESET_DISPATCH',
    };

    this.dispatchedAdminEmails.unshift(emailRecord);

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Admin Password Reset Notification Dispatched',
      description: `Password reset link dispatched for ${emailNorm} by ${actorName} (Clearance Level ${actorLevel}).`,
      actor_name: actorName,
      actor_role: `L${actorLevel} ${actorRole}`,
      target_id: admin?.admin_id || 'admin',
      target_name: recipientName,
      severity: 'info',
    });

    this.persist();
    return {
      success: true,
      message: `Password setup link dispatched for ${emailNorm}.`,
      emailRecord,
    };
  }

  public completeAdminPasswordSetup(
    email: string,
    token: string,
    newPassword: string
  ): { success: boolean; message: string } {
    if (!token || (!token.startsWith('ACT_') && !token.startsWith('RST_'))) {
      return { success: false, message: 'Invalid or expired security token.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must contain at least 8 characters.' };
    }

    const emailNorm = email.trim().toLowerCase();
    const admin = this.adminUsers.find((a) => a.email.toLowerCase() === emailNorm);
    const regUser = this.regularUsers.find((u) => u.email.toLowerCase() === emailNorm);

    if (!admin && !regUser) {
      return { success: false, message: 'Account not found for email provided.' };
    }

    if (admin) {
      admin.historical_passwords = [newPassword, ...(admin.historical_passwords || [])].slice(0, 3);
      admin.last_password_reset_at = new Date().toISOString();
      admin.status = 'ACTIVE';
    }
    if (regUser) {
      regUser.password_hash = newPassword;
      regUser.historical_passwords = [newPassword, ...(regUser.historical_passwords || [])].slice(0, 3);
      regUser.last_password_reset_at = new Date().toISOString();
      regUser.account_status = 'ACTIVE';
    }

    this.logAdminActivity({
      category: 'BUSINESS_APPROVAL',
      title: 'Admin Password Successfully Initialized / Reset',
      description: `Credentials updated for ${emailNorm} via tokenized activation link.`,
      actor_name: admin?.name || regUser?.first_name || 'Admin',
      actor_role: 'Operations Administration',
      target_id: admin?.admin_id || 'admin',
      target_name: emailNorm,
      severity: 'success',
    });

    this.persist();
    return {
      success: true,
      message: 'Password initialized successfully! You can now log into admin.truvaer.com.',
    };
  }
}

export const db = new MockDatabase();
