import { SequentialGenerator } from './SequentialGenerator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Extend dayjs plugins for test environment usage
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);

describe('SequentialGenerator', () => {
  beforeEach(() => {
    // Mock system time to ensure consistent tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should use UTC as default timezone if missing', () => {
      const generator = new SequentialGenerator({});
      jest.setSystemTime(new Date('2023-01-01T23:00:00Z')); // 23:00 UTC is 06:00 BKK next day
      expect(generator.generate()).toContain('20230101');
    });

    it('should use default values when optional config is missing', () => {
      const generator = new SequentialGenerator({ timeZone: 'UTC' });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      // Default: prefix='', dateFormat='YYYYMMDD', length=4
      expect(generator.generate()).toBe('202301010001');
    });
  });

  describe('Sequence Generation', () => {
    it('should generate sequential numbers', () => {
      const generator = new SequentialGenerator({ timeZone: 'UTC' });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      expect(generator.generate()).toBe('202301010001');
      expect(generator.generate()).toBe('202301010002');
    });

    it('should respect custom prefix and length', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        prefix: 'INV-',
        sequentialLength: 3
      });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      expect(generator.generate()).toBe('INV-20230101001');
    });

    it('should reset sequence when date changes', () => {
      const generator = new SequentialGenerator({ timeZone: 'UTC' });
      
      // Day 1
      jest.setSystemTime(new Date('2023-01-01T23:59:59Z'));
      expect(generator.generate()).toBe('202301010001');
      
      // Day 2
      jest.setSystemTime(new Date('2023-01-02T00:00:00Z'));
      expect(generator.generate()).toBe('202301020001');
    });
  });

  describe('Timezone Handling', () => {
    it('should generate correct date based on timezone', () => {
      // 2023-01-01 23:00 UTC is 2023-01-02 06:00 Bangkok
      const date = new Date('2023-01-01T23:00:00Z');
      jest.setSystemTime(date);

      const utcGen = new SequentialGenerator({ timeZone: 'UTC' });
      const bkkGen = new SequentialGenerator({ timeZone: 'Asia/Bangkok' });

      expect(utcGen.generate()).toContain('20230101');
      expect(bkkGen.generate()).toContain('20230102');
    });

    it('should rollover date and reset sequence at timezone midnight', () => {
      const generator = new SequentialGenerator({ timeZone: 'Asia/Bangkok' }); // UTC+7

      // 2023-01-01 16:59:59 UTC -> 2023-01-01 23:59:59 BKK
      jest.setSystemTime(new Date('2023-01-01T16:59:59Z'));
      expect(generator.generate()).toContain('20230101');

      // 2023-01-01 17:00:00 UTC -> 2023-01-02 00:00:00 BKK (New Day)
      jest.setSystemTime(new Date('2023-01-01T17:00:00Z'));
      const code = generator.generate();
      expect(code).toContain('20230102');
      expect(generator.extractSequence(code)).toBe(1);
    });

    it('should handle Daylight Saving Time (DST) transitions correctly (America/New_York)', () => {
      const generator = new SequentialGenerator({ timeZone: 'America/New_York' });

      // DST Start 2023: March 12. Clocks jump forward at 02:00 -> 03:00.
      // 01:30 EST is 06:30 UTC
      jest.setSystemTime(new Date('2023-03-12T06:30:00Z')); 
      expect(generator.generate()).toContain('20230312');
      
      // 03:30 EDT is 07:30 UTC (1 hour later)
      jest.setSystemTime(new Date('2023-03-12T07:30:00Z'));
      const codeSpring = generator.generate();
      expect(codeSpring).toContain('20230312');
      expect(generator.extractSequence(codeSpring)).toBe(2); // Should not reset

      // DST End 2023: Nov 5. Clocks fall back at 02:00 -> 01:00.
      // 01:30 EDT is 05:30 UTC
      jest.setSystemTime(new Date('2023-11-05T05:30:00Z'));
      // Date changed from Mar to Nov, so sequence resets to 1
      expect(generator.generate()).toContain('20231105'); 
      
      // 01:30 EST is 06:30 UTC (1 hour later, clock repeats 1:30 AM)
      jest.setSystemTime(new Date('2023-11-05T06:30:00Z'));
      const codeFall = generator.generate();
      expect(codeFall).toContain('20231105');
      expect(generator.extractSequence(codeFall)).toBe(2); // Should not reset
    });
  });

  describe('Advanced Formatting', () => {
    it('should support advanced format tokens (e.g. Quarter)', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        dateFormat: 'YYYY[Q]Q'
      });
      
      jest.setSystemTime(new Date('2023-04-01T00:00:00Z')); // Q2
      expect(generator.generate()).toBe('2023Q20001');
    });
  });

  describe('Error Handling', () => {
    it('should auto-increment sequence length on overflow', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        sequentialLength: 1
      });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      for (let i = 0; i < 9; i++) {
        generator.generate();
      }
      
      // 9 -> 10 (overflow 1 digit) -> should become 01 (reset to 1 with 2 digits)
      expect(generator.generate()).toBe('2023010101'); 
    });
  });

  describe('Stateless Increment (DB Pattern)', () => {
    let generator: SequentialGenerator;

    beforeEach(() => {
      generator = new SequentialGenerator({ 
        timeZone: 'UTC',
        prefix: 'INV',
        dateFormat: 'YYYYMMDD',
        sequentialLength: 4
      });
    });

    it('should increment sequence if date is the same', () => {
      jest.setSystemTime(new Date('2023-01-01T12:00:00Z'));
      const lastCode = 'INV202301010001';
      
      const nextCode = generator.increment(lastCode);
      expect(nextCode).toBe('INV202301010002');
    });

    it('should reset sequence to 1 if date has changed', () => {
      // Current time is Jan 2nd
      jest.setSystemTime(new Date('2023-01-02T12:00:00Z'));
      // Last code was from Jan 1st
      const lastCode = 'INV202301010005';
      
      const nextCode = generator.increment(lastCode);
      // Should be Jan 2nd, sequence 0001
      expect(nextCode).toBe('INV202301020001');
    });

    it('should validate code correctly', () => {
      expect(generator.validate('INV202301010001')).toBe(true);
      expect(generator.validate('WRONG202301010001')).toBe(false); // Wrong prefix
      expect(generator.validate('INV20230101ABC')).toBe(false); // Non-numeric sequence
    });

    it('should extract parts correctly', () => {
      const code = 'INV202301010001';
      expect(generator.extractDate(code)).toBe('20230101');
      expect(generator.extractSequence(code)).toBe(1);
    });

    it('should throw error when incrementing invalid code', () => {
      expect(() => generator.increment('INVALID')).toThrow('Invalid code format');
    });
  });

  describe('Separator Functionality', () => {
    it('should include separator in generated code', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        prefix: 'INV',
        separator: '-'
      });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      expect(generator.generate()).toBe('INV-20230101-0001');
    });

    it('should handle separator in increment', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        prefix: 'INV',
        separator: '-'
      });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      const next = generator.increment('INV-20230101-0001');
      expect(next).toBe('INV-20230101-0002');
    });

    it('should handle mismatched sequence length (e.g. auto-expanded code) correctly', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        prefix: 'INV',
        separator: '-',
        sequentialLength: 4 // Config is 4
      });

      // Set system time to match the date in expandedCode so it counts as the "same day"
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      // Input has 5 digits (simulating a code that was auto-expanded previously)
      const expandedCode = 'INV-20230101-00001'; 
      
      // Should extract correctly despite config mismatch
      expect(generator.extractSequence(expandedCode)).toBe(1);
      expect(generator.extractDate(expandedCode)).toBe('20230101');
      
      // Should increment correctly and PRESERVE the expanded length (5 digits)
      const next = generator.increment(expandedCode);
      expect(next).toBe('INV-20230101-00002');
    });
  });

  describe('Stateless Generation (External State)', () => {
    it('should generate code from provided sequence number', () => {
      const generator = new SequentialGenerator({ timeZone: 'UTC' });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      // Simulate getting sequence 5 from Redis
      const code = generator.generateFromSequence(5);
      expect(code).toBe('202301010005');
    });

    it('should allow providing custom dateKey', () => {
      const generator = new SequentialGenerator({ timeZone: 'UTC' });
      
      // Simulate processing a backlog item from yesterday
      const yesterdayKey = '20221231';
      const code = generator.generateFromSequence(10, yesterdayKey);
      expect(code).toBe('202212310010');
    });
  });

  describe('Edge Cases', () => {
    it('should handle sequence length exceeding config without separator correctly', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        prefix: 'INV',
        sequentialLength: 4 // Config is 4
      });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      // Input has 5 digits (simulating a code that was auto-expanded previously)
      const expandedCode = 'INV2023010100001'; 
      
      // Should increment correctly and PRESERVE the expanded length (5 digits)
      const next = generator.increment(expandedCode);
      
      expect(next).toBe('INV2023010100002');
    });

    it('should handle leap year transition correctly', () => {
      const generator = new SequentialGenerator({ timeZone: 'UTC' });
      
      // 2024 is a leap year. Feb 29th.
      jest.setSystemTime(new Date('2024-02-29T23:59:59Z'));
      expect(generator.generate()).toBe('202402290001');
      
      // Transition to Mar 1st
      jest.setSystemTime(new Date('2024-03-01T00:00:00Z'));
      expect(generator.generate()).toBe('202403010001'); // Should reset
    });

    it('should not reset sequence if formatted date string remains the same (e.g. YYYYMM)', () => {
      const generator = new SequentialGenerator({ 
        timeZone: 'UTC',
        dateFormat: 'YYYYMM' // Monthly format implies monthly reset
      });
      
      // Jan 1st
      jest.setSystemTime(new Date('2023-01-01T10:00:00Z'));
      expect(generator.generate()).toBe('2023010001');
      
      // Jan 31st (Same month, different day) -> Should NOT reset
      jest.setSystemTime(new Date('2023-01-31T23:59:59Z'));
      expect(generator.generate()).toBe('2023010002');
      
      // Feb 1st (New month) -> Should reset
      jest.setSystemTime(new Date('2023-02-01T00:00:00Z'));
      expect(generator.generate()).toBe('2023020001');
    });

    it('should handle special characters in prefix and separator', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        prefix: 'ID#',
        separator: '/'
      });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
      
      const code = generator.generate();
      expect(code).toBe('ID#/20230101/0001');
      expect(generator.validate(code)).toBe(true);
      expect(generator.extractDate(code)).toBe('20230101');
      expect(generator.extractSequence(code)).toBe(1);
    });

    it('should reset sequence yearly when format is YY', () => {
      const generator = new SequentialGenerator({
        timeZone: 'UTC',
        dateFormat: 'YY'
      });

      // 2023 Dec 31
      jest.setSystemTime(new Date('2023-12-31T23:59:59Z'));
      expect(generator.generate()).toBe('230001');

      // 2024 Jan 01 (New Year) -> Should reset
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      expect(generator.generate()).toBe('240001');
    });
  });
});