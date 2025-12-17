
'use client';

import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  path: string;
}

const STEPS: Step[] = [
  { id: 'vehicle', label: 'Vehicle Info', path: '/getoffer/vehicle' },
  { id: 'basics', label: 'The Basics', path: '/getoffer/basics' },
  { id: 'features', label: 'Features', path: '/getoffer/features' },
  { id: 'condition', label: 'Condition', path: '/getoffer/condition' },
  { id: 'offer', label: 'Your Offer', path: '/getoffer/offer' },
];

interface StepNavigationProps {
  currentStep: string;
  completedSteps?: string[];
}

export default function StepNavigation({ currentStep, completedSteps = [] }: StepNavigationProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-24">
        <h3 className="text-sm font-semibold text-quirk-gray-500 uppercase tracking-wider mb-4">
          Progress
        </h3>
        <nav className="space-y-1">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
            const isActive = step.id === currentStep;
            const isPending = index > currentIndex && !completedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-number">
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isPending ? 'text-quirk-gray-400' : ''
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Progress indicator */}
        <div className="mt-6 pt-6 border-t border-quirk-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-quirk-gray-500">Progress</span>
            <span className="font-semibold text-quirk-gray-700">
              {Math.round(((currentIndex + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 p-4 bg-quirk-gray-50 rounded-lg">
          <p className="text-xs text-quirk-gray-500">
            Need help? Our team is available 7 days a week to answer your questions.
          </p>
          <a
            href="tel:+16032634552"
            className="text-xs font-semibold text-quirk-red hover:underline mt-2 inline-block"
          >
            Call (603) 263-4552
          </a>
        </div>
      </div>
    </div>
  );
}

// Mobile progress bar component
export function MobileProgress({ currentStep }: { currentStep: string }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="lg:hidden mb-6">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-quirk-gray-500">
          Step {currentIndex + 1} of {STEPS.length}
        </span>
        <span className="font-medium text-quirk-gray-700">
          {STEPS[currentIndex]?.label}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
