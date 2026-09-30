export function pullSentences(buffer: string) {
  const sentences: string[] = [];
  const pattern = /[^.!?…]+[.!?…]+(?:["')]+)?\s*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(buffer))) {
    sentences.push(match[0].trim());
    lastIndex = pattern.lastIndex;
  }
  return { sentences, rest: buffer.slice(lastIndex) };
}
