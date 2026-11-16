import { describe, expect, it } from "vitest";
import {
  CONTROL_PATTERN_CODES,
  parseControlPatternCodes,
} from "../copybook-control";

describe("copybook control patterns", () => {
  it("exposes all selectable numeric and alphabetic patterns", () => {
    expect(CONTROL_PATTERN_CODES).toHaveLength(32);
    expect(CONTROL_PATTERN_CODES[0]).toBe("1");
    expect(CONTROL_PATTERN_CODES.at(-1)).toBe("W");
  });

  it("keeps the entered sequence and ignores separators", () => {
    expect(parseControlPatternCodes("1 2,3\nA-W")).toEqual([
      "1",
      "2",
      "3",
      "A",
      "W",
    ]);
  });

  it("normalizes lower-case codes without removing repeated practice rows", () => {
    expect(parseControlPatternCodes("aA11")).toEqual(["A", "A", "1", "1"]);
  });
});
