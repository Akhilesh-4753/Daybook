export const formatMultiLineText = (rawText) => {
  if (!rawText) return '';
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return '';
  if (lines.length === 1) return lines[0];

  return lines.map((line) => (line.startsWith('-') ? line : `- ${line}`)).join('\n');
};
