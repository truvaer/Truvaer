export type PolicySlug =
  | 'about'
  | 'accessibility'
  | 'user-agreement'
  | 'privacy-policy'
  | 'cookie-policy'
  | 'copyright-policy'
  | 'brand-policy'
  | 'community-guidelines';

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  subsections?: {
    subtitle: string;
    text: string;
  }[];
}

export interface PolicyDocument {
  slug: PolicySlug;
  title: string;
  badge: string;
  category: 'Company' | 'Legal' | 'Trust & Compliance' | 'Standards';
  lastUpdated: string;
  effectiveDate: string;
  readingTimeMinutes: number;
  summary: string;
  sections: PolicySection[];
}

export const POLICIES: Record<PolicySlug, PolicyDocument> = {
  about: {
    slug: 'about',
    title: 'About Truvaer Aviation',
    badge: 'Enterprise Heritage',
    category: 'Company',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 5,
    summary:
      'Truvaer is the world’s premier sovereign business aviation ecosystem, bridging private jet owners, certified air charter operators, Fixed Base Operators (FBOs), and discerning global aviators across 180+ countries.',
    sections: [
      {
        id: 'mission-vision',
        title: '1. Mission & Corporate Vision',
        content:
          'Truvaer was founded on a singular premise: private aviation should combine uncompromising luxury, absolute operational transparency, and military-grade safety governance. We provide an integrated digital infrastructure where operators manage aircraft fleets and compliance, while global travelers, family offices, and enterprise corporations reserve bespoke executive air mobility with zero broker obscurity.',
      },
      {
        id: 'global-network',
        title: '2. Global Operating Hubs & Infrastructure',
        content:
          'Headquartered across five strategic international aviation corridors, Truvaer maintains active operations and flight dispatch connectivity at major world hubs:',
        subsections: [
          {
            subtitle: 'Asia-Pacific (APAC) & Subcontinent',
            text: 'Primary flight support and engineering coordination at Chhatrapati Shivaji Maharaj International (BOM), Indira Gandhi International (DEL), and Kempegowda (BLR).',
          },
          {
            subtitle: 'Middle East & North Africa (MENA)',
            text: 'VIP charter dispatch, ramp concierge, and heavy bunkering at Dubai World Central (DWC) and Al Maktoum International.',
          },
          {
            subtitle: 'Europe & United Kingdom (EMEA)',
            text: 'European charter brokerage, slot allocation, and CAMO airworthiness support at London Heathrow (LHR), London Biggin Hill (BQH), and Munich (MUC).',
          },
          {
            subtitle: 'Americas & Southeast Asia',
            text: 'Executive liaison and long-range intercontinental sectors through New York Teterboro (TEB/JFK) and Singapore Changi (SIN).',
          },
        ],
      },
      {
        id: 'standards',
        title: '3. Aviation Safety & Verification Standards',
        content:
          'Every business profile and aviation enterprise listed on Truvaer undergoes rigorous two-tier administrative audit. We cross-verify statutory civil aviation certificates (DGCA, FAA Part 135, EASA AOC), corporate registrations, insurance liability binders (minimum $100M third-party liability), and statutory security credentials.',
      },
      {
        id: 'sustainability',
        title: '4. Sustainable Aviation Fuel (SAF) & Net-Zero Commitment',
        content:
          'Truvaer partners with global fuel providers to champion book-and-claim Sustainable Aviation Fuel (SAF). We empower charter clients to calculate lifecycle carbon offset footprints directly during flight booking, targeting 100% net-zero executive flights across participating European and Asian sectors by 2030.',
      },
      {
        id: 'leadership',
        title: '5. Governance & Executive Leadership',
        content:
          'Our board and leadership team comprise retired military and civil aviation commanders, aviation attorneys, corporate treasury specialists, and aerospace engineers dedicated to elevating the standards of executive air travel.',
      },
    ],
  },

  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility Statement',
    badge: 'WCAG 2.1 AA Compliant',
    category: 'Trust & Compliance',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 4,
    summary:
      'Truvaer is committed to ensuring digital accessibility for people of all abilities, adhering to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and Section 508 standards.',
    sections: [
      {
        id: 'commitment',
        title: '1. Our Inclusivity Commitment',
        content:
          'At Truvaer, accessibility is an integral component of our user experience architecture. We believe that discovering aviation services, managing enterprise catalogs, and reviewing aerospace market intelligence should be seamlessly usable by everyone, including people with visual, auditory, cognitive, and motor impairments.',
      },
      {
        id: 'conformance-status',
        title: '2. Conformance Standards & Benchmarks',
        content:
          'This web application has been built and continually audited to conform with WCAG 2.1 Level AA standards. Key accessibility features implemented across all portals include:',
        subsections: [
          {
            subtitle: 'Keyboard Navigation & Focus Management',
            text: 'All interactive elements, buttons, modal dialogs, and flight filter sidebars are fully navigable using standard keyboard inputs (Tab, Shift+Tab, Enter, Escape, Arrow keys) with persistent high-visibility focus indicators.',
          },
          {
            subtitle: 'Screen Reader Optimization',
            text: 'Semantic HTML5 landmarks (header, nav, main, aside, footer), ARIA live regions for real-time notifications, and descriptive alt attributes for all aircraft livery and cockpit imagery.',
          },
          {
            subtitle: 'Color Contrast & Typography',
            text: 'Minimum text contrast ratio of 4.5:1 for body copy and 3:1 for large graphical headings. Built-in light and dark themes ensure comfortable readability across varied lighting conditions.',
          },
          {
            subtitle: 'Form Controls & Error Identification',
            text: 'Clear text labels, explicit input instructions, and descriptive error messages that identify validation issues without relying solely on color indicators.',
          },
        ],
      },
      {
        id: 'assistive-tech',
        title: '3. Compatible Assistive Technologies',
        content:
          'The Truvaer platform is tested with major assistive technologies and browser configurations, including JAWS, NVDA, Apple VoiceOver (macOS and iOS), Android TalkBack, and modern browser zoom magnifications up to 200% without loss of layout integrity.',
      },
      {
        id: 'feedback-escalation',
        title: '4. Feedback, Inquiries & Accessibility Coordinator',
        content:
          'If you encounter any accessibility barrier or require content in an alternative accessible format, please contact our dedicated Accessibility Coordinator at accessibility@truvaer.com or phone +1 (800) 555-TRUV. We aim to acknowledge and resolve reported accessibility tickets within 2 business days.',
      },
    ],
  },

  'user-agreement': {
    slug: 'user-agreement',
    title: 'User Agreement & Terms of Service',
    badge: 'Legally Binding Contract',
    category: 'Legal',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 9,
    summary:
      'These Terms of Service govern your access to and use of Truvaer.com, including marketplace quotation requests, charter escrow bookings, corporate wallet credits, and admin services.',
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms & Eligibility',
        content:
          'By registering an account, accessing Truvaer.com, or submitting flight quotation inquiries, you agree to be legally bound by this User Agreement. You must be at least 18 years of age and hold legal capacity to enter binding contracts. If you act on behalf of a corporate aviation enterprise, you represent that you hold valid administrative authority to bind that entity.',
      },
      {
        id: 'account-types',
        title: '2. Account Classification & Identity Verification',
        content:
          'Truvaer maintains distinct account classes with specific verification mandates:',
        subsections: [
          {
            subtitle: 'Regular Aviator / Charter Client Accounts',
            text: 'For individual passengers, corporate executives, and travel managers seeking flight quotations, aircraft tours, and charter reservations.',
          },
          {
            subtitle: 'Verified Corporate Business Operator Accounts',
            text: 'For Air Operator Certificate (AOC) holders, FBO facilities, aircraft maintenance organizations, and charter brokers. Operators must submit official business registration, insurance certificates, and banking coordinates for administrative verification before public listing.',
          },
          {
            subtitle: 'Administrative & Governance Accounts (L0–L8)',
            text: 'Internal platform administrators governed by role-based access control, dual-stage debit pipelines, and SIEM security logging.',
          },
        ],
      },
      {
        id: 'marketplace-quotes',
        title: '3. Charter Quotes, Escrow & Payment Processing',
        content:
          'Truvaer operates as an advanced aviation technology marketplace connecting charterers directly with certified operators. All charter quotation requests are subject to operator availability, aircraft slot permits, and civil aviation ATC approvals. Payments processed via corporate wallet credits, Razorpay, or bank wire are held in secure transaction escrow until flight confirmation.',
      },
      {
        id: 'payout-rules',
        title: '4. Treasury Reserve & 80% Payout Policy',
        content:
          'For active corporate accounts, credit withdrawals and bank payouts are subject to an 80% maximum reserve cap to ensure operational liquidity for ongoing customer quotations and commitments. Full 100% balance payout is permitted strictly when an account is formally suspended, deactivated, or terminated by the finance department, upon which remaining funds are reconciled to the verified bank coordinates on record.',
      },
      {
        id: 'prohibited-conduct',
        title: '5. Prohibited Platform Conduct',
        content:
          'Users and operators agree not to: (a) post fictitious aircraft tail numbers or invalid serial numbers; (b) impersonate civil aviation authorities; (c) attempt unauthorized SQL injection, reverse engineering, or data scraping; (d) execute fraudulent payment chargebacks; or (e) harass, defame, or solicit operators outside verified marketplace channels.',
      },
      {
        id: 'liability-indemnity',
        title: '6. Limitation of Liability & Force Majeure',
        content:
          'Truvaer is a digital platform and does not operate aircraft as a direct air carrier unless explicitly stated. Direct air transportation is provided exclusively by certified air operators holding valid AOC credentials. Truvaer is not liable for flight delays, diversions, or cancellations caused by adverse weather, NOTAM restrictions, ATC slot groundings, war, or acts of God.',
      },
    ],
  },

  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Global Privacy Policy',
    badge: 'GDPR / CCPA / DPDP Compliant',
    category: 'Legal',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 8,
    summary:
      'How Truvaer collects, processes, encrypts, and protects passenger manifest records, corporate KYC credentials, and telemetry data across our global aviation platform.',
    sections: [
      {
        id: 'scope-compliance',
        title: '1. Regulatory Framework & Scope',
        content:
          'Truvaer adheres to global data privacy statutes including the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act as amended (CCPA/CPRA), the Digital Personal Data Protection (DPDP) Act 2023 of India, and UAE Federal Decree-Law No. 45/2021 on Personal Data Protection.',
      },
      {
        id: 'information-collected',
        title: '2. Information We Collect',
        content:
          'Given the stringent nature of international business aviation, we collect and process specific categories of data:',
        subsections: [
          {
            subtitle: 'Passenger Manifest & Flight Clearance Data',
            text: 'Full legal names, passport numbers, nationalities, dates of birth, and visa details strictly required for filing flight clearance manifests with customs and civil aviation authorities (DGCA, FAA, Eurocontrol).',
          },
          {
            subtitle: 'Corporate KYC & Registry Data',
            text: 'Incorporation certificates, tax identification numbers (GSTIN/VAT/EIN), bank account coordinates (masked using AES-256), and Air Operator Certificates (AOC).',
          },
          {
            subtitle: 'Telemetry & Authentication Records',
            text: 'Login credentials salted using Argon2id, 3-password historical security archives, two-factor authentication tokens, IP addresses, and encrypted API logs.',
          },
        ],
      },
      {
        id: 'data-use',
        title: '3. Purpose of Processing & Zero Selling Pledge',
        content:
          'Truvaer NEVER sells, rents, or commercializes personal or flight data to third-party data brokers or advertisers. We process data strictly to: facilitate flight bookings, verify civil aviation operator credentials, process financial transactions, fulfill statutory customs compliance, and protect our platform from cyber threats.',
      },
      {
        id: 'encryption-storage',
        title: '4. Encryption & Security Architecture',
        content:
          'All data in transit is encrypted using TLS 1.3 with forward secrecy. Sensitive data at rest (banking numbers, passports, government IDs) is encrypted using AES-256 KMS envelopes. Access to production databases is strictly governed by multi-factor authentication and role-based access control (RBAC).',
      },
      {
        id: 'data-rights',
        title: '5. Your Data Subject Rights',
        content:
          'Under applicable privacy laws, you possess the right to: (a) request a copy of your personal data; (b) rectify inaccurate flight profile records; (c) request erasure of personal data ("Right to be Forgotten"), subject to statutory aviation record retention requirements; (d) restrict processing; and (e) withdraw consent at any time.',
      },
      {
        id: 'dpo-contact',
        title: '6. Data Protection Officer (DPO)',
        content:
          'For inquiries or to exercise your statutory privacy rights, contact our Data Protection Officer at privacy@truvaer.com or write to Truvaer Data Governance Office, Aviation House, Mumbai International Airport (BOM), Mumbai 400099, India.',
      },
    ],
  },

  'cookie-policy': {
    slug: 'cookie-policy',
    title: 'Cookie & Tracking Policy',
    badge: 'Interactive Consent Ready',
    category: 'Legal',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 5,
    summary:
      'Information on how Truvaer uses cookies, session storage, and local storage tokens to deliver secure authentication, portal preferences, and performance analytics.',
    sections: [
      {
        id: 'what-are-cookies',
        title: '1. What Are Cookies & Local Storage',
        content:
          'Cookies and web storage technologies (localStorage and sessionStorage) are small data files placed on your browser or device when you visit Truvaer.com. They allow our platform to remember your active session, maintain your customized aircraft filters, and ensure secure authentication.',
      },
      {
        id: 'cookie-categories',
        title: '2. Categories of Cookies We Employ',
        content:
          'We categorize cookies and storage mechanisms into four distinct groups:',
        subsections: [
          {
            subtitle: '1. Strictly Necessary / Essential (Always Active)',
            text: 'Essential for site operation, session management, CSRF token validation, Argon2id auth tokens, and corporate wallet security. Without these, the marketplace cannot function.',
          },
          {
            subtitle: '2. Functional & Preference Cookies',
            text: 'Stores user preferences such as Light/Dark UI theme selection (`truvaer_theme`), selected base hub, preferred currency (INR, USD, EUR, GBP), and language.',
          },
          {
            subtitle: '3. Performance & Operational Telemetry',
            text: 'Collects anonymized platform response times, API load statistics, and edge delivery telemetry to maintain 99.99% marketplace uptime.',
          },
          {
            subtitle: '4. Security & Fraud Prevention',
            text: 'Monitors suspicious login velocity and brute-force attempts to protect corporate escrow balances and verified operator portals.',
          },
        ],
      },
      {
        id: 'manage-cookies',
        title: '3. Managing Cookie Preferences',
        content:
          'You can modify your cookie choices at any time through our interactive Cookie Preferences manager below, or directly through your web browser settings. Disabling essential cookies may impair the functionality of flight booking and corporate wallet portals.',
      },
      {
        id: 'third-party-cookies',
        title: '4. Third-Party Web Services',
        content:
          'We do not permit third-party advertising networks to drop tracking pixels on Truvaer. Third-party integrations are limited to verified payment infrastructure (Razorpay, PayPal) and map rendering services, which operate strictly under contractual data processing agreements.',
      },
    ],
  },

  'copyright-policy': {
    slug: 'copyright-policy',
    title: 'Copyright & DMCA Policy',
    badge: 'Intellectual Property',
    category: 'Legal',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 6,
    summary:
      'Truvaer respects the intellectual property rights of aircraft photographers, aerospace manufacturers, and operators. Learn how we handle copyright notices and DMCA takedowns.',
    sections: [
      {
        id: 'ip-ownership',
        title: '1. Truvaer Intellectual Property',
        content:
          'All software, source code, visual UI design, proprietary pricing algorithms, regional cash flow analytics models, databases, graphics, logos, and editorial content on Truvaer.com are the exclusive intellectual property of Truvaer Technologies Inc. and protected by international copyright, patent, and trademark treaties.',
      },
      {
        id: 'aircraft-photography',
        title: '2. Aircraft Photography & Operator Media',
        content:
          'Aircraft liveries, cabin photography, and virtual tours uploaded by verified business operators remain the property of the respective operator or photographer. By uploading content, operators grant Truvaer a non-exclusive, worldwide license to display such media across our marketplace directory.',
      },
      {
        id: 'dmca-notice',
        title: '3. Notice of Copyright Infringement (DMCA / Indian Copyright Act)',
        content:
          'If you believe that your copyrighted aircraft photograph, text, or trademark has been reproduced on Truvaer without authorization, please submit a formalized takedown notice containing:',
        subsections: [
          {
            subtitle: 'Required Notice Elements',
            text: '1. Identification of the copyrighted work claimed to have been infringed.\n2. Exact URL or location of the infringing material on Truvaer.com.\n3. Your contact coordinates (name, physical address, email, phone number).\n4. A statement made in good faith that the disputed use is unauthorized.\n5. A statement under penalty of perjury that the information in your notice is accurate.\n6. A physical or electronic signature of the copyright owner or authorized representative.',
          },
        ],
      },
      {
        id: 'counter-notice',
        title: '4. Counter-Notification Procedure',
        content:
          'If an operator believes that their material was delisted in error or due to misidentification, they may file a formal counter-notification with our legal department. Upon receipt, Truvaer will notify the complainant and may restore the material within 10 to 14 business days unless legal action is initiated.',
      },
      {
        id: 'designated-agent',
        title: '5. Designated Copyright Agent',
        content:
          'Direct all intellectual property notices to: Truvaer Legal & IP Department, Email: legal@truvaer.com or dmca@truvaer.com.',
      },
    ],
  },

  'brand-policy': {
    slug: 'brand-policy',
    title: 'Brand Policy & Media Guidelines',
    badge: 'Trademarks & Assets',
    category: 'Standards',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 5,
    summary:
      'Official guidelines for the correct usage of Truvaer trademarks, logo marks, corporate colors, press kit assets, and co-marketing partnerships.',
    sections: [
      {
        id: 'trademark-overview',
        title: '1. Truvaer Trademarks & Service Marks',
        content:
          'The name "Truvaer", the Truvaer stylized winged emblem, "AeroMatrix", "ServiceScout", and related corporate slogans are registered trademarks of Truvaer Technologies Inc. Any unauthorized use of our brand marks in a manner likely to cause consumer confusion or imply false endorsement is strictly prohibited.',
      },
      {
        id: 'logo-usage',
        title: '2. Official Logo Usage & Clear Space',
        content:
          'When featuring the Truvaer logo in aviation editorial, press coverage, or partner collaterals, adhere to the following rules:',
        subsections: [
          {
            subtitle: 'Clear Space & Isolation',
            text: 'Always maintain a minimum clear space surrounding the logo equal to the height of the letter "T". Never crowd the emblem with competing typography or aircraft silhouettes.',
          },
          {
            subtitle: 'Minimum Size Requirements',
            text: 'For digital display, the logo mark must not appear smaller than 32 pixels in height. For print publications, the minimum height is 15 millimeters.',
          },
          {
            subtitle: 'Unacceptable Modifications',
            text: 'Do not alter the letterforms, rotate the winged crest, add heavy drop shadows, or change the aspect ratio.',
          },
        ],
      },
      {
        id: 'color-palette',
        title: '3. Official Brand Color Palette',
        content:
          'Our corporate aesthetic reflects executive private aviation precision:',
        subsections: [
          {
            subtitle: 'Truvaer Midnight Navy',
            text: 'Primary background foundation. Hex: #020617 / #0f172a.',
          },
          {
            subtitle: 'Aviation Gold',
            text: 'Used for verified operator badges and prestige accents. Hex: #f59e0b / #d97706.',
          },
          {
            subtitle: 'Horizon Sky Blue',
            text: 'Primary interactive button and navigation accents. Hex: #0284c7 / #38bdf8.',
          },
          {
            subtitle: 'Runway Emerald',
            text: 'Active status indicators, verified safety certifications, and clean approvals. Hex: #10b981.',
          },
        ],
      },
      {
        id: 'co-branding',
        title: '4. Operator Co-Branding & Press Kit',
        content:
          'Verified air charter operators may use the "Verified on Truvaer" badge on their website, hangars, and flight brochures in accordance with their verified operator tier. High-resolution vector SVGs and press kit assets can be downloaded directly from our brand portal or requested via press@truvaer.com.',
      },
    ],
  },

  'community-guidelines': {
    slug: 'community-guidelines',
    title: 'Community & Professional Guidelines',
    badge: 'Code of Ethics',
    category: 'Standards',
    lastUpdated: 'October 11, 2026',
    effectiveDate: 'January 1, 2026',
    readingTimeMinutes: 6,
    summary:
      'Standards of professional excellence, ethical conduct, safety adherence, and zero tolerance for fraud across the global Truvaer aviation ecosystem.',
    sections: [
      {
        id: 'philosophy',
        title: '1. Professional Excellence in Aviation',
        content:
          'Aviation is an industry built on absolute discipline, mutual trust, and uncompromising safety. Truvaer brings together flight crews, charter buyers, aircraft owners, and ground support specialists. Every member of our ecosystem is expected to interact with the highest degree of professionalism and integrity.',
      },
      {
        id: 'operator-obligations',
        title: '2. Obligations of Verified Flight Operators',
        content:
          'Air operators and charter brokerage desks must abide by the following core principles:',
        subsections: [
          {
            subtitle: 'Accurate Fleet & Availability Reporting',
            text: 'Aircraft listed on the directory must be legitimately available under current operational control. Operators must never quote flights on aircraft they are not authorized to dispatch.',
          },
          {
            subtitle: 'Mandatory Safety & Crew Duty Adherence',
            text: 'Operators must strictly observe civil aviation Flight Duty Time Limitations (FDTL). Under no circumstances may an operator pressurize flight crews to exceed duty limits or fly into weather below landing minimums.',
          },
          {
            subtitle: 'Price Transparency & Honesty',
            text: 'All charter quotations must clearly itemize flight hours, airport slot handling fees, overnight crew layovers, and applicable aviation taxes without surprise surcharge markups.',
          },
        ],
      },
      {
        id: 'client-conduct',
        title: '3. Expectations for Charter Clients & Guests',
        content:
          'Guests chartering private jets are expected to treat flight crews, cabin hosts, and airport handling agents with dignity. Unruly passenger behavior, interference with flight crew duties, or attempts to transport undeclared contraband will result in immediate flight termination, account deactivation, and referral to civil aviation authorities.',
      },
      {
        id: 'anti-fraud',
        title: '4. Zero Tolerance for Fraud & Malicious Activity',
        content:
          'Truvaer maintains zero tolerance for: (a) fraudulent credit top-ups; (b) fictitious payment receipts; (c) spamming operators with fake quote requests; (d) safety certificate forgery; and (e) malicious operator reporting. Violations trigger immediate hard-lock suspension and forfeiture of wallet reserves.',
      },
      {
        id: 'whistleblower',
        title: '5. Aviation Safety Whistleblower Gateway',
        content:
          'If you observe any regulatory safety violation, compromised maintenance practice, or unethical conduct within our network, submit a confidential report to our Governance Committee at safety@truvaer.com. All reports are investigated with complete whistleblower protection.',
      },
    ],
  },
};
