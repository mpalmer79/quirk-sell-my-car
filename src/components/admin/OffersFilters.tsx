'use client';

import { Search, Filter } from 'lucide-react';
import { DateRangeFilter } from '@/types/admin';
import { STATUS_CONFIG, DATE_RANGE_OPTIONS } from '@/lib/admin/constants';

interface OffersFiltersProps {
  statusFilter: string;
  searchQuery: string;
  dateRange: DateRangeFilter;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onDateRangeChange: (range: DateRangeFilter) => void;
}

export function OffersFilters({
  statusFilter,
  searchQuery,
  dateRange,
  onStatusChange,
  onSearchChange,
  onDateRangeChange,
}: OffersFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by VIN..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
