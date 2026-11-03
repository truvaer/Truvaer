import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Building2,
  MapPin,
  Globe,
  Layers,
  ShieldCheck,
  Video,
  RotateCcw,
  Plane,
  Briefcase,
  DollarSign,
  Tag,
  Star,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ServiceListing } from '../types';
import { COMPREHENSIVE_LOCATIONS, LocationItem } from '../data/searchLocationsData';
import { STANDARD_SERVICES_BY_CATEGORY, AVIATION_TAXONOMY, AVIATION_ZONES_MAP, getZoneForCountry } from '../data/aviationGeographies';

export interface ServiceScoutFilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedSubCategory: string;
  onSubCategoryChange: (subCategory: string) => void;
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (verified: boolean) => void;
  hasVideoOnly: boolean;
  onHasVideoOnlyChange: (hasVideo: boolean) => void;
  onResetAll: () => void;
  availableCategories: string[];
  availableSubCategories: string[];
  availableCountries: Array<{ code: string; name: string; flag: string }>;
  availableCities: string[];
  allListings: ServiceListing[];
  filteredCount: number;
  hasMultiRegionClearance?: boolean;
  userAssignedRegions?: string[];
  onOpenProfileMenu?: () => void;
  className?: string;
}

export const ServiceScoutFilterSidebar: React.FC<ServiceScoutFilterSidebarProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedSubCategory,
  onSubCategoryChange,
  selectedServices,
  onServicesChange,
  selectedCountry,
  onCountryChange,
  selectedCity,
  onCityChange,
  selectedCompany,
  onCompanyChange,
  verifiedOnly,
  onVerifiedOnlyChange,
  hasVideoOnly,
  onHasVideoOnlyChange,
  onResetAll,
  availableCategories,
  availableSubCategories,
  availableCountries,
  availableCities,
  allListings,
  filteredCount,
  hasMultiRegionClearance = true,
  userAssignedRegions = [],
  onOpenProfileMenu,
  className = '',
}) => {
  // Input search terms for each filter field
  const [categorySearch, setCategorySearch] = useState('');
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<
    'category' | 'subcategory' | 'country' | 'location' | 'company' | null
  >(null);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute number of applied filters
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'All') count++;
    if (selectedSubCategory && selectedSubCategory !== 'All' && selectedSubCategory !== 'All Subcategories') count++;
    if (selectedServices.length > 0) count += selectedServices.length;
    if (selectedCountry && selectedCountry !== 'All') count++;
    if (selectedCity && selectedCity !== 'All') count++;
    if (selectedCompany && selectedCompany !== 'All') count++;
    if (verifiedOnly) count++;
    if (hasVideoOnly) count++;
    return count;
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedServices,
    selectedCountry,
    selectedCity,
    selectedCompany,
    verifiedOnly,
    hasVideoOnly,
  ]);

  // All unique companies from listings
  const allAvailableCompanies = useMemo(() => {
    const compMap = new Map<string, { name: string; category: string; city: string; country: string; rating: number; verified: boolean }>();
    allListings.forEach((l) => {
      if (l.name && !compMap.has(l.name.toLowerCase())) {
        compMap.set(l.name.toLowerCase(), {
          name: l.name,
          category: l.category,
          city: l.city,
          country: l.country || 'IN',
          rating: l.rating || 5.0,
          verified: l.isVerified || false,
        });
      }
    });
    return Array.from(compMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allListings]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();
    if (!q) return availableCategories;
    return availableCategories.filter((c) => c.toLowerCase().includes(q));
  }, [availableCategories, categorySearch]);

  // Filtered sub-categories
  const filteredSubCategories = useMemo(() => {
    const q = subCategorySearch.toLowerCase().trim();
    if (!q) return availableSubCategories;
    return availableSubCategories.filter((s) => s.toLowerCase().includes(q));
  }, [availableSubCategories, subCategorySearch]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return availableCountries;
    return availableCountries.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [availableCountries, countrySearch]);

  // Comprehensive Location search (City, State, Country) matching user reference screenshot
  const filteredLocations = useMemo(() => {
    const q = locationSearch.toLowerCase().trim();
    if (!q) {
      // Default initial list showing rich locations
      return COMPREHENSIVE_LOCATIONS.slice(0, 10);
    }
    return COMPREHENSIVE_LOCATIONS.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.state.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        loc.display.toLowerCase().includes(q) ||
        (loc.airportCode && loc.airportCode.toLowerCase().includes(q))
    );
  }, [locationSearch]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    const q = companySearch.toLowerCase().trim();
    if (!q) return allAvailableCompanies.slice(0, 10);
    return allAvailableCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [allAvailableCompanies, companySearch]);

  // Active details resolution for the "details should be displayed below" requirement
  const activeLocationObj = useMemo(() => {
    if (!selectedCity || selectedCity === 'All') return null;
    return (
      COMPREHENSIVE_LOCATIONS.find(
        (l) => l.city.toLowerCase() === selectedCity.toLowerCase() || l.display.toLowerCase().includes(selectedCity.toLowerCase())
      ) || null
    );
  }, [selectedCity]);

  const activeCountryObj = useMemo(() => {
    if (!selectedCountry || selectedCountry === 'All') return null;
    return (
      availableCountries.find(
        (c) => c.code.toUpperCase() === selectedCountry.toUpperCase() || c.name.toLowerCase() === selectedCountry.toLowerCase()
      ) || null
    );
  }, [selectedCountry, availableCountries]);

  const activeCategoryServices = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return [];
    return STANDARD_SERVICES_BY_CATEGORY[selectedCategory] || [];
  }, [selectedCategory]);

  const activeCompanyObj = useMemo(() => {
    if (!selectedCompany || selectedCompany === 'All') return null;
    return allAvailableCompanies.find((c) => c.name.toLowerCase() === selectedCompany.toLowerCase()) || null;
  }, [selectedCompany, allAvailableCompanies]);

  return (
    <div ref={sidebarRef} className={`w-full pb-16 ${className}`}>
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 pb-14 shadow-2xl space-y-5 text-slate-100">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER: "All Filters" + "Applied(N)" (exact match to image)         */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">All Filters</h3>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${
                appliedFiltersCount > 0
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'text-slate-400'
              }`}
            >
              Applied({appliedFiltersCount})
            </span>

            {/* Jump to Available Filter Details Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('available-filter-details-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded-md hover:bg-indigo-500/10"
              title="Jump to Available Filter Details"
            >
              <Info className="w-3 h-3" />
              <span>Details</span>
            </button>

            {appliedFiltersCount > 0 && (
              <button
                type="button"
                onClick={onResetAll}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                title="Reset all applied filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>



        {/* ========================================================================= */}
        {/* 2. CATEGORY FILTER (with chip & autocomplete dropdown)                    */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-bold text-slate-200">Category</label>

          <div
            className={`w-full min-h-[42px] bg-slate-950 border rounded-2xl p-1.5 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
              openDropdown === 'category'
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setOpenDropdown('category')}
          >
            {/* Selected Category Chip */}
            {selectedCategory && selectedCategory !== 'All' ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-600/25 border border-indigo-500/40 text-xs font-semibold text-indigo-200 animate-in fade-in">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryChange('All');
                    onSubCategoryChange('All');
                  }}
                  className="p-0.5 rounded-full hover:bg-indigo-500/30 text-indigo-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null}

            {/* Live Search Input */}
            <input
              type="text"
              placeholder={selectedCategory && selectedCategory !== 'All' ? '' : 'Search categories...'}
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setOpenDropdown('category');
              }}
              onFocus={() => setOpenDropdown('category')}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-0.5"
            />

            {/* Clear / Chevron Icon */}
            <div className="flex items-center space-x-1 text-slate-400 px-1">
              {selectedCategory && selectedCategory !== 'All' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryChange('All');
                    onSubCategoryChange('All');
                    setCategorySearch('');
                  }}
                  className="hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'category' ? null : 'category');
                }}
              >
                {openDropdown === 'category' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown List */}
          {openDropdown === 'category' && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1 animate-in fade-in-50">
              <button
                type="button"
                onClick={() => {
                  onCategoryChange('All');
                  onSubCategoryChange('All');
                  setCategorySearch('');
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Categories</span>
                {selectedCategory === 'All' && <Check className="w-3.5 h-3.5" />}
              </button>
              {filteredCategories
                .filter((c) => c !== 'All')
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onCategoryChange(cat);
                      setCategorySearch('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. SUB-CATEGORY FILTER                                                    */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sub-Category</span>
          </label>

          <div
            className={`w-full min-h-[42px] bg-slate-950 border rounded-2xl p-1.5 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
              openDropdown === 'subcategory'
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setOpenDropdown('subcategory')}
          >
            {selectedSubCategory && selectedSubCategory !== 'All' && selectedSubCategory !== 'All Subcategories' ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-blue-600/25 border border-blue-500/40 text-xs font-semibold text-blue-200 animate-in fade-in">
                <span>{selectedSubCategory}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubCategoryChange('All');
                  }}
                  className="p-0.5 rounded-full hover:bg-blue-500/30 text-blue-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null}

            <input
              type="text"
              placeholder={
                selectedSubCategory && selectedSubCategory !== 'All' && selectedSubCategory !== 'All Subcategories'
                  ? ''
                  : 'Search sub-categories...'
              }
              value={subCategorySearch}
              onChange={(e) => {
                setSubCategorySearch(e.target.value);
                setOpenDropdown('subcategory');
              }}
              onFocus={() => setOpenDropdown('subcategory')}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-0.5"
            />

            <div className="flex items-center space-x-1 text-slate-400 px-1">
              {selectedSubCategory && selectedSubCategory !== 'All' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubCategoryChange('All');
                    setSubCategorySearch('');
                  }}
                  className="hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'subcategory' ? null : 'subcategory');
                }}
              >
                {openDropdown === 'subcategory' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {openDropdown === 'subcategory' && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1 animate-in fade-in-50">
              <button
                type="button"
                onClick={() => {
                  onSubCategoryChange('All');
                  setSubCategorySearch('');
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  selectedSubCategory === 'All'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Sub-Categories</span>
                {selectedSubCategory === 'All' && <Check className="w-3.5 h-3.5" />}
              </button>
              {filteredSubCategories
                .filter((s) => s !== 'All' && s !== 'All Subcategories')
                .map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      onSubCategoryChange(sub);
                      setSubCategorySearch('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedSubCategory === sub
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{sub}</span>
                    {selectedSubCategory === sub && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. COUNTRY FILTER                                                         */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Country</span>
          </label>

          <div
            className={`w-full min-h-[42px] bg-slate-950 border rounded-2xl p-1.5 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
              openDropdown === 'country'
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setOpenDropdown('country')}
          >
            {selectedCountry && selectedCountry !== 'All' ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-600/25 border border-emerald-500/40 text-xs font-semibold text-emerald-200 animate-in fade-in">
                <span>{availableCountries.find((c) => c.code === selectedCountry)?.flag || '🌍'}</span>
                <span>{availableCountries.find((c) => c.code === selectedCountry)?.name || selectedCountry}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCountryChange('All');
                    onCityChange('All');
                  }}
                  className="p-0.5 rounded-full hover:bg-emerald-500/30 text-emerald-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null}

            <input
              type="text"
              placeholder={selectedCountry && selectedCountry !== 'All' ? '' : 'Search countries...'}
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                setOpenDropdown('country');
              }}
              onFocus={() => setOpenDropdown('country')}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-0.5"
            />

            <div className="flex items-center space-x-1 text-slate-400 px-1">
              {selectedCountry && selectedCountry !== 'All' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCountryChange('All');
                    onCityChange('All');
                    setCountrySearch('');
                  }}
                  className="hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'country' ? null : 'country');
                }}
              >
                {openDropdown === 'country' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {openDropdown === 'country' && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1 animate-in fade-in-50">
              <button
                type="button"
                onClick={() => {
                  onCountryChange('All');
                  onCityChange('All');
                  setCountrySearch('');
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  selectedCountry === 'All' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🌍 All Global Countries</span>
                {selectedCountry === 'All' && <Check className="w-3.5 h-3.5" />}
              </button>
              {filteredCountries
                .filter((c) => c.code !== 'All')
                .map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onCountryChange(c.code);
                      onCityChange('All');
                      setCountrySearch('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedCountry === c.code
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({c.code})</span>
                    </span>
                    {selectedCountry === c.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. LOCATION / AIRPORT HUB FILTER (MATCHING REFERENCE SCREENSHOT EXACTLY!)   */}
        {/* In the screenshot: User typed "Gul", focused input with purple border,     */}
        {/* and matching options: Alangulam, Angul, Bagula, Dindigul, Gulabpura, etc.  */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Location / Airport Hub (City, State, Country)</span>
          </label>

          {/* Autocomplete Suggestions Box: When open, rendered as a dedicated options panel */}
          {openDropdown === 'location' && (
            <div className="bg-slate-950 border border-slate-700 rounded-2xl p-2 mb-2 max-h-56 overflow-y-auto space-y-1 shadow-2xl animate-in fade-in-50">
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Matching Aviation Locations ({filteredLocations.length})</span>
                <span className="text-sky-400">Click to Select</span>
              </div>
              {filteredLocations.map((loc) => {
                const isSelected = selectedCity.toLowerCase() === loc.city.toLowerCase();
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onCityChange(loc.city);
                      if (loc.countryCode && selectedCountry === 'All') {
                        onCountryChange(loc.countryCode);
                      }
                      setLocationSearch('');
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-xs text-white truncate">{loc.display}</div>
                      {loc.hubType && (
                        <div className="text-[10px] text-slate-400 font-mono truncate">{loc.hubType}</div>
                      )}
                    </div>
                    {loc.airportCode && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold shrink-0">
                        {loc.airportCode}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Location Input Box: Matches purple/indigo focus border from user reference image */}
          <div
            className={`w-full min-h-[44px] bg-slate-950 border rounded-2xl p-2 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
              openDropdown === 'location'
                ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                : 'border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setOpenDropdown('location')}
          >
            {selectedCity && selectedCity !== 'All' ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-sky-600/25 border border-sky-500/40 text-xs font-semibold text-sky-200 animate-in fade-in">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>{selectedCity}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCityChange('All');
                  }}
                  className="p-0.5 rounded-full hover:bg-sky-500/30 text-sky-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null}

            <input
              type="text"
              placeholder={selectedCity && selectedCity !== 'All' ? '' : 'Type location (e.g., Gul, Mumbai, Dubai...)'}
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setOpenDropdown('location');
              }}
              onFocus={() => setOpenDropdown('location')}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-0.5 font-medium"
            />

            <div className="flex items-center space-x-1 text-slate-400 px-1">
              {selectedCity && selectedCity !== 'All' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCityChange('All');
                    setLocationSearch('');
                  }}
                  className="hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'location' ? null : 'location');
                }}
              >
                {openDropdown === 'location' ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. COMPANIES FILTER (Search company names with chevron, from image)         */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Companies</span>
          </label>

          <div
            className={`w-full min-h-[44px] bg-slate-950 border rounded-2xl p-2 flex flex-wrap items-center gap-1.5 transition-all cursor-text ${
              openDropdown === 'company'
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
            onClick={() => setOpenDropdown('company')}
          >
            {selectedCompany && selectedCompany !== 'All' ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-600/25 border border-purple-500/40 text-xs font-semibold text-purple-200 animate-in fade-in">
                <Building2 className="w-3 h-3 text-purple-400" />
                <span className="truncate max-w-[150px]">{selectedCompany}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompanyChange('All');
                  }}
                  className="p-0.5 rounded-full hover:bg-purple-500/30 text-purple-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null}

            <input
              type="text"
              placeholder={selectedCompany && selectedCompany !== 'All' ? '' : 'Search company names'}
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value);
                setOpenDropdown('company');
              }}
              onFocus={() => setOpenDropdown('company')}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2 py-0.5"
            />

            <div className="flex items-center space-x-1 text-slate-400 px-1">
              {selectedCompany && selectedCompany !== 'All' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompanyChange('All');
                    setCompanySearch('');
                  }}
                  className="hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'company' ? null : 'company');
                }}
              >
                {openDropdown === 'company' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {openDropdown === 'company' && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto space-y-1 animate-in fade-in-50">
              <button
                type="button"
                onClick={() => {
                  onCompanyChange('All');
                  setCompanySearch('');
                  setOpenDropdown(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  selectedCompany === 'All' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>All Companies</span>
                {selectedCompany === 'All' && <Check className="w-3.5 h-3.5" />}
              </button>
              {filteredCompanies.map((comp) => (
                <button
                  key={comp.name}
                  type="button"
                  onClick={() => {
                    onCompanyChange(comp.name);
                    setCompanySearch('');
                    setOpenDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    selectedCompany === comp.name
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-xs text-white truncate flex items-center space-x-1.5">
                      <span>{comp.name}</span>
                      {comp.verified && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {comp.category} • {comp.city}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-amber-400 font-mono shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{comp.rating.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 7. VERIFICATION & VIDEO TOGGLES                                           */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
            Verification &amp; Media
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onVerifiedOnlyChange(!verifiedOnly)}
              className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                verifiedOnly
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Verified Only</span>
              </div>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                  verifiedOnly ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-slate-600'
                }`}
              >
                {verifiedOnly && '✓'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onHasVideoOnlyChange(!hasVideoOnly)}
              className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                hasVideoOnly
                  ? 'bg-sky-950/60 border-sky-500/60 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px]">Video Tour</span>
              </div>
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                  hasVideoOnly ? 'bg-sky-500 border-sky-400 text-black font-bold' : 'border-slate-600'
                }`}
              >
                {hasVideoOnly && '✓'}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8. AVAILABLE DETAILS CARD ("details should be displayed below")           */}
        {/* ========================================================================= */}
        <div id="available-filter-details-section" className="pt-3 pb-8 border-t border-slate-800 space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Available Filter Details</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Full Details
              </span>
              <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                {filteredCount} Matches
              </span>
            </div>
          </div>

          {/* Conditional Detail Boxes based on user selection */}
          {appliedFiltersCount === 0 ? (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
              Select or type any <strong>Category</strong>, <strong>Sub-Category</strong>,{' '}
              <strong>Country</strong>, or <strong>City / Airport Hub</strong> to inspect available aerospace capabilities,
              operational flight corridors, and verified providers below.
            </div>
          ) : (
            <div className="space-y-2.5 animate-in fade-in-50">
              {/* Category Details */}
              {selectedCategory && selectedCategory !== 'All' && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 font-mono">Category Profile</span>
                    <span className="text-[10px] text-slate-400 font-mono">Verified Sector</span>
                  </div>
                  <div className="text-xs font-bold text-white">{selectedCategory}</div>
                  <p className="text-[11px] text-slate-300">
                    Aviation directory taxonomy featuring verified operations, certified personnel, and compliance-audited listings.
                  </p>
                  {activeCategoryServices.length > 0 && (
                    <div className="pt-1.5 border-t border-indigo-500/20 text-[10px] text-indigo-300">
                      <strong>Approved Services ({activeCategoryServices.length}):</strong> {activeCategoryServices.slice(0, 3).join(', ')}...
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Category Details */}
              {selectedSubCategory && selectedSubCategory !== 'All' && selectedSubCategory !== 'All Subcategories' && (
                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-blue-400 font-mono">Sub-Category Scope</span>
                    <span className="text-[10px] text-blue-300 font-mono">Operations</span>
                  </div>
                  <div className="text-xs font-bold text-white">{selectedSubCategory}</div>
                  <p className="text-[11px] text-slate-300">
                    Dedicated specialty sector governed under standardized civil aviation procedures and TRUVAER statutory verifications.
                  </p>
                </div>
              )}

              {/* Location (City / State / Airport Hub) Details */}
              {activeLocationObj && (
                <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-sky-400 font-mono">Aviation Hub Details</span>
                    {activeLocationObj.airportCode && (
                      <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
                        {activeLocationObj.airportCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>{activeLocationObj.display}</span>
                  </div>
                  {activeLocationObj.hubType && (
                    <div className="text-[11px] text-sky-200">{activeLocationObj.hubType}</div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center space-x-2">
                    <span>Region: {getZoneForCountry(activeLocationObj.country)} Hub</span>
                    <span>•</span>
                    <span>State: {activeLocationObj.state}</span>
                  </div>
                </div>
              )}


              {/* Company Details */}
              {activeCompanyObj && (
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-purple-400 font-mono">Company Profile</span>
                    {activeCompanyObj.verified && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeCompanyObj.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {activeCompanyObj.category} • {activeCompanyObj.city}, {activeCompanyObj.country}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
