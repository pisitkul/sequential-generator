import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// ติดตั้ง plugin ให้ dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

export class SequentialGenerator {
  private shortCode: string;
  private timeZone: string;
  private today: string;

  constructor(shortCode?: string) {
    this.shortCode = shortCode || "SEX";
    this.timeZone = "Asia/Bangkok";
    this.today = dayjs().tz(this.timeZone).format("YYMMDD");
  }

  // สร้างหมายเลขใหม่
  generate(): string {
    return `${this.shortCode}${this.today}0001`;
  }

  // ตรวจสอบความถูกต้องของหมายเลข
  validate(shippedInfoNumber: string): boolean {
    if (!shippedInfoNumber) {
      throw new Error("ShippedInfoNumber is required");
    }

    const platformCode = shippedInfoNumber.substring(0, 3);
    const shippedDate = shippedInfoNumber.substring(3, 9);
    const formatShippedDate = dayjs(shippedDate, "YYMMDD").tz(this.timeZone);

    return (
      platformCode === this.shortCode && formatShippedDate.isSame(this.today)
    );
  }

  // เพิ่มหมายเลขถัดไป
  increment(shippedInfoNumber: string): string {
    if (!shippedInfoNumber) {
      throw new Error("ShippedInfoNumber is required");
    }

    const latestNumber = shippedInfoNumber.substring(9);
    const shippedInfo = shippedInfoNumber.substring(0, 9);
    const currentNumber = Number(latestNumber);
    const maxNumber = 9999;

    if (currentNumber === maxNumber) {
      throw new Error("Maximum number reached. Cannot increment.");
    }

    const nextNumber = String(currentNumber + 1).padStart(4, "0");
    return `${shippedInfo}${nextNumber}`;
  }
}
