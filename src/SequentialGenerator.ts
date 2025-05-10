import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Setup dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export class SequentialGenerator {
  private prefix: string;
  private timeZone: string;
  private dateString: string;

  constructor(prefix: string, timeZone: string, dateFormat: string = "YYMMDD") {
    if (!prefix) throw new Error("prefix is required");
    if (!timeZone) throw new Error("timeZone is required");

    this.prefix = prefix;
    this.timeZone = timeZone;
    this.dateString = dayjs().tz(this.timeZone).format(dateFormat);
  }

  // Generate new sequential code
  generate(): string {
    return `${this.prefix}${this.dateString}0001`;
  }

  // Validate a generated code
  validate(code: string): boolean {
    if (!code) {
      throw new Error("code is required");
    }

    const codePrefix = code.substring(0, 3);
    const codeDate = code.substring(3, 9);
    const parsedDate = dayjs(codeDate, "YYMMDD").tz(this.timeZone);

    return codePrefix === this.prefix && parsedDate.isSame(this.dateString);
  }

  // Increment the last sequential code
  increment(currentCode: string): string {
    if (!currentCode) {
      throw new Error("currentCode is required");
    }

    const sequenceNumber = currentCode.substring(9);
    const codeBase = currentCode.substring(0, 9);
    const number = Number(sequenceNumber);
    const max = 9999;

    if (number === max) {
      throw new Error("Maximum number reached. Cannot increment.");
    }

    const nextSequence = String(number + 1).padStart(4, "0");
    return `${codeBase}${nextSequence}`;
  }
}
