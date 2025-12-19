/**
 * Admin Dashboard Constants
 */

import {
  Clock,
  Eye,
  Mail,
  Calendar,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const STATUS_CONFIG: Record
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  viewed: { label: 'Viewed', color: 'bg-blue-100 text-blue-800', icon: Eye },
  emailed: { label: 'Emailed', color: 'bg-purple-100 text-purple-800', icon: Mail },
  scheduled: { label: 'Scheduled', color: 'bg-indigo-100 text-indigo-800', icon: Calendar },
  inspected: { label: 'Inspected', color: 'bg-cyan-100 text-cyan-800', icon: Car },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
};

export const DATE_RANGE_OPTIONS = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: 'all', label: 'All Time' },
] as const;
