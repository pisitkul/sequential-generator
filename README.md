# Sequential Generator 🚀

A simple, timezone-aware sequential code generator with a date-based prefix.
Designed for generating readable, traceable, and unique reference codes.

Perfect for invoices, orders, tickets, documents, or any system that requires
human-readable sequential identifiers.

---

## ✨ Features

* **Sequential Code Generation**
  Generates codes in the format `{prefix}{date}{sequence}`
  Example: `INV202305110001`

* **Timezone-Aware**
  Correctly calculates dates based on a specified timezone
  (e.g. `Asia/Bangkok`, `America/New_York`)

* **Custom Date Format**
  Supports custom date formats (default: `YYYYMMDD`)

* **Configurable Sequence Length**
  Control the number of digits in the sequence
  (default: 4 digits → `0001`)

* **Automatic Sequence Expansion**
  Automatically increases sequence length when the limit is reached
  (`9999` → `00001`)

* **Custom Separator**
  Optional separator between segments
  Example: `INV-20230101-001`

---

## 📦 Installation

```bash
npm install sequential-generator
```

---

## 🛠 Usage

```ts
import { SequentialGenerator } from 'sequential-generator';

const generator = new SequentialGenerator({
  prefix: 'INV',
  timeZone: 'Asia/Bangkok',
  separator: '-',
});

// Generate a new code
const code = generator.generate();
console.log(code);
// INV-20230511-0001

// Validate an existing code
console.log(generator.validate('INV-20230511-0001'));
// true

// Increment a code (stateless / DB-friendly)
console.log(generator.increment('INV-20230511-0001'));
// INV-20230511-0002
```

---

## ⚙️ Custom Configuration

```ts
const generator = new SequentialGenerator({
  prefix: 'INV',
  timeZone: 'America/New_York',
  dateFormat: 'YYMMDD',
  sequentialLength: 6,
});
```

---

## 📚 API Reference

### `class SequentialGenerator`

#### Constructor

```ts
new SequentialGenerator(options: {
  prefix: string;
  timeZone: string;
  dateFormat?: string;        // default: YYYYMMDD
  sequentialLength?: number; // default: 4
  separator?: string;
});
```

#### Methods

| Method                  | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `generate()`            | Generates a new sequential code based on the current date |
| `validate(code)`        | Validates whether a code matches the expected format      |
| `increment(code)`       | Returns the next sequential code (stateless)              |
| `extractDate(code)`     | Extracts the date portion from a code                     |
| `extractSequence(code)` | Extracts the numeric sequence from a code                 |

---

## 📅 Supported Date Formats

This library supports all date formats provided by **Day.js**.
Commonly used patterns include:

| Pattern | Description      | Example |
| ------- | ---------------- | ------- |
| `YYYY`  | 4-digit year     | `2024`  |
| `YY`    | 2-digit year     | `24`    |
| `MM`    | Month (2 digits) | `01`    |
| `DD`    | Day (2 digits)   | `31`    |
| `HH`    | Hour (24h)       | `13`    |
| `mm`    | Minute           | `45`    |
| `Q`     | Quarter          | `1`     |

### Examples

* `YYYYMMDD` → `20241231` (daily reset)
* `YYYYMM` → `202412` (monthly reset)
* `YY` → `24` (yearly reset)

---

## 📝 License

MIT License
Copyright (c) 2024
**Pratchaya Ueapisitkul**

---
