import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Eye,
  MessageSquare,
  Unlock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  Trash2,
  EyeOff,
  Plus,
  Video,
  Image as ImageIcon,
  Edit3,
  X,
  Play,
  RotateCcw,
  Tag,
  Share2,
  Globe,
  LocateFixed,
  Compass,
  Layers,
  Crown,
  Lock,
  AlertCircle,
  AlertTriangle,
  User,
  DollarSign,
  FileText,
  Briefcase,
  Radio,
  Send,
  FolderPlus,
  LayoutGrid,
  Tags,
  Heart,
  ThumbsUp,
  Users,
  GraduationCap,
  Moon,
  Info,
  FileSpreadsheet,
  Flag,
  ShieldAlert,
  BellRing,
  UserPlus,
  UserCheck,
  Ban,
  Check,
  Camera,
  Headphones,
  Upload,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { ServiceListing, CustomerReview, RegularUser, BusinessProfile, PublicationStatus, AdminUser, AviationZone } from '../types';
import { ALL_ZONES, AVIATION_ZONES_MAP } from '../data/aviationGeographies';
import { maskPhoneNumber, parseEmailForMasking } from '../utils/privacyAndMasking';
import { GoogleAdSlot } from './GoogleAdSlot';
import { LinkedInMarketingFeed } from './LinkedInMarketingFeed';
import { DirectQuotationModal } from './DirectQuotationModal';
import { DirectServiceOfferModal } from './DirectServiceOfferModal';
import { AdminBroadcastModal } from '../erp/AdminBroadcastModal';
import { AddCategorySubCategoryModal } from './AddCategorySubCategoryModal';
import { AddServicesToListingModal } from './AddServicesToListingModal';
import { ApprovedTaxonomyModal } from '../erp/ApprovedTaxonomyModal';
import { BusinessVerificationModal } from '../business/BusinessVerificationModal';
import { ServiceScoutFilterSidebar } from './ServiceScoutFilterSidebar';
import { ServiceScoutSearchEngine } from './ServiceScoutSearchEngine';
import { LocationAutocomplete } from '../shared/LocationAutocomplete';
import { ProfilePictureManager } from '../shared/ProfilePictureManager';
import { RequestQuotationModal } from './RequestQuotationModal';
import { ReportBlockBusinessModal } from './ReportBlockBusinessModal';
import { QuotationDealsLifecycleModal } from './QuotationDealsLifecycleModal';
import { FollowingUpdatesModal } from './FollowingUpdatesModal';
import { LightboxImageSlider } from '../components/LightboxImageSlider';
import { SavedListingsDrawer } from './SavedListingsDrawer';

interface MarketingPortalProps {
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  isAdmin: boolean;
  activeAdminUser?: AdminUser | null;
  onOpenWallet: () => void;
  onOpenAuth?: () => void;
  onOpenDirectChat?: (recipientEmail: string, initialSubject: string) => void;
  onOpenUserProfile?: () => void;
  onOpenProfileMenu?: () => void;
  onOpenTaxonomy?: () => void;
  onOpenCustomerCare?: () => void;
  initialSubTab?: 'linkedin_feed' | 'directory';
}

export const COUNTRIES = [
  { code: 'All', name: 'All Countries', flag: '🌐' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

export function resolveAirportCodes(listing: Partial<ServiceListing>): { icao: string; iata: string } {
  if (listing.icao && listing.iata) {
    return { icao: listing.icao.toUpperCase(), iata: listing.iata.toUpperCase() };
  }
  const city = (listing.city || '').toUpperCase();
  const address = (listing.address || '').toUpperCase();
  const name = (listing.name || '').toUpperCase();
  const text = `${city} ${address} ${name}`;

  if (text.includes('GOA') || text.includes('RGOA') || text.includes('GOI') || text.includes('GOX')) {
    return { icao: listing.icao || 'VOGO', iata: listing.iata || 'GOX' };
  }
  if (text.includes('DEL') || text.includes('DELHI')) {
    return { icao: listing.icao || 'VIDP', iata: listing.iata || 'DEL' };
  }
  if (text.includes('BOM') || text.includes('MUMBAI')) {
    return { icao: listing.icao || 'VABB', iata: listing.iata || 'BOM' };
  }
  if (text.includes('BLR') || text.includes('BANGALORE') || text.includes('BENGALURU')) {
    return { icao: listing.icao || 'VOBL', iata: listing.iata || 'BLR' };
  }
  if (text.includes('HYD') || text.includes('HYDERABAD') || text.includes('SHAMSHABAD')) {
    return { icao: listing.icao || 'VOHS', iata: listing.iata || 'HYD' };
  }
  if (text.includes('DXB') || text.includes('DUBAI')) {
    return { icao: listing.icao || 'OMDB', iata: listing.iata || 'DXB' };
  }
  if (text.includes('SIN') || text.includes('SINGAPORE') || text.includes('CHANGI')) {
    return { icao: listing.icao || 'WSSS', iata: listing.iata || 'SIN' };
  }
  if (text.includes('LHR') || text.includes('LONDON') || text.includes('HEATHROW')) {
    return { icao: listing.icao || 'EGLL', iata: listing.iata || 'LHR' };
  }
  if (text.includes('MIA') || text.includes('MIAMI')) {
    return { icao: listing.icao || 'KMIA', iata: listing.iata || 'MIA' };
  }
  if (text.includes('FRA') || text.includes('FRANKFURT')) {
    return { icao: listing.icao || 'EDDF', iata: listing.iata || 'FRA' };
  }
  if (text.includes('SYD') || text.includes('SYDNEY')) {
    return { icao: listing.icao || 'YSSY', iata: listing.iata || 'SYD' };
  }
  if (text.includes('ALA') || text.includes('ALMATY')) {
    return { icao: listing.icao || 'UAAA', iata: listing.iata || 'ALA' };
  }
  return {
    icao: listing.icao || (city.length >= 3 ? `V${city.slice(0, 3)}` : 'VIDP'),
    iata: listing.iata || (city.length >= 3 ? city.slice(0, 3) : 'DEL'),
  };
}

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  dubai: { lat: 25.2532, lng: 55.3657 },
  mumbai: { lat: 19.0896, lng: 72.8656 },
  'new delhi': { lat: 28.5562, lng: 77.1000 },
  delhi: { lat: 28.5562, lng: 77.1000 },
  singapore: { lat: 1.3644, lng: 103.9915 },
  london: { lat: 51.4700, lng: -0.4543 },
  paris: { lat: 49.0097, lng: 2.5479 },
  'new york': { lat: 40.6413, lng: -73.7781 },
  bangalore: { lat: 13.1986, lng: 77.7066 },
  bengaluru: { lat: 13.1986, lng: 77.7066 },
  tokyo: { lat: 35.7720, lng: 140.3929 },
  sydney: { lat: -33.9399, lng: 151.1753 },
  frankfurt: { lat: 50.0379, lng: 8.5622 },
  doha: { lat: 25.2731, lng: 51.6081 },
  riyadh: { lat: 24.9576, lng: 46.6988 },
  'abu dhabi': { lat: 24.4330, lng: 54.6511 },
  hyderabad: { lat: 17.2403, lng: 78.4294 },
  chennai: { lat: 12.9941, lng: 80.1709 },
  ahmedabad: { lat: 23.0726, lng: 72.6347 },
  zurich: { lat: 47.4582, lng: 8.5555 },
  geneva: { lat: 46.2370, lng: 6.1092 },
  'los angeles': { lat: 33.9416, lng: -118.4085 },
  chicago: { lat: 41.9742, lng: -87.9073 },
  miami: { lat: 25.7959, lng: -80.2870 },
  toronto: { lat: 43.6777, lng: -79.6248 },
};

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getListingCoordinates(item: { city?: string; country?: string; id: string }): { lat: number; lng: number } {
  const cityKey = (item.city || '').trim().toLowerCase();
  if (CITY_COORDINATES[cityKey]) {
    return CITY_COORDINATES[cityKey];
  }
  if (item.country?.toUpperCase() === 'IN' || item.country?.toUpperCase() === 'INDIA') {
    return { lat: 19.0896 + (item.id.charCodeAt(0) % 5) * 0.3, lng: 72.8656 + (item.id.charCodeAt(1) % 5) * 0.3 };
  }
  if (item.country?.toUpperCase() === 'AE' || item.country?.toUpperCase() === 'UAE') {
    return { lat: 25.2532 + (item.id.charCodeAt(0) % 4) * 0.1, lng: 55.3657 + (item.id.charCodeAt(1) % 4) * 0.1 };
  }
  if (item.country?.toUpperCase() === 'SG' || item.country?.toUpperCase() === 'SINGAPORE') {
    return { lat: 1.3644 + (item.id.charCodeAt(0) % 3) * 0.05, lng: 103.9915 + (item.id.charCodeAt(1) % 3) * 0.05 };
  }
  if (item.country?.toUpperCase() === 'GB' || item.country?.toUpperCase() === 'UK') {
    return { lat: 51.4700 + (item.id.charCodeAt(0) % 5) * 0.2, lng: -0.4543 + (item.id.charCodeAt(1) % 5) * 0.2 };
  }
  return { lat: 25.2532 + (item.id.charCodeAt(0) % 8) * 0.3, lng: 55.3657 + (item.id.charCodeAt(1) % 8) * 0.3 };
}


export const AVIATION_TAXONOMY: Record<string, string[]> = {
  'All': [
    'All Subcategories',
    'Commercial Pilot License (CPL)',
    'Type Rating (A320 / B737)',
    'Aerospace Design & R&D',
    'OEM Airframe & Engine Parts',
    'Ground Support Equipment (GSE)',
    'Pre-Owned Business Jet Sales',
    'Executive Jet Charter',
    'FBO Executive Lounge & Terminal',
    'Line Maintenance (Part-145)',
    'Heavy Base Overhaul (C & D Check)',
    'VIP In-Flight Gourmet Cuisine',
    '5-Star Aviator Hotel',
  ],
  'Pilot Training & Academies': [
    'All Subcategories',
    'Commercial Pilot License (CPL)',
    'Type Rating (A320 / B737)',
    'Airline Cadet Programs',
    'Level-D Simulator Training',
    'Flight Instructor Rating',
    'Ground School & ATPL Classes',
  ],
  'Aeronautics & Engineering': [
    'All Subcategories',
    'Aerospace Design & R&D',
    'Avionics Systems Integration',
    'Structural Testing & NDT',
    'Propulsion & Turbine Engineering',
    'UAV & Drone Aeronautical Labs',
  ],
  'Aviation Suppliers & GSE': [
    'All Subcategories',
    'OEM Airframe & Engine Parts',
    'Ground Support Equipment (GSE)',
    'Aviation Fuel (Jet A-1 & Avgas)',
    'Cabin Interiors & Seat Systems',
    'Flight Crew Supplies & Corporate Uniforms',
    'Safety & Life Rafts Equipment',
  ],
  'Aircraft Dealers & Brokers': [
    'All Subcategories',
    'Pre-Owned Business Jet Sales',
    'Turboprop & Piston Brokerage',
    'Commercial Aircraft Leasing',
    'Helicopter Acquisition',
    'Aircraft Pre-Purchase Inspections',
  ],
  'Private Air Charter': [
    'All Subcategories',
    'Executive Jet Charter',
    'Turboprop Regional Flights',
    'Helicopter Transfers',
    'Air Ambulance & Medevac',
    'Cargo & Heavy Lift Charter',
    'Empty Leg Specialists',
  ],
  'Airport & FBO Terminals': [
    'All Subcategories',
    'Commercial Airport Terminal',
    'FBO Executive Lounge & Terminal',
    'Airside Ground Handling',
    'Helipad & Vertiport',
    'Air Cargo Complex',
    'Hangarage & Apron Parking',
  ],
  'MRO & Avionics': [
    'All Subcategories',
    'Line Maintenance (Part-145)',
    'Heavy Base Overhaul (C & D Check)',
    'Avionics Calibration & Radar',
    'Engine & APU Shop Overhaul',
    'AOG Expedited Dispatch',
  ],
  'Flight Catering & Galley': [
    'All Subcategories',
    'VIP In-Flight Gourmet Cuisine',
    'High-Altitude Bespoke Menus',
    'Commercial Airline Meal Production',
    'Bonded Wine Vault & Sommelier',
    'Dry-Ice & Cryo Flight Packs',
  ],
  'Boutique Hospitality & Crew': [
    'All Subcategories',
    '5-Star Aviator Hotel',
    '24/7 Crew Transit Day-Rooms',
    'Runway-View Executive Suites',
    'Airside Crew Transfer Shuttles',
  ],
};

export const CATEGORIES = Object.keys(AVIATION_TAXONOMY);

export function detectPresentCountry(): { code: string; name: string; flag: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) return { code: 'IN', name: 'India', flag: '🇮🇳' };
    if (tz.includes('Dubai') || tz.includes('Abu_Dhabi') || tz.includes('Muscat')) return { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' };
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('America') || tz.includes('Denver') || tz.includes('Miami')) return { code: 'US', name: 'United States', flag: '🇺🇸' };
    if (tz.includes('London')) return { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' };
    if (tz.includes('Singapore')) return { code: 'SG', name: 'Singapore', flag: '🇸🇬' };
    if (tz.includes('Berlin') || tz.includes('Frankfurt') || tz.includes('Munich')) return { code: 'DE', name: 'Germany', flag: '🇩🇪' };
    if (tz.includes('Paris')) return { code: 'FR', name: 'France', flag: '🇫🇷' };
    if (tz.includes('Riyadh')) return { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' };
    if (tz.includes('Qatar')) return { code: 'QA', name: 'Qatar', flag: '🇶🇦' };
    if (tz.includes('Zurich') || tz.includes('Geneva')) return { code: 'CH', name: 'Switzerland', flag: '🇨🇭' };
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane')) return { code: 'AU', name: 'Australia', flag: '🇦🇺' };
    if (tz.includes('Toronto') || tz.includes('Vancouver')) return { code: 'CA', name: 'Canada', flag: '🇨🇦' };
    if (tz.includes('Tokyo')) return { code: 'JP', name: 'Japan', flag: '🇯🇵' };
  } catch (e) {
    // fallback
  }
  return { code: 'IN', name: 'India', flag: '🇮🇳' };
}

export const CITIES = ['All', 'Mumbai', 'Delhi', 'Bengaluru', 'Dubai', 'London', 'Singapore', 'Miami', 'Munich', 'RGOA'];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  IN: ['Mumbai', 'Delhi', 'Bengaluru', 'RGOA', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Cochin', 'Pune'],
  AE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Al Ain'],
  US: ['Miami', 'New York', 'Los Angeles', 'Chicago', 'Dallas', 'Atlanta', 'San Francisco', 'Houston', 'Seattle'],
  GB: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Bristol'],
  SG: ['Singapore', 'Seletar'],
  DE: ['Munich', 'Frankfurt', 'Berlin', 'Hamburg', 'Dusseldorf', 'Cologne', 'Stuttgart'],
  FR: ['Paris', 'Nice', 'Toulouse', 'Marseille', 'Lyon', 'Bordeaux'],
  SA: ['Riyadh', 'Jeddah', 'Dammam', 'Medina'],
  QA: ['Doha'],
  CH: ['Zurich', 'Geneva', 'Basel', 'Bern'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton'],
  JP: ['Tokyo', 'Osaka', 'Nagoya', 'Fukuoka', 'Sapporo'],
};

const SORT_OPTIONS = [
  { id: 'featured_desc', label: 'Featured (Default)' },
  { id: 'rating_desc', label: 'Highest Rating' },
  { id: 'reviews_desc', label: 'Most Reviewed' },
  { id: 'established_desc', label: 'Established Year' },
];

export const MarketingPortal: React.FC<MarketingPortalProps> = ({
  currentUser,
  currentBusiness,
  isAdmin,
  activeAdminUser,
  onOpenWallet,
  onOpenAuth,
  onOpenDirectChat,
  onOpenUserProfile,
  onOpenProfileMenu,
  onOpenCustomerCare,
  initialSubTab,
}) => {
  // Portal Tab: 'linkedin_feed' (Stories for you) vs 'directory' (ServiceScout)
  const [portalTab, setPortalTab] = useState<'linkedin_feed' | 'directory'>(
    initialSubTab || 'linkedin_feed'
  );

  useEffect(() => {
    if (initialSubTab) {
      setPortalTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Filters & Search state matching MyGermanUniversity Unifinder
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('truvaer_default_country') || 'All';
  });
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured_desc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasVideoOnly, setHasVideoOnly] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('truvaer_saved_listings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('truvaer_saved_listings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllFavorites = () => {
    setFavorites({});
    try {
      localStorage.removeItem('truvaer_saved_listings');
    } catch {}
  };

  // Near Me Geolocation Quick-Filter
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeNotice, setNearMeNotice] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleToggleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setNearMeNotice(null);
      return;
    }

    setNearMeLoading(true);
    setNearMeNotice(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const fallback = CITY_COORDINATES['dubai'];
      setUserCoords(fallback);
      setNearMeActive(true);
      setNearMeLoading(false);
      setNearMeNotice('Browser GPS unavailable. Sorted by proximity to standard international hub (DXB).');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setNearMeActive(true);
        setNearMeLoading(false);
        setNearMeNotice('GPS proximity active: Listings sorted nearest to your verified position.');
      },
      (err) => {
        // Fallback to detected regional hub
        const fallback = detectedLocation.code === 'IN' ? CITY_COORDINATES['mumbai'] : CITY_COORDINATES['dubai'];
        setUserCoords(fallback);
        setNearMeActive(true);
        setNearMeLoading(false);
        setNearMeNotice(`GPS access skipped (${err.message}). Sorted relative to ${detectedLocation.name || 'regional'} aviation center.`);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  // Type Search option in Business interface for Countries, City, Category, and Sub-Category
  const [universalTypeSearch, setUniversalTypeSearch] = useState('');
  const [countryTypeSearch, setCountryTypeSearch] = useState('');
  const [cityTypeSearch, setCityTypeSearch] = useState('');
  const [categoryTypeSearch, setCategoryTypeSearch] = useState('');
  const [subCategoryTypeSearch, setSubCategoryTypeSearch] = useState('');
  const [showTypeSearchSuggestions, setShowTypeSearchSuggestions] = useState(false);

  // Default Location (Present Country) Detection & Condition
  const detectedLocation = detectPresentCountry();
  const [defaultCountry, setDefaultCountry] = useState<string>(() => {
    return localStorage.getItem('truvaer_default_country') || '';
  });
  const [presentCountryPromptOpen, setPresentCountryPromptOpen] = useState(false);
  const [tempSelectedCountry, setTempSelectedCountry] = useState<string>(detectedLocation.code);

  // Condition to ask for default location (present) country
  useEffect(() => {
    const saved = localStorage.getItem('truvaer_default_country');
    const dismissed = localStorage.getItem('truvaer_location_prompt_dismissed');
    if (saved) {
      setDefaultCountry(saved);
      setSelectedCountry(saved);
    } else if (!dismissed) {
      // Ask user to confirm or set their present default country
      setPresentCountryPromptOpen(true);
    }
  }, []);

  const handleSetDefaultCountry = (countryCode: string) => {
    localStorage.setItem('truvaer_default_country', countryCode);
    setDefaultCountry(countryCode);
    setSelectedCountry(countryCode);
    setPresentCountryPromptOpen(false);
  };

  const handleDismissDefaultLocationPrompt = () => {
    localStorage.setItem('truvaer_location_prompt_dismissed', 'true');
    setPresentCountryPromptOpen(false);
  };

  const handleClearDefaultCountry = () => {
    localStorage.removeItem('truvaer_default_country');
    setDefaultCountry('');
    setSelectedCountry('All');
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All'); // Fast reset of sub-category on domain change
  };

  // Active modal states
  const [activeListing, setActiveListing] = useState<ServiceListing | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [unlockedLeads, setUnlockedLeads] = useState<Record<string, boolean>>({});
  const [unlockedContactsSync, setUnlockedContactsSync] = useState(0);
  const [chatRestrictionNotice, setChatRestrictionNotice] = useState<string | null>(null);
  const [listingsVersion, setListingsVersion] = useState(0);

  // =========================================================================
  // Regional Access Governance & Country-City Strict Isolation (L7 / L8 Gate)
  // Requirement: "Marketing portal getting all the city names even after setting
  // different country fix the code to make sure only City names listed comes when
  // selected with particular country where the admin will control to allow only
  // specific region to specific people. Multiple regions can be selected only if
  // the admin user or manager is approved by L7 or L8"
  // =========================================================================
  const resolvedAdmin =
    activeAdminUser ||
    (isAdmin ? db.getAdminUsers().find((a) => a.email === currentUser?.email) || db.getAdminUsers()[0] : null);

  const userAssignedRegions: AviationZone[] = useMemo(() => {
    if (resolvedAdmin) {
      // Requirement: The authority for Multi-zone changes should be delegated from L7 to L5 (Manager and above)
      if ((resolvedAdmin.level || 0) >= 5 || resolvedAdmin.role === 'SUPER_ADMIN' || resolvedAdmin.role === 'MANAGER' || resolvedAdmin.role === 'ADMIN') {
        return ALL_ZONES; // L5+ Managers and above have delegated global multi-region operational clearance
      }
      if (resolvedAdmin.multi_region_approved && resolvedAdmin.assigned_regions && resolvedAdmin.assigned_regions.length > 0) {
        return resolvedAdmin.assigned_regions; // L5+ approved multi-region
      }
      return resolvedAdmin.assigned_regions && resolvedAdmin.assigned_regions.length > 0
        ? resolvedAdmin.assigned_regions
        : ['APAC'];
    }
    if (currentUser?.assigned_regions && currentUser.assigned_regions.length > 0) {
      return currentUser.assigned_regions;
    }
    return ALL_ZONES;
  }, [resolvedAdmin, currentUser]);

  const hasMultiRegionClearance = useMemo(() => {
    if (!resolvedAdmin) return true;
    // Delegated from L7 to L5 (Manager and above)
    if ((resolvedAdmin.level || 0) >= 5 || resolvedAdmin.role === 'SUPER_ADMIN' || resolvedAdmin.role === 'MANAGER' || resolvedAdmin.role === 'ADMIN') return true;
    return !!resolvedAdmin.multi_region_approved;
  }, [resolvedAdmin]);

  // Countries filtered by assigned region
  const availableCountries = useMemo(() => {
    if (userAssignedRegions.length < ALL_ZONES.length) {
      const allowedCountriesSet = new Set<string>();
      userAssignedRegions.forEach((z) => {
        const countries = AVIATION_ZONES_MAP[z]?.countries || [];
        countries.forEach((c) => allowedCountriesSet.add(c.toLowerCase()));
      });
      return COUNTRIES.filter((c) => {
        if (c.code === 'All') return true;
        return allowedCountriesSet.has(c.name.toLowerCase());
      });
    }
    return COUNTRIES;
  }, [userAssignedRegions]);

  // Dynamic live platform categories from database
  const liveTaxonomy = db.getAviationTaxonomy();
  const availableCategories = useMemo(() => {
    return Object.keys(liveTaxonomy);
  }, [liveTaxonomy, listingsVersion]);

  const availableSubCategories = useMemo(() => {
    return liveTaxonomy[selectedCategory] || ['All Subcategories'];
  }, [selectedCategory, liveTaxonomy, listingsVersion]);

  // Cities strictly bound to selected country!
  const availableCities = useMemo(() => {
    if (selectedCountry === 'All') {
      const citySet = new Set<string>();
      if (userAssignedRegions.length < ALL_ZONES.length) {
        const allowedCountriesSet = new Set<string>();
        userAssignedRegions.forEach((z) => {
          (AVIATION_ZONES_MAP[z]?.countries || []).forEach((c) => allowedCountriesSet.add(c.toLowerCase()));
        });
        for (const [code, cities] of Object.entries(CITIES_BY_COUNTRY)) {
          const cObj = COUNTRIES.find((c) => c.code === code);
          if (cObj && allowedCountriesSet.has(cObj.name.toLowerCase())) {
            cities.forEach((ct) => citySet.add(ct));
          }
        }
      } else {
        Object.values(CITIES_BY_COUNTRY).forEach((cities) => cities.forEach((c) => citySet.add(c)));
      }
      return ['All', ...Array.from(citySet)];
    }

    const countryObj = COUNTRIES.find(
      (c) => c.code.toUpperCase() === selectedCountry.toUpperCase() || c.name.toLowerCase() === selectedCountry.toLowerCase()
    );
    const code = countryObj ? countryObj.code : selectedCountry.toUpperCase();
    const baseList = CITIES_BY_COUNTRY[code] || [];

    const dbListings = db.getServiceListings();
    const additionalCities = new Set<string>();
    dbListings.forEach((l) => {
      if (
        l.city &&
        (l.country?.toLowerCase() === code.toLowerCase() ||
          l.country?.toLowerCase() === countryObj?.name.toLowerCase())
      ) {
        additionalCities.add(l.city);
      }
    });

    const combined = Array.from(new Set([...baseList, ...Array.from(additionalCities)]));
    return ['All', ...combined];
  }, [selectedCountry, userAssignedRegions]);

  // When selected country changes, ensure city is reset if not valid for that country
  useEffect(() => {
    if (selectedCity !== 'All' && !availableCities.includes(selectedCity)) {
      setSelectedCity('All');
    }
  }, [selectedCountry, availableCities, selectedCity]);

  // Operational suspension check: If status is HARD_LOCKED or REJECTED
  const isBusinessSuspended =
    currentBusiness?.verification_status === 'HARD_LOCKED' ||
    currentBusiness?.verification_status === 'REJECTED';

  // Filtered lists based on type-search input
  const filteredAvailableCountries = useMemo(() => {
    if (!countryTypeSearch.trim()) return availableCountries;
    const q = countryTypeSearch.toLowerCase().trim();
    return availableCountries.filter(
      (c) =>
        c.code === 'All' ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [availableCountries, countryTypeSearch]);

  const filteredAvailableCities = useMemo(() => {
    if (!cityTypeSearch.trim()) return availableCities;
    const q = cityTypeSearch.toLowerCase().trim();
    return availableCities.filter(
      (ct) => ct === 'All' || ct.toLowerCase().includes(q)
    );
  }, [availableCities, cityTypeSearch]);

  const filteredAvailableCategories = useMemo(() => {
    if (!categoryTypeSearch.trim()) return availableCategories;
    const q = categoryTypeSearch.toLowerCase().trim();
    return availableCategories.filter(
      (cat) => cat === 'All' || cat.toLowerCase().includes(q)
    );
  }, [availableCategories, categoryTypeSearch]);

  const filteredAvailableSubCategories = useMemo(() => {
    if (!subCategoryTypeSearch.trim()) return availableSubCategories;
    const q = subCategoryTypeSearch.toLowerCase().trim();
    return availableSubCategories.filter(
      (sub) => sub === 'All Subcategories' || sub === 'All' || sub.toLowerCase().includes(q)
    );
  }, [availableSubCategories, subCategoryTypeSearch]);

  // Universal Type-Search Suggestions across Countries, City, Category, and Sub-Category
  const universalSuggestions = useMemo(() => {
    const q = universalTypeSearch.trim().toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedCountries = availableCountries
      .filter((c) => c.code !== 'All' && (c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q))
      .slice(0, 5);

    const matchedCities = availableCities
      .filter((ct) => ct !== 'All' && ct.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedCategories = availableCategories
      .filter((cat) => cat !== 'All' && cat.toLowerCase().includes(q))
      .slice(0, 4);

    const matchedSubCategories: Array<{ category: string; sub: string }> = [];
    Object.entries(liveTaxonomy).forEach(([cat, subs]) => {
      subs.forEach((sub) => {
        if (sub.toLowerCase().includes(q) && matchedSubCategories.length < 5) {
          matchedSubCategories.push({ category: cat, sub });
        }
      });
    });

    const totalMatches =
      matchedCountries.length + matchedCities.length + matchedCategories.length + matchedSubCategories.length;

    return {
      totalMatches,
      countries: matchedCountries,
      cities: matchedCities,
      categories: matchedCategories,
      subCategories: matchedSubCategories,
    };
  }, [universalTypeSearch, availableCountries, availableCities, availableCategories, liveTaxonomy]);

  const globalSettings = db.getGlobalSettings();
  const currentUserId = currentUser ? currentUser.user_id : currentBusiness ? currentBusiness.business_id : 'guest_session';

  // Direct Inquiry Modal State
  const [directInquiryListing, setDirectInquiryListing] = useState<ServiceListing | null>(null);
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySenderName, setInquirySenderName] = useState('');
  const [inquirySenderEmail, setInquirySenderEmail] = useState('');
  const [inquirySenderPhone, setInquirySenderPhone] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  // Business Profile, Budget, Contact & Media Management Modal
  const [editingListing, setEditingListing] = useState<ServiceListing | null>(null);
  const [editActiveTab, setEditActiveTab] = useState<'business' | 'branding' | 'media' | 'services'>('business');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editPricingRate, setEditPricingRate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('IN');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editFacilities, setEditFacilities] = useState('');
  const [editAmenities, setEditAmenities] = useState('');
  const [editServices, setEditServices] = useState('');
  const [editIcao, setEditIcao] = useState('');
  const [editIata, setEditIata] = useState('');
  const [editSaveFeedback, setEditSaveFeedback] = useState<string | null>(null);

  // Direct Device Image Upload Handlers via FileReader
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'create') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'edit') {
        setEditLogoUrl(dataUrl);
      } else {
        setCreateForm((prev) => ({ ...prev, logoUrl: dataUrl }));
      }
      showToast('Logo image loaded successfully from device!');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'create') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    let count = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (target === 'edit') {
          setEditPhotos((prev) => [...prev, dataUrl]);
        } else {
          setCreateForm((prev) => ({ ...prev, photos: [...prev.photos, dataUrl] }));
        }
        count++;
        if (count === files.length) {
          showToast(`Uploaded ${count} image(s) from local device!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Custom Service Addition & Request States (Requirement: Add services option, select Other -> Admin approval)
  const [selectedStandardServiceToAdd, setSelectedStandardServiceToAdd] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceCategory, setCustomServiceCategory] = useState('');
  const [customServiceDesc, setCustomServiceDesc] = useState('');
  const [customServiceFeedback, setCustomServiceFeedback] = useState<string | null>(null);

  // Direct Service Offer Modal State (Requirement: Business and Admin only can send service offers directly to customers)
  const [showServiceOfferModal, setShowServiceOfferModal] = useState(false);
  const [serviceOfferTargetListing, setServiceOfferTargetListing] = useState<ServiceListing | null>(null);

  // Admin Broadcast Modal State (Category, Zone, Country Broadcast)
  const [showAdminBroadcastModal, setShowAdminBroadcastModal] = useState(false);

  // Business User Category & Sub-Category Addition Modal
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Add Services to Listing Modal (Admin & Business Users Only)
  const [showAddServicesModal, setShowAddServicesModal] = useState(false);
  const [targetListingForServicesModal, setTargetListingForServicesModal] = useState<ServiceListing | null>(null);

  // Direct Quotation Modal State
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationListing, setQuotationListing] = useState<ServiceListing | null>(null);

  // Request Quotation Modal State (User-Facing RFQ Flow)
  const [showRequestQuotationModal, setShowRequestQuotationModal] = useState(false);
  const [targetListingForQuotation, setTargetListingForQuotation] = useState<ServiceListing | null>(null);

  // Report & Block Business Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [targetListingForReport, setTargetListingForReport] = useState<ServiceListing | null>(null);

  // Full Quotation & Deals Pipeline Lifecycle Modal State
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);

  // Following Updates Modal State
  const [showFollowingUpdatesModal, setShowFollowingUpdatesModal] = useState(false);

  // Followed Business IDs State
  const [followedBusinessIds, setFollowedBusinessIds] = useState<string[]>(() => {
    return db.getFollowedBusinessIds(currentUser?.user_id || 'user_standard_demo');
  });

  // Blocked Business IDs State
  const [blockedBusinessIds, setBlockedBusinessIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('truvaer_user_blocked_businesses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast alert state
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setPortalToast(msg);
    setTimeout(() => {
      setPortalToast((cur) => (cur === msg ? null : cur));
    }, 4500);
  };

  const handleToggleFollow = (listing: ServiceListing) => {
    const uId = currentUser?.user_id || 'user_standard_demo';
    const isCurrentlyFollowing = followedBusinessIds.includes(listing.business_id);
    if (isCurrentlyFollowing) {
      db.unfollowBusiness(uId, listing.business_id);
      setFollowedBusinessIds((prev) => prev.filter((id) => id !== listing.business_id));
      showToast(`Unfollowed ${listing.name}.`);
    } else {
      db.followBusiness(uId, listing.business_id);
      setFollowedBusinessIds((prev) => [...prev, listing.business_id]);
      showToast(
        `You are now following ${listing.name}! You'll receive real-time notifications when they post updates.`
      );
    }
  };

  const handleOpenReportModal = (listing: ServiceListing) => {
    setTargetListingForReport(listing);
    setShowReportModal(true);
  };

  const handleOpenRequestQuotationModal = (listing: ServiceListing) => {
    setTargetListingForQuotation(listing);
    setShowRequestQuotationModal(true);
  };

  const handleUnblockBusiness = (businessId: string, businessName: string) => {
    try {
      const updated = blockedBusinessIds.filter((id) => id !== businessId);
      setBlockedBusinessIds(updated);
      localStorage.setItem('truvaer_user_blocked_businesses', JSON.stringify(updated));
      showToast(`Unblocked ${businessName}.`);
    } catch {
      // ignore
    }
  };

  const handleToggleBlockBusiness = (businessId: string, businessName: string) => {
    try {
      const isCurrentlyBlocked = blockedBusinessIds.includes(businessId);
      if (isCurrentlyBlocked) {
        handleUnblockBusiness(businessId, businessName);
      } else {
        const updated = [...blockedBusinessIds, businessId];
        setBlockedBusinessIds(updated);
        localStorage.setItem('truvaer_user_blocked_businesses', JSON.stringify(updated));
        showToast(`Blocked ${businessName}. Content from this business is restricted.`);
      }
    } catch {
      // ignore
    }
  };

  // Create Listing Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'Airport',
    subCategory: 'Airport',
    logoUrl: '',
    videoUrl: '',
    photos: [] as string[],
    photoInput: '',
    city: 'RGOA',
    country: 'IN',
    address: '',
    area: 'Shamshabad',
    pincode: '50097',
    phone: '+91 ',
    email: '',
    registration_number: 'AV-ORG-',
    established_year: 2024,
    facilities: 'Airports, VIP Lounge, Fueling Bay, Helipad',
    amenities: '24/7 Security, Crew Rest Suite, High-Speed Wi-Fi, Customs Clearance',
    services: 'Airside Ground Handling, Commercial Aviation Terminal, Runway Lighting Maintenance',
    leadUnlockCredits: 10,
    directChatCredits: 5,
  });

  // Customer Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState<string | null>(null);

  // Active Video Playback modal
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocState, setNewLocState] = useState('');
  const [newLocCountry, setNewLocCountry] = useState('IN');
  const [newLocDisplay, setNewLocDisplay] = useState('');
  const [locFeedback, setLocFeedback] = useState<string | null>(null);

  // Determine if user can edit media & branding
  const isVerifiedBusinessUser = currentBusiness?.verification_status === 'VERIFIED' || isAdmin;

  // Strict Policy: Only Admin and Manager roles can create listings, categories, or locations. Business users cannot self-add businesses.
  const isAdminOrManager = Boolean(
    isAdmin ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER' ||
    (activeAdminUser && (
      activeAdminUser.role === 'ADMIN' ||
      activeAdminUser.role === 'SUPER_ADMIN' ||
      activeAdminUser.role === 'MANAGER' ||
      (activeAdminUser.level || 0) >= 1
    ))
  );

  // Strict User/Business Profile Edit Permission Policy:
  // Restrict access ONLY to the profile or business created by the Business user account.
  // Example: If 1 account creates multiple businesses, the account should have access to edit only that profiles/business,
  // but NOT the profiles or businesses listed by other accounts.
  // Similarly, admin and super admin have access to edit all profiles.
  const canEditListing = (listing: ServiceListing): boolean => {
    if (isAdmin) return true;

    // Logged in as a Business account
    if (currentBusiness) {
      if (listing.business_id === currentBusiness.business_id || listing.id === currentBusiness.business_id) {
        return true;
      }
      if (
        currentBusiness.business_email &&
        listing.email &&
        listing.email.toLowerCase() === currentBusiness.business_email.toLowerCase()
      ) {
        return true;
      }
    }

    // Logged in as a user account
    if (currentUser) {
      if (listing.creator_user_id && listing.creator_user_id === currentUser.user_id) {
        return true;
      }
      if (listing.email && currentUser.email && listing.email.toLowerCase() === currentUser.email.toLowerCase()) {
        return true;
      }
      const b = db.getBusinessById(listing.business_id);
      if (b) {
        if (b.creator_user_id === currentUser.user_id) return true;
        if (b.business_email && currentUser.email && b.business_email.toLowerCase() === currentUser.email.toLowerCase()) {
          return true;
        }
      }
    }

    return false;
  };

  // Domain match helpers
  const categoryMatches = (listingCategory: string, filterCat: string): boolean => {
    if (filterCat === 'All') return true;
    const l = (listingCategory || '').toLowerCase();
    const f = filterCat.toLowerCase();
    if (l === f) return true;
    if (f.includes('operations') || f.includes('training')) {
      return l.includes('training') || l.includes('operations') || l.includes('corporate') || l.includes('dispatch');
    }
    if (f.includes('aeronautics') || f.includes('engineering')) {
      return l.includes('aeronautics') || l.includes('engineering') || l.includes('aerospace') || l.includes('propulsion');
    }
    if (f.includes('supplier') || f.includes('gse')) {
      return l.includes('supplier') || l.includes('parts') || l.includes('spare') || l.includes('gse') || l.includes('equipment');
    }
    if (f.includes('dealer') || f.includes('broker')) {
      return l.includes('dealer') || l.includes('broker') || l.includes('sales') || l.includes('acquisition') || l.includes('leasing');
    }
    if (f.includes('charter')) {
      return l.includes('charter') || l.includes('private air');
    }
    if (f.includes('airport') || f.includes('fbo') || f.includes('terminal')) {
      return l.includes('airport') || l.includes('fbo') || l.includes('terminal');
    }
    if (f.includes('mro') || f.includes('avionics')) {
      return l.includes('mro') || l.includes('avionics') || l.includes('maintenance') || l.includes('overhaul');
    }
    if (f.includes('catering') || f.includes('galley')) {
      return l.includes('catering') || l.includes('galley') || l.includes('cuisine');
    }
    if (f.includes('hospitality') || f.includes('crew') || f.includes('hotel')) {
      return l.includes('hospitality') || l.includes('hotel') || l.includes('crew');
    }
    return false;
  };

  const subCategoryMatches = (listingSub: string | undefined, filterSub: string): boolean => {
    if (filterSub === 'All' || filterSub === 'All Subcategories') return true;
    if (!listingSub) return false;
    const l = listingSub.toLowerCase();
    const f = filterSub.toLowerCase();
    return l.includes(f) || f.includes(l);
  };

  const countryMatches = (listingCountry: string | undefined, filterCountry: string): boolean => {
    if (filterCountry === 'All') return true;
    if (!listingCountry) return false;
    const target = filterCountry.toUpperCase();
    const actual = listingCountry.toUpperCase();
    if (actual === target) return true;
    const matchedCountry = COUNTRIES.find((c) => c.code === target);
    if (matchedCountry && (actual === matchedCountry.name.toUpperCase() || actual.includes(matchedCountry.code))) {
      return true;
    }
    return false;
  };

  // Retrieve service listings with filters
  const allListings = db.getServiceListings();

  const filteredListings = allListings
    .filter((s) => {
      // Condition 1: Only admin accounts have access to view restricted/unapproved publications.
      // Standard users and guests can only view PUBLISHED listings.
      if (!isAdmin && s.publication_status && s.publication_status !== 'PUBLISHED') {
        return false;
      }

      // Category filter
      if (!categoryMatches(s.category, selectedCategory)) {
        return false;
      }
      // Sub-category filter
      if (!subCategoryMatches(s.subCategory, selectedSubCategory)) {
        return false;
      }
      // Country filter
      if (!countryMatches(s.country, selectedCountry)) {
        return false;
      }
      // City / Hub filter
      if (
        selectedCity !== 'All' &&
        s.city.toLowerCase() !== selectedCity.toLowerCase() &&
        !s.city.toLowerCase().includes(selectedCity.toLowerCase()) &&
        !(s.address && s.address.toLowerCase().includes(selectedCity.toLowerCase())) &&
        !(s.area && s.area.toLowerCase().includes(selectedCity.toLowerCase()))
      ) {
        return false;
      }

      // Services filter (multi-selected services)
      if (selectedServices.length > 0) {
        const matchesAnyService = selectedServices.some((sel) =>
          s.services.some(
            (svc) =>
              svc.toLowerCase().includes(sel.toLowerCase()) || sel.toLowerCase().includes(svc.toLowerCase())
          )
        );
        if (!matchesAnyService) return false;
      }

      // Company / Organization filter
      if (
        selectedCompany !== 'All' &&
        s.name.toLowerCase() !== selectedCompany.toLowerCase() &&
        s.business_id !== selectedCompany
      ) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !s.isVerified) {
        return false;
      }
      // Video only filter
      if (hasVideoOnly && (!s.videoUrl || s.videoUrl.trim() === '')) {
        return false;
      }
      // Search query filter
      if (appliedSearch.trim() !== '') {
        const q = appliedSearch.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCat = s.category.toLowerCase().includes(q);
        const matchesSubCat = s.subCategory ? s.subCategory.toLowerCase().includes(q) : false;
        const matchesCountry = s.country ? s.country.toLowerCase().includes(q) : false;
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesArea = s.area ? s.area.toLowerCase().includes(q) : false;
        const matchesServices = s.services.some((svc) => svc.toLowerCase().includes(q));
        const matchesFacilities = s.facilities ? s.facilities.some((f) => f.toLowerCase().includes(q)) : false;
        if (!matchesName && !matchesCat && !matchesSubCat && !matchesCountry && !matchesCity && !matchesArea && !matchesServices && !matchesFacilities) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (nearMeActive && userCoords) {
        const coordsA = getListingCoordinates(a);
        const coordsB = getListingCoordinates(b);
        const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, coordsA.lat, coordsA.lng);
        const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, coordsB.lat, coordsB.lng);
        return distA - distB;
      }
      if (selectedSort === 'rating_desc') return b.rating - a.rating;
      if (selectedSort === 'reviews_desc') return b.reviews_count - a.reviews_count;
      if (selectedSort === 'established_desc') return (b.established_year || 0) - (a.established_year || 0);
      return 0; // Featured default
    });

  const handleApplyFilter = () => {
    setAppliedSearch(searchQuery);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setAppliedSearch('');
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSelectedServices([]);
    setSelectedCountry(defaultCountry || 'All');
    setSelectedCity('All');
    setSelectedCompany('All');
    setSelectedSort('featured_desc');
    setVerifiedOnly(false);
    setHasVideoOnly(false);
  };

  // Pay-Per-Lead Model: Credits are debited from the business account that owns the listing (NOT the viewer!)
  const handleUnlockLead = (listing: ServiceListing) => {
    const viewerId = currentUser?.user_id || currentBusiness?.business_id || 'guest_aviator';

    // Pay-Per-Lead: debits the BUSINESS account wallet that owns the listing
    const res = db.requestPhoneUnlock(listing.id, viewerId);
    
    // Immediately unlock contact coordinates for the viewer (FREE for the prospective customer)
    setUnlockedLeads((prev) => ({ ...prev, [listing.id]: true }));
    setUnlockedContactsSync((v) => v + 1);

    // Record lead in CRM for the business
    db.recordPhoneLeadView(listing.id, viewerId);
  };

  // Condition 5: Request phone number unlocks contact with X credit debit from provider business wallet, valid for 30 days
  const handleRequestPhoneUnlock = (listing: ServiceListing) => {
    const res = db.requestPhoneUnlock(listing.id, currentUserId);
    if (res.success) {
      alert(`Contact Unmasked: ${res.message}\nPhone: ${listing.phone}\nValid for ${globalSettings.unlockValidityDays} days.`);
      setUnlockedContactsSync((v) => v + 1);
    } else {
      alert(res.message);
    }
  };

  // Condition 1: Only admin accounts can change, modify, or restrict publication
  const handleAdminSetPublication = (listingId: string, status: PublicationStatus) => {
    if (!isAdmin) {
      alert('Security Exception: Only administrative accounts have authority to change, modify, or restrict publication.');
      return;
    }

    let reason: string | undefined = undefined;
    if (status === 'RESTRICTED') {
      const inputReason = window.prompt(
        'Enter reason for restricting this aviation publication:',
        'Security compliance or document audit pending'
      );
      if (inputReason === null) return;
      reason = inputReason.trim() || 'Restricted by administrator';
    }

    const adminId = currentUser?.user_id || 'admin_officer';
    const res = db.adminSetPublicationStatus(listingId, status, adminId, reason);
    alert(res.message);
    setListingsVersion((v) => v + 1);
  };

  // Condition 3: Direct chat permitted only between Business-to-Standard & Standard-to-Business
  const handleDirectChat = (listing: ServiceListing) => {
    let senderType: 'BUSINESS_USER' | 'STANDARD_USER' | 'ADMIN' | null = null;
    if (currentBusiness) {
      senderType = 'BUSINESS_USER';
    } else if (currentUser) {
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MANAGER') {
        senderType = 'ADMIN';
      } else {
        senderType = 'STANDARD_USER';
      }
    }

    if (!senderType) {
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        alert('Please log in with an Aviator or Corporate Business account to initiate direct communications.');
      }
      return;
    }

    // Target is an aviation provider business
    const validation = db.validateChatPermission(senderType, 'BUSINESS_USER');
    if (!validation.allowed) {
      setChatRestrictionNotice(validation.reason || 'Direct chat is prohibited under platform governance policy.');
      return;
    }

    // Open Direct Inquiry & Live Encrypted Chat Modal
    setDirectInquiryListing(listing);
    setInquirySubject(`Direct Inquiry: ${listing.name}`);
    setInquiryMessage('');
    setInquirySenderName(
      currentUser
        ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || `@${currentUser.username}`
        : currentBusiness?.organization_name || 'Aviator Client'
    );
    setInquirySenderEmail(currentUser?.email || currentBusiness?.business_email || '');
    setInquirySenderPhone(currentUser?.phone_number || currentBusiness?.phone_number || '');
    setInquirySuccess(null);
  };

  const handleSendDirectInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInquiryListing) return;
    if (!inquiryMessage.trim()) {
      alert('Please enter your inquiry message.');
      return;
    }
    if (!inquirySenderEmail.trim()) {
      alert('Please enter your contact email address.');
      return;
    }

    const currentUserId = currentUser?.user_id || 'guest_aviator_' + Math.random().toString(36).substring(7);

    // Requirement 4: If the chat is started the X value of credit is debited from the business account holder wallet
    const debitRes = db.startDirectChatWithDebit(
      directInquiryListing.id,
      currentUserId,
      inquirySenderName || 'Aviator Client',
      inquirySenderEmail,
      inquiryMessage
    );

    // Log the inquiry into database API / audit logs for tracking
    db.logApiCall(
      '/api/v1/marketplace/direct-inquiry',
      'POST',
      200,
      {
        listing_id: directInquiryListing.id,
        listing_name: directInquiryListing.name,
        recipient_email: directInquiryListing.email,
        sender_name: inquirySenderName,
        sender_email: inquirySenderEmail,
        sender_phone: inquirySenderPhone,
        subject: inquirySubject,
        message: inquiryMessage,
        debited_credits: debitRes.debitedCredits,
        auto_renew_triggered: debitRes.autoRenewTriggered,
      },
      {
        status: 'DISPATCHED',
        encrypted: true,
        channel: 'TRUVAER_DIRECT_ENCRYPTED_RELAY',
        message_id: `inq_${Math.random().toString(36).substring(7)}`,
      }
    );

    setInquirySuccess(
      `Inquiry dispatched directly to ${directInquiryListing.name}. ${debitRes.debitedCredits} credits debited from provider corporate wallet.${
        debitRes.autoRenewTriggered ? ' Provider wallet auto-renewed.' : ''
      }`
    );
    setTimeout(() => {
      setDirectInquiryListing(null);
      setInquirySuccess(null);
    }, 4000);
  };

  // Open Business, Budget & Media Editor
  const handleOpenEditMedia = (
    listing: ServiceListing,
    defaultTab: 'business' | 'branding' | 'media' | 'services' = 'business'
  ) => {
    if (!canEditListing(listing)) {
      alert?.('Access Terminated: You are not permitted to edit other accounts. Only the owning business user account or Administrator may modify this profile.');
      return;
    }
    setEditingListing(listing);
    setEditActiveTab(defaultTab);
    setEditPhone(listing.phone || currentBusiness?.phone_number || '');
    setEditEmail(listing.email || currentBusiness?.business_email || '');
    setEditBudget(listing.budget || currentBusiness?.budget || '₹1,500,000 / Sector');
    setEditPricingRate(listing.pricing_rate || currentBusiness?.pricing_rate || '₹3,50,000 / Block Hour');
    setEditAddress(listing.address || currentBusiness?.physical_location || '');
    setEditCity(listing.city || 'RGOA');
    setEditCountry(listing.country || 'IN');
    setEditLogoUrl(listing.logoUrl || '');
    setEditVideoUrl(listing.videoUrl || '');
    setEditPhotos(listing.photos ? [...listing.photos] : []);
    setNewPhotoInput('');
    setEditSubCategory(listing.subCategory || '');
    setEditArea(listing.area || '');
    setEditPincode(listing.pincode || '');
    setEditFacilities(listing.facilities ? listing.facilities.join(', ') : '');
    setEditAmenities(listing.amenities ? listing.amenities.join(', ') : '');
    setEditServices(listing.services ? listing.services.join(', ') : '');
    setEditIcao(listing.icao || '');
    setEditIata(listing.iata || '');
    setEditSaveFeedback(null);
  };

  const handleAddPhotoToEdit = () => {
    if (!newPhotoInput.trim()) return;
    setEditPhotos((prev) => [...prev, newPhotoInput.trim()]);
    setNewPhotoInput('');
  };

  const handleRemovePhotoFromEdit = (index: number) => {
    setEditPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveMediaAndBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    if (!canEditListing(editingListing)) {
      setEditSaveFeedback('Access Denied: You do not have permission to modify this business profile.');
      return;
    }

    const parsedFacilities = editFacilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedAmenities = editAmenities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedServices = editServices
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = db.updateServiceListingMediaAndBranding(editingListing.id, {
      phone: editPhone.trim(),
      email: editEmail.trim(),
      budget: editBudget.trim(),
      pricing_rate: editPricingRate.trim(),
      address: editAddress.trim(),
      city: editCity.trim(),
      country: editCountry.trim(),
      logoUrl: editLogoUrl.trim(),
      videoUrl: editVideoUrl.trim(),
      photos: editPhotos,
      subCategory: editSubCategory.trim(),
      area: editArea.trim(),
      pincode: editPincode.trim(),
      facilities: parsedFacilities,
      amenities: parsedAmenities,
      services: parsedServices,
      icao: editIcao.trim().toUpperCase(),
      iata: editIata.trim().toUpperCase(),
    });

    // Also sync business profile if this listing belongs to logged-in business
    if (currentBusiness && (currentBusiness.business_id === editingListing.business_id || editingListing.business_id === 'biz_verified_general')) {
      db.updateBusinessProfileDetails(currentBusiness.business_id, {
        phone_number: editPhone.trim(),
        business_email: editEmail.trim(),
        budget: editBudget.trim(),
        pricing_rate: editPricingRate.trim(),
        physical_location: editAddress.trim(),
      });
    }

    if (res.success) {
      setEditSaveFeedback('Business details, budget, contact & media updated successfully!');
      setListingsVersion((v) => v + 1);
      setTimeout(() => {
        setEditingListing(null);
        setEditSaveFeedback(null);
      }, 1200);
    }
  };

  // Add standard service directly to listing
  const handleAddStandardService = (serviceName: string) => {
    if (!editingListing || !serviceName.trim()) return;
    const res = db.addServiceToListing(editingListing.id, serviceName.trim());
    if (res.success && res.listing) {
      setEditingListing({ ...res.listing });
      setEditServices(res.listing.services.join(', '));
      setListingsVersion((v) => v + 1);
      setCustomServiceFeedback(`Added "${serviceName}" to listing.`);
      setSelectedStandardServiceToAdd('');
      setTimeout(() => setCustomServiceFeedback(null), 3000);
    } else {
      setCustomServiceFeedback(res.message);
    }
  };

  // Remove service from listing
  const handleRemoveService = (serviceName: string) => {
    if (!editingListing) return;
    const res = db.removeServiceFromListing(editingListing.id, serviceName);
    if (res.success && res.listing) {
      setEditingListing({ ...res.listing });
      setEditServices(res.listing.services.join(', '));
      setListingsVersion((v) => v + 1);
      setCustomServiceFeedback(`Removed "${serviceName}".`);
      setTimeout(() => setCustomServiceFeedback(null), 3000);
    }
  };

  // Submit custom service request ("Other" -> Admin Approval)
  const handleSubmitCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing || !customServiceName.trim()) {
      setCustomServiceFeedback('Please enter a custom service name.');
      return;
    }

    const bizId = editingListing.business_id;
    const bizName = editingListing.name;
    const requestedBy = currentBusiness?.owner_name || currentUser?.first_name || 'Business Operator';

    const res = db.requestCustomService({
      business_id: bizId,
      business_name: bizName,
      listing_id: editingListing.id,
      service_name: customServiceName.trim(),
      category: customServiceCategory.trim() || editingListing.category,
      description: customServiceDesc.trim() || `Custom bespoke service requested for ${editingListing.name}.`,
      requested_by: requestedBy,
    });

    if (res.success) {
      setCustomServiceFeedback(res.message);
      setCustomServiceName('');
      setCustomServiceDesc('');
      setTimeout(() => setCustomServiceFeedback(null), 5000);
    } else {
      setCustomServiceFeedback(res.message);
    }
  };

  // Create Listing Handler
  const handleCreateListingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Policy: Creating business listings is permitted ONLY for Admin and Manager level access
    if (!isAdminOrManager) {
      alert('Permission Denied: Creating business listings is restricted strictly to Admin and Manager accounts. Business users cannot self-add businesses.');
      return;
    }

    if (!createForm.name.trim()) {
      alert('Please provide an organization name.');
      return;
    }

    const businessId = currentBusiness?.business_id || 'biz_verified_general';

    const parsedFacilities = createForm.facilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedAmenities = createForm.amenities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedServices = createForm.services
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = db.createServiceListing({
      business_id: businessId,
      name: createForm.name.trim(),
      category: createForm.category,
      subCategory: createForm.subCategory.trim(),
      logoUrl: createForm.logoUrl.trim() || undefined,
      videoUrl: createForm.videoUrl.trim() || undefined,
      photos: createForm.photos.length > 0 ? createForm.photos : [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'
      ],
      city: createForm.city,
      country: createForm.country,
      address: createForm.address.trim() || 'Aviation Hub Avenue',
      area: createForm.area.trim(),
      pincode: createForm.pincode.trim(),
      phone: createForm.phone.trim(),
      email: createForm.email.trim() || 'partner@truvaer.com',
      registration_number: createForm.registration_number.trim(),
      established_year: Number(createForm.established_year) || 2024,
      facilities: parsedFacilities,
      amenities: parsedAmenities,
      services: parsedServices,
      isVerified: false,
      publication_status: 'PENDING_APPROVAL',
      leadUnlockCredits: createForm.leadUnlockCredits,
      directChatCredits: createForm.directChatCredits,
    });

    if (res.success) {
      alert(
        'Marketplace listing registered successfully!\n\nSecurity Policy: Before this organization/business listing goes live on the marketplace, administrative authentication must be completed by the Truvaer Admin Team to verify credentials and ensure no fake business accounts are published.'
      );
      setShowCreateModal(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;

    const authorId = currentUser ? currentUser.user_id : 'guest_aviator';
    const authorName = currentUser
      ? `${currentUser.first_name || 'Aviator'} ${currentUser.last_name || ''}`.trim() || `@${currentUser.username}`
      : 'Verified Aviator';

    const res = db.addReview(activeListing.id, authorId, authorName, newRating, newComment);
    if (res.success) {
      setReviewSubmitSuccess('Review published! You have been credited +50 Earned Credits as a Community Bounty.');
      setNewComment('');
      setTimeout(() => setReviewSubmitSuccess(null), 4000);
    }
  };

  const handleModerateReview = (reviewId: string, action: 'hide' | 'unhide' | 'delete') => {
    const actorRole = isAdmin ? 'ADMIN' : 'BUSINESS';
    const res = db.moderateReview(reviewId, action, actorRole);
    if (res.success) {
      setActiveListing({ ...activeListing! });
    } else {
      alert(res.message);
    }
  };

  return (
    <div id="marketplace-root" className="space-y-4">
      {/* Top Breadcrumbs & Marketplace Header - Visible only when browsing ServiceScout directory */}
      {portalTab === 'directory' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono tracking-wider text-slate-400">
              <span className="font-bold text-white uppercase tracking-widest text-[13px]">
                SERVICESCOUT SHOWCASE
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-blue-400 font-semibold">
                ServiceScout &gt; Verified Business Directory &amp; Fleet Showcase
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Global verified aviation service directory, showcase, airport terminals, luxury suites &amp; FBO facilities.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            {/* Quick status pill */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ServiceScout: {filteredListings.length} Active Listings</span>
            </div>

            {/* Customer Care / VIP Concierge quick action for Business & Users */}
            {onOpenCustomerCare && (
              <button
                onClick={onOpenCustomerCare}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  currentBusiness
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-white'
                    : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300 hover:text-white'
                }`}
                title={currentBusiness ? 'Connect with Customer Care: VIP Concierge & B2B Priority Queue' : 'Connect with Customer Care: Live Chat & Support'}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{currentBusiness ? 'VIP Concierge' : 'Customer Care'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Portal View Mode Switcher: Toggle between Stories for you & ServiceScout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPortalTab('linkedin_feed')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              portalTab === 'linkedin_feed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Stories for you</span>
          </button>

          <button
            type="button"
            onClick={() => setPortalTab('directory')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              portalTab === 'directory'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ServiceScout</span>
            {!db.isModuleActive('mod_biz_listing') && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                Offline
              </span>
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-400 pr-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active View: {portalTab === 'linkedin_feed' ? 'Stories for you' : 'ServiceScout'}</span>
        </div>
      </div>

      {portalTab === 'linkedin_feed' ? (
        <LinkedInMarketingFeed
          currentUser={currentUser}
          currentBusiness={currentBusiness}
          isAdmin={isAdmin}
          activeAdminUser={activeAdminUser}
          onOpenWallet={onOpenWallet}
          onOpenDirectChat={onOpenDirectChat}
          onOpenUserProfile={onOpenUserProfile}
          onSwitchToDirectory={() => setPortalTab('directory')}
        />
      ) : !db.isModuleActive('mod_biz_listing') ? (
        <div className="p-8 sm:p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl mx-auto my-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-white">Business Listing &amp; ServiceScout Offline</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              This module has been suspended globally by the L8 Sovereign Administrator. Business listings, directory searches, and quotation submissions are disabled platform-wide.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setPortalTab('linkedin_feed')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer inline-flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Browse Stories for you</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Two-Column Responsive Layout: Fixed Left Filters Sidebar + Scrolling Right Content */}
          <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* LEFT COLUMN: Fixed Filters Sidebar (Matching Reference Filter Interface) */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-20 self-start lg:max-h-[calc(100vh-5rem)] overflow-y-auto pr-1 pb-16 scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-slate-900/40 rounded-3xl overscroll-contain">
          <ServiceScoutFilterSidebar
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedSubCategory={selectedSubCategory}
            onSubCategoryChange={setSelectedSubCategory}
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            selectedCompany={selectedCompany}
            onCompanyChange={setSelectedCompany}
            verifiedOnly={verifiedOnly}
            onVerifiedOnlyChange={setVerifiedOnly}
            hasVideoOnly={hasVideoOnly}
            onHasVideoOnlyChange={setHasVideoOnly}
            onResetAll={handleResetFilters}
            availableCategories={availableCategories}
            availableSubCategories={availableSubCategories}
            availableCountries={availableCountries}
            availableCities={availableCities}
            allListings={allListings}
            filteredCount={filteredListings.length}
            hasMultiRegionClearance={hasMultiRegionClearance}
            userAssignedRegions={userAssignedRegions}
            onOpenProfileMenu={onOpenProfileMenu}
          />
        </aside>

        {/* RIGHT COLUMN: ServiceScout Business List & Search */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Condition: Organization Status on HARD_LOCKED, REJECTED, or Unverified */}
          {currentBusiness && currentBusiness.verification_status !== 'VERIFIED' && (
            <div
              className={`border-2 rounded-2xl p-4 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
                currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                  ? 'bg-rose-950/85 border-rose-500/60'
                  : 'bg-amber-950/85 border-amber-500/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-sm text-white uppercase tracking-wider">
                      {currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                        ? 'ORGANIZATION HARD-LOCKED / SUSPENDED BY ADMIN'
                        : 'ORGANIZATION UNDER VERIFICATION WITH ADMIN'}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/60 text-amber-300 font-bold border border-amber-500/40">
                      STANDARD USER MODE
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                    {currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                      ? 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
                      : 'Your account is under verification with the Admin, your service options will be enabled once verified.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVerificationModal(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                  currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                Verification Details
              </button>
            </div>
          )}

          {/* ServiceScout Header at Business List */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>ServiceScout</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                    Verified Business Directory &amp; Search
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Search, filter, and inspect verified aviation enterprises, charter operators, and engineering facilities.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowLifecycleModal(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="View Quotation Requests, Deals and Closed Sales"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                <span>Quotation &amp; Deals Tracker</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFollowingUpdatesModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="View latest announcements and updates from followed organizations"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Following Updates ({followedBusinessIds.length})</span>
              </button>

              <div className="text-xs font-mono text-slate-400 pl-1">
                <span className="text-white font-bold">{filteredListings.length}</span> verified
              </div>
            </div>
          </div>

          {/* Toast Notification Alert Banner */}
          {portalToast && (
            <div className="bg-sky-950/80 border border-sky-500/40 p-3 px-4 rounded-2xl text-xs text-sky-200 flex items-center justify-between shadow-lg animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{portalToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setPortalToast(null)}
                className="text-slate-400 hover:text-white text-xs font-bold ml-2 cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}

          {/* SERVICE SCOUT SEARCH ENGINE: Multi-Filter Matrix with Available Details Displayed Below */}
          <ServiceScoutSearchEngine
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedSubCategory={selectedSubCategory}
            onSubCategoryChange={setSelectedSubCategory}
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            availableCategories={availableCategories}
            availableSubCategories={availableSubCategories}
            availableCountries={availableCountries}
            allListings={allListings}
            filteredCount={filteredListings.length}
            onApplyFilter={handleApplyFilter}
            onResetFilters={handleResetFilters}
            isVerifiedBusinessUser={isAdminOrManager}
            canCreateListing={isAdminOrManager}
            onCreateListing={isAdminOrManager ? () => setShowCreateModal(true) : undefined}
            onAddCategoryModal={isAdminOrManager ? () => setShowAddCategoryModal(true) : undefined}
            onAddLocationModal={isAdminOrManager ? () => setShowAddLocationModal(true) : undefined}
          />

          {/* Account Profile button removed from ServiceScout at Standard User interface as requested */}

            {/* Requirement 7: Google Ads responsive placement inside marketing directory */}
            <div className="mt-4">
              <GoogleAdSlot adSlotId="marketplace-directory-banner" />
            </div>

            {/* Condition to ask for default location (present) country */}
            {presentCountryPromptOpen && (
              <div className="mt-3 p-3.5 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400 shrink-0 mt-0.5">
                    <LocateFixed className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-xs font-bold">Set Default Location (Present Country)</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-medium">
                        Detected: {detectedLocation.flag} {detectedLocation.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Would you like to set your default country to prioritize localized flight academies, aeronautical engineering labs, suppliers, aircraft dealers, and charter operators?
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => handleSetDefaultCountry(detectedLocation.code)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-sky-200" />
                    <span>Confirm {detectedLocation.flag} {detectedLocation.name}</span>
                  </button>

                  <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
                    <select
                      value={tempSelectedCountry}
                      onChange={(e) => setTempSelectedCountry(e.target.value)}
                      className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer"
                    >
                      {COUNTRIES.filter((c) => c.code !== 'All').map((c) => (
                        <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSetDefaultCountry(tempSelectedCountry)}
                      className="ml-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Set
                    </button>
                  </div>

                  <button
                    onClick={handleDismissDefaultLocationPrompt}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    Browse Global (All)
                  </button>
                </div>
              </div>
            )}

          {/* Row Below Search: Only the Featured (Default) Sort Option & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1 py-1">
            <div className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{filteredListings.length}</span> listing{filteredListings.length === 1 ? '' : 's'}
              {appliedSearch && <span> for &ldquo;<span className="text-blue-400">{appliedSearch}</span>&rdquo;</span>}
              {selectedCategory !== 'All' && <span> in <span className="text-sky-400 font-semibold">{selectedCategory}</span></span>}
              {selectedSubCategory !== 'All' && <span> &gt; <span className="text-indigo-400 font-semibold">{selectedSubCategory}</span></span>}
              {selectedCountry !== 'All' && (
                <span> in <span className="text-emerald-400 font-semibold">{COUNTRIES.find((c) => c.code === selectedCountry)?.name || selectedCountry}</span></span>
              )}
            </div>

            {/* Featured (Default) Sort Option & Business/Admin Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
              {/* Saved Listings / Favorites Drawer Button (A1) */}
              <button
                type="button"
                onClick={() => setShowSavedDrawer(true)}
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                  Object.values(favorites).filter(Boolean).length > 0
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
                title="View your saved aviation listings"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    Object.values(favorites).filter(Boolean).length > 0
                      ? 'fill-rose-400 text-rose-400'
                      : 'text-slate-400'
                  }`}
                />
                <span>Saved ({Object.values(favorites).filter(Boolean).length})</span>
              </button>

              {/* "Near Me" Geolocation Quick-Filter (A3) */}
              <button
                type="button"
                onClick={handleToggleNearMe}
                disabled={nearMeLoading}
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                  nearMeActive
                    ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
                title="Sort directory listings nearest to your live GPS coordinates"
              >
                <Compass
                  className={`w-3.5 h-3.5 ${
                    nearMeLoading ? 'animate-spin' : nearMeActive ? 'text-slate-950' : 'text-sky-400'
                  }`}
                />
                <span>{nearMeLoading ? 'Locating...' : nearMeActive ? 'Near Me: Active' : 'Near Me'}</span>
              </button>

              {isVerifiedBusinessUser && (
                <button
                  onClick={() => {
                    setServiceOfferTargetListing(null);
                    setShowServiceOfferModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                  title="Direct Service Offer: Pitch services directly to inquiring customers"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Direct Service Offer</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowAdminBroadcastModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                  title="Admin Regional Broadcast: Send notification/email by Category, Country and Zone (APAC, ANZ, CIS, EMEA, LATAM, NA)"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Airway Broadcast (Zones)</span>
                </button>
              )}

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 text-xs font-semibold">Sort By:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-slate-600 focus:ring-1 focus:ring-blue-500 shadow-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Near Me Active Notification & Reset Bar */}
          {nearMeActive && (
            <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-sky-950/70 border border-sky-800/80 text-xs text-sky-200 shadow-md">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{nearMeNotice || 'Near Me Active: Listings sorted by geographical proximity.'}</span>
              </div>
              <button
                type="button"
                onClick={() => setNearMeActive(false)}
                className="text-[11px] font-bold text-sky-400 hover:text-white underline cursor-pointer ml-2 shrink-0"
              >
                Reset Distance
              </button>
            </div>
          )}

      {/* Listing Cards List: Exactly reproducing the 3-Section layout from the shared screenshot */}
      <div className="space-y-4">
        {filteredListings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Marketplace listings match your filters</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search query, selecting &lsquo;All Global Hubs&rsquo;, or clearing category tags.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredListings.map((item) => {
            const isLeadUnlocked = unlockedLeads[item.id] || false;
            const isFavorited = favorites[item.id] || false;
            const isFollowing = followedBusinessIds.includes(item.business_id);
            const isBlocked = blockedBusinessIds.includes(item.business_id);
            const followersCount = db.getBusinessFollowersCount(item.business_id);
            const photoUrl =
              item.photos?.[0] ||
              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';
            const itemCoords = getListingCoordinates(item);
            const distanceKm = userCoords
              ? calculateDistanceKm(userCoords.lat, userCoords.lng, itemCoords.lat, itemCoords.lng)
              : null;

            return (
              <div
                key={item.id}
                id={`listing-card-${item.id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl transition-all grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
                >
                  {/* ========================================================================= */}
                  {/* SECTION 1: BUSINESS IDENTITY, CONTACT RELAY & UNIFIED ACTION BUTTONS       */}
                  {/* ========================================================================= */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-3.5">
                    <div>
                      {/* Top Row: Business Logo + Verified + Follow + Favorite + Report/Block */}
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`w-13 h-13 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shadow-inner shrink-0 overflow-hidden relative group ${
                            canEditListing(item) ? 'cursor-pointer hover:border-indigo-500' : ''
                          }`}
                          onClick={() => {
                            if (canEditListing(item)) handleOpenEditMedia(item, 'branding');
                          }}
                          title={canEditListing(item) ? 'Click to edit, upload or delete firm profile logo' : item.name}
                        >
                          {item.logoUrl ? (
                            <img
                              src={item.logoUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg bg-slate-950 flex items-center justify-center text-slate-600">
                              <Building2 className="w-6 h-6 text-sky-400" />
                            </div>
                          )}

                          {canEditListing(item) && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                              <Camera className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap justify-end gap-1.5">
                          {isBlocked && (
                            <button
                              type="button"
                              onClick={() => handleUnblockBusiness(item.business_id, item.name)}
                              className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center space-x-1 hover:bg-rose-500/30 transition-colors cursor-pointer"
                              title="Click to unblock this business"
                            >
                              <Ban className="w-3 h-3 text-rose-400" />
                              <span>Blocked (Unblock)</span>
                            </button>
                          )}

                          {item.isVerified && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Verified</span>
                            </span>
                          )}

                          {/* Favorite button */}
                          <button
                            type="button"
                            onClick={() => toggleFavorite(item.id)}
                            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400 stroke-[1.75]'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Organization Name / Title */}
                      <h3
                        onClick={() => setActiveListing(item)}
                        className="text-base sm:text-lg font-bold tracking-tight text-white mt-2.5 hover:text-sky-400 cursor-pointer transition-colors leading-snug line-clamp-2"
                        title={item.name}
                      >
                        {item.name}
                      </h3>

                      {/* Location Line & Proximity */}
                      <div className="flex items-center space-x-1.5 text-xs text-slate-300 mt-1 font-medium flex-wrap gap-y-1">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>
                            {item.city || 'Global Hub'}
                            {item.country ? `, ${item.country}` : ''}
                          </span>
                        </div>
                        {distanceKm !== null && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 ${
                              nearMeActive
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                            title="Direct distance from your position"
                          >
                            <Compass className="w-2.5 h-2.5 text-sky-400" />
                            <span>{distanceKm < 1 ? '< 1 km' : `${distanceKm} km`}</span>
                          </span>
                        )}
                      </div>

                      {/* Badges & Taxonomy Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700 text-[11px] font-semibold">
                          {item.category || 'Aviation Hub'}
                        </span>
                        {item.subCategory && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                            {item.subCategory}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-800/50 text-[11px] font-mono font-bold">
                          TRUEAER: {item.truvaer_id || item.id.slice(0, 10).toUpperCase()}
                        </span>
                      </div>

                      {/* Action Buttons: Chat, Quotation & Send Direct Offer (Stacked rounded buttons) */}
                      <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleDirectChat(item)}
                          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs border border-indigo-500/40 flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                          title="Chat directly"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-white" />
                          <span>Chat</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenRequestQuotationModal(item)}
                          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs border border-indigo-500/40 flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                          title="Request quotation from business owner"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                          <span>Quotation</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setServiceOfferTargetListing(item);
                            setShowServiceOfferModal(true);
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs border border-indigo-500/40 flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                          title="Send direct customized offer"
                        >
                          <Send className="w-3.5 h-3.5 text-white" />
                          <span>Send Direct Offer</span>
                        </button>
                      </div>

                      {/* Contact Relay Details */}
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-800 text-xs">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold select-text">
                            {isLeadUnlocked ? item.phone : maskPhoneNumber(item.phone || '+914023456789').masked}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate select-text">
                            {isLeadUnlocked ? item.email : parseEmailForMasking(item.email || 'ops@rgoa-airport.in').displayHint}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2 text-slate-400 text-[11px] leading-snug">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 select-text">
                            {item.address
                              ? `${item.address}, ${item.city}`
                              : `${item.city || 'Aerospace Avenue'}, ${item.country || 'Global'}`}
                          </span>
                        </div>

                        {/* ICAO & IATA Airport Codes Badge Button (Displayed Under Address) */}
                        <div className="pt-1.5 flex items-center">
                          {(() => {
                            const codes = resolveAirportCodes(item);
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast(`Airport Coordinates: ICAO [${codes.icao}] • IATA [${codes.iata}] for ${item.name}`);
                                }}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold transition-all shadow-xs cursor-pointer group"
                                title="Click to view airport codes & terminal specifications"
                              >
                                <span className="text-slate-400 font-sans text-[9px] uppercase font-semibold">Airport Codes:</span>
                                <span>ICAO: <span className="text-white font-bold">{codes.icao}</span></span>
                                <span className="text-sky-500">•</span>
                                <span>IATA: <span className="text-white font-bold">{codes.iata}</span></span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* SECTION 2: SERVICES, CAPABILITIES & FACILITIES (NO $ ESTIMATED BUDGET COL)*/}
                  {/* ========================================================================= */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-3.5 lg:border-x lg:border-slate-800 lg:px-4">
                    <div>
                      {/* Section Title */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Services &amp; Capabilities
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                          {item.services?.length || 0} Listed
                        </span>
                      </div>

                      {/* Services Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-2.5 max-h-40 overflow-y-auto pr-1">
                        {item.services && item.services.length > 0 ? (
                          item.services.map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-sky-200 border border-slate-700/80 text-xs font-medium flex items-center space-x-1"
                            >
                              <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                              <span>{srv}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No listed services</span>
                        )}
                      </div>

                      {/* Facilities Block */}
                      {item.facilities && item.facilities.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                          <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Infrastructure &amp; Facilities</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.facilities.map((fac, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[11px]"
                              >
                                {fac}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Amenities Block */}
                      {item.amenities && item.amenities.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                          <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Amenities &amp; Standards</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.amenities.map((am, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[11px]"
                              >
                                {am}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operational Details at bottom of middle section */}
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Established:</span>
                        <span className="font-semibold text-white">Est. {item.established_year || 2020}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Registration / Auth:</span>
                        <span className="font-mono text-slate-200">
                          {item.registration_number || 'DGCA-AUTH-2024'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Aviation Verification:</span>
                        <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified Enterprise</span>
                        </span>
                      </div>

                      {canEditListing(item) && (
                        <div className="pt-2 flex justify-end items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMedia(item, 'branding')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center space-x-1 cursor-pointer"
                            title="Upload, edit, or delete business firm profile logo"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Edit Logo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditMedia(item, 'media')}
                            className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline flex items-center space-x-1 cursor-pointer"
                            title="Edit media & branding"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Media &amp; Listing</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* SECTION 3: VIDEO / PHOTO MEDIA (RIGHT) WITH RATING & ACTIONS DIRECTLY BENEATH */}
                  {/* ========================================================================= */}
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Hero Photo / Video Media Container */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-md">
                        <img
                          src={photoUrl}
                          alt={item.name}
                          onClick={() => setActiveListing(item)}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 cursor-pointer"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top-Right "Advertising (i)" Badge */}
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center space-x-1 select-none pointer-events-none shadow-sm">
                          <span>Advertising</span>
                          <Info className="w-3 h-3 text-slate-300" />
                        </div>

                        {/* Facility Tour Play Overlay */}
                        {item.videoUrl && (
                          <div className="absolute bottom-2.5 left-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                setVideoModalUrl(item.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ')
                              }
                              className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
                            >
                              <Play className="w-3 h-3 fill-white text-white" />
                              <span>Watch Tour</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Optional Photo Thumbnail Strip */}
                      {item.photos && item.photos.length > 1 && (
                        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5">
                          {item.photos.slice(0, 4).map((p, idx) => (
                            <img
                              key={idx}
                              src={p}
                              alt=""
                              onClick={() => setActiveListing(item)}
                              className="w-12 h-8 object-cover rounded-md border border-slate-800 hover:border-sky-500 cursor-pointer shrink-0 transition-colors"
                            />
                          ))}
                        </div>
                      )}

                      {/* Rating: Destination Profile & Reviews Section (Placed Directly Under Media) */}
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-amber-400">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-sm text-white">
                              {item.rating ? item.rating.toFixed(1) : '4.9'}
                            </span>
                            <span className="text-slate-400 text-xs ml-1">
                              ({item.reviews_count ? item.reviews_count : 24} reviews)
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                            Top Rated
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveListing(item)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer shadow-xs"
                          title="Open Destination Profile & Verified Reviews"
                        >
                          <div className="flex items-center space-x-1.5">
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                            <span>Rating: Destination Profile &amp; Reviews</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons Under Media & Rating (Matching Uploaded Interface): Follow, Report, Block, Unlock */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      {/* 1. Follow Option Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(item)}
                        className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs ${
                          isFollowing
                            ? 'bg-indigo-700/80 hover:bg-rose-900/40 text-indigo-100 hover:text-rose-200 border border-indigo-500/50'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-indigo-600/20'
                        }`}
                        title={isFollowing ? 'Following organization (Click to unfollow)' : 'Follow organization for real-time post updates'}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            <span>Following ({followersCount})</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 text-white" />
                            <span>+ Follow</span>
                          </>
                        )}
                      </button>

                      {/* 2. Distinct Report & Block Buttons Row */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Report Option Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(item)}
                          className="py-2.5 px-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Report this business entity to Admin for policy audit"
                        >
                          <Flag className="w-3.5 h-3.5 text-rose-400" />
                          <span>Report</span>
                        </button>

                        {/* Block Option Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleBlockBusiness(item.business_id, item.name)}
                          className={`py-2.5 px-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs ${
                            isBlocked
                              ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/50'
                              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                          }`}
                          title={isBlocked ? 'Click to unblock this business' : 'Block this business from feed and marketplace'}
                        >
                          <Ban className={`w-3.5 h-3.5 ${isBlocked ? 'text-rose-400' : 'text-slate-400'}`} />
                          <span>{isBlocked ? 'Blocked' : 'Block'}</span>
                        </button>
                      </div>

                      {/* 3. Get in Touch Action Button */}
                      {!isLeadUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleUnlockLead(item)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs relative overflow-hidden"
                          title="Get in touch with this organization"
                        >
                          <Phone className="w-3.5 h-3.5 text-white" />
                          <span>Get in Touch</span>
                        </button>
                      ) : (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-950/60 border border-emerald-600 text-emerald-300 font-semibold text-xs flex items-center justify-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Connected: {item.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            );
          })
        )}
      </div>
        </div>
      </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT BRANDING & MEDIA (RIGHT MEDIA & LEFT BRANDING)       */}
      {/* ========================================================================= */}
      {editingListing && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingListing(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>Manage Media &amp; Branding</span>
                  <span className="text-xs font-normal text-blue-400">• {editingListing.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update the left branding logo or add high-resolution photos and video to the right side.
                </p>
              </div>
              <button
                onClick={() => setEditingListing(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setEditActiveTab('business')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                  editActiveTab === 'business'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Contact, Budget &amp; Location</span>
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('branding')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                  editActiveTab === 'branding'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Logo &amp; Branding</span>
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('media')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                  editActiveTab === 'media'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Photos &amp; Video</span>
              </button>
              <button
                type="button"
                onClick={() => setEditActiveTab('services')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                  editActiveTab === 'services'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Services &amp; Approvals</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveMediaAndBranding} className="p-5 overflow-y-auto space-y-4">
              {editActiveTab === 'business' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Business User Controls: Update your corporate phone number, email address, pricing budget, and operational base.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Contact Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Corporate Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+91 99999 12345"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Masked to unauthenticated visitors per PII compliance.
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business Email Address
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="operations@truvaer.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Estimated Budget */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Estimated Budget / Sector Price
                      </label>
                      <input
                        type="text"
                        value={editBudget}
                        onChange={(e) => setEditBudget(e.target.value)}
                        placeholder="e.g. ₹1,500,000 / Sector or $25,000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    {/* Pricing Rate */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hourly / Service Pricing Rate
                      </label>
                      <input
                        type="text"
                        value={editPricingRate}
                        onChange={(e) => setEditPricingRate(e.target.value)}
                        placeholder="e.g. ₹3,50,000 / Block Hour"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Address & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Hangar 4A, Executive VIP Terminal"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Operating City
                      </label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="e.g. RGOA, DEL, BOM"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ICAO / IATA Code
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={editIcao}
                          onChange={(e) => setEditIcao(e.target.value.toUpperCase())}
                          placeholder="ICAO"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono text-center"
                        />
                        <input
                          type="text"
                          value={editIata}
                          onChange={(e) => setEditIata(e.target.value.toUpperCase())}
                          placeholder="IATA"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : editActiveTab === 'branding' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-200 flex items-start space-x-2">
                    <ImageIcon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Upload a company or facility logo. You can upload an image directly from your local device or provide an external image URL.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Facility Logo (Direct File Upload &amp; URL Fallback)
                    </label>

                    {/* Direct Local Device Upload */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Local Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, 'edit')}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={editLogoUrl}
                        onChange={(e) => setEditLogoUrl(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Logo Preview */}
                    {editLogoUrl && (
                      <div className="flex items-center space-x-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="w-16 h-16 rounded-xl border border-slate-700 overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center p-1">
                          <img
                            src={editLogoUrl}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="text-xs">
                          <div className="text-white font-semibold flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Active Logo Preview Loaded</span>
                          </div>
                          <div className="text-slate-400 text-[11px] truncate max-w-xs">{editLogoUrl.substring(0, 45)}...</div>
                          <button
                            type="button"
                            onClick={() => setEditLogoUrl('')}
                            className="text-[11px] text-rose-400 hover:underline mt-1 cursor-pointer block"
                          >
                            Remove Logo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : editActiveTab === 'media' ? (
                <div className="space-y-4">
                  {/* Video URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Video URL (YouTube Embed or MP4 Video)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ or https://assets...mp4"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      If provided, visitors can click the video icon on the right side of the card to play a facility tour.
                    </p>
                  </div>

                  {/* Photo Gallery Management with Direct File Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Right-Side Photo Gallery ({editPhotos.length} images)
                      </label>
                      <span className="text-[10px] text-sky-400 font-mono">Local upload &amp; URL supported</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Images from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handlePhotosUpload(e, 'edit')}
                        />
                      </label>
                      <div className="flex flex-1 gap-2">
                        <input
                          type="url"
                          placeholder="Or paste image URL (https://...)"
                          value={newPhotoInput}
                          onChange={(e) => setNewPhotoInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddPhotoToEdit}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add URL</span>
                        </button>
                      </div>
                    </div>

                    {/* Photo preview thumbnails */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                      {editPhotos.length === 0 ? (
                        <div className="col-span-full py-6 text-center text-xs text-slate-500">
                          No photos added yet. Add image URLs above.
                        </div>
                      ) : (
                        editPhotos.map((photo, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 h-20 bg-slate-900">
                            <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => handleRemovePhotoFromEdit(idx)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Facilities & Amenities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Facilities (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Airports, VIP Lounge, Helipad..."
                        value={editFacilities}
                        onChange={(e) => setEditFacilities(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Amenities (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="24/7 Security, Crew Rest, Wi-Fi..."
                        value={editAmenities}
                        onChange={(e) => setEditAmenities(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : editActiveTab === 'services' ? (
                <div className="space-y-4">
                  {/* Service Addition Protocol Banner */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Service Management &amp; Central Administration Approvals:</span>
                      <span>
                        Select available platform services below to attach them directly. If your specialized service is not listed, select <strong>&quot;Other&quot;</strong> and submit your custom service. It goes directly to the Central Admin Desk and is automatically activated upon approval!
                      </span>
                    </div>
                  </div>

                  {customServiceFeedback && (
                    <div className="p-3 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{customServiceFeedback}</span>
                    </div>
                  )}

                  {/* 1. Active Services On Listing */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <span>Currently Active Services on Listing ({editingListing.services?.length || 0})</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Live on marketplace</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(!editingListing.services || editingListing.services.length === 0) ? (
                        <span className="text-xs text-slate-500 italic">No services attached to this listing yet. Select or request below.</span>
                      ) : (
                        editingListing.services.map((srv, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                          >
                            <span>{srv}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(srv)}
                              className="text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                              title="Remove service from listing"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 2. Add Existing Platform Service */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <label className="text-xs font-bold text-slate-200 block">
                      Add Verified Platform Service (Category: {editingListing.category})
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedStandardServiceToAdd}
                        onChange={(e) => setSelectedStandardServiceToAdd(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none cursor-pointer"
                      >
                        <option value="">-- Choose from available platform catalog services --</option>
                        {db.getAvailableServicesForCategory(editingListing.category).map((srv) => (
                          <option key={srv} value={srv}>
                            {srv}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!selectedStandardServiceToAdd}
                        onClick={() => handleAddStandardService(selectedStandardServiceToAdd)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center space-x-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Service</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Custom Service Addition: Select "Other" -> Submit for Admin Approval */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        +
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Service Not In List? Select &quot;Other&quot; and Add Service</h4>
                        <p className="text-[11px] text-slate-400">
                          Forwarded to Admin Approval Desk • Once approved by Admin, automatically added to the portal!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Proposed Service Name *
                        </label>
                        <input
                          type="text"
                          value={customServiceName}
                          onChange={(e) => setCustomServiceName(e.target.value)}
                          placeholder="e.g. Medevac Air Ambulance 24/7 or B777 Engine Wash"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Technical Scope &amp; Operational Details *
                        </label>
                        <textarea
                          rows={2}
                          value={customServiceDesc}
                          onChange={(e) => setCustomServiceDesc(e.target.value)}
                          placeholder="Detail aircraft specifications, certification standards (DGCA/FAA/EASA), or operating hours..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitCustomService}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Custom Service for Admin Approval</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Operator Custom Services Track Record */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-300 block">Operator Custom Service Requests Status:</span>
                    {db.getCustomServiceRequests().filter(r => r.listing_id === editingListing.id || r.business_id === editingListing.business_id).length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No custom requests submitted yet for this listing.</p>
                    ) : (
                      db.getCustomServiceRequests().filter(r => r.listing_id === editingListing.id || r.business_id === editingListing.business_id).map((req) => (
                        <div key={req.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white flex items-center space-x-2">
                              <span>{req.service_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {req.status === 'PENDING_APPROVAL' ? 'PENDING ADMIN APPROVAL' : req.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{req.description}</p>
                          </div>
                          {isAdmin && req.status === 'PENDING_APPROVAL' && (
                            <button
                              type="button"
                              onClick={() => {
                                db.approveCustomService(req.id, currentUser?.user_id || 'admin_primary', currentUser?.first_name || 'Admin');
                                setListingsVersion(v => v + 1);
                                setCustomServiceFeedback(`Approved "${req.service_name}"! Automatically added to portal.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Approve Now
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Profile Picture & Firm Logo Management (Upload, Crop & Delete) */}
                  <ProfilePictureManager
                    currentImageUrl={editLogoUrl}
                    fallbackInitials={editingListing?.name?.slice(0, 2).toUpperCase() || 'AV'}
                    isBusiness={true}
                    title="Business Firm Profile Logo & Picture (Auto-Crop & Purge)"
                    onImageSaved={(newLogo) => {
                      setEditLogoUrl(newLogo || '');
                      if (editingListing) {
                        db.updateBusinessLogo(editingListing.business_id, newLogo);
                      }
                    }}
                  />

                  {/* Manual Logo URL Input fallback */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Or Direct Logo Image URL (CDN / Web)
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://.../logo.png"
                      value={editLogoUrl}
                      onChange={(e) => setEditLogoUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* SubCategory, Area & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">SubCategory</label>
                      <input
                        type="text"
                        value={editSubCategory}
                        onChange={(e) => setEditSubCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Area</label>
                      <input
                        type="text"
                        value={editArea}
                        onChange={(e) => setEditArea(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={editPincode}
                        onChange={(e) => setEditPincode(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editSaveFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{editSaveFeedback}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE LISTING MODAL (FOR '+ CREATE' GREEN BUTTON)              */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#5cb85c]/20 flex items-center justify-center text-[#5cb85c]">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Marketplace Listing</h3>
                  <p className="text-xs text-slate-400">
                    Publish your aviation facility with left logo branding and right-side photos/video.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListingSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Section 1: Left Branding */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>1. Left Column: Logo &amp; Branding</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Test 2 or SkyAir Terminal"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Logo (Device Upload or URL)
                    </label>
                    <div className="flex gap-2">
                      <label className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1 shadow-sm shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLogoUpload(e, 'create')}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or URL: https://.../logo.png"
                        value={createForm.logoUrl}
                        onChange={(e) => setCreateForm({ ...createForm, logoUrl: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {createForm.logoUrl && (
                      <div className="mt-2 flex items-center space-x-2 p-2 bg-slate-900/80 rounded-lg border border-slate-800">
                        <img src={createForm.logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain bg-slate-950 p-0.5" />
                        <span className="text-[11px] text-emerald-400 font-medium">Logo attached</span>
                        <button
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, logoUrl: '' })}
                          className="text-[11px] text-rose-400 hover:underline ml-auto"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Middle Details */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>2. Middle Column: Categories &amp; Location</span>
                </div>
                
                {/* Same Line: Category and Sub-Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const defaultSub = (liveTaxonomy[newCat] || [])[1] || newCat;
                        setCreateForm({ ...createForm, category: newCat, subCategory: defaultSub });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      {availableCategories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Sub-Category</label>
                    <select
                      value={createForm.subCategory}
                      onChange={(e) => setCreateForm({ ...createForm, subCategory: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      {(liveTaxonomy[createForm.category] || ['All Subcategories'])
                        .filter((sub) => sub !== 'All Subcategories')
                        .map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Country and City Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                    <select
                      value={createForm.country}
                      onChange={(e) => {
                        const nextCountry = e.target.value;
                        const countryCities = CITIES_BY_COUNTRY[nextCountry] || ['Mumbai', 'Delhi', 'Dubai', 'London', 'Miami'];
                        setCreateForm({ ...createForm, country: nextCountry, city: countryCities[0] || 'Mumbai' });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      {COUNTRIES.filter((c) => c.code !== 'All').map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City / Hub</label>
                    <select
                      value={createForm.city}
                      onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                    >
                      {(CITIES_BY_COUNTRY[createForm.country] || ['Mumbai', 'Delhi', 'Dubai', 'London', 'Miami']).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad"
                      value={createForm.address}
                      onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ICAO / IATA Code</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="ICAO"
                        value={(createForm as any).icao || ''}
                        onChange={(e) => setCreateForm({ ...createForm, icao: e.target.value.toUpperCase() } as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono text-center"
                      />
                      <input
                        type="text"
                        placeholder="IATA"
                        value={(createForm as any).iata || ''}
                        onChange={(e) => setCreateForm({ ...createForm, iata: e.target.value.toUpperCase() } as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Shamshabad"
                      value={createForm.area}
                      onChange={(e) => setCreateForm({ ...createForm, area: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="e.g. 50097"
                      value={createForm.pincode}
                      onChange={(e) => setCreateForm({ ...createForm, pincode: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Right Media, Video & Offerings */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>3. Right Column: Video, Photos &amp; Amenities</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Video URL (Right side)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                    value={createForm.videoUrl}
                    onChange={(e) => setCreateForm({ ...createForm, videoUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Direct Photos Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Photo Gallery ({createForm.photos.length} uploaded)
                    </label>
                    <span className="text-[10px] text-sky-400 font-mono">Device upload &amp; preview</span>
                  </div>
                  <label className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photos from Local Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotosUpload(e, 'create')}
                    />
                  </label>
                  {createForm.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2 max-h-32 overflow-y-auto p-1 bg-slate-900 rounded-lg border border-slate-800">
                      {createForm.photos.map((p, idx) => (
                        <div key={idx} className="relative rounded overflow-hidden h-14 bg-slate-950 border border-slate-700">
                          <img src={p} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCreateForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded bg-rose-600/90 text-white cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Facilities (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.facilities}
                    onChange={(e) => setCreateForm({ ...createForm, facilities: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.amenities}
                    onChange={(e) => setCreateForm({ ...createForm, amenities: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5cb85c] hover:bg-[#4ea64e] text-white font-bold text-xs transition-colors shadow cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Publish to Marketplace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL DESTINATION PROFILE, REVIEWS & MODERATION                   */}
      {/* ========================================================================= */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                    {activeListing.category}
                  </span>
                  <span>•</span>
                  <span className="text-xs text-slate-400">Est. {activeListing.established_year}</span>
                  <span>•</span>
                  <span className="text-xs font-mono text-slate-400">Reg: {activeListing.registration_number}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{activeListing.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{activeListing.address}</p>
              </div>

              <button
                onClick={() => setActiveListing(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Photo Gallery & Video Preview */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Verified Facility Imagery &amp; Video
                  </h4>
                  {activeListing.videoUrl && (
                    <button
                      onClick={() => setVideoModalUrl(activeListing.videoUrl!)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-sky-400" />
                      <span>Play Facility Video</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeListing.photos.map((ph, idx) => (
                    <div
                      key={idx}
                      data-photo-index={idx}
                      onClick={() => {
                        setLightboxPhotos(activeListing.photos);
                        setLightboxInitialIndex(idx);
                        setIsLightboxOpen(true);
                      }}
                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-950 aspect-video sm:aspect-auto sm:h-44"
                    >
                      <img
                        src={ph}
                        alt={`${activeListing.name} view ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1.5 text-xs text-white font-bold backdrop-blur-xs">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        <span>View in Full Lightbox ({idx + 1}/{activeListing.photos.length})</span>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono text-slate-300 pointer-events-none">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Capabilities & Facilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Corporate Service Offerings &amp; Facilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeListing.services.map((svc) => (
                    <div
                      key={svc}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decentralized Customer Ratings & Reviews */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">Customer Ratings &amp; Verification Log</h4>
                    <p className="text-xs text-slate-400">
                      Decentralized peer feedback. Verified aviators earn 50 Credits per verified review.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-amber-400 font-black text-lg bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{activeListing.rating} / 5</span>
                  </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleAddReview} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Submit a Rating</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Provide detailed feedback regarding turnaround time, crew hospitality, or hangar standards..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />

                  {reviewSubmitSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>{reviewSubmitSuccess}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow cursor-pointer"
                    >
                      <span>Post Review (+50 Credits Bounty)</span>
                    </button>
                  </div>
                </form>

                {/* Reviews List with Moderation */}
                <div className="space-y-3">
                  {db.getReviewsForListing(activeListing.id).map((rev) => {
                    const isHidden = rev.status === 'hidden';
                    return (
                      <div
                        key={rev.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                          isHidden
                            ? 'bg-slate-950/40 border-dashed border-amber-500/40 opacity-70'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{rev.author_name}</span>
                            <div className="flex items-center space-x-0.5 text-amber-400">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                            {isHidden && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
                                HIDDEN BY {rev.hidden_by}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-slate-400">
                            <span className="text-[10px]">{new Date(rev.timestamp).toLocaleDateString()}</span>

                            {/* Moderation Controls (TRD 5.1: Business can Hide; Admin can Hide or Delete) */}
                            <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                              {isHidden ? (
                                <button
                                  onClick={() => handleModerateReview(rev.id, 'unhide')}
                                  className="text-slate-400 hover:text-emerald-400 p-1 cursor-pointer"
                                  title="Unhide review"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleModerateReview(rev.id, 'hide')}
                                  className="text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
                                  title="Hide review on profile"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  onClick={() => handleModerateReview(rev.id, 'delete')}
                                  className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                                  title="Admin only: Delete review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-300 leading-relaxed">{rev.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DIRECT INQUIRY / LIVE ENCRYPTED MESSENGER                        */}
      {/* ========================================================================= */}
      {directInquiryListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Direct Provider Inquiry
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    To: <span className="text-blue-300 font-semibold">{directInquiryListing.name}</span> ({directInquiryListing.category})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDirectInquiryListing(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendDirectInquiry} className="p-5 space-y-3.5">
              {inquirySuccess ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Inquiry Sent Successfully!</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">{inquirySuccess}</p>
                  {onOpenDirectChat && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDirectInquiryListing(null);
                          setInquirySuccess(null);
                          onOpenDirectChat('', '');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center space-x-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Communications &amp; Live Chats</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Name / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Captain Aditya"
                        value={inquirySenderName}
                        onChange={(e) => setInquirySenderName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="aditya@example.com"
                        value={inquirySenderEmail}
                        onChange={(e) => setInquirySenderEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Message / Requirement Specifications
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Specify dates, aircraft type, passenger count, VIP lounge requirements, ground handling, catering or MRO specifics..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                      required
                    />
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Truvaer Direct Encrypted Channel</span>
                    </span>
                    <span className="font-mono text-slate-500">Zero Intermediary Fees</span>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setDirectInquiryListing(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Direct Inquiry</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Condition 3: Chat Restriction Enforcement Modal */}
      {chatRestrictionNotice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Chat Restriction</h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Condition 3 Policy Enforcement
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-medium text-amber-200">{chatRestrictionNotice}</p>
              <p className="text-slate-400 text-[11px]">
                Under platform governance policy, direct communications are strictly restricted to
                <strong className="text-white"> Business ↔ Standard Aviators </strong> and
                <strong className="text-white"> Standard Aviator ↔ Business </strong> channels only.
                Direct Business-to-Business (B2B) and Aviator-to-Aviator (U2U) private messaging are disabled to safeguard marketplace integrity.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setChatRestrictionNotice(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Direct Quotation Issuance Modal (Requirement 1 & 2) */}
      <DirectQuotationModal
        isOpen={showQuotationModal}
        onClose={() => {
          setShowQuotationModal(false);
          setQuotationListing(null);
        }}
        currentBusiness={
          quotationListing
            ? {
                business_id: quotationListing.business_id,
                organization_name: quotationListing.name,
                owner_name: currentBusiness?.owner_name || 'Fleet Operator',
                reg_number_type: 'CORPORATE_REG_NO',
                registration_number: quotationListing.registration_number,
                country: quotationListing.country,
                business_email: quotationListing.email,
                phone_number: quotationListing.phone,
                password_hash: '',
                inc_cert_doc_url: '',
                inc_cert_file_name: '',
                inc_cert_file_size: 0,
                bank_account_holder: quotationListing.name,
                bank_account_number: '•••• 8912',
                bank_account_number_masked: '•••• 8912',
                bank_ifsc_swift: 'HDFC0001923',
                bank_name: 'HDFC Aviation Commercial Bank',
                verification_status: 'VERIFIED',
                submitted_at: '2024-01-01',
                budget: quotationListing.budget,
                pricing_rate: quotationListing.pricing_rate,
              }
            : currentBusiness
        }
        currentUser={currentUser}
        prefillClientName={currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : ''}
        prefillClientEmail={currentUser?.email || ''}
        prefillClientPhone={currentUser?.phone_number || ''}
        prefillServiceTitle={quotationListing ? `${quotationListing.name} - ${quotationListing.category}` : ''}
        onQuotationIssued={() => {
          setListingsVersion((v) => v + 1);
        }}
      />

      {/* Direct Service Offer Modal (Requirement: Business and Admin only can send service offers directly to customers) */}
      <DirectServiceOfferModal
        isOpen={showServiceOfferModal}
        onClose={() => {
          setShowServiceOfferModal(false);
          setServiceOfferTargetListing(null);
        }}
        currentBusiness={currentBusiness}
        currentUser={currentUser}
        targetListing={serviceOfferTargetListing}
        onOfferSent={() => {
          setListingsVersion((v) => v + 1);
        }}
      />

      {/* Admin Broadcast Modal (Requirement: Admin notifications and emails by Category, Country, and Zone) */}
      <AdminBroadcastModal
        isOpen={showAdminBroadcastModal}
        onClose={() => setShowAdminBroadcastModal(false)}
        activeAdminUser={null}
        onBroadcastPublished={() => {
          setListingsVersion((v) => v + 1);
        }}
      />

      {/* Add Category & Sub-Category Modal for Business Users */}
      <AddCategorySubCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        business={currentBusiness}
        onSuccess={() => {
          setListingsVersion((v) => v + 1);
        }}
      />

      {/* Add Services to Listing Modal (Admin and Business User Only) */}
      <AddServicesToListingModal
        isOpen={showAddServicesModal}
        onClose={() => {
          setShowAddServicesModal(false);
          setTargetListingForServicesModal(null);
        }}
        listing={targetListingForServicesModal}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        isAdmin={isAdmin}
        activeAdminUser={activeAdminUser}
        onSuccess={() => {
          setListingsVersion((v) => v + 1);
        }}
      />

      {/* Add / Register Business Location Modal */}
      {showAddLocationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Register Business Location</h3>
                  <p className="text-[11px] text-slate-400">
                    Add operational aviation hubs and cities where your services can be assigned.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLocationModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {locFeedback && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold">
                {locFeedback}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isAdminOrManager) {
                  setLocFeedback('Permission Denied: Only Admin and Manager accounts can register new business locations.');
                  return;
                }
                if (!newLocCity.trim() || !newLocDisplay.trim()) return;
                const bizId = currentBusiness?.business_id || 'biz_verified_general';
                const res = db.addBusinessLocation(bizId, {
                  city: newLocCity.trim(),
                  state: newLocState.trim() || 'State Corridor',
                  country: newLocCountry.trim() || 'IN',
                  display: newLocDisplay.trim(),
                });
                setLocFeedback(res.message);
                setListingsVersion((v) => v + 1);
                setTimeout(() => {
                  setShowAddLocationModal(false);
                  setLocFeedback(null);
                  setNewLocCity('');
                  setNewLocDisplay('');
                }, 1500);
              }}
              className="space-y-4"
            >
              <LocationAutocomplete
                label="Search & Select City / Hub"
                value={newLocDisplay}
                placeholder="Type 3+ letters (e.g. Hyderabad, TS, India / Hyderabad, Sindh province, Pakistan)..."
                minChars={3}
                onChange={(display, loc) => {
                  setNewLocDisplay(display);
                  if (loc) {
                    setNewLocCity(loc.city);
                    setNewLocState(loc.state);
                    setNewLocCountry(loc.countryCode || 'IN');
                  } else {
                    setNewLocCity(display);
                  }
                }}
              />

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Detected City</label>
                  <input
                    type="text"
                    value={newLocCity}
                    onChange={(e) => setNewLocCity(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={newLocState}
                    onChange={(e) => setNewLocState(e.target.value)}
                    placeholder="e.g. TS / Sindh province"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl text-[11px] text-slate-300">
                💡 Automatically maps the city to your business profile so customers searching for &ldquo;{newLocCity || 'this city'}&rdquo; will find your verified listings and services.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newLocCity.trim() || !newLocDisplay.trim()}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Business Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Account Verification Status Modal */}
      <BusinessVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        business={currentBusiness}
        isHardLockedByAdmin={currentBusiness?.is_hard_locked_by_admin}
      />

      {/* Request Quotation Modal (Requirement: User clicks Request Quotation -> select services & request details -> delivered to Business User) */}
      <RequestQuotationModal
        isOpen={showRequestQuotationModal}
        onClose={() => {
          setShowRequestQuotationModal(false);
          setTargetListingForQuotation(null);
        }}
        targetListing={targetListingForQuotation}
        currentUser={currentUser}
        onRequestSubmitted={(req) => {
          showToast(`Quotation request ${req.request_number} delivered directly to ${req.business_name}!`);
        }}
        onOpenLifecycleModal={() => setShowLifecycleModal(true)}
      />

      {/* Report & Block Business Modal (Requirement: Report / Block option with best reason options -> escalated to Admin/Manager/Super Admin) */}
      <ReportBlockBusinessModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setTargetListingForReport(null);
        }}
        targetListing={targetListingForReport}
        currentUser={currentUser}
        onReportSubmitted={(rep) => {
          showToast(`Report #${rep.report_number} submitted to Admin, Manager, and Super Admin desks for immediate audit.`);
        }}
        onBusinessBlocked={(bizId) => {
          setBlockedBusinessIds((prev) => (prev.includes(bizId) ? prev : [...prev, bizId]));
        }}
      />

      {/* Quotation & Deals Full Lifecycle Modal (RFQ -> Issue Quote -> Accept Quote -> Deal in Pipeline -> Payment Done -> Sale Finalized / Deal Closed) */}
      <QuotationDealsLifecycleModal
        isOpen={showLifecycleModal}
        onClose={() => setShowLifecycleModal(false)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        onRefreshData={() => setListingsVersion((v) => v + 1)}
      />

      {/* Following Updates Feed & Broadcast Modal (Requirement: Follow option so users get latest updates when organization posts anything) */}
      <FollowingUpdatesModal
        isOpen={showFollowingUpdatesModal}
        onClose={() => setShowFollowingUpdatesModal(false)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        onRefreshData={() => setListingsVersion((v) => v + 1)}
      />

      {/* ========================================================================= */}
      {/* TOP-LEVEL VIDEO PLAYBACK MODAL (Guaranteed to play ON TOP of all popups)  */}
      {/* ========================================================================= */}
      {videoModalUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
                <Video className="w-4 h-4 text-sky-400" />
                <span>Verified Facility Media Tour &amp; Video</span>
              </span>
              <button
                type="button"
                onClick={() => setVideoModalUrl(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {videoModalUrl.includes('youtube') || videoModalUrl.includes('embed') ? (
                <iframe
                  src={
                    videoModalUrl.includes('autoplay')
                      ? videoModalUrl
                      : `${videoModalUrl}${videoModalUrl.includes('?') ? '&' : '?'}autoplay=1`
                  }
                  title="Facility Tour"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoModalUrl} controls autoPlay className="w-full h-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VERIFIED FACILITY IMAGERY LIGHTBOX & SLIDER (ARROW KEYS & EVENT DELEGATION) */}
      {/* ========================================================================= */}
      <LightboxImageSlider
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={lightboxPhotos}
        initialIndex={lightboxInitialIndex}
        title={activeListing?.name || 'Verified Facility Gallery'}
        subtitle={`${activeListing?.city || ''}, ${activeListing?.country || ''} • Facility Photo Gallery`}
      />

      {/* Saved Listings / Favorites Drawer (A1) */}
      <SavedListingsDrawer
        isOpen={showSavedDrawer}
        onClose={() => setShowSavedDrawer(false)}
        savedItemIds={Object.entries(favorites).filter(([_, v]) => Boolean(v)).map(([k]) => k)}
        allListings={allListings}
        onToggleFavorite={toggleFavorite}
        onClearAll={clearAllFavorites}
        onSelectListing={(listing) => {
          setActiveListing(listing);
          setShowSavedDrawer(false);
        }}
        onDirectChat={(listing) => {
          handleDirectChat(listing);
          setShowSavedDrawer(false);
        }}
        onRequestQuotation={(listing) => {
          handleOpenRequestQuotationModal(listing);
          setShowSavedDrawer(false);
        }}
      />
    </div>
  );
};

