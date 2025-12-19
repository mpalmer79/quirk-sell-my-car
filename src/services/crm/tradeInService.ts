// Trade-In Workflow Service
// Orchestrates the complete sell/trade-in process with VIN Solutions CRM
// This is the main integration point between the Quirk app and CRM

import {
  VinSolutionsClient,
  getVinSolutionsClient,
  VinSolutionsCustomer,
  VinSolutionsLead,
  VinSolutionsAppraisal,
  VinSolutionsVehicle,
  AppraisalCondition,
} from './vinSolutionsClient';

import { VehicleInfo, VehicleBasics, VehicleFeatures, VehicleCondition, OfferData } from '@/types/vehicle';

// ============================================================
// TYPES
// ============================================================
export interface TradeInSubmission {
  // Customer info (from contact form)
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    zipCode?: string;
    preferredContact?: 'email' | 'phone' | 'text';
  };
  // Vehicle info (from VIN decode + user input)
  vehicle: VehicleInfo;
  basics: VehicleBasics;
  features: VehicleFeatures;
  condition: VehicleCondition;
  // Offer data (calculated estimate)
  offer: OfferData;
  // Additional context
  source?: string;
  notes?: string;
  consentToContact?: boolean;
}

export interface TradeInResult {
  success: boolean;
  leadId?: string;
  appraisalId?: string;
  customerId?: string;
  confirmationNumber?: string;
  error?: string;
}

// ============================================================
// TRADE-IN WORKFLOW SERVICE
// ============================================================
export class TradeInService {
  private client: VinSolutionsClient;

  constructor(client?: VinSolutionsClient) {
    this.client = client || getVinSolutionsClient();
  }

  /**
   * Check if CRM integration is available
   */
  isIntegrationEnabled(): boolean {
    return this.client.isConfigured();
  }

  /**
   * Submit a complete trade-in/sell request to CRM
   * This is the main entry point for creating a lead from the web app
   */
  async submitTradeIn(submission: TradeInSubmission): Promise<TradeInResult> {
    // If CRM not configured, return success with local confirmation
    if (!this.isIntegrationEnabled()) {
      console.warn('VIN Solutions integration not configured. Lead stored locally only.');
      return {
        success: true,
        confirmationNumber: this.generateLocalConfirmation(),
      };
    }

    try {
      // Step 1: Find or create customer
      const customer = await this.client.findOrCreateCustomer({
        firstName: submission.customer.firstName,
        lastName: submission.customer.lastName,
        email: submission.customer.email,
        phone: submission.customer.phone,
        address: submission.customer.zipCode ? {
          zipCode: submission.customer.zipCode,
        } : undefined,
        preferredContactMethod: submission.customer.preferredContact,
        doNotCall: !submission.consentToContact,
        doNotEmail: !submission.consentToContact,
        doNotText: !submission.consentToContact,
      });

      if (!customer.id) {
        throw new Error('Failed to create customer record');
      }

      // Step 2: Create lead
      const leadType = submission.basics.sellOrTrade === 'trade' ? 'trade-in' : 'sell';
      const lead = await this.client.createLead({
        customerId: customer.id,
        customer: customer,
        source: submission.source || 'Website',
        sourceDetail: 'Quirk Sell My Car - Online Appraisal',
        type: leadType,
        status: 'new',
        notes: this.buildLeadNotes(submission),
      });

      if (!lead.id) {
        throw new Error('Failed to create lead record');
      }

      // Step 3: Create appraisal record
      const appraisal = await this.createAppraisalFromSubmission(
        lead.id,
        customer.id!,
        submission
      );

      // Step 4: Log initial activity
      await this.client.logActivity({
        leadId: lead.id,
        customerId: customer.id,
        type: 'form_submission',
        subject: 'Online Trade-In Appraisal Submitted',
        description: `Customer submitted online appraisal for ${submission.vehicle.year} ${submission.vehicle.make} ${submission.vehicle.model}. ` +
          `Preliminary estimate: $${submission.offer.offerAmount.toLocaleString()}`,
      });

      // Step 5: Create follow-up task
      await this.createFollowUpTask(lead.id, customer.id!, submission);

      return {
        success: true,
        leadId: lead.id,
        appraisalId: appraisal.id,
        customerId: customer.id,
        confirmationNumber: this.generateConfirmationNumber(lead.id),
      };

    } catch (error) {
      console.error('Trade-in submission error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit trade-in request',
      };
    }
  }

  /**
   * Get appraisal status for customer follow-up
   */
  async getAppraisalStatus(appraisalId: string): Promise<{
    status: string;
    estimatedValue: number;
    finalValue?: number;
    expirationDate: string;
  } | null> {
    if (!this.isIntegrationEnabled()) {
      return null;
    }

    const appraisal = await this.client.getAppraisal(appraisalId);
    
    if (!appraisal) {
      return null;
    }

    return {
      status: appraisal.status,
      estimatedValue: appraisal.estimatedValue,
      finalValue: appraisal.finalValue,
      expirationDate: appraisal.expirationDate,
    };
  }

  /**
   * Update appraisal after in-person inspection
   */
  async completeInspection(
    appraisalId: string,
    finalValue: number,
    notes?: string
  ): Promise<boolean> {
    if (!this.isIntegrationEnabled()) {
      return false;
    }

    try {
      await this.client.updateAppraisalStatus(appraisalId, 'completed', finalValue);
      return true;
    } catch (error) {
      console.error('Failed to complete inspection:', error);
      return false;
    }
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  private async createAppraisalFromSubmission(
    leadId: string,
    customerId: string,
    submission: TradeInSubmission
  ): Promise<VinSolutionsAppraisal> {
    const vehicle: VinSolutionsVehicle = {
      vin: submission.vehicle.vin,
      year: submission.vehicle.year,
      make: submission.vehicle.make,
      model: submission.vehicle.model,
      trim: submission.vehicle.trim,
      bodyStyle: submission.vehicle.bodyClass,
      exteriorColor: submission.basics.color,
      mileage: submission.basics.mileage ?? 0,
      transmission: submission.basics.transmission,
      driveType: submission.basics.drivetrain,
      engine: submission.basics.engine,
      fuelType: submission.vehicle.fuelType,
    };

    const condition: AppraisalCondition = {
      overallGrade: this.mapConditionGrade(submission.condition.overallCondition),
      accidentHistory: this.mapAccidentHistory(submission.condition.accidentHistory),
      smokerVehicle: submission.condition.smokedIn,
      modifications: submission.condition.modifications ? ['Has modifications'] : [],
      damageNotes: this.buildConditionNotes(submission.condition),
    };

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    return this.client.createAppraisal({
      leadId,
      customerId,
      vehicle,
      condition,
      estimatedValue: submission.offer.offerAmount,
      appraisalDate: new Date().toISOString(),
      expirationDate: expirationDate.toISOString(),
      status: 'pending',
      notes: `Online estimate. Subject to in-person inspection.\n\nFeatures: ${this.buildFeaturesList(submission.features)}`,
    });
  }

  private async createFollowUpTask(
    leadId: string,
    customerId: string,
    submission: TradeInSubmission
  ): Promise<void> {
    // Calculate due date based on customer preference
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 2); // Follow up within 2 hours

    await this.client.createTask({
      leadId,
      customerId,
      assignedUserId: '', // Will be assigned by CRM auto-routing or manually
      subject: `Follow up: Online Trade-In - ${submission.vehicle.year} ${submission.vehicle.make} ${submission.vehicle.model}`,
      description: `Customer ${submission.customer.firstName} ${submission.customer.lastName} submitted an online trade-in appraisal.\n\n` +
        `Contact: ${submission.customer.phone} / ${submission.customer.email}\n` +
        `Preferred contact: ${submission.customer.preferredContact || 'Not specified'}\n` +
        `Preliminary estimate: $${submission.offer.offerAmount.toLocaleString()}\n\n` +
        `Action: Call to schedule in-person appraisal appointment.`,
      priority: 'high',
      dueDate: dueDate.toISOString(),
      status: 'pending',
    });
  }

  private buildLeadNotes(submission: TradeInSubmission): string {
    const lines = [
      `=== Online Trade-In Submission ===`,
      ``,
      `Vehicle: ${submission.vehicle.year} ${submission.vehicle.make} ${submission.vehicle.model} ${submission.vehicle.trim || ''}`,
      `VIN: ${submission.vehicle.vin}`,
      `Mileage: ${submission.basics.mileage?.toLocaleString()} miles`,
      `Color: ${submission.basics.color || 'Not specified'}`,
      ``,
      `Intent: ${submission.basics.sellOrTrade === 'trade' ? 'Trade-in toward new vehicle' : 'Sell outright'}`,
      `Loan Status: ${submission.basics.loanOrLease || 'Not specified'}`,
      ``,
      `Overall Condition: ${submission.condition.overallCondition || 'Not specified'}`,
      `Accident History: ${submission.condition.accidentHistory || 'Not specified'}`,
      `Drivable: ${submission.condition.drivability || 'Not specified'}`,
      ``,
      `Preliminary Estimate: $${submission.offer.offerAmount.toLocaleString()}`,
      `Estimate Valid Until: ${new Date(submission.offer.offerExpiry).toLocaleDateString()}`,
      ``,
      `*** This is a preliminary online estimate. Final offer subject to in-person inspection. ***`,
    ];

    if (submission.notes) {
      lines.push(``, `Customer Notes: ${submission.notes}`);
    }

    return lines.join('\n');
  }

  private buildConditionNotes(condition: VehicleCondition): string {
    const notes: string[] = [];

    if (condition.mechanicalIssues?.length && !condition.mechanicalIssues.includes('none')) {
      notes.push(`Mechanical Issues: ${condition.mechanicalIssues.join(', ')}`);
    }
    if (condition.engineIssues?.length && !condition.engineIssues.includes('none')) {
      notes.push(`Engine Issues: ${condition.engineIssues.join(', ')}`);
    }
    if (condition.exteriorDamage?.length && !condition.exteriorDamage.includes('none')) {
      notes.push(`Exterior Damage: ${condition.exteriorDamage.join(', ')}`);
    }
    if (condition.interiorDamage?.length && !condition.interiorDamage.includes('none')) {
      notes.push(`Interior Damage: ${condition.interiorDamage.join(', ')}`);
    }
    if (condition.windshieldDamage && condition.windshieldDamage !== 'none') {
      notes.push(`Windshield: ${condition.windshieldDamage}`);
    }

    return notes.join('\n') || 'No significant issues reported';
  }

  private buildFeaturesList(features: VehicleFeatures): string {
    const allFeatures = Object.values(features)
      .flat()
      .filter(f => f && f !== 'none');
    
    return allFeatures.length > 0 ? allFeatures.join(', ') : 'None specified';
  }

  private mapConditionGrade(condition?: string): 'excellent' | 'good' | 'fair' | 'poor' {
    const mapping: Record<string, 'excellent' | 'good' | 'fair' | 'poor'> = {
      'like-new': 'excellent',
      'pretty-great': 'good',
      'just-okay': 'fair',
      'kind-of-rough': 'poor',
      'major-issues': 'poor',
    };
    return mapping[condition || ''] || 'fair';
  }

  private mapAccidentHistory(history?: string): 'none' | 'minor' | 'major' {
    if (history === 'none') return 'none';
    if (history === '1') return 'minor';
    if (history === '2+') return 'major';
    return 'none';
  }

  private generateConfirmationNumber(leadId: string): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const shortId = leadId.slice(-6).toUpperCase();
    return `QRK-${dateStr}-${shortId}`;
  }

  private generateLocalConfirmation(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QRK-${dateStr}-${random}`;
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================
let serviceInstance: TradeInService | null = null;

export function getTradeInService(): TradeInService {
  if (!serviceInstance) {
    serviceInstance = new TradeInService();
  }
  return serviceInstance;
}

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

/**
 * Quick submit for trade-in from offer page
 */
export async function submitTradeInOffer(
  submission: TradeInSubmission
): Promise<TradeInResult> {
  const service = getTradeInService();
  return service.submitTradeIn(submission);
}

/**
 * Check if CRM integration is available
 */
export function isCrmEnabled(): boolean {
  const service = getTradeInService();
  return service.isIntegrationEnabled();
}
