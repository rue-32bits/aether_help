/**
 * Bionic Reading Converter Utility
 * Formats text by emphasizing the first 40-50% of each word to create fixation anchors for neurodivergent and dyslexic readers.
 */

export function formatBionicWord(word: string): string {
  if (!word || word.length <= 1) return word;

  // Preserve leading/trailing punctuation
  const match = word.match(/^([^\w]*)([\w'-]+)([^\w]*)$/);
  if (!match) return word;

  const [, leadingPunct, coreWord, trailingPunct] = match;
  const len = coreWord.length;

  let boldLen = 1;
  if (len === 2 || len === 3) {
    boldLen = 1;
  } else if (len <= 5) {
    boldLen = 2;
  } else if (len <= 8) {
    boldLen = 3;
  } else {
    boldLen = Math.ceil(len * 0.45);
  }

  const boldPart = coreWord.slice(0, boldLen);
  const regularPart = coreWord.slice(boldLen);

  return `${leadingPunct}<strong>${boldPart}</strong>${regularPart}${trailingPunct}`;
}

export function toBionicHtml(text: string): string {
  if (!text) return '';

  return text
    .split('\n')
    .map((paragraph) => {
      const words = paragraph.split(' ');
      return words.map((w) => formatBionicWord(w)).join(' ');
    })
    .join('\n');
}

/**
 * React helper component to render text with or without Bionic Reading
 */
export function renderBionicOrPlain(text: string, isBionicEnabled: boolean) {
  if (!isBionicEnabled) {
    return text;
  }
  const formattedHtml = toBionicHtml(text);
  return { __html: formattedHtml };
}
