# Agent Context: Sequential Generator Module

## 1. Project Overview
The `sequential-generator` is a TypeScript library designed to generate unique, sequential, time-aware codes. It is commonly used for generating business identifiers such as Invoice Numbers (e.g., `INV-20231225-0001`), Order IDs, or Transaction References.

## 2. Purpose & Objectives
- **Uniqueness**: Ensure codes are unique within a specific timeframe (usually a day).
- **Traceability**: Codes should indicate when they were generated via a date component.
- **Flexibility**: Support various date formats, timezones, and sequence lengths.
- **Scalability**: Support both single-instance (in-memory) and distributed systems (stateless/DB-backed).

## 3. Functional Requirements

### 3.1 Code Structure
The generated code follows this pattern:
`{PREFIX}{SEPARATOR}{DATE}{SEPARATOR}{SEQUENCE}`

- **Prefix**: Optional static string (e.g., "INV").
- **Separator**: Optional delimiter (e.g., "-").
- **Date**: Formatted date string based on `dayjs` formats (e.g., "YYYYMMDD").
- **Sequence**: Numeric sequence padded with zeros (e.g., "0001").

### 3.2 Core Logic
1.  **Timezone Awareness**: All date calculations must respect the configured IANA timezone (e.g., 'Asia/Bangkok').
2.  **Sequence Reset**: The sequence number must reset to `1` when the formatted date string changes (i.e., a new day/month/year depending on format).
3.  **Auto-Expansion**: If the sequence number exceeds the maximum value for the current length (e.g., 9999), the sequence length should automatically increase, and the sequence should reset to 1 (e.g., `9999` -> `00001`).
4.  **Stateless Support**: Must provide methods (`increment`, `generateFromSequence`) to support external state management (Redis/DB) where the sequence number is passed in.

## 4. Development Guidelines

### 4.1 Technology Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **Key Libraries**: `dayjs` (for date/time/timezone handling).
- **Testing**: `jest` (Unit testing is mandatory).

### 4.2 Implementation Details
- **Class**: `SequentialGenerator`
- **Configuration**: Passed via constructor (`SequentialGeneratorConfig`).
- **Error Handling**: Fail gracefully or auto-recover (like auto-expansion) where appropriate. Validate inputs in `increment`.

### 4.3 Testing Strategy
- **Time Mocking**: Use `jest.useFakeTimers()` and `jest.setSystemTime()` to test date rollovers deterministically.
- **Edge Cases**: Test timezone boundaries, sequence overflows, and missing separators.