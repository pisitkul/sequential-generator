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
  private dateFormat: string;
  private sequenceLength: number;

  constructor(
    prefix: string,
    timeZone: string,
    dateFormat: string = "YYYYMMDD",
    sequenceLength: number = 4
  ) {
    if (!prefix) throw new Error("prefix is required");
    if (!timeZone) throw new Error("timeZone is required");

    this.prefix = prefix;
    this.timeZone = timeZone;
    this.dateFormat = dateFormat;
    this.sequenceLength = sequenceLength;
    this.dateString = dayjs().tz(this.timeZone).format(this.dateFormat);
  }

  // Generate new sequential code
  generate(): string {
    return `${this.prefix}${this.dateString}${"1".padStart(
      this.sequenceLength,
      "0"
    )}`;
  }

  // Validate a generated code
  validate(code: string): boolean {
    if (!code) {
      throw new Error("currentCode is required");
    }

    const codePrefix = code.substring(0, 3);
    const codeDate = code.substring(3, this.dateFormat.length + 3);
    const parsedDate = dayjs(codeDate, this.dateFormat).tz(this.timeZone);

    return codePrefix === this.prefix && parsedDate.isSame(this.dateString);
  }

  // Increment the last sequential code
  increment(currentCode: string): string {
    if (!currentCode) {
      throw new Error("currentCode is required");
    }

    const dateLength = this.dateFormat.length;
    const prefixLength = this.prefix.length;
    const codeBaseLength = prefixLength + dateLength;

    const sequenceNumber = currentCode.substring(codeBaseLength);
    const codeBase = currentCode.substring(0, codeBaseLength);
    const currentNumber = Number(sequenceNumber);
    const max = Number("9".repeat(this.sequenceLength));

    if (currentNumber >= max) {
      throw new Error("Maximum number reached. Cannot increment.");
    }

    const nextSequence = String(currentNumber + 1).padStart(
      this.sequenceLength,
      "0"
    );
    return `${codeBase}${nextSequence}`;
  }
}
