# Sequential Generator 🚀

A simple, timezone-aware sequential code generator with date prefix. This package is useful for generating sequential codes that include a timestamp-based prefix, ensuring uniqueness and easy traceability.

เครื่องมือสร้างโค้ดลำดับที่ง่ายและรองรับ timezone โดยมีพรีฟิกซ์ที่รวมวันที่ ตัวโปรแกรมนี้เหมาะสำหรับการสร้างโค้ดที่มีลำดับต่อเนื่องซึ่งมีพรีฟิกซ์เป็นข้อมูลวันที่ ช่วยให้โค้ดมีความเป็นเอกลักษณ์และสามารถตรวจสอบย้อนกลับได้ง่าย

## Features 🌟

| English | ไทย |
|---------|-----|
| **Generate Sequential Codes**: Creates codes formatted as `{prefix}{date}{sequential number}`, e.g., `SEX2305110001`. | **สร้างโค้ดลำดับต่อเนื่อง**: สร้างโค้ดในรูปแบบ `{prefix}{date}{sequential number}` เช่น `SEX2305110001` |
| **Timezone-Aware**: Supports time zone specification (e.g., `Asia/Bangkok`). | **รองรับ Timezone**: รองรับการกำหนดโซนเวลา (เช่น `Asia/Bangkok`) |
| **Customizable Date Format**: Supports custom date formats, default is `YYYYMMDD`. | **รูปแบบวันที่สามารถกำหนดได้**: รองรับการกำหนดรูปแบบวันที่ตามต้องการ โดยค่าเริ่มต้นคือ `YYYYMMDD` |
| **Flexible Sequence Length**: Configure the number of digits in the sequence (default: 4 digits, e.g., `0001`). | **ความยืดหยุ่นในความยาวของลำดับ**: สามารถกำหนดจำนวนหลักของลำดับได้ โดยค่าเริ่มต้นคือ 4 หลัก (เช่น `0001`) |
| **Max Sequence Limit**: Generator stops when reaching maximum value (e.g., `9999` for 4 digits). | **จำกัดจำนวนสูงสุดของลำดับ**: เมื่อถึงลำดับสูงสุด (เช่น `9999` สำหรับ 4 หลัก) จะไม่สามารถเพิ่มลำดับได้อีก |

## Installation 📦

```bash
npm install sequential-generator
```

## Usage 🛠️

```typescript
import { SequentialGenerator } from 'sequential-generator';

// Create a generator with prefix, timezone, default date format and sequence length
const generator = new SequentialGenerator('SEX', 'Asia/Bangkok');

// Generate a new code
const newCode = generator.generate();
console.log(newCode);  // Example output: SEX2305110001

// Validate a code
const isValid = generator.validate('SEX2305110001');
console.log(isValid);  // true or false

// Increment an existing code
const incrementedCode = generator.increment('SEX2305110001');
console.log(incrementedCode);  // Example output: SEX2305110002
```

## Custom Configuration ⚙️

```typescript
// Create a generator with custom date format and sequence length
const generator = new SequentialGenerator(
  'INV',                // prefix
  'America/New_York',   // timeZone
  'YYMMDD',            // custom date format
  6                    // 6-digit sequence (e.g., 000001)
);
```

## Max Sequence Limit ⚠️

If the sequence reaches the maximum value based on the defined sequence length, the generator will throw an error:

```typescript
const maxCode = 'SEX2305119999';  // Maximum for 4-digit sequence
try {
  console.log(generator.increment(maxCode));
} catch (error) {
  console.error(error.message);  // Output: "Maximum number reached. Cannot increment."
}
```

## API Reference 📚

### Class: `SequentialGenerator`

#### Constructor

```typescript
constructor(
  prefix: string,
  timeZone: string,
  dateFormat: string = "YYYYMMDD",
  sequenceLength: number = 4
)
```

#### Methods

| Method | Description |
|--------|-------------|
| `generate()` | Generates a new sequential code based on current date |
| `validate(code: string)` | Validates if a given code follows the expected format |
| `increment(code: string)` | Returns the next sequential code in the sequence |
| `extractDate(code: string)` | Extracts the date component from a code |
| `extractSequence(code: string)` | Extracts the sequence number from a code |

## License 📝

MIT License
Copyright (c) 2024 Pratchaya Ueapisitkul
