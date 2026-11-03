import React, { useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  MapPin,
  RotateCcw,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { ServiceListing } from '../types';

export interface ServiceScoutSearchEngineProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedSubCategory?: string;
  onSubCategoryChange?: (subCat: string) => void;
  selectedServices?: string[];
  onServicesChange?: (services: string[]) => void;
  selectedCountry?: string;
  onCountryChange?: (country: string) => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
  availableCategories?: string[];
  availableSubCategories?: string[];
  availableCountries?: Array<{ code: string; name: string; flag: string }>;
  allListings?: ServiceListing[];
  filteredCount?: number;
  onApplyFilter: () => void;
  onResetFilters: () => void;
  isVerifiedBusinessUser?: boolean;
  canCreateListing?: boolean;
  onCreateListing?: () => void;
  onAddCategoryModal?: () => void;
  onAddLocationModal?: () => void;
  className?: string;
}

export const ServiceScoutSearchEngine: React.FC<ServiceScoutSearchEngineProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  selectedSubCategory,
  selectedServices = [],
  selectedCountry,
  selectedCity,
  onApplyFilter,
  onResetFilters,
  isVerifiedBusinessUser = false,
  canCreateListing = false,
  onCreateListing,
  onAddCategoryModal,
  onAddLocationModal,
  className = '',
}) => {
  // Compute number of active filters from sidebar and search query
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory && selectedCategory !== 'All') count++;
    if (selectedSubCategory && selectedSubCategory !== 'All' && selectedSubCategory !== 'All Subcategories') count++;
    if (selectedServices.length > 0) count += selectedServices.length;
    if (selectedCountry && selectedCountry !== 'All') count++;
    if (selectedCity && selectedCity !== 'All') count++;
    return count;
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedServices, selectedCountry, selectedCity]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 text-slate-100 ${className}`}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-tight">ServiceScout Search Engine</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                Directory Search
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fast keyword search across verified aerospace enterprises, charter operators, flight academies, and engineering facilities.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
              activeFiltersCount > 0
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-400 bg-slate-950 border border-slate-800'
            }`}
          >
            Applied ({activeFiltersCount})
          </span>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-slate-400 hover:text-rose-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-800 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Reset all active search filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Keyword Search Bar Row with Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by aerospace company, aircraft type, pilot academy, avionics MRO, charter flight..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onApplyFilter();
            }}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onApplyFilter}
          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Apply Filter</span>
        </button>

        {/* Business/Admin Actions: Create Listing & Add Category */}
        {canCreateListing && onCreateListing && (
          <button
            type="button"
            onClick={onCreateListing}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
            title="Create new marketplace listing"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create</span>
          </button>
        )}

        {canCreateListing && onAddCategoryModal && (
          <button
            type="button"
            onClick={onAddCategoryModal}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
            title="Propose Category & Sub-Category (Admin & Manager only)"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Category</span>
          </button>
        )}

        {/* Add Location Shortcut: Admin & Manager Only */}
        {canCreateListing && onAddLocationModal && (
          <button
            type="button"
            onClick={onAddLocationModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
            title="Update or register business location (Admin & Manager only)"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Business Location</span>
          </button>
        )}
      </div>
    </div>
  );
};
