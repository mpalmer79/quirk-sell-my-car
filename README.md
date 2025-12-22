# Quirk Sell My Car

[![CI/CD](https://github.com/mpalmer79/quirk-sell-my-car/actions/workflows/test.yml/badge.svg)](https://github.com/mpalmer79/quirk-sell-my-car/actions)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

A production-grade vehicle appraisal and instant offer platform for Quirk Auto Dealers. Features AI-powered customer support, real-time VIN decoding, persistent offer history, and enterprise CRM integration.

https://quirk-sell-my-car.vercel.app/

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Features

### Core Functionality
- **Instant Vehicle Appraisal** — Multi-step wizard collecting vehicle specs, features, and condition
- **Real-Time VIN Decoding** — NHTSA vPIC API integration for accurate vehicle identification
- **Algorithm-Based Offers** — Dynamic valuation with 7-day validity period
- **Offer Persistence** — Full audit trail with Supabase PostgreSQL backend

### AI-Powered Support
- **Anthropic Claude Integration** — Intelligent chat assistant for customer inquiries
- **Context-Aware Responses** — Custom system prompts tailored for automotive sales
- **Graceful Fallbacks** — Keyword-based responses when AI is unavailable

### Enterprise Features
- **VIN Solutions CRM** — Complete lead management and appraisal sync
- **Admin Dashboard** — Offer management with analytics and status tracking
- **2FA Authentication** — TOTP-based two-factor authentication for admin access
- **Comprehensive Security** — Rate limiting, bot protection, input validation, XSS prevention

### User Experience
- **Mobile-First Design** — Fully responsive across all devices
- **Progressive Flow** — Guided appraisal with real-time progress tracking
- **Dynamic Vehicle Images** — Make/model-matched imagery via Pexels API

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Homepage   │  │  Appraisal  │  │    Offer    │  │    Admin    │ │
│  │  VIN Entry  │  │   Wizard    │  │   Display   │  │  Dashboard  │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │
┌─────────┴────────────────┴────────────────┴────────────────┴────────┐
│                           API LAYER (Next.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ /decode-vin │  │   /chat     │  │   /offers   │  │   /admin    │ │
│  │   NHTSA     │  │  Anthropic  │  │  Supabase   │  │    Auth     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │
┌─────────┴────────────────┴────────────────┴────────────────┴────────┐
│                        EXTERNAL SERVICES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   NHTSA     │  │  Anthropic  │  │  Supabase   │  │VIN Solutions│ │
│  │  vPIC API   │  │  Claude API │  │  PostgreSQL │  │     CRM     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Anthropic Claude (claude-sonnet-4-20250514) |
| **Validation** | Zod |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Testing** | Jest + React Testing Library |
| **CI/CD** | GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase account (for offer persistence)
- Anthropic API key (for AI chat)

### Installation

```bash
# Clone the repository
git clone https://github.com/mpalmer79/quirk-sell-my-car.git
cd quirk-sell-my-car

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## Environment Configuration

Create `.env.local` from `.env.example`:

```env
# ═══════════════════════════════════════════════════════════════════
# SUPABASE DATABASE
# ═══════════════════════════════════════════════════════════════════
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ═══════════════════════════════════════════════════════════════════
# ANTHROPIC AI CHAT
# ═══════════════════════════════════════════════════════════════════
ANTHROPIC_API_KEY=sk-ant-api03-...

# ═══════════════════════════════════════════════════════════════════
# VIN SOLUTIONS CRM (Optional)
# ═══════════════════════════════════════════════════════════════════
VINSOLUTIONS_API_KEY=your_api_key
VINSOLUTIONS_DEALER_ID=your_dealer_id
VINSOLUTIONS_WEBHOOK_SECRET=webhook_secret

# ═══════════════════════════════════════════════════════════════════
# VEHICLE IMAGES (Optional)
# ═══════════════════════════════════════════════════════════════════
PEXELS_API_KEY=your_pexels_key

# ═══════════════════════════════════════════════════════════════════
# SECURITY
# ═══════════════════════════════════════════════════════════════════
FORM_TOKEN_SECRET=your_32_char_minimum_secret
```

---

## Database Schema

### Supabase PostgreSQL Setup

Execute the following SQL in Supabase SQL Editor:

```sql
-- ═══════════════════════════════════════════════════════════════════
-- ENABLE EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════
-- OFFERS TABLE
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Vehicle Information (from NHTSA VIN Decode)
  vin VARCHAR(17) NOT NULL,
  year INTEGER NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  trim VARCHAR(100),
  body_class VARCHAR(100),
  drive_type VARCHAR(50),
  engine_cylinders VARCHAR(10),
  engine_displacement VARCHAR(20),
  fuel_type VARCHAR(50),
  transmission_style VARCHAR(50),
  
  -- Vehicle Basics
  mileage INTEGER NOT NULL,
  zip_code VARCHAR(10),
  color VARCHAR(50),
  sell_or_trade VARCHAR(20) CHECK (sell_or_trade IN ('sell', 'trade', 'not-sure')),
  loan_or_lease VARCHAR(20) CHECK (loan_or_lease IN ('loan', 'lease', 'neither')),
  
  -- Condition Assessment
  overall_condition VARCHAR(50),
  accident_history VARCHAR(20),
  drivability VARCHAR(20),
  mechanical_issues TEXT[],
  engine_issues TEXT[],
  exterior_damage TEXT[],
  interior_damage TEXT[],
  
  -- Offer Details
  estimated_value INTEGER NOT NULL,
  offer_amount INTEGER NOT NULL,
  offer_expiry TIMESTAMPTZ NOT NULL,
  is_preliminary BOOLEAN DEFAULT TRUE,
  
  -- Customer Contact
  customer_email VARCHAR(254),
  customer_phone VARCHAR(20),
  customer_name VARCHAR(100),
  
  -- Status Tracking
  status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'viewed', 'emailed', 'scheduled', 
                      'inspected', 'accepted', 'rejected', 'expired', 'completed')),
  status_notes TEXT,
  
  -- CRM Integration
  crm_lead_id VARCHAR(100),
  crm_synced_at TIMESTAMPTZ,
  
  -- Audit Metadata
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  session_id UUID,
  source VARCHAR(50) DEFAULT 'website'
);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES FOR QUERY OPTIMIZATION
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX idx_offers_vin ON offers(vin);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_created_at ON offers(created_at DESC);
CREATE INDEX idx_offers_customer_email ON offers(customer_email);
CREATE INDEX idx_offers_offer_amount ON offers(offer_amount);
CREATE INDEX idx_offers_make_model ON offers(make, model);

-- ═══════════════════════════════════════════════════════════════════
-- AUTOMATIC UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Service role: Full CRUD access
CREATE POLICY "Service role full access" ON offers
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Anonymous: Insert only (for creating new offers)
CREATE POLICY "Anonymous can create offers" ON offers
  FOR INSERT TO anon
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════
-- ANALYTICS VIEW
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW offer_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS total_offers,
  SUM(offer_amount) AS total_value,
  AVG(offer_amount)::INTEGER AS avg_offer,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'accepted') AS accepted,
  COUNT(*) FILTER (WHERE status = 'expired') AS expired
FROM offers
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

---

## API Reference

### NHTSA VIN Decoder

**Endpoint:** `GET /api/decode-vin?vin={VIN}`

Decodes a 17-character VIN using the NHTSA vPIC API (free, no key required).

```typescript
// Request
GET /api/decode-vin?vin=1HGBH41JXMN109186

// Response
{
  "vin": "1HGBH41JXMN109186",
  "year": 2021,
  "make": "Honda",
  "model": "Accord",
  "trim": "Sport",
  "bodyClass": "Sedan",
  "driveType": "Front Wheel Drive",
  "engineCylinders": "4",
  "displacement": "1.5",
  "fuelType": "Gasoline",
  "transmissionStyle": "CVT"
}
```

### Anthropic Chat

**Endpoint:** `POST /api/chat`

AI-powered customer support using Claude claude-sonnet-4-20250514.

```typescript
// Request
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "How long is my offer valid?" }
  ]
}

// Response
{
  "content": "Online estimates are typically provided for reference purposes..."
}
```

**Features:**
- Rate limiting (10 requests/minute per IP)
- Bot detection and blocking
- Input sanitization and validation
- Graceful fallback responses when API unavailable

### Offers API

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/offers` | Create new offer |
| `GET` | `/api/offers` | List offers (paginated) |
| `GET` | `/api/offers/[id]` | Get offer by ID |
| `PATCH` | `/api/offers/[id]` | Update offer status |
| `GET` | `/api/offers/analytics` | Get offer analytics |

---

## Security

### Security Features

| Feature | Implementation |
|---------|----------------|
| **Rate Limiting** | Per-endpoint limits with exponential backoff |
| **Bot Protection** | User-agent analysis, honeypot fields, behavior detection |
| **Input Validation** | Zod schemas for all API inputs |
| **XSS Prevention** | HTML escaping, content sanitization |
| **SQL Injection** | Parameterized queries via Supabase client |
| **CSRF Protection** | Form tokens with HMAC validation |
| **Audit Logging** | Structured logs for security events |

### Authentication

Admin dashboard supports:
- Email/password authentication
- TOTP-based 2FA (Google Authenticator compatible)
- Backup codes
- Session management
- Account lockout after failed attempts

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# CI mode
npm run test:ci
```

### Test Coverage

| Category | Files |
|----------|-------|
| **API Routes** | `chat.test.ts`, `decode-vin.test.ts` |
| **Components** | `ChatWidget.test.tsx`, `Header.test.tsx`, `VehicleImage.test.tsx` |
| **Pages** | `HomePage.test.tsx`, `VehiclePage.test.tsx` |
| **Security** | `rateLimit.test.ts`, `botProtection.test.ts`, `validation.test.ts` |
| **Services** | `vinDecoder.test.ts`, `vehicleImage.test.ts` |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Settings → Environment Variables
4. Deploy

### Environment Variables for Production

Ensure all required variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `FORM_TOKEN_SECRET`

---

## Project Structure

```
quirk-sell-my-car/
├── .github/workflows/
│   └── test.yml                    # CI/CD pipeline
├── public/
│   └── *.jpg, *.svg                # Static assets
├── src/
│   ├── app/
│   │   ├── page.tsx                # Homepage
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   ├── admin/
│   │   │   ├── login/              # Admin authentication
│   │   │   ├── offers/             # Offer management dashboard
│   │   │   └── settings/2fa/       # 2FA setup
│   │   ├── api/
│   │   │   ├── chat/               # Anthropic AI chat
│   │   │   ├── decode-vin/         # NHTSA VIN decoder
│   │   │   ├── offers/             # Offer CRUD + analytics
│   │   │   ├── submit-offer/       # Lead submission
│   │   │   ├── vehicle-image/      # Dynamic images
│   │   │   ├── health/             # Health check endpoint
│   │   │   ├── admin/auth/         # Admin authentication APIs
│   │   │   └── webhooks/           # CRM webhooks
│   │   └── getoffer/
│   │       ├── vehicle/            # VIN results
│   │       ├── basics/             # Step 1: Vehicle basics
│   │       ├── features/           # Step 2: Features
│   │       ├── condition/          # Step 3: Condition
│   │       └── offer/              # Final offer display
│   ├── components/
│   │   ├── ChatWidget.tsx          # AI chat assistant
│   │   ├── Header.tsx              # Navigation
│   │   ├── StepNavigation.tsx      # Wizard sidebar
│   │   └── VehicleImage.tsx        # Dynamic images
│   ├── context/
│   │   └── VehicleContext.tsx      # Global state
│   ├── hooks/
│   │   └── useFormSecurity.tsx     # Security hooks
│   ├── lib/
│   │   ├── admin-auth.ts           # Auth utilities
│   │   ├── database/
│   │   │   ├── index.ts            # DB exports
│   │   │   ├── offerService.ts     # Supabase operations
│   │   │   └── types.ts            # Database types
│   │   └── security/
│   │       ├── auditLog.ts         # Security logging
│   │       ├── botProtection.ts    # Bot detection
│   │       ├── env.ts              # Environment utils
│   │       ├── rateLimit.ts        # Rate limiting
│   │       ├── sanitize.ts         # Input sanitization
│   │       └── validation.ts       # Zod schemas
│   ├── services/
│   │   ├── vinDecoder.ts           # NHTSA integration
│   │   ├── vehicleImage.ts         # Image service
│   │   └── crm/
│   │       ├── index.ts            # CRM exports
│   │       ├── types.ts            # CRM types
│   │       ├── tradeInService.ts   # Lead management
│   │       └── vinSolutionsClient.ts # VIN Solutions API
│   ├── types/
│   │   ├── vehicle.ts              # Vehicle types
│   │   └── admin.ts                # Admin types
│   ├── middleware.ts               # Auth middleware
│   └── __tests__/                  # Test suites
├── .env.example                    # Environment template
├── jest.config.js                  # Jest configuration
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies
```

---

## Test VINs

| VIN | Vehicle |
|-----|---------|
| `1GCGTDEN5L1124703` | 2020 Chevrolet Colorado |
| `1HGBH41JXMN109186` | 2021 Honda Accord |
| `5UXCR6C55KLL13697` | 2019 BMW X5 |

---

## Contributing

1. Create a feature branch from `main`
2. Make changes with test coverage
3. Ensure all tests pass: `npm test`
4. Submit PR with description of changes

---

## License

Proprietary — Quirk Auto Dealers © 2025, 2026

---

