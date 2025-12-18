import {
  VEHICLE_COLORS,
  CONDITION_OPTIONS,
  FEATURE_OPTIONS,
} from '@/types/vehicle';

describe('Vehicle Types and Constants', () => {
  describe('VEHICLE_COLORS', () => {
    it('contains common colors', () => {
      expect(VEHICLE_COLORS).toContain('Black');
      expect(VEHICLE_COLORS).toContain('White');
      expect(VEHICLE_COLORS).toContain('Silver');
      expect(VEHICLE_COLORS).toContain('Red');
      expect(VEHICLE_COLORS).toContain('Blue');
    });

    it('has 15 color options', () => {
      expect(VEHICLE_COLORS).toHaveLength(15);
    });

    it('includes Other as fallback', () => {
      expect(VEHICLE_COLORS).toContain('Other');
    });
  });

  describe('CONDITION_OPTIONS', () => {
    describe('mechanicalIssues', () => {
      it('has expected options', () => {
        const ids = CONDITION_OPTIONS.mechanicalIssues.map(o => o.id);
        expect(ids).toContain('ac');
        expect(ids).toContain('transmission');
        expect(ids).toContain('none');
      });

      it('has labels for all options', () => {
        CONDITION_OPTIONS.mechanicalIssues.forEach(option => {
          expect(option.label).toBeDefined();
          expect(option.label.length).toBeGreaterThan(0);
        });
      });
    });

    describe('engineIssues', () => {
      it('has expected options', () => {
        const ids = CONDITION_OPTIONS.engineIssues.map(o => o.id);
        expect(ids).toContain('check-engine');
        expect(ids).toContain('strange-noises');
        expect(ids).toContain('none');
      });
    });

    describe('exteriorDamage', () => {
      it('has expected options', () => {
        const ids = CONDITION_OPTIONS.exteriorDamage.map(o => o.id);
        expect(ids).toContain('minor');
        expect(ids).toContain('rust');
        expect(ids).toContain('none');
      });
    });

    describe('interiorDamage', () => {
      it('has expected options', () => {
        const ids = CONDITION_OPTIONS.interiorDamage.map(o => o.id);
        expect(ids).toContain('stains');
        expect(ids).toContain('rips-tears');
        expect(ids).toContain('none');
      });
    });

    describe('technologyIssues', () => {
      it('has expected options', () => {
        const ids = CONDITION_OPTIONS.technologyIssues.map(o => o.id);
        expect(ids).toContain('sound-system');
        expect(ids).toContain('backup-camera');
        expect(ids).toContain('none');
      });
    });
  });

  describe('FEATURE_OPTIONS', () => {
    it('has entertainment options', () => {
      const ids = FEATURE_OPTIONS.entertainment.map(o => o.id);
      expect(ids).toContain('navigation');
      expect(ids).toContain('premium-sound');
    });

    it('has exterior options', () => {
      const ids = FEATURE_OPTIONS.exterior.map(o => o.id);
      expect(ids).toContain('running-boards');
    });

    it('has cargoAndTowing options', () => {
      const ids = FEATURE_OPTIONS.cargoAndTowing.map(o => o.id);
      expect(ids).toContain('towing-pkg');
      expect(ids).toContain('bed-liner');
    });

    it('has seats options', () => {
      const ids = FEATURE_OPTIONS.seats.map(o => o.id);
      expect(ids).toContain('leather');
    });
  });
});
