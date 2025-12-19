# Implementation Plan for Sequential-Generator

This document outlines the plan for implementing new features as requested.

## Feature: Implement Missing Core Methods

**Objective:** Implement the `increment`, `validate`, `extractDate`, and `extractSequence` methods as described in the README, as they are currently missing from the implementation.

**Files to Modify:**
- `src/SequentialGenerator.ts`
- `src/SequentialGenerator.spec.ts`

**Implementation Steps:**

1.  **Implement `extractDate(code: string)`:**
    -   Calculate the start and end indices of the date part based on `prefix` length and `dateFormat` length.
    -   Return the substring.

2.  **Implement `extractSequence(code: string)`:**
    -   Calculate the start index of the sequence part.
    -   Return the substring converted to a number.

3.  **Implement `validate(code: string)`:**
    -   Check if the code starts with the configured `prefix`.
    -   Extract the date part and validate it using `dayjs`.
    -   Extract the sequence part and validate that it is a valid number.
    -   Check if the total length matches the expected length.

4.  **Implement `increment(code: string)`:**
    -   Validate the input code using `validate()`.
    -   Extract the sequence number.
    -   Increment the sequence number by 1.
    -   Check if the new sequence number exceeds the maximum allowed by `sequentialLength`.
    -   Reconstruct the code string with the new sequence number.

5.  **Add new tests in `src/SequentialGenerator.spec.ts`:**
    -   Add test cases for `validate` with valid and invalid codes.
    -   Add test cases for `increment` to ensure it correctly increments the sequence.
    -   Add test cases for `extractDate` and `extractSequence`.

## Feature 1: Automatic Sequence Length Increment

**Objective:** When the sequence number reaches its maximum (e.g., 999), the next number should not throw an error. Instead, the sequence length should increase by one, and the number should reset to 1 (e.g., `...999` becomes `...0001`).

**Files to Modify:**
- `src/SequentialGenerator.ts`
- `tests/SequentialGenerator.test.ts`

**Implementation Steps:**

1.  **Modify `increment()` method in `src/SequentialGenerator.ts`:**
    -   Locate the check `if (currentNumber >= max)`.
    -   Instead of throwing an error, implement the following logic:
        -   Increment `this.sequenceLength` by 1.
        -   The next sequence number will be `1`.
        -   Pad the new number with zeros to match the new `sequenceLength`.
        -   Return the newly formatted code string.

2.  **Add new tests in `tests/SequentialGenerator.test.ts`:**
    -   Create a new test case within the `increment()` describe block.
    -   Test that when a code at maximum capacity (e.g., `...9999`) is incremented, the new code has an increased sequence length and starts from 1 (e.g., `...00001`).

## Feature 2: Always Start Sequence at 1

**Objective:** The `generate()` method should always produce a code with the sequence number starting at 1.

**Analysis:**
- The current implementation of the `generate()` method already fulfills this requirement. It initializes the first code with `1`, padded with leading zeros.

**Conclusion:** No code changes are necessary for this feature.

## Feature 3: Optional Separator

**Objective:** Allow an optional separator to be placed between the prefix, date, and sequence number for improved readability (e.g., `PREFIX-YYMMDD-0001`).

**Files to Modify:**
- `src/SequentialGenerator.ts`
- `tests/SequentialGenerator.test.ts`

**Implementation Steps:**

1.  **Update Constructor in `src/SequentialGenerator.ts`:**
    -   Add a new optional parameter to the constructor: `separator: string = ""`.
    -   Store this value in a private class property `this.separator`.

2.  **Update `generate()` method:**
    -   Modify the return string to conditionally add the separator between the prefix, date, and sequence parts if `this.separator` is not an empty string.

3.  **Update `increment()` method:**
    -   When parsing `currentCode`, account for the presence of the separator to correctly extract the sequence number.
    -   When constructing the new code string, ensure the separator is included if it was present in the original.

4.  **Update `validate()` method:**
    -   Modify the logic that extracts `codePrefix` and `codeDate` to handle codes that may contain a separator.

5.  **Add new tests in `tests/SequentialGenerator.test.ts`:**
    -   Create a new `describe` block for "Separator functionality".
    -   Add tests for `generate()`, `increment()`, and `validate()` for a generator instance that is configured with a separator.
    -   Ensure existing tests (without a separator) still pass.
