/** 每个换行代表一行；带空格的数字会按空格拆成独立练习行。 */
export function parseNumberRows(content: string): string[] {
  const rows: string[] = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      rows.push("");
      continue;
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    rows.push(...(tokens.length > 1 ? tokens : [trimmed]));
  }

  return rows.length > 0 ? rows : [""];
}

/** 将行内数字序列循环展开，样本数与物理可绘单元格数分别限幅。 */
export function buildNumberPracticeSequence(
  token: string,
  sampleLimit: number,
  cellLimit: number,
): string[] {
  const pattern = Array.from(token.replace(/\s+/g, ""));
  const maxSamples = Math.max(0, Math.floor(sampleLimit));
  const maxCells = Math.max(0, Math.floor(cellLimit));

  if (pattern.length === 0 || maxSamples === 0 || maxCells === 0) return [];

  const result: string[] = [];
  let renderedSamples = 0;
  let cursor = 0;

  while (renderedSamples < maxSamples && result.length < maxCells) {
    const character = pattern[cursor % pattern.length];
    result.push(character);
    if (character !== "/") renderedSamples++;
    cursor++;
  }

  return result;
}
