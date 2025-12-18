// VIN Solutions CRM Client
// Complete integration ready for API key configuration
// Documentation: https://developer.vinsolutions.com/

import {
  VinSolutionsConfig,
  VinSolutionsCredentials,
  VinSolutionsAuthToken,
  VinSolutionsApiResponse,
  VinSolutionsCustomer,
  VinSolutionsLead,
  VinSolutionsVehicle,
  VinSolutionsAppraisal,
  VinSolutionsActivity,
  VinSolutionsTask,
  VinSolutionsSearchResult,
  VinSolutionsUser,
  LeadStatus,
  AppraisalStatus,
} from './types';

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================
const DEFAULT_CONFIG: VinSolutionsConfig = {
  baseUrl: 'https://api.vinsolutions.com',
  apiVersion: 'v1',
  dealerId: process.env.VINSOLUTIONS_DEALER_ID || '',
  defaultSource: 'Website',
  defaultSourceDetail: 'Quirk Sell My Car',
  timeoutMs: 30000,
  retryAttempts: 3,
  webhookSecret: process.env.VINSOLUTIONS_WEBHOOK_SECRET,
};

// ============================================================
// VIN SOLUTIONS CLIENT CLASS
// ============================================================
export class VinSolutionsClient {
  private config: VinSolutionsConfig;
  private credentials: VinSolutionsCredentials;
  private authToken: VinSolutionsAuthToken | null = null;

  constructor(
    credentials?: Partial<VinSolutionsCredentials>,
    config?: Partial<VinSolutionsConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.credentials = {
      apiKey: credentials?.apiKey || process.env.VINSOLUTIONS_API_KEY || '',
      dealerId: credentials?.dealerId || this.config.dealerId,
      userId: credentials?.userId || process.env.VINSOLUTIONS_USER_ID,
    };
  }

  // ============================================================
  // AUTHENTICATION
  // ============================================================
  
  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!(this.credentials.apiKey && this.credentials.dealerId);
  }

  /**
   * Authenticate and get access token
   */
  async authenticate(): Promise<VinSolutionsAuthToken> {
    if (!this.isConfigured()) {
      throw new Error('VIN Solutions credentials not configured. Set VINSOLUTIONS_API_KEY and VINSOLUTIONS_DEALER_ID environment variables.');
    }

    // Check if we have a valid cached token
    if (this.authToken && this.authToken.expiresAt > new Date()) {
      return this.authToken;
    }

    const response = await this.makeRequest<{ accessToken: string; expiresIn: number }>(
      '/auth/token',
      {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.credentials.apiKey,
          dealerId: this.credentials.dealerId,
        }),
      },
      true // Skip auth for this request
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Authentication failed');
    }

    this.authToken = {
      accessToken: response.data.accessToken,
      expiresAt: new Date(Date.now() + response.data.expiresIn * 1000),
    };

    return this.authToken;
  }

  // ============================================================
  // CUSTOMER MANAGEMENT
  // ============================================================

  /**
   * Search for existing customers
   */
  async searchCustomers(params: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    page?: number;
    pageSize?: number;
  }): Promise<VinSolutionsSearchResult<VinSolutionsCustomer>> {
    const queryParams = new URLSearchParams();
    if (params.email) queryParams.set('email', params.email);
    if (params.phone) queryParams.set('phone', params.phone);
    if (params.firstName) queryParams.set('firstName', params.firstName);
    if (params.lastName) queryParams.set('lastName', params.lastName);
    queryParams.set('page', String(params.page || 1));
    queryParams.set('pageSize', String(params.pageSize || 20));

    const response = await this.makeRequest<VinSolutionsSearchResult<VinSolutionsCustomer>>(
      `/customers?${queryParams.toString()}`
    );

    return response.data || { results: [], totalCount: 0, page: 1, pageSize: 20 };
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<VinSolutionsCustomer | null> {
    const response = await this.makeRequest<VinSolutionsCustomer>(
      `/customers/${customerId}`
    );
    return response.data || null;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customer: VinSolutionsCustomer): Promise<VinSolutionsCustomer> {
    const response = await this.makeRequest<VinSolutionsCustomer>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify(customer),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create customer');
    }

    return response.data;
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(
    customerId: string,
    updates: Partial<VinSolutionsCustomer>
  ): Promise<VinSolutionsCustomer> {
    const response = await this.makeRequest<VinSolutionsCustomer>(
      `/customers/${customerId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update customer');
    }

    return response.data;
  }

  /**
   * Find or create customer (upsert pattern)
   */
  async findOrCreateCustomer(customer: VinSolutionsCustomer): Promise<VinSolutionsCustomer> {
    // Try to find by email first
    if (customer.email) {
      const existing = await this.searchCustomers({ email: customer.email });
      if (existing.results.length > 0) {
        return existing.results[0];
      }
    }

    // Try to find by phone
    if (customer.phone) {
      const existing = await this.searchCustomers({ phone: customer.phone });
      if (existing.results.length > 0) {
        return existing.results[0];
      }
    }

    // Create new customer
    return this.createCustomer(customer);
  }

  // ============================================================
  // LEAD MANAGEMENT
  // ============================================================

  /**
   * Create a new lead
   */
  async createLead(lead: Omit<VinSolutionsLead, 'id'>): Promise<VinSolutionsLead> {
    const leadData = {
      ...lead,
      source: lead.source || this.config.defaultSource,
      sourceDetail: lead.sourceDetail || this.config.defaultSourceDetail,
    };

    const response = await this.makeRequest<VinSolutionsLead>(
      '/leads',
      {
        method: 'POST',
        body: JSON.stringify(leadData),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create lead');
    }

    return response.data;
  }

  /**
   * Get lead by ID
   */
  async getLead(leadId: string): Promise<VinSolutionsLead | null> {
    const response = await this.makeRequest<VinSolutionsLead>(`/leads/${leadId}`);
    return response.data || null;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<VinSolutionsLead> {
    const response = await this.makeRequest<VinSolutionsLead>(
      `/leads/${leadId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update lead status');
    }

    return response.data;
  }

  /**
   * Assign lead to user
   */
  async assignLead(leadId: string, userId: string): Promise<VinSolutionsLead> {
    const response = await this.makeRequest<VinSolutionsLead>(
      `/leads/${leadId}/assign`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to assign lead');
    }

    return response.data;
  }

  /**
   * Search leads
   */
  async searchLeads(params: {
    status?: LeadStatus;
    type?: string;
    assignedUserId?: string;
    createdAfter?: string;
    createdBefore?: string;
    page?: number;
    pageSize?: number;
  }): Promise<VinSolutionsSearchResult<VinSolutionsLead>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.set(key, String(value));
    });

    const response = await this.makeRequest<VinSolutionsSearchResult<VinSolutionsLead>>(
      `/leads?${queryParams.toString()}`
    );

    return response.data || { results: [], totalCount: 0, page: 1, pageSize: 20 };
  }

  // ============================================================
  // APPRAISAL MANAGEMENT
  // ============================================================

  /**
   * Create vehicle appraisal
   */
  async createAppraisal(
    appraisal: Omit<VinSolutionsAppraisal, 'id'>
  ): Promise<VinSolutionsAppraisal> {
    const response = await this.makeRequest<VinSolutionsAppraisal>(
      '/appraisals',
      {
        method: 'POST',
        body: JSON.stringify(appraisal),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create appraisal');
    }

    return response.data;
  }

  /**
   * Get appraisal by ID
   */
  async getAppraisal(appraisalId: string): Promise<VinSolutionsAppraisal | null> {
    const response = await this.makeRequest<VinSolutionsAppraisal>(
      `/appraisals/${appraisalId}`
    );
    return response.data || null;
  }

  /**
   * Update appraisal status
   */
  async updateAppraisalStatus(
    appraisalId: string,
    status: AppraisalStatus,
    finalValue?: number
  ): Promise<VinSolutionsAppraisal> {
    const response = await this.makeRequest<VinSolutionsAppraisal>(
      `/appraisals/${appraisalId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, finalValue }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update appraisal');
    }

    return response.data;
  }

  // ============================================================
  // ACTIVITY LOGGING
  // ============================================================

  /**
   * Log an activity
   */
  async logActivity(activity: Omit<VinSolutionsActivity, 'id'>): Promise<VinSolutionsActivity> {
    const response = await this.makeRequest<VinSolutionsActivity>(
      '/activities',
      {
        method: 'POST',
        body: JSON.stringify(activity),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to log activity');
    }

    return response.data;
  }

  /**
   * Get activities for a lead
   */
  async getLeadActivities(leadId: string): Promise<VinSolutionsActivity[]> {
    const response = await this.makeRequest<{ activities: VinSolutionsActivity[] }>(
      `/leads/${leadId}/activities`
    );
    return response.data?.activities || [];
  }

  // ============================================================
  // TASK MANAGEMENT
  // ============================================================

  /**
   * Create a follow-up task
   */
  async createTask(task: Omit<VinSolutionsTask, 'id'>): Promise<VinSolutionsTask> {
    const response = await this.makeRequest<VinSolutionsTask>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify(task),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create task');
    }

    return response.data;
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, outcome?: string): Promise<VinSolutionsTask> {
    const response = await this.makeRequest<VinSolutionsTask>(
      `/tasks/${taskId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify({ outcome }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to complete task');
    }

    return response.data;
  }

  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  /**
   * Get available sales users for lead assignment
   */
  async getSalesUsers(): Promise<VinSolutionsUser[]> {
    const response = await this.makeRequest<{ users: VinSolutionsUser[] }>(
      '/users?role=sales'
    );
    return response.data?.users || [];
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<VinSolutionsUser | null> {
    const response = await this.makeRequest<VinSolutionsUser>(`/users/${userId}`);
    return response.data || null;
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<VinSolutionsApiResponse<T>> {
    // Ensure we're authenticated (unless this is the auth request itself)
    if (!skipAuth) {
      try {
        await this.authenticate();
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: error instanceof Error ? error.message : 'Authentication failed',
          },
        };
      }
    }

    const url = `${this.config.baseUrl}/${this.config.apiVersion}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Dealer-Id': this.credentials.dealerId,
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken && !skipAuth) {
      headers['Authorization'] = `Bearer ${this.authToken.accessToken}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || `HTTP_${response.status}`,
            message: data.message || `Request failed with status ${response.status}`,
            details: data.details,
          },
        };
      }

      return {
        success: true,
        data: data as T,
        metadata: data.metadata,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: `Request timed out after ${this.config.timeoutMs}ms`,
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================
let clientInstance: VinSolutionsClient | null = null;

export function getVinSolutionsClient(): VinSolutionsClient {
  if (!clientInstance) {
    clientInstance = new VinSolutionsClient();
  }
  return clientInstance;
}

// Export types for external use
export * from './types';
