// VIN Solutions CRM Integration Types
// Documentation: https://developer.vinsolutions.com/

// ============================================================
// AUTHENTICATION
// ============================================================
export interface VinSolutionsCredentials {
  apiKey: string;
  dealerId: string;
  userId?: string;
}

export interface VinSolutionsAuthToken {
  accessToken: string;
  expiresAt: Date;
  refreshToken?: string;
}

// ============================================================
// CUSTOMER / LEAD TYPES
// ============================================================
export interface VinSolutionsCustomer {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  dateOfBirth?: string;
  driversLicense?: string;
  preferredContactMethod?: 'email' | 'phone' | 'text';
  doNotCall?: boolean;
  doNotEmail?: boolean;
  doNotText?: boolean;
}

export interface VinSolutionsLead {
  id?: string;
  customerId?: string;
  customer: VinSolutionsCustomer;
  source: string;
  sourceDetail?: string;
  type: 'trade-in' | 'sell' | 'purchase' | 'service';
  status?: LeadStatus;
  assignedUserId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'appointment_set'
  | 'appointment_shown'
  | 'sold'
  | 'lost'
  | 'duplicate';

// ============================================================
// VEHICLE / APPRAISAL TYPES
// ============================================================
export interface VinSolutionsVehicle {
  id?: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  exteriorColor?: string;
  interiorColor?: string;
  mileage: number;
  transmission?: string;
  driveType?: string;
  engine?: string;
  fuelType?: string;
  stockNumber?: string;
}

export interface VinSolutionsAppraisal {
  id?: string;
  leadId: string;
  customerId: string;
  vehicle: VinSolutionsVehicle;
  condition: AppraisalCondition;
  estimatedValue: number;
  finalValue?: number;
  appraisalDate: string;
  expirationDate: string;
  status: AppraisalStatus;
  notes?: string;
  photos?: string[];
  appraiserId?: string;
}

export interface AppraisalCondition {
  overallGrade: 'excellent' | 'good' | 'fair' | 'poor';
  mechanicalCondition?: string;
  bodyCondition?: string;
  interiorCondition?: string;
  tiresCondition?: string;
  accidentHistory?: 'none' | 'minor' | 'major';
  titleStatus?: 'clean' | 'salvage' | 'rebuilt' | 'lemon';
  hasOpenRecalls?: boolean;
  smokerVehicle?: boolean;
  modifications?: string[];
  damageNotes?: string;
}

export type AppraisalStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'accepted'
  | 'declined';

// ============================================================
// ACTIVITY / TASK TYPES
// ============================================================
export interface VinSolutionsActivity {
  id?: string;
  leadId: string;
  customerId: string;
  type: ActivityType;
  subject: string;
  description?: string;
  userId?: string;
  scheduledAt?: string;
  completedAt?: string;
  outcome?: string;
  createdAt?: string;
}

export type ActivityType = 
  | 'call'
  | 'email'
  | 'text'
  | 'appointment'
  | 'note'
  | 'task'
  | 'website_visit'
  | 'form_submission';

export interface VinSolutionsTask {
  id?: string;
  leadId?: string;
  customerId?: string;
  assignedUserId: string;
  subject: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface VinSolutionsApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    page?: number;
    pageSize?: number;
    totalRecords?: number;
    totalPages?: number;
  };
}

export interface VinSolutionsSearchResult<T> {
  results: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ============================================================
// WEBHOOK TYPES
// ============================================================
export interface VinSolutionsWebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  dealerId: string;
  data: Record<string, unknown>;
  signature?: string;
}

export type WebhookEvent = 
  | 'lead.created'
  | 'lead.updated'
  | 'lead.assigned'
  | 'customer.created'
  | 'customer.updated'
  | 'appraisal.created'
  | 'appraisal.completed'
  | 'appointment.scheduled'
  | 'appointment.completed';

// ============================================================
// CONFIGURATION TYPES
// ============================================================
export interface VinSolutionsConfig {
  baseUrl: string;
  apiVersion: string;
  dealerId: string;
  defaultSource: string;
  defaultSourceDetail: string;
  timeoutMs: number;
  retryAttempts: number;
  webhookSecret?: string;
}

export interface VinSolutionsUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string;
  isActive: boolean;
}
