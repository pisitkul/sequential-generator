import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);

/**
 * Configuration for the SequentialGenerator.
 */
export interface SequentialGeneratorConfig {
  /**
   * A string to prepend to the generated code.
   * @default ''
   */
  prefix?: string;

  /**
   * The date format string, compatible with dayjs.
   * @see https://day.js.org/docs/en/display/format
   * @default 'YYYYMMDD'
   */
  dateFormat?: string;

  /**
   * The length of the sequential number part. The number will be padded with leading zeros.
   * @default 4
   */
  sequentialLength?: number;

  /**
   * The IANA time zone name. This is required to ensure date calculations are consistent.
   * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   * @example 'Asia/Bangkok'
   * @default 'UTC'
   */
  timeZone?: string;

  /**
   * An optional separator string to place between the prefix, date, and sequence number.
   * @default ''
   */
  separator?: string;
}

/**
 * A simple generator for creating sequential codes with a prefix and date.
 * The sequence resets when the formatted date string changes.
 * 
 * @warning This class stores the sequence in memory. The sequence will reset if the process restarts.
 */
export class SequentialGenerator {
  private readonly prefix: string;
  private readonly dateFormat: string;
  private sequentialLength: number;
  private readonly timeZone: string;
  private readonly separator: string;

  private lastGeneratedDate: string | null = null;
  private currentSequence: number = 0;

  /**
   * Creates an instance of SequentialGenerator.
   * @param config - The configuration object.
   */
  constructor(config: SequentialGeneratorConfig = {}) {
    this.prefix = config.prefix !== undefined ? config.prefix : '';
    this.dateFormat = config.dateFormat !== undefined ? config.dateFormat : 'YYYYMMDD';
    this.sequentialLength = config.sequentialLength !== undefined ? config.sequentialLength : 4;
    this.timeZone = config.timeZone || 'UTC';
    this.separator = config.separator !== undefined ? config.separator : '';
  }

  /**
   * Resets the internal generator state (sequence and last date).
   * Useful for testing or manual state management.
   */
  public reset(): void {
    this.currentSequence = 0;
    this.lastGeneratedDate = null;
  }

  /**
   * Parses a code into its constituent parts based on current configuration.
   * @param code - The code to parse.
   * @returns An object containing the prefix, date, and sequence number.
   * @throws Will throw if the code is invalid.
   */
  public parse(code: string): { prefix: string; date: string; sequence: number } {
    if (!this.validate(code)) {
      throw new Error('Invalid code format provided to parse');
    }

    return {
      prefix: this.prefix,
      date: this.extractDate(code),
      sequence: this.extractSequence(code),
    };
  }

  /**
   * Generates the next sequential code.
   * @returns The generated sequential code string.
   * @throws Will throw an error if the sequence number exceeds the defined length.
   */
  public generate(): string {
    const currentDate = dayjs().tz(this.timeZone).format(this.dateFormat);

    this.currentSequence = currentDate === this.lastGeneratedDate ? this.currentSequence + 1 : 1;
    this.lastGeneratedDate = currentDate;

    const sequenceString = String(this.currentSequence).padStart(this.sequentialLength, '0');

    if (sequenceString.length > this.sequentialLength) {
      // Feature 1: Automatic Sequence Length Increment
      this.sequentialLength++;
      return this.generateFromSequence(1, currentDate);
    }

    return `${this.prefix}${this.separator}${currentDate}${this.separator}${sequenceString}`;
  }

  /**
   * Extracts the date part from a generated code.
   * @param code - The code to extract from.
   */
  public extractDate(code: string): string {
    const startIndex = this.prefix.length + this.separator.length;
    
    // If separator exists, use it to find the end of the date part
    if (this.separator) {
      const lastSeparatorIndex = code.lastIndexOf(this.separator);
      if (lastSeparatorIndex > startIndex) {
        return code.substring(startIndex, lastSeparatorIndex);
      }
    }

    // Fallback: use date format length
    const dateLength = this.getDateFormatLength();
    return code.substring(startIndex, startIndex + dateLength);
  }

  /**
   * Extracts the sequence number from a generated code.
   * @param code - The code to extract from.
   */
  public extractSequence(code: string): number {
    let startIndex = code.length - this.sequentialLength;

    // If separator exists, use it to find the start of the sequence part
    if (this.separator) {
      const lastSeparatorIndex = code.lastIndexOf(this.separator);
      if (lastSeparatorIndex !== -1) {
        startIndex = lastSeparatorIndex + this.separator.length;
      }
    } else {
      // Fallback: use date format length to determine start of sequence
      const dateLength = this.getDateFormatLength();
      startIndex = this.prefix.length + this.separator.length + dateLength + this.separator.length;
    }

    const sequenceString = code.substring(startIndex);
    return parseInt(sequenceString, 10);
  }

  /**
   * Validates if a code matches the current configuration format.
   * @param code - The code to validate.
   */
  public validate(code: string): boolean {
    if (!code.startsWith(this.prefix)) return false;
    
    const dateLength = this.getDateFormatLength();
    // Basic length check: Prefix + Sep + Date(min 1) + Sep + Seq(min 1)
    if (code.length < this.prefix.length + (this.separator.length * 2) + dateLength + 1) return false;
    
    let sequenceString = '';
    if (this.separator) {
      const lastSeparatorIndex = code.lastIndexOf(this.separator);
      if (lastSeparatorIndex === -1) return false;
      sequenceString = code.substring(lastSeparatorIndex + this.separator.length);
    } else {
      // Fallback
      const startIndex = this.prefix.length + this.separator.length + dateLength + this.separator.length;
      sequenceString = code.substring(startIndex);
    }

    // Check if sequence part is numeric
    return /^\d+$/.test(sequenceString);
  }

  /**
   * Generates the next code based on the last code retrieved from storage (e.g., DB).
   * Handles date rollover automatically.
   * 
   * @param lastCode - The last generated code.
   */
  public increment(lastCode: string): string {
    if (!this.validate(lastCode)) {
      throw new Error('Invalid code format provided to increment');
    }

    const currentDate = this.getDateKey();
    const lastCodeDate = this.extractDate(lastCode);

    let nextSequence = 1;

    // If date hasn't changed, increment the sequence
    if (lastCodeDate === currentDate) {
      const lastSequence = this.extractSequence(lastCode);
      
      // Check if we need to update sequentialLength to match the input code
      // (e.g. input has 5 digits but config has 4)
      if (this.separator) {
        const lastSeparatorIndex = lastCode.lastIndexOf(this.separator);
        const lastSeqLength = lastCode.length - (lastSeparatorIndex + this.separator.length);
        if (lastSeqLength > this.sequentialLength) {
          this.sequentialLength = lastSeqLength;
        }
      } else {
        // No separator: calculate based on date length
        const dateLength = this.getDateFormatLength();
        // code = prefix + date + sequence
        const lastSeqLength = lastCode.length - (this.prefix.length + dateLength);
        if (lastSeqLength > this.sequentialLength) {
          this.sequentialLength = lastSeqLength;
        }
      }

      nextSequence = lastSequence + 1;
    }
    // If date changed, nextSequence remains 1 (reset)

    return this.generateFromSequence(nextSequence, currentDate);
  }

  /**
   * Helper to get the length of the formatted date string.
   * Assumes the date format produces a fixed length string (e.g. YYYYMMDD).
   */
  private getDateFormatLength(): number {
    return dayjs().tz(this.timeZone).format(this.dateFormat).length;
  }

  /**
   * Gets the current date key based on the configured timeZone and dateFormat.
   * This is useful for external state management (e.g. Redis keys).
   * @returns The formatted date string.
   */
  public getDateKey(): string {
    return dayjs().tz(this.timeZone).format(this.dateFormat);
  }

  /**
   * Generates a code using a specific sequence number.
   * This method is stateless and useful for distributed systems where the sequence
   * is managed externally (e.g., Redis, Database).
   * 
   * @param sequence - The sequence number to use.
   * @param dateKey - Optional date key. If not provided, it's calculated automatically.
   * @returns The generated sequential code string.
   */
  public generateFromSequence(sequence: number, dateKey?: string): string {
    const currentKey = dateKey || this.getDateKey();
    const sequenceString = String(sequence).padStart(this.sequentialLength, '0');

    if (sequenceString.length > this.sequentialLength) {
      // Feature 1: Automatic Sequence Length Increment (Recursive check)
      this.sequentialLength++;
      return this.generateFromSequence(1, currentKey);
    }

    return `${this.prefix}${this.separator}${currentKey}${this.separator}${sequenceString}`;
  }
}