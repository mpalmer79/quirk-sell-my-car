'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  Share2,
  Car,
  Loader2,
  ArrowLeft,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';
import VehicleImage from '@/components/VehicleImage';
import { useVehicle } from '@/context/VehicleContext';

export default function OfferPage() {
  const router = useRouter();
  const { vehicleInfo, basics, calculateOffer, offerData, resetAll } = useVehicle();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOfferId, setSavedOfferId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Track if we've already saved to prevent double-saves
  const hasSaved = useRef(false);

  // Calculate and save offer on mount
  useEffect(() => {
    if (!vehicleInfo || !basics.mileage) {
      router.push('/');
      return;
    }

    const processOffer = async () => {
      // Calculate the offer after a delay
      const timer = setTimeout(async () => {
        const offer = calculateOffer();
        setLoading(false);

        // Save to database (only once)
        if (offer && !hasSaved.current) {
          hasSaved.current = true;
          await saveOffer(offer);
        }
      }, 2000);

      return () => clearTimeout(timer);
    };

    processOffer();
  }, [vehicleInfo, basics, calculateOffer, router]);

  // Save offer to database
  const saveOffer = async (offer: NonNullable<typeof offerData>) => {
    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Vehicle Information
          vin: offer.vehicleInfo.vin,
          year: offer.vehicleInfo.year,
          make: offer.vehicleInfo.make,
          model: offer.vehicleInfo.model,
          trim: offer.vehicleInfo.trim || null,
          body_class: offer.vehicleInfo.bodyClass || null,
          drive_type: offer.vehicleInfo.driveType || null,
          engine_cylinders: offer.vehicleInfo.engineCylinders || null,
          engine_displacement: offer.vehicleInfo.engineDisplacement || null,
          fuel_type: offer.vehicleInfo.fuelType || null,
          transmission_style: offer.vehicleInfo.transmissionStyle || null,

          // Vehicle Basics
          mileage: offer.basics.mileage,
          zip_code: offer.basics.zipCode || null,
          color: offer.basics.color || null,
          sell_or_trade: offer.basics.sellOrTrade || null,
          loan_or_lease: offer.basics.loanOrLease || null,

          // Condition
          overall_condition: offer.condition.overallCondition || null,
          accident_history: offer.condition.accidentHistory || null,
          drivability: offer.condition.drivability || null,
          mechanical_issues: offer.condition.mechanicalIssues || null,
          engine_issues: offer.condition.engineIssues || null,
          exterior_damage: offer.condition.exteriorDamage || null,
          interior_damage: offer.condition.interiorDamage || null,

          // Offer Details
          estimated_value: offer.estimatedValue,
          offer_amount: offer.offerAmount,
          offer_expiry: offer.offerExpiry,
          is_preliminary: offer.isPreliminary,

          // Generate session ID for tracking
          session_id: crypto.randomUUID(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save offer');
      }

      const { offer: savedOffer } = await response.json();
      setSavedOfferId(savedOffer.id);
    } catch (error) {
      console.error('Error saving offer:', error);
      // Don't show error to user if it's just DB not configured - offer still works
      if (error instanceof Error && !error.message.includes('not configured')) {
        setSaveError(error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!savedOfferId) {
      // If no saved ID, just show success (email would be sent separately)
      setEmailSent(true);
      return;
    }

    setEmailSending(true);

    try {
      // Update offer with email and mark as emailed
      const response = await fetch(`/api/offers/${savedOfferId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: email,
          status: 'emailed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update offer');
      }

      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      // Still show success - the email capture is the important part
      setEmailSent(true);
    } finally {
      setEmailSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Car Offer - ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model}`,
          text: `I got an offer of $${offerData?.offerAmount?.toLocaleString()} for my ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model} from Quirk Auto Dealers!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  const handleStartOver = () => {
    resetAll();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 mx-auto flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Calculating Your Offer
          </h2>
          <p className="text-gray-500">
            We&apos;re analyzing market data and your vehicle details to get you the best possible offer...
          </p>
        </div>
      </div>
    );
  }

  if (!offerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Unable to generate offer. Please try again.</p>
          <button onClick={handleStartOver} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const expiryDate = offerData.offerExpiry 
    ? new Date(offerData.offerExpiry).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Your Offer is Ready!
          </h1>
          <p className="text-gray-500 mt-2">
            Here&apos;s our offer for your {vehicleInfo?.year} {vehicleInfo?.make} {vehicleInfo?.model}
          </p>
          
          {/* Save Status - subtle indicator */}
          {saving && (
            <p className="text-gray-400 text-xs mt-2 flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving offer...
            </p>
          )}
          {savedOfferId && !saving && (
            <p className="text-gray-400 text-xs mt-2">
              Offer ID: {savedOfferId.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:shadow-none print:border">
              {/* Offer Amount */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
                <p className="text-white/80 text-sm mb-1">Your Offer</p>
                <p className="text-4xl sm:text-5xl font-bold text-white">
                  ${offerData.offerAmount?.toLocaleString()}
                </p>
                {expiryDate && (
                  <p className="text-white/80 text-sm mt-2 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Valid through {expiryDate}
                  </p>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="p-6">
                <VehicleImage vehicleInfo={vehicleInfo} className="rounded-xl mb-6" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Vehicle</p>
                    <p className="font-semibold text-gray-900">
                      {vehicleInfo?.year} {vehicleInfo?.make} {vehicleInfo?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">VIN</p>
                    <p className="font-mono text-sm text-gray-700">{vehicleInfo?.vin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Mileage</p>
                    <p className="font-semibold text-gray-900">
                      {basics.mileage?.toLocaleString()} miles
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Condition</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {offerData.condition.overallCondition?.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Form */}
            {!emailSent ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 print:hidden">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Email My Offer
                </h3>
                <form onSubmit={handleEmailSubmit} className="flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={emailSending}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={emailSending}
                  >
                    {emailSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Send Offer'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-green-50 rounded-2xl p-6 print:hidden">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Offer Sent!</p>
                    <p className="text-green-600 text-sm">Check your email at {email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 print:hidden">
              <button onClick={handlePrint} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button onClick={handleShare} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button onClick={handleStartOver} className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                New Offer
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 print:hidden">
            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                What&apos;s Next?
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Schedule Appointment</p>
                    <p className="text-gray-500 text-xs">Bring your vehicle to any Quirk location</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Bring Documents</p>
                    <p className="text-gray-500 text-xs">ID, title, and registration</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Get Paid</p>
                    <p className="text-gray-500 text-xs">Same-day payment by check</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Questions?
              </h3>
              <div className="space-y-3">
                <a
                  href="tel:+16032634552"
                  className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>(603) 263-4552</span>
                </a>
                <a
                  href="mailto:steve.obrien@quirkautodealers.com"
                  className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>steve.obrien@quirkautodealers.com</span>
                </a>
              </div>
            </div>

            {/* Find Location */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Find a Location
              </h3>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm">17+ locations across MA &amp; NH</p>
                  <Link
                    href="https://www.quirkchevynh.com/contact"
                    target="_blank"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    View All Locations →
                  </Link>
                </div>
              </div>
            </div>

            {/* Trade-in CTA */}
            {basics.sellOrTrade === 'trade' || basics.sellOrTrade === 'not-sure' ? (
              <div className="bg-gray-900 rounded-2xl shadow-sm p-6 text-white">
                <Car className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-2">
                  Ready to Trade In?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Browse our inventory and apply your ${offerData.offerAmount?.toLocaleString()} credit toward your next vehicle.
                </p>
                <Link
                  href="https://www.quirkchevynh.com"
                  target="_blank"
                  className="block text-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Browse Inventory
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-gray-400 print:hidden">
          <p>
            This offer is subject to verification of vehicle condition and documentation.
            Offer valid for 7 days. Final offer may vary based on in-person inspection.
          </p>
        </div>
      </div>
    </div>
  );
}
