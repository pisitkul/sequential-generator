import { SequentialGenerator } from '../src';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);

describe('SequentialGenerator', () => {
  // ---------------------------------------------------------------------------
  // Shared test fixtures (real date — no fake timers)
  // ---------------------------------------------------------------------------
  const prefix = 'INV';
  const timeZone = 'Asia/Bangkok';
  const dateFormat = 'YYYYMMDD';
  const today = dayjs().tz(timeZone).format(dateFormat);

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------
  describe('Constructor', () => {
    test('should create an instance with full config', () => {
      const gen = new SequentialGenerator({ prefix, timeZone });
      expect(gen).toBeInstanceOf(SequentialGenerator);
    });

    test('should create an instance with no config (all defaults)', () => {
      const gen = new SequentialGenerator();
      expect(gen).toBeInstanceOf(SequentialGenerator);
    });

    test('should use default dateFormat (YYYYMMDD)', () => {
      const gen = new SequentialGenerator({ prefix, timeZone });
      const code = gen.generate();
      const todayDefault = dayjs().tz(timeZone).format('YYYYMMDD');
      expect(code).toBe(`${prefix}${todayDefault}0001`);
    });

    test('should use default timeZone (UTC)', () => {
      const gen = new SequentialGenerator({ prefix });
      expect(gen).toBeInstanceOf(SequentialGenerator);
    });

    test('should reset state correctly using reset()', () => {
      const gen = new SequentialGenerator({ prefix, timeZone });
      gen.generate(); // sequence becomes 1
      gen.reset();
      expect(gen.generate()).toBe(`${prefix}${today}0001`); // sequence starts at 1 again
    });
  });

  // ---------------------------------------------------------------------------
  // generate()
  // ---------------------------------------------------------------------------
  describe('generate()', () => {
    test('should generate a correctly formatted code', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.generate()).toBe(`${prefix}${today}0001`);
    });

    test('should increment sequence on subsequent calls (same day)', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      gen.generate(); // 0001
      gen.generate(); // 0002
      expect(gen.generate()).toBe(`${prefix}${today}0003`);
    });

    test('should include separator when configured', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      expect(gen.generate()).toBe(`INV-${today}-0001`);
    });

    test('should use custom sequentialLength', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, sequentialLength: 6 });
      expect(gen.generate()).toBe(`${prefix}${today}000001`);
    });

    test('should auto-expand sequence length when limit is reached', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, sequentialLength: 1 });
      for (let i = 0; i < 9; i++) gen.generate(); // 1..9
      const expanded = gen.generate(); // auto-expand to 2 digits, resets to 1
      expect(expanded).toBe(`${prefix}${today}01`);
    });
  });

  // ---------------------------------------------------------------------------
  // validate()
  // ---------------------------------------------------------------------------
  describe('validate()', () => {
    test('should return true for a valid generated code', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      const code = gen.generate();
      expect(gen.validate(code)).toBe(true);
    });

    test('should return true for a valid code with separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      expect(gen.validate(`INV-${today}-0001`)).toBe(true);
    });

    test('should return false for code with wrong prefix', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.validate(`XXX${today}0001`)).toBe(false);
    });

    test('should return false for an empty string', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.validate('')).toBe(false);
    });

    test('should return false for code with non-numeric sequence', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.validate(`${prefix}${today}ABCD`)).toBe(false);
    });

    test('should return false if separator is missing when configured', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      expect(gen.validate(`${prefix}${today}0001`)).toBe(false);
    });

    test('should validate correctly when prefix is empty string', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC' });
      const code = gen.generate(); // e.g. '<today>0001'
      expect(gen.validate(code)).toBe(true);
      expect(gen.validate(today)).toBe(false); // too short (missing sequence)
      expect(gen.validate(`${today}ABCD`)).toBe(false); // non-numeric sequence
    });
  });

  // ---------------------------------------------------------------------------
  // increment()
  // ---------------------------------------------------------------------------
  describe('increment()', () => {
    test('should increment the sequence by 1', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.increment(`${prefix}${today}0001`)).toBe(`${prefix}${today}0002`);
    });

    test('should reset sequence to 0001 on date rollover', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      const yesterday = dayjs().tz(timeZone).subtract(1, 'day').format(dateFormat);
      expect(gen.increment(`${prefix}${yesterday}0005`)).toBe(`${prefix}${today}0001`);
    });

    test('should auto-expand sequence digits when needed', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, sequentialLength: 4 });
      expect(gen.increment(`${prefix}${today}09999`)).toBe(`${prefix}${today}10000`);
    });

    test('should work with separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      expect(gen.increment(`INV-${today}-0001`)).toBe(`INV-${today}-0002`);
    });

    test('should auto-expand sequence digits with separator when needed', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-', sequentialLength: 4 });
      expect(gen.increment(`INV-${today}-09999`)).toBe(`INV-${today}-10000`);
    });

    test('should throw for invalid code format', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(() => gen.increment('INVALID_CODE')).toThrow('Invalid code format');
    });
  });

  // ---------------------------------------------------------------------------
  // extractDate()
  // ---------------------------------------------------------------------------
  describe('extractDate()', () => {
    test('should extract date from code without separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.extractDate(`${prefix}${today}0001`)).toBe(today);
    });

    test('should extract date from code with separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      expect(gen.extractDate(`INV-${today}-0001`)).toBe(today);
    });

    test('should fallback to date format length if separator is misplaced', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat: 'YYYY', separator: '-' });
      // prefix="INV", sep="-", startIndex=4. code="INV-2025" (len 8). sep at 3. 3 > 4 is false.
      expect(gen.extractDate('INV-2025')).toBe('2025');
    });
  });

  // ---------------------------------------------------------------------------
  // extractSequence()
  // ---------------------------------------------------------------------------
  describe('extractSequence()', () => {
    test('should extract sequence number from code without separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.extractSequence(`${prefix}${today}0042`)).toBe(42);
    });

    test('should extract sequence number from code with separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      expect(gen.extractSequence(`INV-${today}-0042`)).toBe(42);
    });

    test('should fallback when separator is missing in code despite config', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      // Should still work if we pass a code without separator (fallback to standard logic)
      expect(gen.extractSequence(`${prefix}${today}0042`)).toBe(42);
    });
  });

  // ---------------------------------------------------------------------------
  // generateFromSequence()
  // ---------------------------------------------------------------------------
  describe('generateFromSequence()', () => {
    test('should generate code from a given sequence number', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.generateFromSequence(5)).toBe(`${prefix}${today}0005`);
    });

    test('should use provided dateKey when given', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.generateFromSequence(1, '20240101')).toBe(`${prefix}202401010001`);
    });
  });

  // ---------------------------------------------------------------------------
  // getDateKey()
  // ---------------------------------------------------------------------------
  describe('getDateKey()', () => {
    test('should return current date formatted by dateFormat', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(gen.getDateKey()).toBe(today);
    });
  });

  // ---------------------------------------------------------------------------
  // parse()
  // ---------------------------------------------------------------------------
  describe('parse()', () => {
    test('should parse a valid code into its parts', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      const code = `${prefix}${today}0042`;
      const parsed = gen.parse(code);
      expect(parsed).toEqual({
        prefix: prefix,
        date: today,
        sequence: 42,
      });
    });

    test('should parse correctly with separator', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat, separator: '-' });
      const code = `INV-${today}-0007`;
      const parsed = gen.parse(code);
      expect(parsed).toEqual({
        prefix: prefix,
        date: today,
        sequence: 7,
      });
    });

    test('should throw error when parsing invalid code', () => {
      const gen = new SequentialGenerator({ prefix, timeZone, dateFormat });
      expect(() => gen.parse('INVALID')).toThrow('Invalid code format provided to parse');
    });
  });

  // ---------------------------------------------------------------------------
  // Timezone & Date-Reset Edge Cases (fake timers for determinism)
  // ---------------------------------------------------------------------------
  describe('Timezone & Date-Reset Edge Cases', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should use UTC as default timezone', () => {
      jest.setSystemTime(new Date('2023-01-01T23:00:00Z'));
      const gen = new SequentialGenerator({});
      expect(gen.generate()).toContain('20230101');
    });

    test('should generate correct date based on timezone (UTC vs Bangkok)', () => {
      // 2023-01-01 23:00 UTC = 2023-01-02 06:00 Bangkok
      jest.setSystemTime(new Date('2023-01-01T23:00:00Z'));
      const utcGen = new SequentialGenerator({ timeZone: 'UTC' });
      const bkkGen = new SequentialGenerator({ timeZone: 'Asia/Bangkok' });
      expect(utcGen.generate()).toContain('20230101');
      expect(bkkGen.generate()).toContain('20230102');
    });

    test('should reset sequence at Bangkok midnight', () => {
      const gen = new SequentialGenerator({ timeZone: 'Asia/Bangkok' }); // UTC+7

      // 2023-01-01 23:59:59 BKK == 2023-01-01 16:59:59 UTC
      jest.setSystemTime(new Date('2023-01-01T16:59:59Z'));
      expect(gen.generate()).toContain('20230101');

      // 2023-01-02 00:00:00 BKK == 2023-01-01 17:00:00 UTC
      jest.setSystemTime(new Date('2023-01-01T17:00:00Z'));
      const code = gen.generate();
      expect(code).toContain('20230102');
      expect(gen.extractSequence(code)).toBe(1);
    });

    test('should handle Daylight Saving Time (DST) transitions (America/New_York)', () => {
      const gen = new SequentialGenerator({ timeZone: 'America/New_York' });

      // DST Start 2023 (Mar 12): 01:30 EST = 06:30 UTC
      jest.setSystemTime(new Date('2023-03-12T06:30:00Z'));
      expect(gen.generate()).toContain('20230312');

      // 03:30 EDT = 07:30 UTC — same day, sequence should NOT reset
      jest.setSystemTime(new Date('2023-03-12T07:30:00Z'));
      const codeSpring = gen.generate();
      expect(codeSpring).toContain('20230312');
      expect(gen.extractSequence(codeSpring)).toBe(2);

      // DST End 2023 (Nov 5): 01:30 EDT = 05:30 UTC
      jest.setSystemTime(new Date('2023-11-05T05:30:00Z'));
      expect(gen.generate()).toContain('20231105');

      // 01:30 EST = 06:30 UTC (clock repeats 1:30 AM) — same day, no reset
      jest.setSystemTime(new Date('2023-11-05T06:30:00Z'));
      const codeFall = gen.generate();
      expect(codeFall).toContain('20231105');
      expect(gen.extractSequence(codeFall)).toBe(2);
    });

    test('should handle leap year transition (Feb 29 → Mar 1)', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC' });

      jest.setSystemTime(new Date('2024-02-29T23:59:59Z'));
      expect(gen.generate()).toBe('202402290001');

      jest.setSystemTime(new Date('2024-03-01T00:00:00Z'));
      expect(gen.generate()).toBe('202403010001'); // sequence resets
    });

    test('should support monthly date format and reset only on month change', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', dateFormat: 'YYYYMM' });

      jest.setSystemTime(new Date('2023-01-01T10:00:00Z'));
      expect(gen.generate()).toBe('2023010001');

      jest.setSystemTime(new Date('2023-01-31T23:59:59Z'));
      expect(gen.generate()).toBe('2023010002'); // same month, no reset

      jest.setSystemTime(new Date('2023-02-01T00:00:00Z'));
      expect(gen.generate()).toBe('2023020001'); // new month, resets
    });

    test('should reset sequence yearly when format is YY', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', dateFormat: 'YY' });

      jest.setSystemTime(new Date('2023-12-31T23:59:59Z'));
      expect(gen.generate()).toBe('230001');

      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      expect(gen.generate()).toBe('240001'); // new year, resets
    });

    test('should support advanced format tokens (Quarter)', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', dateFormat: 'YYYY[Q]Q' });

      jest.setSystemTime(new Date('2023-04-01T00:00:00Z')); // Q2
      expect(gen.generate()).toBe('2023Q20001');
    });

    test('should handle special characters in prefix and separator', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', prefix: 'ID#', separator: '/' });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      const code = gen.generate();
      expect(code).toBe('ID#/20230101/0001');
      expect(gen.validate(code)).toBe(true);
      expect(gen.extractDate(code)).toBe('20230101');
      expect(gen.extractSequence(code)).toBe(1);
    });

    test('should auto-expand sequence length on generate() overflow', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', sequentialLength: 1 });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      for (let i = 0; i < 9; i++) gen.generate(); // 1..9

      // 10 overflows 1 digit → auto-expands to 2, resets to 1
      expect(gen.generate()).toBe('2023010101');
    });

    test('should auto-expand sequence length when generateFromSequence overflows (recursive path)', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', sequentialLength: 1 });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      // sequence=10 overflows 1 digit → recursively resets to 1 with 2 digits
      const code = gen.generateFromSequence(10, '20230101');
      expect(code).toBe('2023010101');
    });

    test('should handle sequence length mismatch in increment() without separator', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', prefix: 'INV', sequentialLength: 4 });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      // 5-digit code simulating auto-expanded previous code
      const expanded = 'INV2023010100001';
      expect(gen.increment(expanded)).toBe('INV2023010100002');
    });

    test('should handle sequence length mismatch in increment() with separator', () => {
      const gen = new SequentialGenerator({ timeZone: 'UTC', prefix: 'INV', separator: '-', sequentialLength: 4 });
      jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));

      const expanded = 'INV-20230101-00001'; // 5 digits
      expect(gen.extractSequence(expanded)).toBe(1);
      expect(gen.extractDate(expanded)).toBe('20230101');
      expect(gen.increment(expanded)).toBe('INV-20230101-00002'); // preserves 5-digit length
    });
  });
});
