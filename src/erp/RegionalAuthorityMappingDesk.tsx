import React, { useState, useMemo } from 'react';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowRight,
  Layers,
  MapPin,
  RefreshCw,
  FolderPlus,
  Sliders,
  Lock,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { RegionalAuthorityZone, RegionCountryMapping, AdminUser, RegularUser } from '../types';

interface RegionalAuthorityMappingDeskProps {
  activeAdminUser?: AdminUser | null;
  currentUser?: RegularUser | null;
  onRefreshAll?: () => void;
}

export const RegionalAuthorityMappingDesk: React.FC<RegionalAuthorityMappingDeskProps> = ({
  activeAdminUser,
  currentUser,
  onRefreshAll,
}) => {
  // L8 users and Super Admin only have Edit access
  const isL8OrSuperAdmin = Boolean(
    activeAdminUser?.level === 8 ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com'
  );

  const [regions, setRegions] = useState<RegionalAuthorityZone[]>(() => db.getRegionalZones());
  const [countryMappings, setCountryMappings] = useState<RegionCountryMapping[]>(() =>
    db.getCountryRegionMappings()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'ACCORDION' | 'TABLE'>('ACCORDION');

  // Expanded regions state for hierarchical accordion
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>(() => {
    // Expand all by default
    const map: Record<string, boolean> = {};
    regions.forEach((r) => {
      map[r.code] = true;
    });
    return map;
  });

  // Modals state
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<RegionCountryMapping | null>(null);
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [assignedRegionCode, setAssignedRegionCode] = useState(regions[0]?.code || 'APAC');
  const [authorityAgency, setAuthorityAgency] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<RegionalAuthorityZone | null>(null);
  const [regionCode, setRegionCode] = useState('');
  const [regionName, setRegionName] = useState('');
  const [regionDesc, setRegionDesc] = useState('');
  const [regionHq, setRegionHq] = useState('');
  const [regionAuth, setRegionAuth] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = () => {
    setRegions(db.getRegionalZones());
    setCountryMappings(db.getCountryRegionMappings());
    if (onRefreshAll) onRefreshAll();
  };

  const toggleRegionExpand = (code: string) => {
    setExpandedRegions((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // -------------------------------------------------------------
  // COUNTRY MODAL HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddCountryModal = (defaultRegion?: string) => {
    setEditingCountry(null);
    setCountryName('');
    setCountryCode('');
    setAssignedRegionCode(defaultRegion || regions[0]?.code || 'APAC');
    setAuthorityAgency('');
    setCurrency('USD');
    setIsCountryModalOpen(true);
  };

  const handleOpenEditCountryModal = (item: RegionCountryMapping) => {
    setEditingCountry(item);
    setCountryName(item.name);
    setCountryCode(item.code);
    setAssignedRegionCode(item.regionCode);
    setAuthorityAgency(item.regionalAuthorityAgency || '');
    setCurrency(item.currency || 'USD');
    setIsCountryModalOpen(true);
  };

  const handleSaveCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Country mapping modification is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (!countryName.trim()) {
      alert('Please enter a country name.');
      return;
    }

    const finalCode = (countryCode.trim() || countryName.slice(0, 2)).toUpperCase();

    const res = db.saveCountryRegionMapping({
      id: editingCountry?.id,
      name: countryName.trim(),
      code: finalCode,
      regionCode: assignedRegionCode,
      regionalAuthorityAgency: authorityAgency.trim() || 'Civil Aviation Authority',
      currency: currency.trim().toUpperCase() || 'USD',
      status: 'ACTIVE',
    });

    reloadData();
    setIsCountryModalOpen(false);
    showToast(res.message);
  };

  const handleDeleteCountry = (item: RegionCountryMapping) => {
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Country mapping deletion is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (!window.confirm(`Unmap and delete ${item.name} (${item.code}) from ${item.regionCode}?`)) {
      return;
    }
    const res = db.deleteCountryRegionMapping(item.id);
    reloadData();
    showToast(res.message);
  };

  const handleQuickReassign = (item: RegionCountryMapping, newRegion: string) => {
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Country region reassignment is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (item.regionCode === newRegion) return;
    const res = db.reassignCountryRegion(item.id, newRegion);
    reloadData();
    showToast(res.message);
  };

  const handleAutoFixMappings = () => {
    if (!isL8OrSuperAdmin) return;
    const res = db.syncAndFixCountryMappings();
    reloadData();
    showToast(res.message);
  };

  // -------------------------------------------------------------
  // REGION MODAL HANDLERS (SEPARATE FORM)
  // -------------------------------------------------------------
  const handleOpenAddRegionModal = () => {
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Regional Zone creation is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    setEditingRegion(null);
    setRegionCode('');
    setRegionName('');
    setRegionDesc('');
    setRegionHq('');
    setRegionAuth('');
    setIsRegionModalOpen(true);
  };

  const handleOpenEditRegionModal = (reg: RegionalAuthorityZone) => {
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Regional Zone editing is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    setEditingRegion(reg);
    setRegionCode(reg.code);
    setRegionName(reg.name);
    setRegionDesc(reg.description);
    setRegionHq(reg.headquarters || '');
    setRegionAuth(reg.primaryAuthority || '');
    setIsRegionModalOpen(true);
  };

  const handleSaveRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Regional Zone modification is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (!regionCode.trim() || !regionName.trim()) {
      alert('Please enter region code and name.');
      return;
    }

    const res = db.saveRegionalZone({
      id: editingRegion?.id,
      code: regionCode.trim().toUpperCase(),
      name: regionName.trim(),
      description: regionDesc.trim(),
      headquarters: regionHq.trim(),
      primaryAuthority: regionAuth.trim(),
    });

    reloadData();
    setIsRegionModalOpen(false);
    showToast(res.message);
  };

  const handleDeleteRegion = (reg: RegionalAuthorityZone) => {
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Regional Zone deletion is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (!window.confirm(`Delete Regional Zone "${reg.name}"?`)) return;
    const res = db.deleteRegionalZone(reg.id);
    if (!res.success) {
      alert(res.message);
      return;
    }
    reloadData();
    showToast(res.message);
  };

  // -------------------------------------------------------------
  // COMPUTED HIERARCHY
  // -------------------------------------------------------------
  const filteredHierarchy = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return regions
      .filter((r) => {
        if (selectedRegionFilter !== 'ALL' && r.code !== selectedRegionFilter) {
          return false;
        }
        return true;
      })
      .map((r) => {
        const countriesInRegion = countryMappings.filter((c) => c.regionCode === r.code);
        const filteredCountries = countriesInRegion.filter((c) => {
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            (c.regionalAuthorityAgency && c.regionalAuthorityAgency.toLowerCase().includes(q))
          );
        });

        const regionMatches =
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q);

        return {
          region: r,
          countries: filteredCountries,
          totalInRegion: countriesInRegion.length,
          matchesFilter: regionMatches || filteredCountries.length > 0,
        };
      })
      .filter((item) => item.matchesFilter);
  }, [regions, countryMappings, searchQuery, selectedRegionFilter]);

  const flatFilteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return countryMappings.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.regionCode.toLowerCase().includes(q) ||
        (c.regionalAuthorityAgency && c.regionalAuthorityAgency.toLowerCase().includes(q));

      const matchesRegion = selectedRegionFilter === 'ALL' || c.regionCode === selectedRegionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [countryMappings, searchQuery, selectedRegionFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* L8 / Super Admin Access Level Banner */}
      {!isL8OrSuperAdmin && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center space-x-3 text-amber-200 text-xs shadow-md">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold text-amber-300">Read-Only Mode:</strong> Regional Authority Zone creation, country mapping, and modification are restricted strictly to Level 8 Sovereign Users and Super Admin only. Other users and lower administrative tiers have read-only access.
          </div>
        </div>
      )}

      {/* Header Banner with DUAL Distinct Actions (Country vs Region) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Regional Authority &amp; Country Mapping</h2>
                <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                  Aviation Jurisdiction
                </span>
                {isL8OrSuperAdmin ? (
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    L8 / Super Admin Edit Access
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700 flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Read-Only</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Hierarchical mapping of sovereign countries and civil aviation authorities (DGCA, FAA, EASA, GCAA) to Regional Zones.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Explicitly Distinguishing Country Mapping vs New Region Creation */}
        {isL8OrSuperAdmin ? (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddCountryModal()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
              title="Map an existing or new country into a Regional Zone"
            >
              <MapPin className="w-4 h-4" />
              <span>+ Map Country to Region</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFixMappings}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all shadow-sm"
              title="Double check and automatically heal all country and regional mappings against international civil aviation standard registries"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Double-Check &amp; Fix Mapping</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddRegionModal}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-sm"
              title="Define and register a brand new Regional Authority Zone"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create New Region Zone</span>
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 font-bold text-xs flex items-center space-x-2 shrink-0">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>L8 / Super Admin Edit Only</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Regional Zones</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{regions.length}</div>
          <div className="text-[10px] text-slate-500">APAC, EMEA, NA, LATAM, ANZ, CIS, MENA</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Mapped Countries</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{countryMappings.length}</div>
          <div className="text-[10px] text-slate-500">Sovereign aviation territories mapped</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Largest Regional Sector</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white truncate">EMEA Corridors</div>
          <div className="text-[10px] text-amber-300 font-mono">10 Countries &bull; EASA / GCAA / UK CAA</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Regulatory Bodies</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">18+ Authorities</div>
          <div className="text-[10px] text-slate-500">DGCA, FAA, EASA, GCAA, CASA mapped</div>
        </div>
      </div>

      {/* Toolbar: Search, Region Filter Pills & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country, ISO code (e.g. IN, US), or authority (DGCA)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase hidden sm:inline">View Mode:</span>
            <button
              type="button"
              onClick={() => setViewMode('ACCORDION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'ACCORDION'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Hierarchical Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'TABLE'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Flat Table</span>
            </button>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1">
          <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">Region:</span>
          <button
            type="button"
            onClick={() => setSelectedRegionFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedRegionFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Regions ({regions.length})
          </button>
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRegionFilter(r.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedRegionFilter === r.code
                  ? 'bg-sky-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {r.code} ({countryMappings.filter((c) => c.regionCode === r.code).length})
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: HIERARCHICAL REGION-COUNTRY ACCORDION OVERVIEW                */}
      {/* ========================================================================= */}
      {viewMode === 'ACCORDION' && (
        <div className="space-y-4">
          {filteredHierarchy.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">No regional authority mappings found.</p>
              <p className="text-xs text-slate-500 mt-1">Try another search keyword or map a country to this zone.</p>
            </div>
          ) : (
            filteredHierarchy.map(({ region: reg, countries: cList, totalInRegion }) => {
              const isExpanded = !!expandedRegions[reg.code];

              return (
                <div
                  key={reg.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all"
                >
                  {/* Region Parent Header Card */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-950/80 border-b border-slate-800/80">
                    <div
                      className="flex items-center space-x-3 cursor-pointer group flex-1"
                      onClick={() => toggleRegionExpand(reg.code)}
                    >
                      <button
                        type="button"
                        className="p-1 rounded-lg bg-slate-800 group-hover:bg-slate-700 text-slate-400 group-hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-black text-xs border border-sky-500/30">
                          {reg.code}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors flex items-center space-x-2">
                            <span>{reg.name}</span>
                            {reg.isSystem && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                System Zone
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {reg.description} &bull; <strong className="text-slate-300">{reg.headquarters}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Region Metadata & Controls */}
                    <div className="flex items-center space-x-2.5 self-end sm:self-auto shrink-0">
                      <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                        {totalInRegion} {totalInRegion === 1 ? 'Country' : 'Countries'} Mapped
                      </span>

                      {isL8OrSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenAddCountryModal(reg.code)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                            title={`Map a country directly into ${reg.code}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Map Country</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditRegionModal(reg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                            title="Edit Regional Zone"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {!reg.isSystem && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRegion(reg)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                              title="Delete Custom Regional Zone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Children Table: Assigned Countries */}
                  {isExpanded && (
                    <div className="overflow-x-auto bg-slate-950/40">
                      {cList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          No countries assigned to {reg.name} yet. Click{' '}
                          <button
                            type="button"
                            onClick={() => handleOpenAddCountryModal(reg.code)}
                            className="text-sky-400 font-bold hover:underline"
                          >
                            + Map Country
                          </button>{' '}
                          to map an aviation territory into this zone.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800/80 bg-slate-950/80 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                              <th className="py-2.5 px-5">ISO Code</th>
                              <th className="py-2.5 px-4">Country Name</th>
                              <th className="py-2.5 px-4">Civil Aviation Authority (CAA)</th>
                              <th className="py-2.5 px-4">Currency</th>
                              <th className="py-2.5 px-4">Reassign Region</th>
                              <th className="py-2.5 px-5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {cList.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                {/* ISO Code */}
                                <td className="py-3 px-5">
                                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-800 text-sky-300 border border-slate-700">
                                    {item.code}
                                  </span>
                                </td>

                                {/* Country Name */}
                                <td className="py-3 px-4 font-bold text-white">
                                  {item.name}
                                </td>

                                {/* Civil Aviation Regulatory Agency */}
                                <td className="py-3 px-4 text-slate-300">
                                  <div className="flex items-center space-x-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>{item.regionalAuthorityAgency || 'Civil Aviation Authority'}</span>
                                  </div>
                                </td>

                                {/* Currency */}
                                <td className="py-3 px-4 font-mono text-slate-400">
                                  {item.currency || 'USD'}
                                </td>

                                {/* Quick Reassign Region */}
                                <td className="py-3 px-4">
                                  {isL8OrSuperAdmin ? (
                                    <select
                                      value={item.regionCode}
                                      onChange={(e) => handleQuickReassign(item, e.target.value)}
                                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-white font-mono outline-none focus:border-sky-500 cursor-pointer"
                                    >
                                      {regions.map((r) => (
                                        <option key={r.id} value={r.code}>
                                          {r.code} - {r.name.split(' ')[0]}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="font-mono text-slate-400 text-xs">{item.regionCode}</span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3 px-5 text-right">
                                  {isL8OrSuperAdmin ? (
                                    <div className="flex items-center justify-end space-x-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditCountryModal(item)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                        title="Edit Country Details"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCountry(item)}
                                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                        title="Unmap Country"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end">
                                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 flex items-center space-x-1">
                                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                                        <span>Read-Only</span>
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: FLAT DATA TABLE VIEW                                         */}
      {/* ========================================================================= */}
      {viewMode === 'TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Country Code</th>
                  <th className="py-3 px-4">Country Name</th>
                  <th className="py-3 px-4">Assigned Region</th>
                  <th className="py-3 px-4">Regulatory Authority (CAA)</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {flatFilteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No country mapping matches your search query.
                    </td>
                  </tr>
                ) : (
                  flatFilteredCountries.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {c.regionCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {c.regionalAuthorityAgency || 'Civil Aviation Authority'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.currency || 'USD'}</td>
                      <td className="py-3 px-4 text-right">
                        {isL8OrSuperAdmin ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCountryModal(c)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit Country"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCountry(c)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                              title="Unmap Country"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 flex items-center space-x-1">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                              <span>Read-Only</span>
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT COUNTRY FORM (MAPPING INTO REGION)                     */}
      {/* ========================================================================= */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingCountry ? 'Edit Country Mapping' : 'Map Country to Regional Zone'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Map territory to an existing Regional Zone &amp; Civil Aviation Authority
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="space-y-4">
              {/* Country Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Country Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  placeholder="e.g. Switzerland"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>

              {/* Country Code (ISO 2-Letter) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    ISO Country Code (2-Letter) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CH"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono font-bold text-sky-400 placeholder-slate-600 outline-none uppercase transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Operating Currency</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    placeholder="e.g. CHF"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-white placeholder-slate-600 outline-none uppercase transition-colors"
                  />
                </div>
              </div>

              {/* Assign to Region (Dropdown fetching existing Regional Zones) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Assign to Region (Parent Zone) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={assignedRegionCode}
                  onChange={(e) => setAssignedRegionCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-white outline-none cursor-pointer transition-colors"
                  required
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.code}>
                      {r.code} — {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">
                  Data entered under this country will hierarchically roll up into the selected region.
                </p>
              </div>

              {/* Civil Aviation Regulatory Agency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Regulatory Civil Aviation Authority (CAA)
                </label>
                <input
                  type="text"
                  value={authorityAgency}
                  onChange={(e) => setAuthorityAgency(e.target.value)}
                  placeholder="e.g. FOCA (Federal Office of Civil Aviation) / EASA"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              {/* Submit / Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCountryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingCountry ? 'Update Country Mapping' : 'Save Country Mapping'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT COMPLETELY NEW REGIONAL ZONE FORM                   */}
      {/* ========================================================================= */}
      {isRegionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingRegion ? 'Edit Regional Authority Zone' : 'Create New Regional Authority Zone'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define a new parent regional zone for global air corridors
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegionModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="space-y-4">
              {/* Region Code & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Zone Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={regionCode}
                    onChange={(e) => setRegionCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MENA"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs font-mono font-bold text-amber-400 placeholder-slate-600 outline-none uppercase transition-colors"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Full Region Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    placeholder="e.g. Middle East & North Africa (MENA)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Air Corridors &amp; Scope Description
                </label>
                <textarea
                  value={regionDesc}
                  onChange={(e) => setRegionDesc(e.target.value)}
                  rows={2}
                  placeholder="GCC and North African cross-continental flight sectors and designated airways..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors resize-none"
                />
              </div>

              {/* Headquarters Hub */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Zone Operational Headquarters Hub
                </label>
                <input
                  type="text"
                  value={regionHq}
                  onChange={(e) => setRegionHq(e.target.value)}
                  placeholder="e.g. Riyadh (RUH) / Doha (DOH)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              {/* Primary Regulatory Body */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Primary Civil Aviation Regulatory Body
                </label>
                <input
                  type="text"
                  value={regionAuth}
                  onChange={(e) => setRegionAuth(e.target.value)}
                  placeholder="e.g. GACA / QCAA / GCAA"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingRegion ? 'Update Regional Zone' : 'Create Regional Zone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
