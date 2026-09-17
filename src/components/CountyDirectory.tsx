/**
 * Okoa Malebo - County Directory Component
 * Filterable list of care facilities by county
 */

'use client';

import { useState, useMemo } from 'react';
import { getAllCounties, getFacilitiesByCounty, CARE_FACILITIES, FACILITY_TYPE_LABELS, FACILITY_TAG_LABELS } from '@/lib/storage';
import type { CareFacility, FacilityType } from '@/types';

export function CountyDirectory() {
  const [selectedCounty, setSelectedCounty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FacilityType | 'All'>('All');

  const counties = useMemo(() => ['All', ...getAllCounties()], []);
  const facilities = useMemo(() => {
    let filtered = selectedCounty === 'All' ? CARE_FACILITIES : getFacilitiesByCounty(selectedCounty);
    
    if (filterType !== 'All') {
      filtered = filtered.filter(f => f.type === filterType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.subCounty.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCounty, filterType, searchQuery]);

  const facilityTypes: Array<FacilityType | 'All'> = ['All', 'INPATIENT_REHAB', 'OUTPATIENT_CLINIC', 'MAT_METHADONE', 'AA_MEETING', 'NA_MEETING'];

  return (
    <div className="county-directory-panel motion-panel min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_8px_20px_var(--shadow-color)] sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-800">Find Help Near You</h3>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
          📍 Directory
        </span>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* County Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">County</label>
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          >
            {counties.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Facility Type</label>
          <div className="flex flex-wrap gap-2">
            {facilityTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {type === 'All' ? 'All Types' : FACILITY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or sub-county..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {facilities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-lg mb-2">No facilities found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          facilities.map(facility => (
            <FacilityCard key={facility.id} facility={facility} />
          ))
        )}
      </div>

      {/* Emergency numbers reminder */}
      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
        <p className="mb-2 flex items-center gap-2 font-semibold text-[var(--ink)]">
          🚨 Emergency: If you&apos;re in immediate danger, call:
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="tel:1192" className="font-mono font-bold text-[var(--clay)] hover:underline">NACADA: 1192</a>
          <a href="tel:1199" className="font-mono font-bold text-[var(--clay)] hover:underline">Red Cross: 1199</a>
          <a href="tel:+254722178177" className="font-mono font-bold text-[var(--clay)] hover:underline">Befrienders: +254 722 178 177</a>
        </div>
      </div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: CareFacility }) {
  const typeColor = getTypeColor(facility.type);

  return (
    <div className="min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 transition-all hover:border-[var(--clay)] hover:shadow-md">
      <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="min-w-0 flex-1 font-semibold text-[var(--ink)]">{facility.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
              {FACILITY_TYPE_LABELS[facility.type]}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">{facility.subCounty}, {facility.county} County</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {facility.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            {FACILITY_TAG_LABELS[tag]}
          </span>
        ))}
        {facility.estimatedMonthlyCostKes === 0 && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Free Entry
          </span>
        )}
        {facility.estimatedMonthlyCostKes > 0 && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            ~KES {facility.estimatedMonthlyCostKes.toLocaleString()}/month
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`tel:${facility.contactPhone}`}
          className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          📞 {facility.contactPhone}
        </a>
        {facility.whatsappNumber && (
          <a
            href={`https://wa.me/${facility.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function getTypeColor(type: FacilityType): string {
  switch (type) {
    case 'INPATIENT_REHAB': return 'bg-blue-100 text-blue-700';
    case 'OUTPATIENT_CLINIC': return 'bg-emerald-100 text-emerald-700';
    case 'MAT_METHADONE': return 'bg-purple-100 text-purple-700';
    case 'AA_MEETING': return 'bg-amber-100 text-amber-700';
    case 'NA_MEETING': return 'bg-pink-100 text-pink-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}