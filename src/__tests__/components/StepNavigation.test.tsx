import React from 'react';
import { render, screen } from '@testing-library/react';
import StepNavigation, { MobileProgress } from '@/components/StepNavigation';

describe('StepNavigation', () => {
  describe('desktop navigation', () => {
    it('should render all step labels', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      expect(screen.getByText('Vehicle Info')).toBeInTheDocument();
      expect(screen.getByText('The Basics')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Condition')).toBeInTheDocument();
      expect(screen.getByText('Your Offer')).toBeInTheDocument();
    });

    it('should render Progress heading', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should render step numbers', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should highlight the current step as active', () => {
      render(<StepNavigation currentStep="basics" />);
      
      const basicsStep = screen.getByText('The Basics').closest('.step-item');
      expect(basicsStep).toHaveClass('active');
    });

    it('should mark completed steps', () => {
      render(<StepNavigation currentStep="features" completedSteps={['vehicle', 'basics']} />);
      
      const vehicleStep = screen.getByText('Vehicle Info').closest('.step-item');
      const basicsStep = screen.getByText('The Basics').closest('.step-item');
      
      expect(vehicleStep).toHaveClass('completed');
      expect(basicsStep).toHaveClass('completed');
    });

    it('should mark previous steps as completed even without completedSteps prop', () => {
      render(<StepNavigation currentStep="condition" />);
      
      // Steps before 'condition' should be completed
      const vehicleStep = screen.getByText('Vehicle Info').closest('.step-item');
      const basicsStep = screen.getByText('The Basics').closest('.step-item');
      const featuresStep = screen.getByText('Features').closest('.step-item');
      
      expect(vehicleStep).toHaveClass('completed');
      expect(basicsStep).toHaveClass('completed');
      expect(featuresStep).toHaveClass('completed');
    });

    it('should show checkmark for completed steps', () => {
      render(<StepNavigation currentStep="condition" completedSteps={['vehicle', 'basics', 'features']} />);
      
      // Completed steps should have check icons (SVG) instead of numbers
      const stepItems = document.querySelectorAll('.step-item.completed');
      expect(stepItems.length).toBeGreaterThanOrEqual(3);
    });

    it('should render phone number in help section', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      expect(screen.getByText('Call (603) 263-4552')).toBeInTheDocument();
    });

    it('should render help text', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      expect(screen.getByText(/Need help\?/i)).toBeInTheDocument();
    });
  });

  describe('progress percentage', () => {
    it('should show 20% for first step', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('should show 40% for second step', () => {
      render(<StepNavigation currentStep="basics" />);
      
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should show 60% for third step', () => {
      render(<StepNavigation currentStep="features" />);
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should show 80% for fourth step', () => {
      render(<StepNavigation currentStep="condition" />);
      
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('should show 100% for last step', () => {
      render(<StepNavigation currentStep="offer" />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('should render progress bar', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      const progressBar = document.querySelector('.progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should have correct width for first step', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      const progressFill = document.querySelector('.progress-bar-fill');
      expect(progressFill).toHaveStyle({ width: '20%' });
    });

    it('should have correct width for middle step', () => {
      render(<StepNavigation currentStep="features" />);
      
      const progressFill = document.querySelector('.progress-bar-fill');
      expect(progressFill).toHaveStyle({ width: '60%' });
    });

    it('should have correct width for last step', () => {
      render(<StepNavigation currentStep="offer" />);
      
      const progressFill = document.querySelector('.progress-bar-fill');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });
  });

  describe('phone link', () => {
    it('should have correct tel: href', () => {
      render(<StepNavigation currentStep="vehicle" />);
      
      const phoneLink = screen.getByText('Call (603) 263-4552');
      expect(phoneLink).toHaveAttribute('href', 'tel:+16032634552');
    });
  });
});

describe('MobileProgress', () => {
  it('should render step counter', () => {
    render(<MobileProgress currentStep="vehicle" />);
    
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('should render current step label', () => {
    render(<MobileProgress currentStep="vehicle" />);
    
    expect(screen.getByText('Vehicle Info')).toBeInTheDocument();
  });

  it('should update step counter for different steps', () => {
    render(<MobileProgress currentStep="features" />);
    
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('should render progress bar', () => {
    render(<MobileProgress currentStep="vehicle" />);
    
    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should have correct progress width for first step', () => {
    render(<MobileProgress currentStep="vehicle" />);
    
    const progressFill = document.querySelector('.progress-bar-fill');
    expect(progressFill).toHaveStyle({ width: '20%' });
  });

  it('should have correct progress width for middle step', () => {
    render(<MobileProgress currentStep="condition" />);
    
    const progressFill = document.querySelector('.progress-bar-fill');
    expect(progressFill).toHaveStyle({ width: '80%' });
  });

  it('should have correct progress width for last step', () => {
    render(<MobileProgress currentStep="offer" />);
    
    const progressFill = document.querySelector('.progress-bar-fill');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });

  it('should show Step 5 of 5 for offer step', () => {
    render(<MobileProgress currentStep="offer" />);
    
    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
    expect(screen.getByText('Your Offer')).toBeInTheDocument();
  });
});
