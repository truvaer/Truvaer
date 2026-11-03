import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, X, Check, Globe, Plane } from 'lucide-react';
import { LocationItem, searchLocations, COMPREHENSIVE_LOCATIONS } from '../data/searchLocationsData';

interface LocationAutocompleteProps {
  value: string;
  onChange: (display: string, loc?: LocationItem) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  minChars?: number;
  autoFocus?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Type 3+ letters (e.g., Hyd, Mum, Dub)...',
  label,
  className = '',
  inputClassName = '',
  required = false,
  minChars = 3,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = useMemo(() => {
    if (query.trim().length < minChars) return [];
    return searchLocations(query, minChars);
  }, [query, minChars]);

  const handleSelect = (loc: LocationItem) => {
    setQuery(loc.display);
    onChange(loc.display, loc);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {query.length >= minChars ? `${results.length} found` : `Min ${minChars} chars`}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          placeholder={placeholder}
          required={required}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            onChange(next);
            if (next.trim().length >= minChars) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= minChars) {
              setIsOpen(true);
            }
          }}
          className={`w-full pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-all font-medium ${inputClassName}`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-800/80 animate-in fade-in-50">
          <div className="px-3 py-1.5 bg-slate-950/80 text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-800">
            <span>Verified Aviation Corridors &amp; Hubs</span>
            <span>{results.length} Matches</span>
          </div>
          {results.map((loc) => {
            const isSelected = value === loc.display;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc)}
                className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600/20 text-white'
                    : 'hover:bg-slate-800/80 text-slate-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white truncate">
                      {loc.city}, {loc.state}, {loc.country}
                    </span>
                    {loc.airportCode && (
                      <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30 shrink-0">
                        {loc.airportCode}
                      </span>
                    )}
                  </div>
                  {loc.hubType && (
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center space-x-1">
                      <Plane className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{loc.hubType}</span>
                    </div>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.trim().length >= minChars && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-xl p-3 text-center text-xs text-slate-400">
          No matching aviation hubs found for &ldquo;<span className="text-white font-medium">{query}</span>&rdquo;. You can still use this as a custom location.
        </div>
      )}
    </div>
  );
};
