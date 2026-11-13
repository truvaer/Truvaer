import { FlashNewsItem, FlashNewsConfig } from '../types';

export const FLASH_NEWS_KEY = 'truvaer_flash_news_v1';
export const FLASH_NEWS_CONFIG_KEY = 'truvaer_flash_news_config_v1';

export const countWords = (text: string): number => {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const truncateToWords = (text: string, maxWords: number = 200): string => {
  if (!text) return '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
};

export const defaultFlashNewsPricingMatrix = {
  base_cost: 20,
  timing_rates: {
    5: 15, // 5s Standard Blink
    10: 25, // 10s Extended Blink
    15: 35, // 15s Long Reading
    30: 50, // 30s Static Alert
  },
  position_rates: {
    STANDARD: 10,
    STICKY: 30,
    TOP_PRIORITY: 50,
  },
  showcase_rates: {
    0: 75, // Continuous / Unlimited
    10: 15,
    25: 30,
    50: 50,
    100: 65,
  },
  category_rates: {
    BREAKING: 30,
    OPERATIONS: 15,
    WEATHER_NOTAM: 10,
    CHARTER_DISPATCH: 25,
    AVIATION_ALERT: 20,
    SECURITY: 25,
  },
};

export const initialFlashNewsConfig: FlashNewsConfig = {
  max_active_limit: 10,
  blink_interval_seconds: 5,
  business_publish_credit_cost: 50, // default fallback
  pricing_matrix: defaultFlashNewsPricingMatrix,
  auto_mail_backup: {
    enabled: true,
    frequency: 'WEEKLY',
    recipient_emails: ['sup_admin@truvaer.com', 'compliance@truvaer.com'],
    last_dispatched_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    next_dispatch_at: new Date(Date.now() + 3600000 * 24 * 4).toISOString(),
    backup_count: 8,
    logs: [
      {
        id: 'log_backup_01',
        timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        recipient_count: 2,
        record_count: 10,
        status: 'DISPATCHED',
        format: 'EXCEL_CSV',
        archive_snapshot_id: 'SNAP-2026-10-28-FN',
      },
    ],
  },
  require_2_level_approval: true, // 2-step verification & 2-level approval required before going live
  updated_at: '2026-10-31T00:00:00.000Z',
  updated_by: 'B Aditya Narayana (Chairman & Super Admin L8)',
};

export const initialFlashNewsItems: FlashNewsItem[] = [
  {
    id: 'flash_001',
    headline: 'DGCA MONSOON FLIGHT OPERATIONS ADVISORY ENFORCED ACROSS WEST ZONE',
    content: 'DGCA has issued an expedited monsoon operations NOTAM for all Western Zone international airports including BOM and GOX. Operators are advised to plan for enhanced runway braking action advisories, mandatory extra alternate holding fuel reserves, and strict crosswind limitations for all turboprop and regional executive aircraft charters.',
    word_count: 51,
    category: 'WEATHER_NOTAM',
    priority: 'URGENT',
    published_by_id: 'usr_super_admin',
    published_by_name: 'B Aditya Narayana (Chairman L8)',
    published_by_role: 'Super Administrator',
    published_at: '2026-10-31T07:30:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_002',
    headline: 'FLEET INDUCTION: TWIN GULFSTREAM G700 BUSINESS JETS JOIN MUMBAI EXECUTIVE WING',
    content: 'Truvaer Aviation Holdings confirms delivery of two brand new Gulfstream G700 ultra-long-range business jets to its Mumbai executive fleet base. Stationed at VIP Apron Gate 7, both aircraft feature Rolls-Royce Pearl 700 engines and are available for nonstop transcontinental charter sectors to London, New York, and Zurich.',
    word_count: 50,
    category: 'CHARTER_DISPATCH',
    priority: 'HIGH',
    published_by_id: 'usr_super_admin',
    published_by_name: 'B Aditya Narayana (Chairman L8)',
    published_by_role: 'Super Administrator',
    published_at: '2026-10-31T07:20:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_003',
    headline: 'KEMPEGOWDA INTERNATIONAL AIRPORT (BLR) LAUNCHES DEDICATED VIP GA APRON',
    content: 'Bangalore International Airport Limited inaugurates its expanded 30-bay General Aviation VIP apron and private terminal. The state-of-the-art facility features dedicated customs, biometric express airside clearance, and under-wing electric limousine transfers, cutting ramp-to-runway passenger boarding time to under 8 minutes for private flight departures.',
    word_count: 45,
    category: 'OPERATIONS',
    priority: 'NORMAL',
    published_by_id: 'admin_operations',
    published_by_name: 'Operations Administrator',
    published_by_role: 'Operations Desk Lead',
    published_at: '2026-10-31T07:05:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_004',
    headline: 'AVIATION TURBINE FUEL (ATF) PRICE REVISED DOWNWARDS BY 2.8% NATIONALLY',
    content: 'Aviation Turbine Fuel (ATF) prices have been reduced by 2.8% across key metro hubs including Mumbai, Delhi, and Bangalore for the upcoming billing cycle. This price reduction significantly eases block-hour charter operating costs and provides direct margin relief for corporate fleet operators across domestic sectors.',
    word_count: 46,
    category: 'AVIATION_ALERT',
    priority: 'NORMAL',
    published_by_id: 'admin_operations',
    published_by_name: 'Operations Administrator',
    published_by_role: 'Operations Desk Lead',
    published_at: '2026-10-31T06:45:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_005',
    headline: 'SKYHIGH FLIGHT ACADEMY SECURES FAA & EASA PART-141 CADET TRAINING DUAL CLEARANCE',
    content: 'Hyderabad-based SkyHigh Flight Academy has achieved FAA and EASA Part-141 international certification for its Level-D flight simulator training center. The facility will train 200 airline cadet pilots annually with guaranteed placement pathways into leading commercial carrier fleets.',
    word_count: 38,
    category: 'OPERATIONS',
    priority: 'HIGH',
    published_by_id: 'admin_operations',
    published_by_name: 'Operations Administrator',
    published_by_role: 'Operations Desk Lead',
    published_at: '2026-10-31T06:15:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_006',
    headline: 'IMMEDIATE EMPTY-LEG ALERT: FALCON 2000EX SECTOR BOM-DXB AT 45% DISCOUNT',
    content: 'Commercial Sales Desk confirms an empty-leg private jet opportunity aboard a Dassault Falcon 2000EX flying Mumbai (BOM) to Dubai South (DWC) tomorrow at 14:00 IST. Accommodating 10 VIP passengers with bespoke catering, this sector is released at a 45% discounted rate.',
    word_count: 42,
    category: 'CHARTER_DISPATCH',
    priority: 'URGENT',
    published_by_id: 'usr_super_admin',
    published_by_name: 'B Aditya Narayana (Chairman L8)',
    published_by_role: 'Super Administrator',
    published_at: '2026-10-31T05:30:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_007',
    headline: 'DELHI IGI AIRPORT (VIDP) ACTIVATES CAT-III ILS LOW VISIBILITY PROCEDURES',
    content: 'Airports Authority of India (AAI) has successfully completed winter readiness calibration on Runway 28/10 at Delhi International Airport. Upgraded CAT-III ILS systems are certified to maintain uninterrupted landing operations in runway visual ranges (RVR) down to 50 meters, eliminating weather diversions.',
    word_count: 42,
    category: 'WEATHER_NOTAM',
    priority: 'HIGH',
    published_by_id: 'admin_operations',
    published_by_name: 'Operations Administrator',
    published_by_role: 'Operations Desk Lead',
    published_at: '2026-10-31T04:40:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_008',
    headline: 'AIRFRAME MRO TURNAROUND TIMES EXPEDITED TO 28 DAYS FOR CFM56-7B ENGINES',
    content: 'Bavaria AeroSystems and Truvaer certified MRO partners announce expedited 28-day shop overhaul turnarounds for CFM56-7B turbine powerplants. Accelerated OEM parts clearance and dedicated airside testing cells will prevent extended AOG grounding for executive airliner fleets.',
    word_count: 36,
    category: 'AVIATION_ALERT',
    priority: 'NORMAL',
    published_by_id: 'admin_operations',
    published_by_name: 'Operations Administrator',
    published_by_role: 'Operations Desk Lead',
    published_at: '2026-10-31T03:50:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_009',
    headline: 'AERO-MEDICAL CRITICAL CARE WING EXPANDS 24/7 MEDEVAC STANDBY ACROSS SAARC CORRIDOR',
    content: 'Truvaer Medevac Division deploys two ICU-equipped Learjet 45XR air ambulance aircraft on round-the-clock standby across South Asia and GCC medical corridors. Specialized medical flight crew and neonatal incubators are provisioned for emergency organ and patient repatriation.',
    word_count: 37,
    category: 'OPERATIONS',
    priority: 'HIGH',
    published_by_id: 'admin_operations',
    published_by_name: 'Operations Administrator',
    published_by_role: 'Operations Desk Lead',
    published_at: '2026-10-31T02:30:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
  {
    id: 'flash_010',
    headline: 'ICAO AIRSPACE SAFETY AUDIT CONCLUDES WITH RECORD COMPLIANCE RATING FOR INDIAN BUSINESS AVIATION',
    content: 'International Civil Aviation Organization (ICAO) completes comprehensive safety oversight audit, conferring Indian executive aviation operators a 92.5% effective implementation score. Key commendations were given for digital maintenance tracking, pilot flight-duty limit monitoring, and real-time electronic flight bag dispatch.',
    word_count: 41,
    category: 'SECURITY',
    priority: 'NORMAL',
    published_by_id: 'usr_super_admin',
    published_by_name: 'B Aditya Narayana (Chairman L8)',
    published_by_role: 'Super Administrator',
    published_at: '2026-10-31T01:10:00.000Z',
    status: 'ACTIVE',
    blink_interval_sec: 5,
  },
];
