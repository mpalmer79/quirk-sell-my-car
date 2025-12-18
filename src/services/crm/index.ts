// CRM Integration Module
// Export all CRM-related services and types

// VIN Solutions CRM Client
export {
  VinSolutionsClient,
  getVinSolutionsClient,
} from './vinSolutionsClient';

// Trade-In Workflow Service
export {
  TradeInService,
  getTradeInService,
  submitTradeInOffer,
  isCrmEnabled,
} from './tradeInService';

// Types
export type {
  // VIN Solutions types
  VinSolutionsConfig,
  VinSolutionsCredentials,
  VinSolutionsAuthToken,
  VinSolutionsCustomer,
  VinSolutionsLead,
  VinSolutionsVehicle,
  VinSolutionsAppraisal,
  VinSolutionsActivity,
  VinSolutionsTask,
  VinSolutionsUser,
  VinSolutionsApiResponse,
  VinSolutionsSearchResult,
  VinSolutionsWebhookPayload,
  AppraisalCondition,
  LeadStatus,
  AppraisalStatus,
  ActivityType,
  WebhookEvent,
} from './types';

// Trade-In types
export type {
  TradeInSubmission,
  TradeInResult,
} from './tradeInService';
