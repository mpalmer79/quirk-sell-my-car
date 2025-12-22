'use client';

import { X, Car, Gauge, MapPin, FileText, Key, Cigarette, Wrench, CircleDot, AlertCircle, Paintbrush, Sofa, Cpu, Wind, Mail, DollarSign, Clock, Truck, CreditCard } from 'lucide-react';
import { OfferRecord } from '@/types/admin';
import { STATUS_CONFIG } from '@/lib/admin/constants';
import { StatusBadge } from './StatusBadge';
import {
  formatConditionValue,
  formatArrayValue,
  formatBooleanValue,
  formatKeys,
  formatTiresReplaced,
  formatAccidentHistory,
  formatSellOrTrade,
  formatLoanOrLease,
  formatCurrency,
  formatDate,
} from '@/lib/admin/formatters';

interface OfferDetailModalProps {
  offer: OfferRecord;
  onClose: () => void;
  onStatusUpdate: (offerId: string, status: string) => void;
}

export function OfferDetailModal({ offer, onClose, onStatusUpdate }: OfferDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {offer.year} {offer.make} {offer.model}
            </h2>
            <p className="text-sm text-gray-500 font-mono">{offer.vin}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Offer Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 mb-1">Offer Amount</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(offer.offer_amount)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">Mileage</p>
              <p className="text-2xl font-bold text-blue-700">
                {offer.mileage.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-600 mb-1">Status</p>
              <div className="mt-1">
                <StatusBadge status={offer.status} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Created</p>
              <p className="text-lg font-semibold text-gray-700">
                {formatDate(offer.created_at)}
              </p>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              Vehicle Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InfoCard icon={Car} label="Body Style" value={offer.body_class || 'N/A'} color="blue" />
              <InfoCard icon={Gauge} label="Drive Type" value={offer.drive_type || 'N/A'} color="blue" />
              <InfoCard icon={FileText} label="Fuel Type" value={offer.fuel_type || 'N/A'} color="blue" />
              <InfoCard icon={MapPin} label="ZIP Code" value={offer.zip_code || 'N/A'} color="blue" />
            </div>
          </div>

          {/* Intent & Ownership */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              Intent & Ownership
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={Truck} label="Intent" value={formatSellOrTrade(offer.sell_or_trade)} color="blue" />
              <InfoCard icon={CreditCard} label="Ownership" value={formatLoanOrLease(offer.loan_or_lease)} color="blue" />
            </div>
          </div>

          {/* Condition Overview */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              Condition Overview
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoCard icon={AlertCircle} label="Accidents" value={formatAccidentHistory(offer.accident_history)} color="amber" />
              <InfoCard icon={Car} label="Drivability" value={formatConditionValue(offer.drivability)} color="amber" />
              <InfoCard icon={Cigarette} label="Smoker Vehicle" value={formatBooleanValue(offer.smoked_in, 'Yes - Smoked In', 'Non-Smoker')} color="amber" />
              <InfoCard icon={Key} label="Keys" value={formatKeys(offer.keys)} color="amber" />
              <InfoCard icon={CircleDot} label="Tires Replaced" value={formatTiresReplaced(offer.tires_replaced)} color="amber" />
              <InfoCard icon={Wrench} label="Modifications" value={formatBooleanValue(offer.modifications, 'Has Modifications', 'Stock / No Mods')} color="amber" />
            </div>
          </div>

          {/* Issues & Damage */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              Reported Issues & Damage
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InfoCard icon={Wrench} label="Mechanical Issues" value={formatArrayValue(offer.mechanical_issues)} color="red" />
              <InfoCard icon={Car} label="Engine Issues" value={formatArrayValue(offer.engine_issues)} color="red" />
              <InfoCard icon={Paintbrush} label="Exterior Damage" value={formatArrayValue(offer.exterior_damage)} color="red" />
              <InfoCard icon={Sofa} label="Interior Damage" value={formatArrayValue(offer.interior_damage)} color="red" />
              <InfoCard icon={Cpu} label="Technology Issues" value={formatArrayValue(offer.technology_issues)} color="red" />
              <InfoCard icon={Wind} label="Windshield Damage" value={formatConditionValue(offer.windshield_damage) || 'None'} color="red" />
            </div>
          </div>

          {/* Customer Contact */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">
              Customer Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InfoCard icon={Mail} label="Email" value={offer.customer_email || 'N/A'} color="purple" />
              <InfoCard icon={DollarSign} label="Estimated Value" value={formatCurrency(offer.estimated_value)} color="purple" />
              <InfoCard icon={Clock} label="Offer Expires" value={offer.offer_expiry ? formatDate(offer.offer_expiry) : 'N/A'} color="purple" />
            </div>
          </div>

          {/* Status Update */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const isActive = offer.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => onStatusUpdate(offer.id, key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for info cards
function InfoCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'amber' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-3`}>
      <div className={`flex items-center gap-2 ${colorClasses[color].split(' ')[1]} mb-1`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
