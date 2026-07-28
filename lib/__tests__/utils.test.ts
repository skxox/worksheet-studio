import { describe, it, expect } from "vitest";
import { clamp, randomRange, seededRandom, generateId } from "@/lib/utils";

describe("clamp", () => {
  it("returns the value when within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps to the minimum", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("clamps to the maximum", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
  it("handles min === max", () => {
    expect(clamp(99, 7, 7)).toBe(7);
  });
});

describe("randomRange", () => {
  it("returns min when min === max", () => {
    expect(randomRange(3, 3)).toBe(3);
  });
  it("stays within [min, max)", () => {
    for (let i = 0; i < 100; i++) {
      const v = randomRange(0, 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });
});

describe("seededRandom", () => {
  it("is deterministic for a given seed", () => {
    const a = seededRandom(123);
    const b = seededRandom(123);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });
  it("produces a different sequence for a different seed", () => {
    const a = seededRandom(123);
    const b = seededRandom(999);
    expect(a()).not.toBe(b());
  });
  it("emits values in the (0, 1) range", () => {
    const rng = seededRandom(42);
    for (let i = 0; i < 50; i++) {
      const v = rng();
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
