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
  Example: `INV-20230101-0001`

---

## 🎯 Use Cases

| Use Case | Example Output |
| --- | --- |
| Invoice Number | `INV-20250101-0001` |
| Purchase Order | `PO-20250101-0001` |
| Transfer Number | `TRF-20250101-0001` |
| Inbound Receipt | `IB-20250101-0001` |
| Support Ticket | `TKT-20250101-0001` |
| Delivery Order | `DO-20250101-0001` |
| Quotation | `QT-20250101-0001` |
| Credit Note | `CN-20250101-0001` |
| Payment Receipt | `REC-20250101-0001` |
| Work Order | `WO-20250101-0001` |
| Booking / Reservation | `BK-20250101-0001` |

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

// Parse a code
console.log(generator.parse('INV-20230511-0001'));
// { prefix: 'INV', date: '20230511', sequence: 1 }

// Reset the generator sequence
generator.reset();

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
  timeZone: 'Asia/Bangkok',
  dateFormat: 'YYYYMMDD',
  sequentialLength: 6, // → INV20250101000001
});
```

### Adjusting Sequence Length

The `sequentialLength` option controls how many digits the sequence number has (default: `4`).

```ts
// Default (4 digits)
new SequentialGenerator({ prefix: 'INV', timeZone: 'Asia/Bangkok' });
// → INV202501010001

// 3 digits
new SequentialGenerator({ prefix: 'INV', timeZone: 'Asia/Bangkok', sequentialLength: 3 });
// → INV20250101001

// 6 digits
new SequentialGenerator({ prefix: 'INV', timeZone: 'Asia/Bangkok', sequentialLength: 6 });
// → INV20250101000001
```

> The sequence will automatically expand beyond the configured length when the limit is reached
> (e.g. `9999` → `00001` when `sequentialLength` is `4`).

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
| `parse(code)`           | Decomposes a code into its components (prefix, date, seq) |
| `increment(code)`       | Returns the next sequential code (stateless)              |
| `reset()`               | Resets internal sequence and date state                   |
| `extractDate(code)`     | Extracts the date portion from a code                     |
| `extractSequence(code)` | Extracts the numeric sequence from a code                 |

---

## 📅 Date Format & 🌐 Timezone

This library uses **[Day.js](https://day.js.org/) `^1.11.19`** for date and timezone handling.

### Date Format

All [Day.js format tokens](https://day.js.org/docs/en/display/format) are supported. The default is `YYYYMMDD`.

| Format | Output | Resets every |
| --- | --- | --- |
| `YYYYMMDD` | `20250101` | Day |
| `YYYYMM` | `202501` | Month |
| `YY` | `25` | Year |

### Timezone

The `timeZone` option accepts **IANA timezone names** via the [Day.js timezone plugin](https://day.js.org/docs/en/plugin/timezone). The default is `UTC`.

| Region | timeZone value |
| --- | --- |
| UTC (default) | `UTC` |
| Thailand | `Asia/Bangkok` |
| Japan | `Asia/Tokyo` |
| London | `Europe/London` |
| New York | `America/New_York` |
| Los Angeles | `America/Los_Angeles` |

For the full list, see the [IANA timezone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

---

## 🏗 Dual Package Support

This library is published as a **Dual Package**, supporting both:

* **CommonJS** (`require`)
* **ES Modules** (`import`)

It is compatible with modern build tools like Vite, Webpack, and Next.js, as well as classic Node.js environments.

---

## 📝 License

MIT License
Copyright (c) 2024
**Pratchaya Ueapisitkul**

---
