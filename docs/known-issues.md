# ⚠️ Known Issues & Behaviors

## 1. Auto-Expand Sequence: `generate()` vs `increment()`

### ปัญหา

เมื่อ sequence number เกิน limit ที่กำหนดไว้ใน `sequentialLength`, พฤติกรรมของแต่ละ method **ไม่เหมือนกัน**:

| Method | Overflow Behavior | ตัวอย่าง (`sequentialLength: 1`) |
| --- | --- | --- |
| `increment(lastCode)` | ✅ ต่อเนื่อง — sequence เพิ่มขึ้นตามปกติ | `9` → `10` |
| `generate()` | ⚠️ Reset — length ขยาย แต่ sequence กลับไปเริ่มที่ `1` | `9` → `01` |
| `generateFromSequence(n)` | ⚠️ Reset — เหมือน `generate()` เมื่อ `n` เกิน limit | `generateFromSequence(10)` → `01` |

### Root Cause

Bug อยู่ใน 2 จุดใน `src/SequentialGenerator.ts`:

**จุดที่ 1: `generate()` — line 122**
```ts
if (sequenceString.length > this.sequentialLength) {
  this.sequentialLength++;
  return this.generateFromSequence(1, currentDate); // ❌ ควรเป็น this.currentSequence
}
```

**จุดที่ 2: `generateFromSequence()` — line 275**
```ts
if (sequenceString.length > this.sequentialLength) {
  this.sequentialLength++;
  return this.generateFromSequence(1, currentKey); // ❌ ควรเป็น sequence
}
```

ทั้งสองจุดส่ง `1` hardcode แทนที่จะส่งค่า sequence จริงที่ overflow

### ความเสี่ยง

ถ้าใช้ `generate()` และ sequence เกิน limit ภายในวันเดียวกัน โค้ดที่ได้จะ **ซ้ำกัน** ได้:

```
... INV-20250101-0008
    INV-20250101-0009
    INV-20250101-01    ← overflow, reset (❌ อาจซ้ำกับโค้ดที่เคยออกแล้ว ถ้า sequentialLength เปลี่ยน)
```

### แนวทางแก้ไข (Proposed Fix)

```diff
// generate() — line 122
  if (sequenceString.length > this.sequentialLength) {
    this.sequentialLength++;
-   return this.generateFromSequence(1, currentDate);
+   return this.generateFromSequence(this.currentSequence, currentDate);
  }
```

```diff
// generateFromSequence() — line 275
  if (sequenceString.length > this.sequentialLength) {
    this.sequentialLength++;
-   return this.generateFromSequence(1, currentKey);
+   return this.generateFromSequence(sequence, currentKey);
  }
```

> **หมายเหตุ**: หากแก้ไข ต้องอัปเดต test ที่ assert พฤติกรรมเดิมด้วย (lines 82-87 และ 395-401 ใน `tests/SequentialGenerator.test.ts`)

### คำแนะนำสำหรับ Production

สำหรับระบบที่ต้องการ sequence ต่อเนื่องแน่นอน ให้ใช้ `increment()` ร่วมกับ external storage:

```ts
// ✅ Safe: ใช้ increment() + DB/Redis — ต่อเนื่องเสมอ ไม่ reset
const lastCode = await db.getLastCode(); // e.g. 'INV-20250101-9999'
const next = generator.increment(lastCode); // → 'INV-20250101-10000'
await db.saveLastCode(next);
```

---

*Last updated: 2026-02-21*
