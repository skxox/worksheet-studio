import { describe, expect, it } from "vitest";
import {
  buildNumberPracticeSequence,
  parseNumberRows,
} from "@/lib/copybook-number";

describe("parseNumberRows", () => {
  it("keeps compact digit sequences on one practice row", () => {
    expect(parseNumberRows("1\n2\n\n1234567890")).toEqual([
      "1",
      "2",
      "",
      "1234567890",
    ]);
  });

  it("splits whitespace-separated values into independent rows", () => {
    expect(parseNumberRows("1 2 3\n45 67")).toEqual([
      "1",
      "2",
      "3",
      "45",
      "67",
    ]);
  });
});

describe("buildNumberPracticeSequence", () => {
  it("repeats a digit pattern to the requested sample count", () => {
    expect(buildNumberPracticeSequence("123", 8, 12)).toEqual([
      "1",
      "2",
      "3",
      "1",
      "2",
      "3",
      "1",
      "2",
    ]);
  });

  it("caps the output at visible cells", () => {
    expect(buildNumberPracticeSequence("1234567890", 20, 18)).toHaveLength(18);
  });

  it("preserves explicit separators without counting them as digit samples", () => {
    expect(buildNumberPracticeSequence("12/34", 5, 8)).toEqual([
      "1",
      "2",
      "/",
      "3",
      "4",
      "1",
    ]);
  });
});
