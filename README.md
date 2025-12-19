# Quirk Sell My Car

A vehicle appraisal and instant offer system for Quirk Auto Dealers. Built with Next.js 14, React 18, and Tailwind CSS.

## Features

- **VIN Decoding** - Instant vehicle lookup via NHTSA vPIC API (free, no key required)
- **Multi-Step Wizard** - Guided 3-step appraisal flow (Basics → Features → Condition)
- **Instant Offers** - Algorithm-based offer calculation with 7-day validity
- **AI Chat Assistant** - Anthropic Claude-powered support widget
- **Mobile Responsive** - Optimized for desktop, tablet, and mobile
- **Print/Share** - Export offers via print, email, or link

## Quick Start

### 1. Install Dependencies

``` bash
npm install


### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your API keys:

```env
ANTHROPIC_API_KEY=sk-ant-...
PEXELS_API_KEY=...              # Optional - for vehicle images
NEXT_PUBLIC_SITE_URL=http://localhost:3000


### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
quirk-sell-my-car/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env.example
├── .env.local              # Create from .env.example
└── src/
    ├── app/
    │   ├── page.tsx                # Homepage with VIN entry
    │   ├── layout.tsx              # Root layout
    │   ├── globals.css             # Tailwind + custom styles
    │   ├── api/
    │   │   ├── chat/route.ts       # AI chat endpoint
    │   │   └── decode-vin/route.ts # VIN decoding endpoint
    │   └── getoffer/
    │       ├── vehicle/page.tsx    # VIN results & trim selection
    │       ├── basics/page.tsx     # Step 1: Mileage, ZIP, specs
    │       ├── features/page.tsx   # Step 2: Optional equipment
    │       ├── condition/page.tsx  # Step 3: Condition assessment
    │       └── offer/page.tsx      # Final offer display
    ├── components/
    │   ├── Header.tsx              # Navigation header
    │   ├── ChatWidget.tsx          # AI assistant widget
    │   ├── StepNavigation.tsx      # Wizard progress sidebar
    │   └── VehicleImage.tsx        # Dynamic vehicle images
    ├── context/
    │   └── VehicleContext.tsx      # Global state management
    ├── services/
    │   ├── vinDecoder.ts           # NHTSA API integration
    │   └── vehicleImage.ts         # Stock image service
    └── types/
        └── vehicle.ts              # TypeScript interfaces
```

## Appraisal Flow

| Step | Page | Data Collected |
|------|------|----------------|
| Entry | `/` | VIN or Year/Make/Model |
| Vehicle | `/getoffer/vehicle` | Trim selection, verify specs |
| Basics | `/getoffer/basics` | Mileage, ZIP, color, transmission, drivetrain, engine, sell/trade intent, loan/lease status |
| Features | `/getoffer/features` | Optional equipment (navigation, leather, towing pkg, etc.) |
| Condition | `/getoffer/condition` | Accident history, mechanical issues, exterior/interior damage, overall condition rating |
| Offer | `/getoffer/offer` | Final offer, next steps, print/email/share |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables in Settings → Environment Variables
4. Deploy

### Netlify

1. Push to GitHub
2. Import in [Netlify Dashboard](https://app.netlify.com/start)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Site Settings → Environment Variables

## Configuration

### Branding

Update brand colors in `tailwind.config.js`:

```js
colors: {
  quirk: {
    red: '#C41230',    // Primary brand color
    // ...
  }
}
```

### Contact Info

Update phone/email in:
- `src/components/Header.tsx`
- `src/app/getoffer/offer/page.tsx`

## API Integrations

| Service | Purpose | Key Required |
|---------|---------|--------------|
| NHTSA vPIC | VIN decoding | No (free government API) |
| Anthropic | AI chat assistant | Yes |
| Pexels | Vehicle images | Optional |

## Test VIN

```
1GCGTDEN5L1124703
```
(2020 Chevrolet Colorado)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## License

Proprietary - Quirk Auto Dealers
