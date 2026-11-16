import { describe, expect, it } from "vitest";
import {
  buildEnglishCharacterSamples,
  splitEnglishWordRows,
  splitEnglishWords,
  splitPinyinPracticeRows,
} from "@/lib/copybook-language";

describe("buildEnglishCharacterSamples", () => {
  it("cycles configured letters up to the requested practice count", () => {
    expect(buildEnglishCharacterSamples("AaBb", 7)).toEqual([
      "A",
      "a",
      "B",
      "b",
      "A",
      "a",
      "B",
    ]);
  });

  it("ignores whitespace and returns no samples for empty content", () => {
    expect(buildEnglishCharacterSamples(" A a \n", 3)).toEqual(["A", "a", "A"]);
    expect(buildEnglishCharacterSamples(" \n ", 3)).toEqual([]);
    expect(buildEnglishCharacterSamples("Aa", 0)).toEqual([]);
  });

  it("pairs uppercase and lowercase letters when requested", () => {
    expect(buildEnglishCharacterSamples("ABC", 3, true)).toEqual([
      "Aa",
      "Bb",
      "Cc",
    ]);
  });
});

describe("splitPinyinPracticeRows", () => {
  it("keeps each input line as a practice row and ignores separating spaces", () => {
    expect(splitPinyinPracticeRows("a\no\nā á ǎ à\n\nnǐ")).toEqual([
      ["a"],
      ["o"],
      ["ā", "á", "ǎ", "à"],
      [],
      ["n", "ǐ"],
    ]);
  });
});

describe("splitEnglishWords", () => {
  it("preserves words as independent practice groups", () => {
    expect(splitEnglishWords("hello  world\nfuture design")).toEqual([
      "hello",
      "world",
      "future",
      "design",
    ]);
  });

  it("splits comma-separated words and preserves explicit blank rows", () => {
    expect(splitEnglishWordRows("Lily\n\nbook, pencil, ruler, bag")).toEqual([
      "Lily",
      "",
      "book",
      "pencil",
      "ruler",
      "bag",
    ]);
    expect(splitEnglishWords("book, pencil，ruler")).toEqual([
      "book",
      "pencil",
      "ruler",
    ]);
  });

  it("returns no groups for empty content", () => {
    expect(splitEnglishWords("  \n ")).toEqual([]);
  });
});
