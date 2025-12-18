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
    it('has all required categories', () => {
      expect(CONDITION_OPTIONS.mechanicalIssues).toBeDefined();
      expect(CONDITION_OPTIONS.engineIssues).toBeDefined();
      expect(CONDITION_OPTIONS.exteriorDamage).toBeDefined();
      expect(CONDITION_OPTIONS.interiorDamage).toBeDefined();
      expect(CONDITION_OPTIONS.technologyIssues).toBeDefined();
    });

    it('mechanicalIssues has valid options', () => {
      expect(CONDITION_OPTIONS.mechanicalIssues.length).toBeGreaterThan(3);
      CONDITION_OPTIONS.mechanicalIssues.forEach(option => {
        expect(option.id).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('engineIssues has valid options', () => {
      expect(CONDITION_OPTIONS.engineIssues.length).toBeGreaterThan(3);
      CONDITION_OPTIONS.engineIssues.forEach(option => {
        expect(option.id).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('each category has a "none" option', () => {
      expect(CONDITION_OPTIONS.mechanicalIssues.find(o => o.id === 'none')).toBeDefined();
      expect(CONDITION_OPTIONS.engineIssues.find(o => o.id === 'none')).toBeDefined();
      expect(CONDITION_OPTIONS.exteriorDamage.find(o => o.id === 'none')).toBeDefined();
      expect(CONDITION_OPTIONS.interiorDamage.find(o => o.id === 'none')).toBeDefined();
      expect(CONDITION_OPTIONS.technologyIssues.find(o => o.id === 'none')).toBeDefined();
    });
  });

  describe('FEATURE_OPTIONS', () => {
    it('has all required categories', () => {
      expect(FEATURE_OPTIONS.entertainment).toBeDefined();
      expect(FEATURE_OPTIONS.accessoryPackages).toBeDefined();
      expect(FEATURE_OPTIONS.exterior).toBeDefined();
      expect(FEATURE_OPTIONS.safetyAndSecurity).toBeDefined();
      expect(FEATURE_OPTIONS.cargoAndTowing).toBeDefined();
      expect(FEATURE_OPTIONS.wheelsAndTires).toBeDefined();
      expect(FEATURE_OPTIONS.seats).toBeDefined();
    });

    it('entertainment has valid options', () => {
      expect(FEATURE_OPTIONS.entertainment.length).toBeGreaterThan(3);
      FEATURE_OPTIONS.entertainment.forEach(option => {
        expect(option.id).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('safetyAndSecurity has backup-camera', () => {
      const ids = FEATURE_OPTIONS.safetyAndSecurity.map(o => o.id);
      expect(ids).toContain('backup-camera');
    });

    it('seats has leather and heated-front options', () => {
      const ids = FEATURE_OPTIONS.seats.map(o => o.id);
      expect(ids).toContain('leather');
      expect(ids).toContain('heated-front');
    });

    it('all ids are unique within each category', () => {
      Object.values(FEATURE_OPTIONS).forEach(category => {
        const ids = category.map(o => o.id);
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).toBe(uniqueIds.length);
      });
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
      const basics: Partial<VehicleBasics> = {};
      expect(basics.mileage).toBeUndefined();
    });
  });

  describe('VehicleFeatures type', () => {
    it('accepts valid features', () => {
      const features: VehicleFeatures = {
        entertainment: ['navigation', 'bluetooth'],
        accessoryPackages: ['sport-package'],
        exterior: ['sunroof'],
        safetyAndSecurity: ['backup-camera'],
        cargoAndTowing: ['trailer-hitch'],
        wheelsAndTires: ['alloy-wheels'],
        seats: ['leather', 'heated-front'],
      };

      expect(features.entertainment).toHaveLength(2);
      expect(features.seats).toContain('leather');
    });
  });

  describe('VehicleCondition type', () => {
    it('accepts valid condition', () => {
      const condition: VehicleCondition = {
        accidentHistory: 'none',
        drivability: 'drivable',
        mechanicalIssues: ['none'],
        engineIssues: ['none'],
        exteriorDamage: ['scratches'],
        interiorDamage: ['none'],
        technologyIssues: ['none'],
        windshieldDamage: 'none',
        tiresReplaced: 'none',
        modifications: false,
        smokedIn: false,
        keys: '2+',
        overallCondition: 'pretty-great',
      };

      expect(condition.accidentHistory).toBe('none');
      expect(condition.overallCondition).toBe('pretty-great');
    });

    it('allows partial condition data', () => {
      const condition: Partial<VehicleCondition> = {
        accidentHistory: '1',
        drivability: 'drivable',
      };

      expect(condition.accidentHistory).toBe('1');
      expect(condition.mechanicalIssues).toBeUndefined();
    });
  });

  describe('OfferData type', () => {
    it('accepts valid offer data', () => {
      const vehicleInfo: VehicleInfo = {
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado',
      };

      const basics: VehicleBasics = {
        mileage: 50000,
        zipCode: '03060',
      };

      const features: VehicleFeatures = {
        entertainment: [],
        accessoryPackages: [],
        exterior: [],
        safetyAndSecurity: [],
        cargoAndTowing: [],
        wheelsAndTires: [],
        seats: [],
      };

      const condition: VehicleCondition = {
        accidentHistory: 'none',
        drivability: 'drivable',
        mechanicalIssues: ['none'],
        engineIssues: ['none'],
        exteriorDamage: ['none'],
        interiorDamage: ['none'],
        technologyIssues: ['none'],
        windshieldDamage: 'none',
        tiresReplaced: 'none',
        modifications: false,
        smokedIn: false,
        keys: '2+',
        overallCondition: 'pretty-great',
      };

      const offer: OfferData = {
        vehicleInfo,
        basics,
        features,
        condition,
        estimatedValue: 25000,
        offerAmount: 23500,
        offerExpiry: '2024-12-31T00:00:00.000Z',
        isPreliminary: true,
      };

      expect(offer.estimatedValue).toBe(25000);
      expect(offer.offerAmount).toBe(23500);
      expect(offer.isPreliminary).toBe(true);
    });
  });
});
