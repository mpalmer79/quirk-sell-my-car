import {
  getVehicleSpecs,
  getAvailableTransmissions,
  getAvailableEngines,
  hasVehicleSpecs,
  DEFAULT_SPEC_OPTIONS,
} from '@/lib/vehicleSpecs';

describe('vehicleSpecs library', () => {
  // ===========================================================================
  // getVehicleSpecs()
  // ===========================================================================
  describe('getVehicleSpecs', () => {
    it('returns correct specs for Nissan Sentra', () => {
      const specs = getVehicleSpecs('Nissan', 'Sentra');
      
      expect(specs.transmissions).toContain('CVT');
      expect(specs.transmissions).toContain('Manual');
      expect(specs.transmissions).toHaveLength(2);
      
      expect(specs.engines).toContain('4-Cylinder');
      expect(specs.engines).toHaveLength(1);
    });

    it('returns correct specs for Toyota Camry', () => {
      const specs = getVehicleSpecs('Toyota', 'Camry');
      
      expect(specs.transmissions).toContain('Automatic, 8-Speed');
      expect(specs.engines).toContain('4-Cylinder');
      expect(specs.engines).toContain('V6');
      expect(specs.engines).toContain('Hybrid');
    });

    it('returns correct specs for Ford F-150', () => {
      const specs = getVehicleSpecs('Ford', 'F-150');
      
      expect(specs.transmissions).toContain('Automatic, 10-Speed');
      expect(specs.engines).toContain('V6');
      expect(specs.engines).toContain('V6 Turbo');
      expect(specs.engines).toContain('V8');
      expect(specs.engines).toContain('Hybrid');
      expect(specs.engines).toContain('Electric');
    });

    it('returns correct specs for Chevrolet Silverado', () => {
      const specs = getVehicleSpecs('Chevrolet', 'Silverado');
      
      expect(specs.transmissions).toContain('Automatic, 8-Speed');
      expect(specs.transmissions).toContain('Automatic, 10-Speed');
      expect(specs.engines).toContain('4-Cylinder Turbo');
      expect(specs.engines).toContain('V6');
      expect(specs.engines).toContain('V8');
    });

    it('returns correct specs for Tesla Model 3', () => {
      const specs = getVehicleSpecs('Tesla', 'Model 3');
      
      expect(specs.transmissions).toContain('Automatic');
      expect(specs.transmissions).toHaveLength(1);
      expect(specs.engines).toContain('Electric');
      expect(specs.engines).toHaveLength(1);
    });

    it('returns correct specs for Honda Civic', () => {
      const specs = getVehicleSpecs('Honda', 'Civic');
      
      expect(specs.transmissions).toContain('CVT');
      expect(specs.transmissions).toContain('Manual');
      expect(specs.engines).toContain('4-Cylinder');
      expect(specs.engines).toContain('4-Cylinder Turbo');
    });

    it('returns correct specs for Jeep Wrangler', () => {
      const specs = getVehicleSpecs('Jeep', 'Wrangler');
      
      expect(specs.transmissions).toContain('Automatic, 8-Speed');
      expect(specs.transmissions).toContain('Manual');
      expect(specs.engines).toContain('4-Cylinder Turbo');
      expect(specs.engines).toContain('V6');
      expect(specs.engines).toContain('Hybrid');
    });

    it('returns correct specs for BMW 3 Series', () => {
      const specs = getVehicleSpecs('BMW', '3 Series');
      
      expect(specs.transmissions).toContain('Automatic, 8-Speed');
      expect(specs.engines).toContain('4-Cylinder Turbo');
      expect(specs.engines).toContain('V6 Turbo');
    });

    it('returns default specs for unknown make', () => {
      const specs = getVehicleSpecs('UnknownMake', 'UnknownModel');
      
      expect(specs).toEqual(DEFAULT_SPEC_OPTIONS);
    });

    it('returns default specs for unknown model of known make', () => {
      const specs = getVehicleSpecs('Toyota', 'UnknownModel');
      
      expect(specs).toEqual(DEFAULT_SPEC_OPTIONS);
    });
  });

  // ===========================================================================
  // Case Insensitivity
  // ===========================================================================
  describe('case insensitivity', () => {
    it('handles uppercase make', () => {
      const specs = getVehicleSpecs('NISSAN', 'Sentra');
      expect(specs.engines).toContain('4-Cylinder');
    });

    it('handles lowercase make', () => {
      const specs = getVehicleSpecs('nissan', 'sentra');
      expect(specs.engines).toContain('4-Cylinder');
    });

    it('handles mixed case make', () => {
      const specs = getVehicleSpecs('NiSsAn', 'SeNtRa');
      expect(specs.engines).toContain('4-Cylinder');
    });

    it('handles uppercase model', () => {
      const specs = getVehicleSpecs('Toyota', 'CAMRY');
      expect(specs.engines).toContain('V6');
    });

    it('handles mixed case for Ford F-150', () => {
      const specs = getVehicleSpecs('FORD', 'f-150');
      expect(specs.engines).toContain('V8');
    });
  });

  // ===========================================================================
  // Model Name with Hyphens and Spaces
  // ===========================================================================
  describe('model name with special characters', () => {
    it('handles model with hyphen (F-150)', () => {
      const specs = getVehicleSpecs('Ford', 'F-150');
      expect(specs.engines.length).toBeGreaterThan(0);
      expect(specs.engines).toContain('V8');
    });

    it('handles model with spaces (3 Series)', () => {
      const specs = getVehicleSpecs('BMW', '3 Series');
      expect(specs.engines.length).toBeGreaterThan(0);
    });

    it('handles model with hyphen (CR-V)', () => {
      const specs = getVehicleSpecs('Honda', 'CR-V');
      expect(specs.transmissions).toContain('CVT');
    });

    it('handles Tesla Model 3 with space', () => {
      const specs = getVehicleSpecs('Tesla', 'Model 3');
      expect(specs.engines).toContain('Electric');
    });

    it('handles Ram 1500', () => {
      const specs = getVehicleSpecs('Ram', '1500');
      expect(specs.engines).toContain('V8');
    });

    it('handles Mercedes-Benz with hyphen in make', () => {
      const specs = getVehicleSpecs('Mercedes-Benz', 'C-Class');
      expect(specs.transmissions).toContain('Automatic, 9-Speed');
    });

    it('handles Land Rover with space in make', () => {
      const specs = getVehicleSpecs('Land Rover', 'Defender');
      expect(specs.engines).toContain('4-Cylinder Turbo');
    });
  });

  // ===========================================================================
  // getAvailableTransmissions()
  // ===========================================================================
  describe('getAvailableTransmissions', () => {
    it('returns CVT and Manual for Nissan Sentra', () => {
      const transmissions = getAvailableTransmissions('Nissan', 'Sentra');
      
      expect(transmissions).toContain('CVT');
      expect(transmissions).toContain('Manual');
      expect(transmissions).toHaveLength(2);
    });

    it('returns single option for Tesla', () => {
      const transmissions = getAvailableTransmissions('Tesla', 'Model 3');
      
      expect(transmissions).toContain('Automatic');
      expect(transmissions).toHaveLength(1);
    });

    it('returns multiple options for Jeep Wrangler', () => {
      const transmissions = getAvailableTransmissions('Jeep', 'Wrangler');
      
      expect(transmissions).toContain('Automatic, 8-Speed');
      expect(transmissions).toContain('Manual');
    });

    it('returns CVT for Subaru Outback', () => {
      const transmissions = getAvailableTransmissions('Subaru', 'Outback');
      
      expect(transmissions).toContain('CVT');
    });

    it('returns defaults for unknown vehicle', () => {
      const transmissions = getAvailableTransmissions('Unknown', 'Vehicle');
      
      expect(transmissions).toEqual(DEFAULT_SPEC_OPTIONS.transmissions);
    });
  });

  // ===========================================================================
  // getAvailableEngines()
  // ===========================================================================
  describe('getAvailableEngines', () => {
    it('returns only 4-Cylinder for Nissan Sentra', () => {
      const engines = getAvailableEngines('Nissan', 'Sentra');
      
      expect(engines).toContain('4-Cylinder');
      expect(engines).toHaveLength(1);
    });

    it('returns Electric only for Tesla Model 3', () => {
      const engines = getAvailableEngines('Tesla', 'Model 3');
      
      expect(engines).toContain('Electric');
      expect(engines).toHaveLength(1);
    });

    it('returns multiple options for Toyota Camry', () => {
      const engines = getAvailableEngines('Toyota', 'Camry');
      
      expect(engines).toContain('4-Cylinder');
      expect(engines).toContain('V6');
      expect(engines).toContain('Hybrid');
      expect(engines).toHaveLength(3);
    });

    it('returns V8 for Dodge Charger', () => {
      const engines = getAvailableEngines('Dodge', 'Charger');
      
      expect(engines).toContain('V6');
      expect(engines).toContain('V8');
    });

    it('returns diesel options for Ram 2500', () => {
      const engines = getAvailableEngines('Ram', '2500');
      
      expect(engines).toContain('V8');
      expect(engines).toContain('V6 Diesel');
    });

    it('returns defaults for unknown vehicle', () => {
      const engines = getAvailableEngines('Unknown', 'Vehicle');
      
      expect(engines).toEqual(DEFAULT_SPEC_OPTIONS.engines);
    });
  });

  // ===========================================================================
  // hasVehicleSpecs()
  // ===========================================================================
  describe('hasVehicleSpecs', () => {
    it('returns true for known vehicle (Nissan Sentra)', () => {
      expect(hasVehicleSpecs('Nissan', 'Sentra')).toBe(true);
    });

    it('returns true for known vehicle (Toyota Camry)', () => {
      expect(hasVehicleSpecs('Toyota', 'Camry')).toBe(true);
    });

    it('returns true for known vehicle (Ford F-150)', () => {
      expect(hasVehicleSpecs('Ford', 'F-150')).toBe(true);
    });

    it('returns false for unknown make', () => {
      expect(hasVehicleSpecs('UnknownMake', 'Sentra')).toBe(false);
    });

    it('returns false for unknown model', () => {
      expect(hasVehicleSpecs('Nissan', 'UnknownModel')).toBe(false);
    });

    it('returns false for completely unknown vehicle', () => {
      expect(hasVehicleSpecs('Unknown', 'Vehicle')).toBe(false);
    });

    it('handles case insensitivity', () => {
      expect(hasVehicleSpecs('NISSAN', 'SENTRA')).toBe(true);
      expect(hasVehicleSpecs('nissan', 'sentra')).toBe(true);
    });
  });

  // ===========================================================================
  // Edge Cases
  // ===========================================================================
  describe('edge cases', () => {
    it('handles empty strings', () => {
      const specs = getVehicleSpecs('', '');
      expect(specs).toEqual(DEFAULT_SPEC_OPTIONS);
    });

    it('handles whitespace in make', () => {
      const specs = getVehicleSpecs('  Nissan  ', 'Sentra');
      expect(specs.engines).toContain('4-Cylinder');
    });

    it('handles whitespace in model', () => {
      const specs = getVehicleSpecs('Nissan', '  Sentra  ');
      expect(specs.engines).toContain('4-Cylinder');
    });
  });

  // ===========================================================================
  // Specific Vehicle Scenarios (Real-world use cases)
  // ===========================================================================
  describe('real-world vehicle scenarios', () => {
    it('2019 Nissan Sentra should have limited options', () => {
      const transmissions = getAvailableTransmissions('Nissan', 'Sentra');
      const engines = getAvailableEngines('Nissan', 'Sentra');
      
      // Sentra only comes with CVT or Manual, and only 4-cylinder
      expect(transmissions).toHaveLength(2);
      expect(engines).toHaveLength(1);
      expect(engines[0]).toBe('4-Cylinder');
    });

    it('Chevrolet Corvette should only have V8', () => {
      const engines = getAvailableEngines('Chevrolet', 'Corvette');
      
      expect(engines).toContain('V8');
      expect(engines).toHaveLength(1);
    });

    it('Toyota Sienna should be Hybrid only', () => {
      const engines = getAvailableEngines('Toyota', 'Sienna');
      
      expect(engines).toContain('Hybrid');
      expect(engines).toHaveLength(1);
    });

    it('Honda Civic Type R should be Manual only', () => {
      const transmissions = getAvailableTransmissions('Honda', 'Civic Type R');
      
      expect(transmissions).toContain('Manual');
      expect(transmissions).toHaveLength(1);
    });

    it('Subaru WRX should have turbo engine option', () => {
      const engines = getAvailableEngines('Subaru', 'WRX');
      
      expect(engines).toContain('4-Cylinder Turbo');
    });

    it('Porsche 911 should have manual transmission option', () => {
      const transmissions = getAvailableTransmissions('Porsche', '911');
      
      expect(transmissions).toContain('Manual');
      expect(transmissions).toContain('Automatic, 8-Speed');
    });
  });

  // ===========================================================================
  // DEFAULT_SPEC_OPTIONS
  // ===========================================================================
  describe('DEFAULT_SPEC_OPTIONS', () => {
    it('has reasonable default transmissions', () => {
      expect(DEFAULT_SPEC_OPTIONS.transmissions).toContain('Automatic');
      expect(DEFAULT_SPEC_OPTIONS.transmissions).toContain('Manual');
    });

    it('has reasonable default engines', () => {
      expect(DEFAULT_SPEC_OPTIONS.engines).toContain('4-Cylinder');
      expect(DEFAULT_SPEC_OPTIONS.engines).toContain('V6');
    });
  });
});
