import React from 'react';
import { render, screen } from '@testing-library/react';
import StepNavigation, { MobileProgress } from '@/components/StepNavigation';

describe('StepNavigation', () => {
  it('renders all step labels', () => {
    render(<StepNavigation currentStep="vehicle" />);
    
    expect(screen.getByText('Vehicle Info')).toBeInTheDocument();
    expect(screen.getByText('The Basics')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Condition')).toBeInTheDocument();
    expect(screen.getByText('Your Offer')).toBeInTheDocument();
  });

  it('renders Progress heading', () => {
    render(<StepNavigation currentStep="vehicle" />);
    expect(screen.getAllByText('Progress').length).toBeGreaterThan(0);
  });

  it('renders step numbers', () => {
    render(<StepNavigation currentStep="vehicle" />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 20% for first step', () => {
    render(<StepNavigation currentStep="vehicle" />);
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('shows 40% for second step', () => {
    render(<StepNavigation currentStep="basics" />);
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('shows 60% for third step', () => {
    render(<StepNavigation currentStep="features" />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows 80% for fourth step', () => {
    render(<StepNavigation currentStep="condition" />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('shows 100% for last step', () => {
    render(<StepNavigation currentStep="offer" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders phone number', () => {
    render(<StepNavigation currentStep="vehicle" />);
    expect(screen.getByText('Call (603) 263-4552')).toBeInTheDocument();
  });

  it('renders help text', () => {
    render(<StepNavigation currentStep="vehicle" />);
    expect(screen.getByText(/Need help/)).toBeInTheDocument();
  });

  it('marks active step', () => {
    render(<StepNavigation currentStep="basics" />);
    
    const stepItems = document.querySelectorAll('.step-item');
    const basicsStep = Array.from(stepItems).find(item => 
      item.textContent?.includes('The Basics')
    );
    expect(basicsStep).toHaveClass('active');
  });

  it('marks completed steps', () => {
    render(<StepNavigation currentStep="features" completedSteps={['vehicle', 'basics']} />);
    
    const stepItems = document.querySelectorAll('.step-item');
    const vehicleStep = Array.from(stepItems).find(item => 
      item.textContent?.includes('Vehicle Info')
    );
    expect(vehicleStep).toHaveClass('completed');
  });
});

describe('MobileProgress', () => {
  it('renders step counter', () => {
    render(<MobileProgress currentStep="vehicle" />);
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('renders current step label', () => {
    render(<MobileProgress currentStep="vehicle" />);
    expect(screen.getByText('Vehicle Info')).toBeInTheDocument();
  });

  it('updates for different steps', () => {
    render(<MobileProgress currentStep="features" />);
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('shows last step correctly', () => {
    render(<MobileProgress currentStep="offer" />);
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
    expect(screen.getByText('Your Offer')).toBeInTheDocument();
  });
});
