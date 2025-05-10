import { SequentialGenerator } from "../src/SequentialGenerator";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

describe("SequentialGenerator", () => {
  let generator: SequentialGenerator;

  beforeEach(() => {
    generator = new SequentialGenerator("SEX", "Asia/Bangkok");
  });

  test("should generate a correct format number", () => {
    const generatedNumber = generator.generate();
    const today = dayjs().tz("Asia/Bangkok").format("YYMMDD");
    expect(generatedNumber).toBe(`SEX${today}0001`);
  });

  test("should validate a correct ShippedInfoNumber", () => {
    const correctNumber = generator.generate();
    const isValid = generator.validate(correctNumber);
    expect(isValid).toBe(true);
  });

  test("should not validate an incorrect ShippedInfoNumber", () => {
    const invalidNumber = "SEX2501019999"; // ใช้วันที่ผิด
    const isValid = generator.validate(invalidNumber);
    expect(isValid).toBe(false);
  });

  test("should increment correctly", () => {
    const originalNumber = "SEX2501010001";
    const nextNumber = generator.increment(originalNumber);
    expect(nextNumber).toBe("SEX2501010002");
  });

  test("should throw error if max number reached", () => {
    const maxNumber = "SEX2501019999";
    expect(() => {
      generator.increment(maxNumber);
    }).toThrow("Maximum number reached. Cannot increment.");
  });
});
