import SequentialGenerator from "../src";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

describe("SequentialGenerator", () => {
  const prefix = "SEX";
  const timeZone = "Asia/Bangkok";
  // ใช้งานเป็น "YYYYMMDD" เพื่อให้ตรงกับ default date format ของ sequential generator
  const today = dayjs().tz(timeZone).format("YYMMDD");

  const dateFormat = "YYMMDD";
  let generator: SequentialGenerator;

  beforeEach(() => {
    generator = new SequentialGenerator(prefix, timeZone, dateFormat);
  });

  // Test for Constructor
  describe("Constructor", () => {
    test("should create an instance", () => {
      expect(generator).toBeInstanceOf(SequentialGenerator);
    });

    test("should throw error if prefix is not provided", () => {
      expect(() => new SequentialGenerator("", timeZone)).toThrow(
        "prefix is required"
      );
    });

    test("should throw error if timeZone is not provided", () => {
      expect(() => new SequentialGenerator(prefix, "")).toThrow(
        "timeZone is required"
      );
    });

    test("should use default date format (YYMMDD)", () => {
      const gen = new SequentialGenerator(prefix, timeZone);
      expect(gen).toBeInstanceOf(SequentialGenerator);
    });
  });

  // Test for generate()
  describe("generate()", () => {
    test("should generate a correctly formatted code", () => {
      const result = generator.generate();
      expect(result).toBe(`${prefix}${today}0001`);
    });
  });

  // Test for validate()
  describe("validate()", () => {
    test("should return true for valid code", () => {
      const code = generator.generate();
      expect(generator.validate(code)).toBe(true);
    });

    test("should return false for invalid date", () => {
      const invalidCode = `${prefix}0000000001`;
      expect(generator.validate(invalidCode)).toBe(false);
    });

    test("should throw error for empty code", () => {
      expect(() => generator.validate("")).toThrow("currentCode is required");
    });
  });

  // Test for increment()
  describe("increment()", () => {
    test("should increment the last number", () => {
      const baseCode = `${prefix}${today}0001`;
      expect(generator.increment(baseCode)).toBe(`${prefix}${today}0002`);
    });

    test("should throw error if number reaches 9999", () => {
      const maxCode = `${prefix}${today}9999`;
      expect(() => generator.increment(maxCode)).toThrow(
        "Maximum number reached. Cannot increment."
      );
    });

    test("should throw error for empty input", () => {
      expect(() => generator.increment("")).toThrow("currentCode is required");
    });
  });

  describe("Custom sequence length", () => {
    test("should generate sequence with 6 digits", () => {
      const generator6Digits = new SequentialGenerator(
        prefix,
        timeZone,
        dateFormat,
        6
      );
      const code = generator6Digits.generate();
      expect(code).toBe(`${prefix}${today}000001`);
    });

    test("should increment correctly with 6 digits", () => {
      const generator6Digits = new SequentialGenerator(
        prefix,
        timeZone,
        dateFormat,
        6
      );
      const currentCode = `${prefix}${today}000099`;
      const nextCode = generator6Digits.increment(currentCode);
      expect(nextCode).toBe(`${prefix}${today}000100`);
    });

    test("should throw error if 6-digit max number reached", () => {
      const generator6Digits = new SequentialGenerator(
        prefix,
        timeZone,
        dateFormat,
        6
      );
      const maxCode = `${prefix}${today}999999`;
      expect(() => generator6Digits.increment(maxCode)).toThrow(
        "Maximum number reached. Cannot increment."
      );
    });
  });
});
