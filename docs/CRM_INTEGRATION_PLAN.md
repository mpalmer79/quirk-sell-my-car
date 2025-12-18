# Quirk Sell My Car - CRM Integration Plan

## Overview

This document outlines how the Quirk Sell My Car web application integrates with VIN Solutions CRM and connects to dealership operations.

---

## Architecture

```
┌─────────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Customer Browser   │──────│  Quirk App       │──────│  VIN Solutions  │
│  (quirk-sell-my-car)│      │  (Next.js/Vercel)│      │  CRM API        │
└─────────────────────┘      └──────────────────┘      └─────────────────┘
                                      │                         │
                                      │                         ▼
                                      │               ┌─────────────────┐
                                      │               │  Sales Manager  │
                                      │               │  Dashboard      │
                                      │               └─────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Webhooks        │
                             │  (Real-time)     │
                             └──────────────────┘
```

---

## Data Flow

### 1. Customer Submits Online Appraisal
1. Customer enters VIN → NHTSA decode → vehicle details displayed
2. Customer answers condition/feature questions
3. App calculates **preliminary estimate** (disclaimer: subject to inspection)
4. Customer provides contact info and submits

### 2. CRM Lead Creation (Automatic)
When customer submits, the app:
- Creates/updates **Customer** record in VIN Solutions
- Creates **Lead** with type `trade-in` or `sell`
- Creates **Appraisal** record with online estimate
- Logs **Activity** (form submission)
- Creates **Task** for sales team follow-up (2-hour SLA)

### 3. Sales Team Workflow
- Lead appears in VIN Solutions queue
- Sales rep receives notification/task
- Rep calls customer to schedule in-person appraisal
- Updates lead status: `contacted` → `appointment_set`

### 4. In-Person Appraisal
- Customer brings vehicle to dealership
- Appraiser inspects vehicle
- Updates appraisal with **final offer** via CRM
- Webhook notifies app (optional: email customer)

### 5. Deal Completion
- Customer accepts offer
- CRM tracks through to `sold` status
- Title/payoff workflow handled in CRM

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/submit-offer` | Submit trade-in to CRM |
| `POST /api/webhooks/vinsolutions` | Receive CRM updates |
| `GET /api/decode-vin` | Decode VIN via NHTSA |
| `POST /api/chat` | AI assistant (rate-limited) |

---

## Environment Variables Required

### Vercel Setup

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add each variable below
3. Set Environment to **Production** (and Preview/Development for testing)
4. Click **Save**

| Variable | Source | Required |
|----------|--------|----------|
| `VINSOLUTIONS_API_KEY` | VIN Solutions account manager | Yes |
| `VINSOLUTIONS_DEALER_ID` | VIN Solutions account manager | Yes |
| `VINSOLUTIONS_WEBHOOK_SECRET` | Generate a random string (e.g., `openssl rand -hex 32`) | Yes |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) | Optional (AI chat) |
| `PEXELS_API_KEY` | [Pexels API](https://www.pexels.com/api/) | Optional (vehicle images) |

### Graceful Fallback

The app works without CRM credentials configured:
- **With credentials:** Full VIN Solutions integration (leads, appraisals, tasks)
- **Without credentials:** App generates local confirmation numbers, logs warning

This means you can deploy now and add credentials later.

---

## Integration Checklist

- [x] VIN Solutions client library built
- [x] Lead creation workflow
- [x] Appraisal record creation
- [x] Activity logging
- [x] Task creation for follow-up
- [x] Webhook handler for CRM events
- [x] Rate limiting on submissions
- [x] Error handling & fallbacks
- [ ] **Pending: API keys from VIN Solutions**
- [ ] Pending: Webhook URL registration in CRM
- [ ] Pending: Lead routing rules in CRM
- [ ] Pending: Production testing

---

## Future Enhancements

1. **Real Valuation Data** - Integrate Black Book/KBB/Manheim APIs for market-based estimates
2. **Appointment Scheduling** - Allow customers to book inspection slot online
3. **Photo Upload** - Customer uploads vehicle photos before visit
4. **Payoff Integration** - Connect to lenders for automatic payoff quotes
5. **E-Signature** - Digital document signing for title transfer

---

## Contact

**Implementation Questions:** VIN Solutions Account Manager  
**Technical Issues:** steve.obrien@quirkcars.com  
**Phone:** (603) 263-4552
