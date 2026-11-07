import { AdminDepartment, AdminLevel } from '../types';

/**
 * Masks phone number according to Condition 4:
 * "Phone number and email address will be hidden only first 5 number will be shown eg if the phone number is Country code : +91 and phone number is 9999988888 then it should display at +91 99999XXXXX"
 */
export function maskPhoneNumber(phone: string, fallbackCountryCode: string = '+91'): {
  masked: string;
  countryCode: string;
  visibleDigits: string;
} {
  if (!phone) {
    return { masked: `${fallbackCountryCode} XXXXXXXXXX`, countryCode: fallbackCountryCode, visibleDigits: '' };
  }

  const clean = phone.trim();
  let countryCode = fallbackCountryCode;
  let nationalNumber = clean;

  // Check if string starts with '+'
  if (clean.startsWith('+')) {
    const match = clean.match(/^(\+\d{1,4})[\s\-.]*(.+)$/);
    if (match) {
      countryCode = match[1];
      nationalNumber = match[2];
    }
  }

  // Strip non-digit characters from the national number
  const digitsOnly = nationalNumber.replace(/\D/g, '');

  if (digitsOnly.length <= 5) {
    return {
      masked: `${countryCode} ${digitsOnly}XXXXX`,
      countryCode,
      visibleDigits: digitsOnly,
    };
  }

  const first5 = digitsOnly.slice(0, 5);
  const remainingCount = Math.max(5, digitsOnly.length - 5);
  const maskedX = 'X'.repeat(remainingCount);

  return {
    masked: `${countryCode} ${first5}${maskedX}`,
    countryCode,
    visibleDigits: first5,
  };
}

/**
 * Parses email according to Condition 4:
 * "email address should be displayed at email : user(which should be blured)@domain.com."
 */
export function parseEmailForMasking(email: string): {
  username: string;
  domain: string;
  displayHint: string;
} {
  if (!email || !email.includes('@')) {
    return {
      username: 'user',
      domain: 'domain.com',
      displayHint: 'user•••••@domain.com',
    };
  }

  const parts = email.split('@');
  const username = parts[0] || 'user';
  const domain = parts.slice(1).join('@') || 'domain.com';

  return {
    username,
    domain,
    displayHint: `${username.charAt(0)}•••••@${domain}`,
  };
}

/**
 * Department and Level Hierarchy Definitions (Conditions 8 & 9)
 */
export const ADMIN_DEPARTMENTS: { id: AdminDepartment; name: string; description: string; icon: string }[] = [
  { id: 'Sales', name: 'Sales & Enterprise Acquisitions', description: 'B2B Client accounts, flight brokers & corporate charter packages', icon: 'TrendingUp' },
  { id: 'Marketing', name: 'Marketing & Brand Strategy', description: 'Directory placements, campaigns, SEO & media sponsorship', icon: 'Megaphone' },
  { id: 'Finance', name: 'Finance & Treasury Operations', description: 'Corporate wallet settlements, audits, Razorpay gateways, tax & Commissions', icon: 'Coins' },
  { id: 'Operations', name: 'Operations & Terminal Logistics', description: 'Executive flight coordination, flight slots, directory compliance & KYC verification', icon: 'Plane' },
  { id: 'Stores', name: 'Stores & Hangar Spares Inventory', description: 'Aviation spare parts, avionics components, rotables & hangar requisitions', icon: 'Package' },
  { id: 'HR', name: 'Human Resource & People Care', description: 'Personnel onboarding, credentials, career grading & promotions', icon: 'Users' },
  { id: 'Senior Management Team', name: 'Senior Management & Board', description: 'Executive policy, strategic oversight & super-admin authority', icon: 'Crown' },
  { id: 'Customer Care', name: 'Customer Care & Aviator Support', description: 'Lead facilitation, dispute resolution, 24/7 terminal helpline', icon: 'Headphones' },
];

export const ADMIN_LEVELS_META: Record<AdminLevel, { title: string; designation: string; reportsTo: AdminLevel | null; canApproveDebits: boolean }> = {
  0: { title: 'L0 - Trainee / Junior Associate', designation: 'Trainee Officer', reportsTo: 1, canApproveDebits: false },
  1: { title: 'L1 - Associate Specialist', designation: 'Associate', reportsTo: 2, canApproveDebits: false },
  2: { title: 'L2 - Senior Specialist / Lead', designation: 'Senior Lead', reportsTo: 3, canApproveDebits: false },
  3: { title: 'L3 - Assistant Manager / Supervisor', designation: 'Supervisor', reportsTo: 4, canApproveDebits: false },
  4: { title: 'L4 - Department Manager', designation: 'Manager', reportsTo: 5, canApproveDebits: true }, // Admin Stage 1
  5: { title: 'L5 - Senior Operations Manager', designation: 'Senior Manager', reportsTo: 6, canApproveDebits: true },
  6: { title: 'L6 - Assistant Director / Head', designation: 'Assistant Director', reportsTo: 7, canApproveDebits: true },
  7: { title: 'L7 - Director / Vice President', designation: 'Vice President', reportsTo: 8, canApproveDebits: true },
  8: { title: 'L8 - Senior Executive / Super Admin', designation: 'Executive Chairman & CEO', reportsTo: null, canApproveDebits: true }, // Super Admin Stage 2
};

/**
 * 2-Level Approval requirement calculator (Condition 9)
 * e.g., if L0 is promoted to L1, then L2 and L3 should approve.
 */
export function getRequiredApproverLevels(currentLevel: AdminLevel, targetLevel: AdminLevel): {
  firstApproverLevel: AdminLevel;
  secondApproverLevel: AdminLevel;
} {
  const next1 = Math.min(8, targetLevel + 1) as AdminLevel;
  const next2 = Math.min(8, targetLevel + 2) as AdminLevel;
  return {
    firstApproverLevel: next1,
    secondApproverLevel: next2,
  };
}
