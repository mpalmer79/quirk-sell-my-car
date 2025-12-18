import {
  VEHICLE_COLORS,
  CONDITION_OPTIONS,
  FEATURE_OPTIONS,
  VehicleInfo,
  VehicleBasics,
  VehicleFeatures,
  VehicleCondition,
  OfferData,
} from '@/types/vehicle';

describe('Vehicle Types and Constants', () => {
  describe('VEHICLE_COLORS', () => {
    it('contains expected colors', () => {
      expect(VEHICLE_COLORS).toContain('Black');
      expect(VEHICLE_COLORS).toContain('White');
      expect(VEHICLE_COLORS).toContain('Silver');
      expect(VEHICLE_COLORS).toContain('Gray');
      expect(VEHICLE_COLORS).toContain('Red');
      expect(VEHICLE_COLORS).toContain('Blue');
      expect(VEHICLE_COLORS).toContain('Other');
    });

    it('has at least 10 color options', () => {
      expect(VEHICLE_COLORS.length).toBeGreaterThanOrEqual(10);
    });

    it('all colors are non-empty strings', () => {
      VEHICLE_COLORS.forEach(color => {
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CONDITION_OPTIONS', () => {
    it('has 5 condition levels', () => {
      expect(CONDITION_OPTIONS.length).toBe(5);
    });

    it('has values from 1 to 5', () => {
      const values = CONDITION_OPTIONS.map(o => o.value);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values).toContain(4);
      expect(values).toContain(5);
    });

    it('has labels for all options', () => {
      CONDITION_OPTIONS.forEach(option => {
        expect(option.label).toBeDefined();
        expect(option.label.length).toBeGreaterThan(0);
      });
    });

    it('has descriptions for all options', () => {
      CONDITION_OPTIONS.forEach(option => {
        expect(option.description).toBeDefined();
        expect(option.description.length).toBeGreaterThan(0);
      });
    });

    it('has expected labels', () => {
      const labels = CONDITION_OPTIONS.map(o => o.label);
      expect(labels).toContain('Poor');
      expect(labels).toContain('Fair');
      expect(labels).toContain('Good');
      expect(labels).toContain('Very Good');
      expect(labels).toContain('Excellent');
    });

    it('options are sorted by value ascending', () => {
      for (let i = 0; i < CONDITION_OPTIONS.length - 1; i++) {
        expect(CONDITION_OPTIONS[i].value).toBeLessThan(CONDITION_OPTIONS[i + 1].value);
      }
    });
  });

  describe('FEATURE_OPTIONS', () => {
    it('has multiple feature options', () => {
      expect(FEATURE_OPTIONS.length).toBeGreaterThan(10);
    });

    it('all options have id, label, and category', () => {
      FEATURE_OPTIONS.forEach(option => {
        expect(option.id).toBeDefined();
        expect(option.id.length).toBeGreaterThan(0);
        expect(option.label).toBeDefined();
        expect(option.label.length).toBeGreaterThan(0);
        expect(option.category).toBeDefined();
        expect(option.category.length).toBeGreaterThan(0);
      });
    });

    it('has Safety category options', () => {
      const safetyOptions = FEATURE_OPTIONS.filter(o => o.category === 'Safety');
      expect(safetyOptions.length).toBeGreaterThan(0);
      
      const ids = safetyOptions.map(o => o.id);
      expect(ids).toContain('backup-camera');
    });

    it('has Comfort category options', () => {
      const comfortOptions = FEATURE_OPTIONS.filter(o => o.category === 'Comfort');
      expect(comfortOptions.length).toBeGreaterThan(0);
      
      const ids = comfortOptions.map(o => o.id);
      expect(ids).toContain('leather-seats');
      expect(ids).toContain('heated-seats');
    });

    it('has Technology category options', () => {
      const techOptions = FEATURE_OPTIONS.filter(o => o.category === 'Technology');
      expect(techOptions.length).toBeGreaterThan(0);
      
      const ids = techOptions.map(o => o.id);
      expect(ids).toContain('navigation');
      expect(ids).toContain('apple-carplay');
    });

    it('has Exterior category options', () => {
      const exteriorOptions = FEATURE_OPTIONS.filter(o => o.category === 'Exterior');
      expect(exteriorOptions.length).toBeGreaterThan(0);
      
      const ids = exteriorOptions.map(o => o.id);
      expect(ids).toContain('alloy-wheels');
      expect(ids).toContain('tow-package');
    });

    it('has Performance category options', () => {
      const perfOptions = FEATURE_OPTIONS.filter(o => o.category === 'Performance');
      expect(perfOptions.length).toBeGreaterThan(0);
      
      const ids = perfOptions.map(o => o.id);
      expect(ids).toContain('remote-start');
    });

    it('all ids are unique', () => {
      const ids = FEATURE_OPTIONS.map(o => o.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('VehicleInfo type', () => {
    it('accepts valid vehicle info', () => {
      const info: VehicleInfo = {
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
        trim: 'LT',
        bodyClass: 'Pickup',
        driveType: 'AWD',
        engineCylinders: '8',
        displacement: '5.3',
        fuelType: 'Gasoline',
        transmissionStyle: 'Automatic',
        transmissionSpeeds: '10',
        doors: 4,
      };

      expect(info.vin).toBe('1GCVKNEC0MZ123456');
      expect(info.year).toBe(2021);
      expect(info.make).toBe('CHEVROLET');
    });

    it('allows optional fields to be undefined', () => {
      const info: VehicleInfo = {
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      expect(info.trim).toBeUndefined();
      expect(info.bodyClass).toBeUndefined();
    });
  });

  describe('VehicleBasics type', () => {
    it('accepts valid basics', () => {
      const basics: VehicleBasics = {
        mileage: 50000,
        zipCode: '03060',
        color: 'Black',
        transmission: 'Automatic',
        drivetrain: 'AWD',
        engine: 'V8',
        sellOrTrade: 'trade',
        loanOrLease: 'loan',
      };

      expect(basics.mileage).toBe(50000);
      expect(basics.color).toBe('Black');
    });

    it('allows all fields to be optional', () => {
      const basics: VehicleBasics = {};
      expect(basics.mileage).toBeUndefined();
    });
  });

  describe('VehicleFeatures type', () => {
    it('accepts valid features', () => {
      const features: VehicleFeatures = {
        selectedFeatures: ['navigation', 'leather-seats', 'backup-camera'],
        additionalInfo: 'Recently serviced',
      };

      expect(features.selectedFeatures).toHaveLength(3);
      expect(features.additionalInfo).toBe('Recently serviced');
    });
  });

  describe('VehicleCondition type', () => {
    it('accepts valid condition', () => {
      const condition: VehicleCondition = {
        exterior: 4,
        interior: 4,
        mechanical: 5,
        tires: 3,
        hasAccidentHistory: false,
        hasMajorRepairs: false,
        titleStatus: 'clean',
        keys: 2,
      };

      expect(condition.exterior).toBe(4);
      expect(condition.titleStatus).toBe('clean');
    });
  });

  describe('OfferData type', () => {
    it('accepts valid offer data', () => {
      const offer: OfferData = {
        estimatedValue: 25000,
        lowValue: 23000,
        highValue: 27000,
        confidenceScore: 0.85,
        validUntil: '2024-12-31',
        confirmationNumber: 'QRK-123456',
      };

      expect(offer.estimatedValue).toBe(25000);
      expect(offer.confirmationNumber).toBe('QRK-123456');
    });
  });
});
