/** 将字母样例按描红数量循环展开；空输入或数量为零时不生成示范字。 */
export function buildEnglishCharacterSamples(
  content: string,
  count: number,
  pairLetterCase = false,
): string[] {
  const characters = Array.from(content)
    .filter((character) => character.trim())
    .map((character) =>
      pairLetterCase && /^[a-z]$/i.test(character)
        ? `${character.toUpperCase()}${character.toLowerCase()}`
        : character,
    );
  const sampleCount = Math.max(0, Math.floor(count));

  if (characters.length === 0 || sampleCount === 0) return [];

  return Array.from(
    { length: sampleCount },
    (_, index) => characters[index % characters.length],
  );
}

/** 保留空白作为单词边界，同时兼容换行和连续空格输入。 */
export function splitEnglishWords(content: string): string[] {
  return content
    .trim()
    .split(/[\s,，]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

/** 保留空白行，并将逗号或空格分隔的单词拆成独立练习行。 */
export function splitEnglishWordRows(content: string): string[] {
  if (!content) return [];

  return content.split(/\r?\n/).flatMap((line) => {
    if (!line.trim()) return [""];
    return line
      .split(/[\s,，]+/)
      .map((word) => word.trim())
      .filter(Boolean);
  });
}

/** 拼音字帖按换行分行，空格只用于分隔同一练习行中的拼音字符。 */
export function splitPinyinPracticeRows(content: string): string[][] {
  return content
    .split(/\r?\n/)
    .map((line) => Array.from(line).filter((character) => character.trim()));
}
