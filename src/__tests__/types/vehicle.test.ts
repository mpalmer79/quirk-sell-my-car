import {
  VEHICLE_COLORS,
  CONDITION_OPTIONS,
  FEATURE_OPTIONS,
  VehicleInfo,
  VehicleBasics,
  VehicleFeatures,
  VehicleCondition,
  OfferData,
  ChatMessage,
} from '@/types/vehicle';

describe('Vehicle Types and Constants', () => {
  describe('VEHICLE_COLORS', () => {
    it('should contain expected colors', () => {
      expect(VEHICLE_COLORS).toContain('Black');
      expect(VEHICLE_COLORS).toContain('White');
      expect(VEHICLE_COLORS).toContain('Silver');
      expect(VEHICLE_COLORS).toContain('Red');
      expect(VEHICLE_COLORS).toContain('Blue');
    });

    it('should contain 15 color options', () => {
      expect(VEHICLE_COLORS).toHaveLength(15);
    });

    it('should include Other as a fallback', () => {
      expect(VEHICLE_COLORS).toContain('Other');
    });

    it('should be readonly', () => {
      // TypeScript const assertion ensures readonly
      // This test validates the values are present
      expect(VEHICLE_COLORS[0]).toBe('Black');
      expect(VEHICLE_COLORS[VEHICLE_COLORS.length - 1]).toBe('Other');
    });
  });

  describe('CONDITION_OPTIONS', () => {
    describe('mechanicalIssues', () => {
      it('should contain expected options', () => {
        const ids = CONDITION_OPTIONS.mechanicalIssues.map(o => o.id);
        expect(ids).toContain('ac');
        expect(ids).toContain('transmission');
        expect(ids).toContain('tire-pressure');
        expect(ids).toContain('electrical');
        expect(ids).toContain('none');
      });

      it('should have labels for all options', () => {
        CONDITION_OPTIONS.mechanicalIssues.forEach(option => {
          expect(option.label).toBeDefined();
          expect(option.label.length).toBeGreaterThan(0);
        });
      });

      it('should include "none" option', () => {
        const noneOption = CONDITION_OPTIONS.mechanicalIssues.find(o => o.id === 'none');
        expect(noneOption).toBeDefined();
        expect(noneOption?.label).toBe('No mechanical or electrical issues');
      });
    });

    describe('engineIssues', () => {
      it('should contain expected options', () => {
        const ids = CONDITION_OPTIONS.engineIssues.map(o => o.id);
        expect(ids).toContain('check-engine');
        expect(ids).toContain('strange-noises');
        expect(ids).toContain('vibration');
        expect(ids).toContain('smoke-steam');
        expect(ids).toContain('other');
        expect(ids).toContain('none');
      });

      it('should have 6 options', () => {
        expect(CONDITION_OPTIONS.engineIssues).toHaveLength(6);
      });
    });

    describe('exteriorDamage', () => {
      it('should contain expected options', () => {
        const ids = CONDITION_OPTIONS.exteriorDamage.map(o => o.id);
        expect(ids).toContain('minor');
        expect(ids).toContain('fading-paint');
        expect(ids).toContain('dents-scrapes');
        expect(ids).toContain('rust');
        expect(ids).toContain('hail');
        expect(ids).toContain('none');
      });
    });

    describe('interiorDamage', () => {
      it('should contain expected options', () => {
        const ids = CONDITION_OPTIONS.interiorDamage.map(o => o.id);
        expect(ids).toContain('stains');
        expect(ids).toContain('rips-tears');
        expect(ids).toContain('odors');
        expect(ids).toContain('damaged-panels');
        expect(ids).toContain('none');
      });
    });

    describe('technologyIssues', () => {
      it('should contain expected options', () => {
        const ids = CONDITION_OPTIONS.technologyIssues.map(o => o.id);
        expect(ids).toContain('sound-system');
        expect(ids).toContain('display');
        expect(ids).toContain('backup-camera');
        expect(ids).toContain('safety-sensors');
        expect(ids).toContain('missing-equipment');
        expect(ids).toContain('none');
      });
    });
  });

  describe('FEATURE_OPTIONS', () => {
    describe('entertainment', () => {
      it('should contain navigation and premium-sound', () => {
        const ids = FEATURE_OPTIONS.entertainment.map(o => o.id);
        expect(ids).toContain('navigation');
        expect(ids).toContain('premium-sound');
      });
    });

    describe('accessoryPackages', () => {
      it('should contain expected options', () => {
        const ids = FEATURE_OPTIONS.accessoryPackages.map(o => o.id);
        expect(ids).toContain('sport-appearance');
        expect(ids).toContain('trail-runner');
        expect(ids).toContain('premium-interior');
      });
    });

    describe('exterior', () => {
      it('should contain expected options', () => {
        const ids = FEATURE_OPTIONS.exterior.map(o => o.id);
        expect(ids).toContain('pickup-shell');
        expect(ids).toContain('grille-guard');
        expect(ids).toContain('running-boards');
      });
    });

    describe('safetyAndSecurity', () => {
      it('should contain lane departure warning', () => {
        const ids = FEATURE_OPTIONS.safetyAndSecurity.map(o => o.id);
        expect(ids).toContain('lane-departure');
      });
    });

    describe('cargoAndTowing', () => {
      it('should contain expected options', () => {
        const ids = FEATURE_OPTIONS.cargoAndTowing.map(o => o.id);
        expect(ids).toContain('tonneau-cover');
        expect(ids).toContain('towing-pkg');
        expect(ids).toContain('bed-liner');
      });
    });

    describe('wheelsAndTires', () => {
      it('should contain expected options', () => {
        const ids = FEATURE_OPTIONS.wheelsAndTires.map(o => o.id);
        expect(ids).toContain('oversized-premium');
        expect(ids).toContain('off-road-tires');
        expect(ids).toContain('premium-wheels');
      });
    });

    describe('seats', () => {
      it('should contain leather option', () => {
        const ids = FEATURE_OPTIONS.seats.map(o => o.id);
        expect(ids).toContain('leather');
      });
    });
  });

  describe('Type structures', () => {
    it('should validate VehicleInfo type structure', () => {
      const vehicle: VehicleInfo = {
        vin: '1GCVKNEC0MZ123456',
        year: 2021,
        make: 'CHEVROLET',
        model: 'Silverado 1500',
        trim: 'LT',
        bodyClass: 'Pickup',
        driveType: '4WD',
        engineCylinders: 8,
        engineDisplacement: '5.3',
        fuelType: 'Gasoline',
        transmissionStyle: 'Automatic',
        doors: 4,
        imageUrl: 'https://example.com/car.jpg',
      };

      expect(vehicle.vin).toBe('1GCVKNEC0MZ123456');
      expect(vehicle.year).toBe(2021);
      expect(vehicle.make).toBe('CHEVROLET');
      expect(vehicle.model).toBe('Silverado 1500');
    });

    it('should validate VehicleBasics type structure', () => {
      const basics: VehicleBasics = {
        mileage: 45000,
        zipCode: '03060',
        color: 'Black',
        transmission: 'Automatic',
        drivetrain: '4WD',
        engine: 'V8',
        sellOrTrade: 'sell',
        loanOrLease: 'neither',
      };

      expect(basics.mileage).toBe(45000);
      expect(basics.sellOrTrade).toBe('sell');
    });

    it('should validate VehicleFeatures type structure', () => {
      const features: VehicleFeatures = {
        entertainment: ['navigation'],
        accessoryPackages: [],
        exterior: ['running-boards'],
        safetyAndSecurity: [],
        cargoAndTowing: ['towing-pkg'],
        wheelsAndTires: [],
        seats: ['leather'],
      };

      expect(features.entertainment).toContain('navigation');
      expect(features.seats).toContain('leather');
    });

    it('should validate VehicleCondition type structure', () => {
      const condition: VehicleCondition = {
        accidentHistory: 'none',
        drivability: 'drivable',
        mechanicalIssues: ['none'],
        engineIssues: ['none'],
        exteriorDamage: ['minor'],
        interiorDamage: ['none'],
        technologyIssues: ['none'],
        windshieldDamage: 'none',
        tiresReplaced: '4',
        modifications: false,
        smokedIn: false,
        keys: '2+',
        overallCondition: 'pretty-great',
      };

      expect(condition.accidentHistory).toBe('none');
      expect(condition.overallCondition).toBe('pretty-great');
    });

    it('should validate ChatMessage type structure', () => {
      const message: ChatMessage = {
        id: '123',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      };

      expect(message.id).toBe('123');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should validate OfferData type structure', () => {
      const offerData: OfferData = {
        vehicleInfo: {
          vin: '1GCVKNEC0MZ123456',
          year: 2021,
          make: 'CHEVROLET',
          model: 'Silverado 1500',
        },
        basics: {
          mileage: 45000,
          zipCode: '03060',
          color: 'Black',
          transmission: 'Automatic',
          drivetrain: '4WD',
          engine: 'V8',
          sellOrTrade: 'sell',
          loanOrLease: 'neither',
        },
        features: {
          entertainment: [],
          accessoryPackages: [],
          exterior: [],
          safetyAndSecurity: [],
          cargoAndTowing: [],
          wheelsAndTires: [],
          seats: [],
        },
        condition: {
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
          keys: '1',
          overallCondition: 'just-okay',
        },
        email: 'test@example.com',
        estimatedValue: 30000,
        offerAmount: 28000,
        offerExpiry: '2025-01-01T00:00:00Z',
      };

      expect(offerData.vehicleInfo.vin).toBe('1GCVKNEC0MZ123456');
      expect(offerData.offerAmount).toBe(28000);
    });
  });
});
